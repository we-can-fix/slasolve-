#!/bin/bash
# format-check.sh - Code format checking script

set -e

PROJECT_ROOT=$(pwd)
REPORTS_DIR="$PROJECT_ROOT/reports"
mkdir -p "$REPORTS_DIR"

echo "🔍 Starting code format checks..."

EXIT_CODE=0

# ESLint檢查
if [ -f "package.json" ] && grep -q "eslint" package.json; then
    echo "📝 Running ESLint..."
    npx eslint . --ext .js,.ts,.vue,.jsx,.tsx \
        --format json --output-file "$REPORTS_DIR/eslint-report.json" || \
        EXIT_CODE=$?
    
    # 生成HTML報告
    npx eslint . --ext .js,.ts,.vue,.jsx,.tsx \
        --format html --output-file "$REPORTS_DIR/eslint-report.html" || true
    
    if [ $EXIT_CODE -ne 0 ]; then
        echo "❌ ESLint found issues!"
    else
        echo "✅ ESLint passed!"
    fi
fi

# Prettier檢查
if [ -f ".prettierrc" ] || [ -f ".prettierrc.json" ]; then
    echo "💅 Running Prettier check..."
    npx prettier --check . \
        --write-file-list "$REPORTS_DIR/prettier-files.txt" || \
        PRETTIER_EXIT=$?
    
    if [ ${PRETTIER_EXIT:-0} -ne 0 ]; then
        echo "❌ Prettier format issues found!"
        echo "Run 'npx prettier --write .' to fix formatting issues"
        EXIT_CODE=1
    else
        echo "✅ Prettier passed!"
    fi
fi

# Python代碼檢查
if [ -f "requirements.txt" ] || find . -name "*.py" -type f | head -1 | grep -q .; then
    echo "🐍 Running Python code checks..."
    
    # Black格式檢查
    if command -v black &> /dev/null; then
        echo "  - Checking with Black..."
        black --check --diff . \
            --exclude="/(\.git|\.venv|venv|__pycache__|\.pytest_cache|node_modules)/" || \
            BLACK_EXIT=$?
        
        if [ ${BLACK_EXIT:-0} -ne 0 ]; then
            echo "❌ Black format issues found!"
            echo "Run 'black .' to fix formatting issues"
            EXIT_CODE=1
        else
            echo "✅ Black passed!"
        fi
    fi
    
    # Flake8代碼風格檢查
    if command -v flake8 &> /dev/null; then
        echo "  - Checking with Flake8..."
        flake8 . \
            --exclude=.git,__pycache__,.venv,venv,node_modules \
            --output-file="$REPORTS_DIR/flake8-report.txt" \
            --tee || \
            FLAKE8_EXIT=$?
        
        if [ ${FLAKE8_EXIT:-0} -ne 0 ]; then
            echo "❌ Flake8 issues found!"
            EXIT_CODE=1
        else
            echo "✅ Flake8 passed!"
        fi
    fi
fi

# 生成統一報告
cat > "$REPORTS_DIR/format-check-summary.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "${EXIT_CODE}",
  "checks": {
    "eslint": ${EXIT_CODE:-0},
    "prettier": ${PRETTIER_EXIT:-0},
    "black": ${BLACK_EXIT:-0},
    "flake8": ${FLAKE8_EXIT:-0}
  }
}
EOF

echo ""
echo "📊 Format Check Summary:"
echo "  - Reports directory: $REPORTS_DIR"
cat "$REPORTS_DIR/format-check-summary.json"

if [ ${EXIT_CODE} -eq 0 ]; then
    echo ""
    echo "✅ All format checks passed!"
else
    echo ""
    echo "❌ Format check failed! Please review and fix the issues."
fi

exit ${EXIT_CODE}
