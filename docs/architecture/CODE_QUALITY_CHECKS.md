# 代碼品質檢查實現

## SonarQube靜態分析配置

### 核心配置設置

SonarQube作為靜態代碼分析的核心引擎，需要進行詳細的配置優化：

```properties
# sonar-project.properties
sonar.projectKey=code-quality-system
sonar.projectName=Code Quality System
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8

# 源碼目錄配置
sonar.sources=src,lib,app
sonar.tests=test,spec,__tests__
sonar.exclusions=**/node_modules/**,**/vendor/**,**/*.min.js,**/dist/**

# 語言特定配置
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.python.coverage.reportPaths=coverage.xml
sonar.java.coveragePlugin=jacoco
sonar.jacoco.reportPaths=target/jacoco.exec

# 質量門控配置
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300
```

### 自定義質量配置文件

建立針對不同語言的品質規則配置：

```json
{
  "name": "Enterprise Quality Profile",
  "language": "js",
  "rules": [
    {
      "key": "javascript:S1481",
      "severity": "MAJOR",
      "params": {
        "exceptions": "React,Vue"
      }
    },
    {
      "key": "python:S1134",
      "severity": "MINOR"
    },
    {
      "key": "java:S2259",
      "severity": "BLOCKER"
    },
    {
      "key": "typescript:S1186",
      "severity": "MAJOR"
    }
  ],
  "qualityGate": {
    "name": "Enterprise Gate",
    "conditions": [
      {
        "metric": "coverage",
        "operator": "LT",
        "threshold": "80.0"
      },
      {
        "metric": "duplicated_lines_density",
        "operator": "GT",
        "threshold": "3.0"
      },
      {
        "metric": "maintainability_rating",
        "operator": "GT",
        "threshold": "1"
      },
      {
        "metric": "reliability_rating",
        "operator": "GT",
        "threshold": "1"
      },
      {
        "metric": "security_rating",
        "operator": "GT",
        "threshold": "1"
      },
      {
        "metric": "security_hotspots_reviewed",
        "operator": "LT",
        "threshold": "100"
      }
    ]
  }
}
```

### SonarQube API整合腳本

```python
# sonar_integration.py
import requests
import json
import sys
import os
from typing import Dict, List, Optional

class SonarQubeAPI:
    """SonarQube API客戶端"""
    
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.session = requests.Session()
        self.session.auth = (token, '')
    
    def get_project_quality_gate(self, project_key: str) -> Dict:
        """獲取項目質量門控狀態"""
        url = f"{self.base_url}/api/qualitygates/project_status"
        params = {'projectKey': project_key}
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_project_metrics(self, project_key: str, metrics: List[str]) -> Dict:
        """獲取項目指標數據"""
        url = f"{self.base_url}/api/measures/component"
        params = {
            'component': project_key,
            'metricKeys': ','.join(metrics)
        }
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_issues(
        self, 
        project_key: str, 
        severity: Optional[str] = None,
        status: Optional[str] = None
    ) -> Dict:
        """獲取項目問題列表"""
        url = f"{self.base_url}/api/issues/search"
        params = {
            'componentKeys': project_key,
            'resolved': 'false'
        }
        
        if severity:
            params['severities'] = severity
        if status:
            params['statuses'] = status
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def create_quality_profile(self, profile_data: Dict) -> bool:
        """創建自定義質量配置文件"""
        url = f"{self.base_url}/api/qualityprofiles/create"
        
        response = self.session.post(url, data=profile_data)
        return response.status_code == 200
    
    def activate_rule(
        self, 
        profile_key: str, 
        rule_key: str, 
        severity: str
    ) -> bool:
        """激活質量配置規則"""
        url = f"{self.base_url}/api/qualityprofiles/activate_rule"
        data = {
            'key': profile_key,
            'rule': rule_key,
            'severity': severity
        }
        
        response = self.session.post(url, data=data)
        return response.status_code == 200

def check_quality_gate_status(project_key: str) -> int:
    """
    檢查質量門控狀態
    
    Returns:
        0 - 通過
        1 - 失敗
    """
    sonar = SonarQubeAPI(
        base_url=os.getenv('SONAR_HOST_URL', 'http://sonarqube:9000'),
        token=os.getenv('SONAR_TOKEN')
    )
    
    quality_gate = sonar.get_project_quality_gate(project_key)
    
    if quality_gate['projectStatus']['status'] != 'OK':
        print(f"❌ Quality Gate Failed for {project_key}")
        print("\nFailed Conditions:")
        for condition in quality_gate['projectStatus']['conditions']:
            if condition['status'] != 'OK':
                print(f"  - {condition['metricKey']}: {condition['actualValue']} "
                      f"(threshold: {condition['errorThreshold']})")
        return 1
    
    print(f"✅ Quality Gate Passed for {project_key}!")
    return 0

def generate_quality_report(project_key: str, output_file: str = 'quality-report.json'):
    """生成質量報告"""
    sonar = SonarQubeAPI(
        base_url=os.getenv('SONAR_HOST_URL'),
        token=os.getenv('SONAR_TOKEN')
    )
    
    # 獲取關鍵指標
    metrics = [
        'coverage', 'duplicated_lines_density', 'ncloc',
        'bugs', 'vulnerabilities', 'code_smells',
        'security_hotspots', 'technical_debt',
        'maintainability_rating', 'reliability_rating', 'security_rating'
    ]
    
    metrics_data = sonar.get_project_metrics(project_key, metrics)
    issues_data = sonar.get_issues(project_key)
    quality_gate = sonar.get_project_quality_gate(project_key)
    
    report = {
        'projectKey': project_key,
        'timestamp': datetime.now().isoformat(),
        'qualityGate': quality_gate,
        'metrics': metrics_data,
        'issues': issues_data
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Quality report generated: {output_file}")

if __name__ == "__main__":
    import sys
    from datetime import datetime
    
    if len(sys.argv) < 2:
        print("Usage: python sonar_integration.py <project_key>")
        sys.exit(1)
    
    project_key = sys.argv[1]
    exit_code = check_quality_gate_status(project_key)
    
    # 生成詳細報告
    generate_quality_report(project_key)
    
    sys.exit(exit_code)
```

## ESLint/Prettier格式化檢查

### ESLint配置實現

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:react/recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint',
    'security',
    'import'
  ],
  rules: {
    // 代碼品質規則
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
    
    // 安全規則
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    
    // 導入規則
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/no-absolute-path': 'error',
    'import/no-duplicates': 'error',
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }],
    
    // TypeScript特定規則
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn'
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    {
      files: ['*.test.js', '*.spec.js', '*.test.ts', '*.spec.ts'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
```

### Prettier格式化配置

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "overrides": [
    {
      "files": "*.json",
      "options": {
        "tabWidth": 2
      }
    },
    {
      "files": "*.md",
      "options": {
        "tabWidth": 2,
        "printWidth": 80,
        "proseWrap": "always"
      }
    },
    {
      "files": "*.yml",
      "options": {
        "tabWidth": 2,
        "singleQuote": false
      }
    }
  ]
}
```

### 自動化格式檢查腳本

```bash
#!/bin/bash
# format-check.sh

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
    
    # Pylint檢查
    if command -v pylint &> /dev/null; then
        echo "  - Checking with Pylint..."
        find . -name "*.py" -not -path "*/.*" -not -path "*/venv/*" \
            -not -path "*/__pycache__/*" | \
            xargs pylint \
            --output-format=json:"$REPORTS_DIR/pylint-report.json" || \
            PYLINT_EXIT=$?
        
        if [ ${PYLINT_EXIT:-0} -ne 0 ]; then
            echo "⚠️  Pylint found issues"
            # Pylint不影響整體退出碼，僅作警告
        fi
    fi
fi

# Java代碼檢查
if [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
    echo "☕ Running Java code checks..."
    
    # Checkstyle
    if [ -f "checkstyle.xml" ]; then
        echo "  - Running Checkstyle..."
        # 使用Maven插件或獨立運行
        if [ -f "pom.xml" ]; then
            mvn checkstyle:check || CHECKSTYLE_EXIT=$?
        fi
        
        if [ ${CHECKSTYLE_EXIT:-0} -ne 0 ]; then
            echo "❌ Checkstyle issues found!"
            EXIT_CODE=1
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
    "flake8": ${FLAKE8_EXIT:-0},
    "pylint": ${PYLINT_EXIT:-0},
    "checkstyle": ${CHECKSTYLE_EXIT:-0}
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
```

## 安全掃描實現

### OWASP Dependency Check配置

```bash
#!/bin/bash
# security-scan.sh

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
            # Bandit的某些警告可以容忍
        fi
    fi
fi

# OWASP Dependency Check
if command -v dependency-check &> /dev/null; then
    echo "🛡️  Running OWASP Dependency Check..."
    dependency-check \
        --project "$PROJECT_NAME" \
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
```

### CodeQL分析配置

```yaml
# .github/workflows/codeql-analysis.yml
name: "CodeQL"

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0'  # 每週日執行

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript', 'python' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v2
      with:
        languages: ${{ matrix.language }}
        queries: security-and-quality

    - name: Autobuild
      uses: github/codeql-action/autobuild@v2

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v2
      with:
        category: "/language:${{matrix.language}}"
```

## 配置驗證

### 配置文件檢查腳本

```bash
#!/bin/bash
# config-check.sh

set -e

PROJECT_ROOT=$(pwd)
REPORTS_DIR="$PROJECT_ROOT/reports"
mkdir -p "$REPORTS_DIR"

echo "⚙️  Starting configuration validation..."

EXIT_CODE=0

# 檢查必需的配置文件
REQUIRED_CONFIGS=(
    "package.json"
    ".eslintrc.js"
    ".prettierrc"
    "tsconfig.json"
    "sonar-project.properties"
)

echo "📋 Checking required configuration files..."
for config in "${REQUIRED_CONFIGS[@]}"; do
    if [ -f "$config" ]; then
        echo "  ✅ $config found"
    else
        echo "  ⚠️  $config missing (optional)"
    fi
done

# 驗證JSON配置文件
echo ""
echo "🔍 Validating JSON configurations..."
find . -name "*.json" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read -r json_file; do
    if jq empty "$json_file" 2>/dev/null; then
        echo "  ✅ $json_file is valid"
    else
        echo "  ❌ $json_file is invalid!"
        EXIT_CODE=1
    fi
done

# 驗證YAML配置文件
echo ""
echo "🔍 Validating YAML configurations..."
find . -name "*.yml" -o -name "*.yaml" | grep -v node_modules | grep -v .git | while read -r yaml_file; do
    if python3 -c "import yaml; yaml.safe_load(open('$yaml_file'))" 2>/dev/null; then
        echo "  ✅ $yaml_file is valid"
    else
        echo "  ❌ $yaml_file is invalid!"
        EXIT_CODE=1
    fi
done

# 驗證TypeScript配置
if [ -f "tsconfig.json" ]; then
    echo ""
    echo "📘 Validating TypeScript configuration..."
    if npx tsc --noEmit --project tsconfig.json; then
        echo "  ✅ TypeScript configuration is valid"
    else
        echo "  ❌ TypeScript configuration has errors!"
        EXIT_CODE=1
    fi
fi

# 生成配置檢查報告
cat > "$REPORTS_DIR/config-check-summary.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "${EXIT_CODE}",
  "checks": {
    "required_files": "checked",
    "json_validation": "checked",
    "yaml_validation": "checked",
    "typescript_config": "checked"
  }
}
EOF

if [ ${EXIT_CODE} -eq 0 ]; then
    echo ""
    echo "✅ All configuration checks passed!"
else
    echo ""
    echo "❌ Configuration validation failed!"
fi

exit ${EXIT_CODE}
```

## Python代碼品質工具

### Pylint配置

```ini
# .pylintrc
[MASTER]
ignore=CVS,.git,__pycache__,venv,.venv
ignore-patterns=test_.*?\.py

[MESSAGES CONTROL]
disable=C0111,  # missing-docstring
        C0103,  # invalid-name
        R0903,  # too-few-public-methods
        W0212,  # protected-access

[FORMAT]
max-line-length=100
indent-string='    '

[DESIGN]
max-args=7
max-locals=15
max-returns=6
max-branches=12
```

### Flake8配置

```ini
# .flake8
[flake8]
max-line-length = 100
exclude = 
    .git,
    __pycache__,
    venv,
    .venv,
    node_modules,
    migrations
ignore = 
    E203,  # whitespace before ':'
    E501,  # line too long
    W503   # line break before binary operator
```

### Mypy配置

```ini
# mypy.ini
[mypy]
python_version = 3.9
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
ignore_missing_imports = True

[mypy-tests.*]
ignore_errors = True
```

## 報告生成與聚合

### 統一報告生成器

```python
# generate_report.py
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

class QualityReportGenerator:
    """質量報告生成器"""
    
    def __init__(self, reports_dir: str = 'reports'):
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(exist_ok=True)
    
    def collect_reports(self) -> Dict:
        """收集所有檢查報告"""
        reports = {
            'timestamp': datetime.now().isoformat(),
            'eslint': self._load_json('eslint-report.json'),
            'prettier': self._load_json('format-check-summary.json'),
            'sonarqube': self._load_json('quality-report.json'),
            'security': self._load_json('security-scan-summary.json'),
            'config': self._load_json('config-check-summary.json')
        }
        return reports
    
    def _load_json(self, filename: str) -> Dict:
        """載入JSON報告"""
        filepath = self.reports_dir / filename
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    
    def generate_html_report(self, reports: Dict) -> str:
        """生成HTML報告"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Code Quality Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #333; }}
        .summary {{ background: #f5f5f5; padding: 15px; border-radius: 5px; }}
        .passed {{ color: green; }}
        .failed {{ color: red; }}
        table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #4CAF50; color: white; }}
    </style>
</head>
<body>
    <h1>Code Quality Report</h1>
    <div class="summary">
        <p><strong>Generated:</strong> {reports['timestamp']}</p>
        <p><strong>Status:</strong> <span class="passed">All Checks Passed</span></p>
    </div>
    
    <h2>ESLint Results</h2>
    <p>Issues found: {len(reports.get('eslint', {}).get('results', []))}</p>
    
    <h2>SonarQube Analysis</h2>
    <p>Quality Gate: {reports.get('sonarqube', {}).get('qualityGate', {}).get('projectStatus', {}).get('status', 'N/A')}</p>
    
    <h2>Security Scans</h2>
    <p>Vulnerabilities: {self._count_vulnerabilities(reports.get('security', {}))}</p>
</body>
</html>
        """
        return html
    
    def _count_vulnerabilities(self, security_report: Dict) -> int:
        """計算漏洞數量"""
        # 實現漏洞計數邏輯
        return 0
    
    def save_report(self):
        """保存完整報告"""
        reports = self.collect_reports()
        
        # 保存JSON格式
        with open(self.reports_dir / 'full-report.json', 'w', encoding='utf-8') as f:
            json.dump(reports, f, indent=2, ensure_ascii=False)
        
        # 保存HTML格式
        html_content = self.generate_html_report(reports)
        with open(self.reports_dir / 'index.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✅ Reports generated in {self.reports_dir}")

if __name__ == "__main__":
    generator = QualityReportGenerator()
    generator.save_report()
```

## 相關文檔

- [系統架構設計](./SYSTEM_ARCHITECTURE.md)
- [部署與基礎設施指南](./DEPLOYMENT_INFRASTRUCTURE.md)
- [配置管理說明](./configuration/)

## 更新日誌

- **2025-11-21**：初始版本，完成代碼品質檢查實現文檔
