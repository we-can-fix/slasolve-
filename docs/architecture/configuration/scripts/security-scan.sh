#!/bin/bash
# security-scan.sh - Security scanning script

set -e

PROJECT_ROOT=$(pwd)
REPORTS_DIR="$PROJECT_ROOT/reports"
mkdir -p "$REPORTS_DIR"

echo "🔒 Starting security scans..."

EXIT_CODE=0

# Node.js依賴安全檢查
if [ -f "package.json" ]; then
    echo "📦 Scanning Node.js dependencies..."
    
    # npm audit
    echo "  - Running npm audit..."
    npm audit --json > "$REPORTS_DIR/npm-audit.json" || NPM_AUDIT_EXIT=$?
    
    if [ ${NPM_AUDIT_EXIT:-0} -ne 0 ]; then
        echo "⚠️  npm audit found vulnerabilities"
        npm audit --audit-level=high || EXIT_CODE=$?
    fi
    
    # Snyk (如果已安裝)
    if command -v snyk &> /dev/null; then
        echo "  - Running Snyk..."
        snyk test --json > "$REPORTS_DIR/snyk-report.json" || SNYK_EXIT=$?
    fi
fi

# Python依賴安全檢查
if [ -f "requirements.txt" ]; then
    echo "🐍 Scanning Python dependencies..."
    
    # Safety檢查
    if command -v safety &> /dev/null; then
        echo "  - Running Safety..."
        safety check --json --output "$REPORTS_DIR/safety-report.json" || \
            SAFETY_EXIT=$?
        
        if [ ${SAFETY_EXIT:-0} -ne 0 ]; then
            echo "⚠️  Safety found vulnerabilities"
            EXIT_CODE=1
        fi
    fi
    
    # Bandit安全掃描
    if command -v bandit &> /dev/null; then
        echo "  - Running Bandit..."
        bandit -r . -f json -o "$REPORTS_DIR/bandit-report.json" \
            --exclude .git,.venv,venv,node_modules || \
            BANDIT_EXIT=$?
        
        if [ ${BANDIT_EXIT:-0} -ne 0 ]; then
            echo "⚠️  Bandit found security issues"
        fi
    fi
fi

# OWASP Dependency Check
if command -v dependency-check &> /dev/null; then
    echo "🛡️  Running OWASP Dependency Check..."
    dependency-check \
        --project "${PROJECT_NAME:-default}" \
        --scan . \
        --format JSON \
        --format HTML \
        --out "$REPORTS_DIR" \
        --exclude "**/node_modules/**" \
        --exclude "**/.venv/**" || \
        OWASP_EXIT=$?
    
    if [ ${OWASP_EXIT:-0} -ne 0 ]; then
        echo "⚠️  OWASP Dependency Check found issues"
    fi
fi

# 生成安全報告摘要
cat > "$REPORTS_DIR/security-scan-summary.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "${EXIT_CODE}",
  "scans": {
    "npm_audit": ${NPM_AUDIT_EXIT:-0},
    "snyk": ${SNYK_EXIT:-0},
    "safety": ${SAFETY_EXIT:-0},
    "bandit": ${BANDIT_EXIT:-0},
    "owasp": ${OWASP_EXIT:-0}
  }
}
EOF

echo ""
echo "📊 Security Scan Summary:"
cat "$REPORTS_DIR/security-scan-summary.json"

if [ ${EXIT_CODE} -eq 0 ]; then
    echo ""
    echo "✅ Security scans completed!"
else
    echo ""
    echo "❌ Security vulnerabilities found! Please review and fix."
fi

exit ${EXIT_CODE}
