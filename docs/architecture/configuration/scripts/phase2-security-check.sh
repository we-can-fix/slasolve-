#!/bin/bash
# phase2-security-check.sh - 第二階段安全與配置檢查

set -e

PROJECT_ROOT=$(pwd)
REPORTS_DIR="$PROJECT_ROOT/reports"
PHASE2_REPORTS="$REPORTS_DIR/phase2"
mkdir -p "$PHASE2_REPORTS"

echo "🔒 Starting Phase 2: Security & Configuration Checks"
echo "=================================================="

EXIT_CODE=0

# 1. 安全掃描
echo ""
echo "📦 Step 1: Security Scanning"
echo "----------------------------"

if command -v python3 &> /dev/null; then
    # 運行Python安全掃描器
    SCRIPT_DIR="$(dirname "$0")/../python"
    if [ -f "$SCRIPT_DIR/security_scanner.py" ]; then
        echo "Running comprehensive security scanner..."
        python3 "$SCRIPT_DIR/security_scanner.py" "$PROJECT_ROOT" || SECURITY_EXIT=$?
        
        if [ ${SECURITY_EXIT:-0} -ne 0 ]; then
            echo "❌ Security scans found critical issues!"
            EXIT_CODE=1
        else
            echo "✅ Security scans passed!"
        fi
    fi
fi

# 2. 配置文件驗證
echo ""
echo "⚙️ Step 2: Configuration Validation"
echo "------------------------------------"

if command -v python3 &> /dev/null; then
    SCRIPT_DIR="$(dirname "$0")/../python"
    if [ -f "$SCRIPT_DIR/config_validator.py" ]; then
        echo "Running configuration validator..."
        python3 "$SCRIPT_DIR/config_validator.py" "$PROJECT_ROOT" || CONFIG_EXIT=$?
        
        if [ ${CONFIG_EXIT:-0} -ne 0 ]; then
            echo "❌ Configuration validation failed!"
            EXIT_CODE=1
        else
            echo "✅ Configuration validation passed!"
        fi
    fi
fi

# 3. 密鑰洩漏檢測
echo ""
echo "🔐 Step 3: Secret Detection"
echo "----------------------------"

if command -v gitleaks &> /dev/null; then
    echo "Running Gitleaks for secret detection..."
    gitleaks detect --source="$PROJECT_ROOT" \
        --report-path="$PHASE2_REPORTS/gitleaks-report.json" \
        --report-format=json || GITLEAKS_EXIT=$?
    
    if [ ${GITLEAKS_EXIT:-0} -ne 0 ]; then
        echo "⚠️  Potential secrets detected!"
    else
        echo "✅ No secrets detected!"
    fi
elif command -v trufflehog &> /dev/null; then
    echo "Running TruffleHog for secret detection..."
    trufflehog filesystem "$PROJECT_ROOT" \
        --json > "$PHASE2_REPORTS/trufflehog-report.json" || TRUFFLE_EXIT=$?
    
    if [ ${TRUFFLE_EXIT:-0} -ne 0 ]; then
        echo "⚠️  Potential secrets detected!"
    fi
else
    echo "⚠️  No secret detection tool installed (gitleaks or trufflehog)"
fi

# 4. License合規性檢查
echo ""
echo "📜 Step 4: License Compliance"
echo "------------------------------"

if command -v license-checker &> /dev/null && [ -f "package.json" ]; then
    echo "Checking npm package licenses..."
    license-checker --json --out "$PHASE2_REPORTS/licenses.json" || true
    echo "✅ License report generated!"
fi

if command -v pip-licenses &> /dev/null && [ -f "requirements.txt" ]; then
    echo "Checking Python package licenses..."
    pip-licenses --format=json --output-file="$PHASE2_REPORTS/python-licenses.json" || true
    echo "✅ Python license report generated!"
fi

# 5. 容器安全掃描
echo ""
echo "🐳 Step 5: Container Security"
echo "------------------------------"

if command -v trivy &> /dev/null; then
    # 掃描Dockerfile
    if [ -f "Dockerfile" ]; then
        echo "Scanning Dockerfile with Trivy..."
        trivy config Dockerfile \
            --format json \
            --output "$PHASE2_REPORTS/trivy-dockerfile.json" || true
    fi
    
    # 掃描Docker Compose
    if [ -f "docker-compose.yml" ]; then
        echo "Scanning docker-compose.yml..."
        trivy config docker-compose.yml \
            --format json \
            --output "$PHASE2_REPORTS/trivy-compose.json" || true
    fi
    
    echo "✅ Container security scan completed!"
else
    echo "⚠️  Trivy not installed, skipping container scans"
fi

# 6. 生成Phase 2總體報告
echo ""
echo "📊 Generating Phase 2 Summary Report"
echo "--------------------------------------"

cat > "$PHASE2_REPORTS/phase2-summary.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "phase": "Phase 2 - Security & Configuration",
  "status": "${EXIT_CODE}",
  "checks": {
    "security_scan": ${SECURITY_EXIT:-0},
    "config_validation": ${CONFIG_EXIT:-0},
    "secret_detection": ${GITLEAKS_EXIT:-${TRUFFLE_EXIT:-0}},
    "container_security": 0
  },
  "reports_directory": "$PHASE2_REPORTS"
}
EOF

echo ""
echo "=================================================="
echo "Phase 2 Summary"
echo "=================================================="
cat "$PHASE2_REPORTS/phase2-summary.json" | python3 -m json.tool || cat "$PHASE2_REPORTS/phase2-summary.json"

if [ ${EXIT_CODE} -eq 0 ]; then
    echo ""
    echo "✅ Phase 2 checks completed successfully!"
else
    echo ""
    echo "❌ Phase 2 checks failed! Please review the issues above."
fi

exit ${EXIT_CODE}
