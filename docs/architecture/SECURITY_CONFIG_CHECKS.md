# 安全檢測與配置文件檢查

第二階段部署文檔，專注於深度安全掃描和配置文件驗證系統。

## 漏洞掃描實現

### Bandit Python安全檢查

完整的Python安全掃描器實現：

```python
# security_scanner.py
import subprocess
import json
import os
from typing import Dict, List, Optional
from datetime import datetime

class SecurityScanner:
    """安全掃描器 - 整合多種安全工具"""
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.reports_dir = os.path.join(project_path, 'reports', 'security')
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def run_bandit_scan(self) -> Dict:
        """執行Bandit Python安全掃描"""
        cmd = [
            'bandit', 
            '-r', self.project_path,
            '-f', 'json',
            '-o', os.path.join(self.reports_dir, 'bandit-report.json'),
            '--exclude', '*/test*,*/venv/*,*/.git/*'
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            # 讀取報告
            with open(os.path.join(self.reports_dir, 'bandit-report.json'), 'r') as f:
                report = json.load(f)
            
            # 生成摘要
            summary = {
                'tool': 'bandit',
                'timestamp': datetime.now().isoformat(),
                'total_issues': len(report.get('results', [])),
                'high_severity': len([r for r in report.get('results', []) 
                                    if r.get('issue_severity') == 'HIGH']),
                'medium_severity': len([r for r in report.get('results', []) 
                                      if r.get('issue_severity') == 'MEDIUM']),
                'low_severity': len([r for r in report.get('results', []) 
                                   if r.get('issue_severity') == 'LOW']),
                'metrics': report.get('metrics', {})
            }
            
            return summary
            
        except Exception as e:
            print(f"Bandit scan failed: {e}")
            return {'tool': 'bandit', 'error': str(e)}
    
    def run_safety_scan(self) -> Dict:
        """執行Safety依賴檢查"""
        cmd = ['safety', 'check', '--json', '--output', 
               os.path.join(self.reports_dir, 'safety-report.json')]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            # 讀取報告
            with open(os.path.join(self.reports_dir, 'safety-report.json'), 'r') as f:
                report = json.load(f)
            
            vulnerabilities = report if isinstance(report, list) else []
            
            summary = {
                'tool': 'safety',
                'timestamp': datetime.now().isoformat(),
                'total_vulnerabilities': len(vulnerabilities),
                'packages_affected': len(set([v.get('package', '') for v in vulnerabilities])),
                'vulnerabilities': vulnerabilities
            }
            
            return summary
            
        except Exception as e:
            print(f"Safety scan failed: {e}")
            return {'tool': 'safety', 'error': str(e)}
    
    def run_npm_audit(self) -> Dict:
        """執行npm audit掃描"""
        if not os.path.exists(os.path.join(self.project_path, 'package.json')):
            return {'tool': 'npm-audit', 'skipped': 'No package.json found'}
        
        cmd = ['npm', 'audit', '--json']
        
        try:
            result = subprocess.run(
                cmd, 
                capture_output=True, 
                text=True,
                cwd=self.project_path
            )
            
            report = json.loads(result.stdout)
            
            # 保存報告
            with open(os.path.join(self.reports_dir, 'npm-audit.json'), 'w') as f:
                json.dump(report, f, indent=2)
            
            vulnerabilities = report.get('vulnerabilities', {})
            
            summary = {
                'tool': 'npm-audit',
                'timestamp': datetime.now().isoformat(),
                'total_vulnerabilities': report.get('metadata', {}).get('vulnerabilities', {}).get('total', 0),
                'critical': report.get('metadata', {}).get('vulnerabilities', {}).get('critical', 0),
                'high': report.get('metadata', {}).get('vulnerabilities', {}).get('high', 0),
                'moderate': report.get('metadata', {}).get('vulnerabilities', {}).get('moderate', 0),
                'low': report.get('metadata', {}).get('vulnerabilities', {}).get('low', 0)
            }
            
            return summary
            
        except Exception as e:
            print(f"npm audit failed: {e}")
            return {'tool': 'npm-audit', 'error': str(e)}
    
    def run_snyk_scan(self) -> Dict:
        """執行Snyk安全掃描"""
        if not self._check_command_exists('snyk'):
            return {'tool': 'snyk', 'skipped': 'Snyk not installed'}
        
        cmd = ['snyk', 'test', '--json']
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=self.project_path
            )
            
            report = json.loads(result.stdout) if result.stdout else {}
            
            # 保存報告
            with open(os.path.join(self.reports_dir, 'snyk-report.json'), 'w') as f:
                json.dump(report, f, indent=2)
            
            summary = {
                'tool': 'snyk',
                'timestamp': datetime.now().isoformat(),
                'total_vulnerabilities': len(report.get('vulnerabilities', [])),
                'unique_count': report.get('uniqueCount', 0),
                'critical': len([v for v in report.get('vulnerabilities', []) 
                               if v.get('severity') == 'critical']),
                'high': len([v for v in report.get('vulnerabilities', []) 
                           if v.get('severity') == 'high']),
                'medium': len([v for v in report.get('vulnerabilities', []) 
                             if v.get('severity') == 'medium']),
                'low': len([v for v in report.get('vulnerabilities', []) 
                          if v.get('severity') == 'low'])
            }
            
            return summary
            
        except Exception as e:
            print(f"Snyk scan failed: {e}")
            return {'tool': 'snyk', 'error': str(e)}
    
    def _check_command_exists(self, command: str) -> bool:
        """檢查命令是否存在"""
        from shutil import which
        return which(command) is not None
    
    def run_all_scans(self) -> Dict:
        """執行所有安全掃描"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'project_path': self.project_path,
            'scans': {}
        }
        
        print("🔒 Starting comprehensive security scans...")
        
        # Python安全掃描
        if self._has_python_files():
            print("  🐍 Running Bandit...")
            results['scans']['bandit'] = self.run_bandit_scan()
            
            print("  🛡️ Running Safety...")
            results['scans']['safety'] = self.run_safety_scan()
        
        # Node.js安全掃描
        if os.path.exists(os.path.join(self.project_path, 'package.json')):
            print("  📦 Running npm audit...")
            results['scans']['npm_audit'] = self.run_npm_audit()
            
            print("  🔍 Running Snyk...")
            results['scans']['snyk'] = self.run_snyk_scan()
        
        # 生成總體摘要
        results['summary'] = self._generate_summary(results['scans'])
        
        # 保存總體報告
        summary_file = os.path.join(self.reports_dir, 'security-summary.json')
        with open(summary_file, 'w') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Security scans completed. Report saved to {summary_file}")
        
        return results
    
    def _has_python_files(self) -> bool:
        """檢查項目是否包含Python文件"""
        for root, dirs, files in os.walk(self.project_path):
            if any(f.endswith('.py') for f in files):
                return True
        return False
    
    def _generate_summary(self, scans: Dict) -> Dict:
        """生成總體摘要"""
        total_issues = 0
        critical_count = 0
        high_count = 0
        
        for scan_name, scan_result in scans.items():
            if 'error' in scan_result or 'skipped' in scan_result:
                continue
            
            if 'total_vulnerabilities' in scan_result:
                total_issues += scan_result['total_vulnerabilities']
            elif 'total_issues' in scan_result:
                total_issues += scan_result['total_issues']
            
            if 'critical' in scan_result:
                critical_count += scan_result['critical']
            if 'high' in scan_result or 'high_severity' in scan_result:
                high_count += scan_result.get('high', scan_result.get('high_severity', 0))
        
        return {
            'total_issues': total_issues,
            'critical': critical_count,
            'high': high_count,
            'passed': total_issues == 0 or (critical_count == 0 and high_count == 0)
        }

# 使用示例
if __name__ == "__main__":
    import sys
    
    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    scanner = SecurityScanner(project_path)
    results = scanner.run_all_scans()
    
    # 打印摘要
    print("\n" + "="*60)
    print("Security Scan Summary")
    print("="*60)
    print(f"Total Issues: {results['summary']['total_issues']}")
    print(f"Critical: {results['summary']['critical']}")
    print(f"High: {results['summary']['high']}")
    print(f"Status: {'✅ PASSED' if results['summary']['passed'] else '❌ FAILED'}")
    
    sys.exit(0 if results['summary']['passed'] else 1)
```

### OWASP Dependency Check整合

```python
# owasp_checker.py
import subprocess
import json
import os
from typing import Dict, List
from datetime import datetime

class OWASPDependencyChecker:
    """OWASP Dependency Check整合器"""
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.reports_dir = os.path.join(project_path, 'reports', 'owasp')
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def run_dependency_check(self, project_name: str = 'default-project') -> Dict:
        """執行OWASP Dependency Check"""
        
        output_dir = self.reports_dir
        
        cmd = [
            'dependency-check',
            '--project', project_name,
            '--scan', self.project_path,
            '--format', 'JSON',
            '--format', 'HTML',
            '--out', output_dir,
            '--exclude', '**/node_modules/**',
            '--exclude', '**/.venv/**',
            '--exclude', '**/venv/**',
            '--exclude', '**/.git/**',
            '--suppression', os.path.join(self.project_path, 'dependency-check-suppressions.xml')
            if os.path.exists(os.path.join(self.project_path, 'dependency-check-suppressions.xml'))
            else None
        ]
        
        # 移除None值
        cmd = [c for c in cmd if c is not None]
        
        try:
            print("🛡️ Running OWASP Dependency Check...")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10分鐘超時
            )
            
            # 讀取JSON報告
            json_report_path = os.path.join(output_dir, 'dependency-check-report.json')
            
            if os.path.exists(json_report_path):
                with open(json_report_path, 'r') as f:
                    report = json.load(f)
                
                summary = self._parse_report(report)
                summary['report_path'] = json_report_path
                
                return summary
            else:
                return {
                    'error': 'Report file not found',
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            
        except subprocess.TimeoutExpired:
            return {'error': 'Dependency check timed out after 10 minutes'}
        except Exception as e:
            return {'error': str(e)}
    
    def _parse_report(self, report: Dict) -> Dict:
        """解析OWASP報告"""
        dependencies = report.get('dependencies', [])
        
        vulnerabilities = []
        for dep in dependencies:
            if 'vulnerabilities' in dep:
                for vuln in dep['vulnerabilities']:
                    vulnerabilities.append({
                        'dependency': dep.get('fileName', 'Unknown'),
                        'name': vuln.get('name', ''),
                        'severity': vuln.get('severity', 'UNKNOWN'),
                        'cvssScore': vuln.get('cvssv3', {}).get('baseScore', 0),
                        'description': vuln.get('description', '')
                    })
        
        # 統計嚴重程度
        severity_counts = {
            'CRITICAL': 0,
            'HIGH': 0,
            'MEDIUM': 0,
            'LOW': 0,
            'UNKNOWN': 0
        }
        
        for vuln in vulnerabilities:
            severity = vuln['severity'].upper()
            if severity in severity_counts:
                severity_counts[severity] += 1
            else:
                severity_counts['UNKNOWN'] += 1
        
        return {
            'tool': 'owasp-dependency-check',
            'timestamp': datetime.now().isoformat(),
            'total_dependencies': len(dependencies),
            'vulnerable_dependencies': len([d for d in dependencies if 'vulnerabilities' in d]),
            'total_vulnerabilities': len(vulnerabilities),
            'severity_counts': severity_counts,
            'vulnerabilities': vulnerabilities[:10]  # 只返回前10個
        }
    
    def generate_suppression_file(self, vulnerabilities_to_suppress: List[str]):
        """生成抑制文件"""
        suppression_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<suppressions xmlns="https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd">
'''
        
        for cve in vulnerabilities_to_suppress:
            suppression_xml += f'''    <suppress>
        <notes><![CDATA[
        Suppressed vulnerability {cve}
        ]]></notes>
        <cve>{cve}</cve>
    </suppress>
'''
        
        suppression_xml += '</suppressions>\n'
        
        output_path = os.path.join(self.project_path, 'dependency-check-suppressions.xml')
        with open(output_path, 'w') as f:
            f.write(suppression_xml)
        
        print(f"✅ Suppression file created: {output_path}")

# 使用示例
if __name__ == "__main__":
    import sys
    
    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    checker = OWASPDependencyChecker(project_path)
    result = checker.run_dependency_check()
    
    print("\n" + "="*60)
    print("OWASP Dependency Check Summary")
    print("="*60)
    print(f"Total Dependencies: {result.get('total_dependencies', 0)}")
    print(f"Vulnerable Dependencies: {result.get('vulnerable_dependencies', 0)}")
    print(f"Total Vulnerabilities: {result.get('total_vulnerabilities', 0)}")
    print("\nSeverity Breakdown:")
    for severity, count in result.get('severity_counts', {}).items():
        print(f"  {severity}: {count}")
```

## 配置文件驗證系統

### YAML/JSON配置驗證器

```python
# config_validator.py
import yaml
import json
import os
from typing import Dict, List, Tuple, Optional
from jsonschema import validate, ValidationError
import re

class ConfigValidator:
    """配置文件驗證器"""
    
    def __init__(self, project_path: str):
        self.project_path = project_path
        self.reports_dir = os.path.join(project_path, 'reports', 'config')
        os.makedirs(self.reports_dir, exist_ok=True)
        self.errors = []
        self.warnings = []
    
    def validate_yaml_files(self) -> Dict:
        """驗證所有YAML文件"""
        yaml_files = self._find_files(['*.yml', '*.yaml'])
        
        results = {
            'total_files': len(yaml_files),
            'valid_files': 0,
            'invalid_files': 0,
            'errors': []
        }
        
        for yaml_file in yaml_files:
            try:
                with open(yaml_file, 'r', encoding='utf-8') as f:
                    yaml.safe_load(f)
                results['valid_files'] += 1
            except yaml.YAMLError as e:
                results['invalid_files'] += 1
                results['errors'].append({
                    'file': yaml_file,
                    'error': str(e)
                })
        
        return results
    
    def validate_json_files(self) -> Dict:
        """驗證所有JSON文件"""
        json_files = self._find_files(['*.json'])
        
        results = {
            'total_files': len(json_files),
            'valid_files': 0,
            'invalid_files': 0,
            'errors': []
        }
        
        for json_file in json_files:
            # 跳過node_modules和其他依賴目錄
            if 'node_modules' in json_file or '.venv' in json_file:
                continue
            
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    json.load(f)
                results['valid_files'] += 1
            except json.JSONDecodeError as e:
                results['invalid_files'] += 1
                results['errors'].append({
                    'file': json_file,
                    'error': str(e)
                })
        
        return results
    
    def validate_docker_compose(self) -> Dict:
        """驗證Docker Compose配置"""
        compose_files = [
            'docker-compose.yml',
            'docker-compose.yaml',
            'docker-compose.override.yml'
        ]
        
        results = {
            'files_checked': [],
            'valid': True,
            'errors': [],
            'warnings': []
        }
        
        for filename in compose_files:
            filepath = os.path.join(self.project_path, filename)
            if not os.path.exists(filepath):
                continue
            
            results['files_checked'].append(filename)
            
            try:
                with open(filepath, 'r') as f:
                    config = yaml.safe_load(f)
                
                # 檢查版本
                if 'version' not in config:
                    results['warnings'].append({
                        'file': filename,
                        'message': 'Missing version field'
                    })
                
                # 檢查services
                if 'services' not in config:
                    results['errors'].append({
                        'file': filename,
                        'message': 'Missing services section'
                    })
                    results['valid'] = False
                else:
                    # 檢查每個服務
                    for service_name, service_config in config['services'].items():
                        if not isinstance(service_config, dict):
                            results['errors'].append({
                                'file': filename,
                                'service': service_name,
                                'message': 'Service configuration must be a dictionary'
                            })
                            results['valid'] = False
                        
                        # 檢查必需字段
                        if 'image' not in service_config and 'build' not in service_config:
                            results['warnings'].append({
                                'file': filename,
                                'service': service_name,
                                'message': 'Service should have either image or build field'
                            })
            
            except Exception as e:
                results['errors'].append({
                    'file': filename,
                    'error': str(e)
                })
                results['valid'] = False
        
        return results
    
    def validate_kubernetes_manifests(self) -> Dict:
        """驗證Kubernetes配置"""
        k8s_files = self._find_files(['*.yaml', '*.yml'], 
                                     directories=['k8s', 'kubernetes', '.kube'])
        
        results = {
            'total_files': len(k8s_files),
            'valid_files': 0,
            'invalid_files': 0,
            'errors': [],
            'warnings': []
        }
        
        required_fields = {
            'apiVersion': str,
            'kind': str,
            'metadata': dict
        }
        
        for k8s_file in k8s_files:
            try:
                with open(k8s_file, 'r') as f:
                    manifests = list(yaml.safe_load_all(f))
                
                for manifest in manifests:
                    if not manifest:
                        continue
                    
                    # 檢查必需字段
                    for field, field_type in required_fields.items():
                        if field not in manifest:
                            results['errors'].append({
                                'file': k8s_file,
                                'error': f'Missing required field: {field}'
                            })
                            results['invalid_files'] += 1
                            break
                        
                        if not isinstance(manifest[field], field_type):
                            results['errors'].append({
                                'file': k8s_file,
                                'error': f'Field {field} must be of type {field_type.__name__}'
                            })
                            results['invalid_files'] += 1
                            break
                    else:
                        results['valid_files'] += 1
            
            except Exception as e:
                results['errors'].append({
                    'file': k8s_file,
                    'error': str(e)
                })
                results['invalid_files'] += 1
        
        return results
    
    def validate_env_files(self) -> Dict:
        """驗證環境變量文件"""
        env_files = self._find_files(['.env*'])
        
        results = {
            'total_files': len(env_files),
            'issues': []
        }
        
        # 敏感信息關鍵字
        sensitive_keywords = [
            'password', 'secret', 'key', 'token', 'credential',
            'api_key', 'private_key', 'access_key'
        ]
        
        for env_file in env_files:
            try:
                with open(env_file, 'r') as f:
                    lines = f.readlines()
                
                for line_num, line in enumerate(lines, 1):
                    line = line.strip()
                    
                    # 跳過註釋和空行
                    if not line or line.startswith('#'):
                        continue
                    
                    # 檢查格式
                    if '=' not in line:
                        results['issues'].append({
                            'file': env_file,
                            'line': line_num,
                            'type': 'format_error',
                            'message': 'Invalid format, expected KEY=VALUE'
                        })
                        continue
                    
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # 檢查敏感信息
                    if any(keyword in key.lower() for keyword in sensitive_keywords):
                        if value and value not in ['', 'your_value_here', 'changeme']:
                            results['issues'].append({
                                'file': env_file,
                                'line': line_num,
                                'type': 'security_warning',
                                'message': f'Sensitive value found for {key}'
                            })
            
            except Exception as e:
                results['issues'].append({
                    'file': env_file,
                    'error': str(e)
                })
        
        return results
    
    def _find_files(self, patterns: List[str], directories: Optional[List[str]] = None) -> List[str]:
        """查找匹配的文件"""
        import fnmatch
        
        matched_files = []
        search_dirs = directories or [self.project_path]
        
        for search_dir in search_dirs:
            full_search_dir = os.path.join(self.project_path, search_dir) \
                             if not os.path.isabs(search_dir) else search_dir
            
            if not os.path.exists(full_search_dir):
                continue
            
            for root, dirs, files in os.walk(full_search_dir):
                # 排除常見的依賴目錄
                dirs[:] = [d for d in dirs if d not in [
                    'node_modules', '.git', '__pycache__', 
                    '.venv', 'venv', 'dist', 'build'
                ]]
                
                for pattern in patterns:
                    for filename in fnmatch.filter(files, pattern):
                        matched_files.append(os.path.join(root, filename))
        
        return matched_files
    
    def run_all_validations(self) -> Dict:
        """執行所有配置驗證"""
        results = {
            'timestamp': datetime.now().isoformat(),
            'validations': {}
        }
        
        print("⚙️ Starting configuration validations...")
        
        print("  📄 Validating YAML files...")
        results['validations']['yaml'] = self.validate_yaml_files()
        
        print("  📋 Validating JSON files...")
        results['validations']['json'] = self.validate_json_files()
        
        print("  🐳 Validating Docker Compose...")
        results['validations']['docker_compose'] = self.validate_docker_compose()
        
        print("  ☸️ Validating Kubernetes manifests...")
        results['validations']['kubernetes'] = self.validate_kubernetes_manifests()
        
        print("  🔐 Validating environment files...")
        results['validations']['env_files'] = self.validate_env_files()
        
        # 生成總體摘要
        results['summary'] = self._generate_validation_summary(results['validations'])
        
        # 保存報告
        report_file = os.path.join(self.reports_dir, 'validation-report.json')
        with open(report_file, 'w') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Configuration validation completed. Report saved to {report_file}")
        
        return results
    
    def _generate_validation_summary(self, validations: Dict) -> Dict:
        """生成驗證摘要"""
        total_errors = 0
        total_warnings = 0
        
        for validation_name, validation_result in validations.items():
            if 'errors' in validation_result:
                total_errors += len(validation_result['errors'])
            if 'warnings' in validation_result:
                total_warnings += len(validation_result['warnings'])
            if 'issues' in validation_result:
                for issue in validation_result['issues']:
                    if issue.get('type') == 'security_warning':
                        total_warnings += 1
                    else:
                        total_errors += 1
        
        return {
            'total_errors': total_errors,
            'total_warnings': total_warnings,
            'passed': total_errors == 0
        }

# 使用示例
if __name__ == "__main__":
    import sys
    from datetime import datetime
    
    project_path = sys.argv[1] if len(sys.argv) > 1 else '.'
    validator = ConfigValidator(project_path)
    results = validator.run_all_validations()
    
    print("\n" + "="*60)
    print("Configuration Validation Summary")
    print("="*60)
    print(f"Total Errors: {results['summary']['total_errors']}")
    print(f"Total Warnings: {results['summary']['total_warnings']}")
    print(f"Status: {'✅ PASSED' if results['summary']['passed'] else '❌ FAILED'}")
    
    sys.exit(0 if results['summary']['passed'] else 1)
```

## 自動化集成腳本

### 完整的Phase 2檢查腳本

```bash
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
    if [ -f "security_scanner.py" ]; then
        echo "Running comprehensive security scanner..."
        python3 security_scanner.py "$PROJECT_ROOT" || SECURITY_EXIT=$?
        
        if [ ${SECURITY_EXIT:-0} -ne 0 ]; then
            echo "❌ Security scans found critical issues!"
            EXIT_CODE=1
        else
            echo "✅ Security scans passed!"
        fi
    fi
    
    # 運行OWASP檢查
    if command -v dependency-check &> /dev/null; then
        echo "Running OWASP Dependency Check..."
        python3 owasp_checker.py "$PROJECT_ROOT" || OWASP_EXIT=$?
        
        if [ ${OWASP_EXIT:-0} -ne 0 ]; then
            echo "⚠️  OWASP check found vulnerabilities"
        fi
    fi
fi

# 2. 配置文件驗證
echo ""
echo "⚙️ Step 2: Configuration Validation"
echo "------------------------------------"

if [ -f "config_validator.py" ]; then
    echo "Running configuration validator..."
    python3 config_validator.py "$PROJECT_ROOT" || CONFIG_EXIT=$?
    
    if [ ${CONFIG_EXIT:-0} -ne 0 ]; then
        echo "❌ Configuration validation failed!"
        EXIT_CODE=1
    else
        echo "✅ Configuration validation passed!"
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
    "owasp_check": ${OWASP_EXIT:-0},
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
```

## CI/CD整合

### GitHub Actions - Phase 2工作流

```yaml
# .github/workflows/phase2-security.yml
name: Phase 2 - Security & Configuration Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2點執行

jobs:
  security-scanning:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install security tools
        run: |
          pip install bandit safety snyk
          npm install -g snyk
      
      - name: Run Bandit scan
        run: |
          bandit -r . -f json -o reports/bandit-report.json || true
      
      - name: Run Safety check
        run: |
          safety check --json --output reports/safety-report.json || true
      
      - name: Run Snyk scan
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        run: |
          snyk test --json > reports/snyk-report.json || true
      
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: reports/
  
  configuration-validation:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install validation tools
        run: |
          pip install pyyaml jsonschema
      
      - name: Validate configurations
        run: |
          python3 config_validator.py .
      
      - name: Upload validation reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: config-reports
          path: reports/config/
  
  secret-detection:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload Gitleaks report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: gitleaks-report
          path: gitleaks-report.json
  
  container-security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: '.'
          format: 'json'
          output: 'trivy-report.json'
      
      - name: Upload Trivy report
        uses: actions/upload-artifact@v3
        with:
          name: trivy-report
          path: trivy-report.json
  
  license-compliance:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Check licenses
        run: |
          npx license-checker --json --out licenses.json
      
      - name: Upload license report
        uses: actions/upload-artifact@v3
        with:
          name: license-report
          path: licenses.json
```

### Jenkins Pipeline - Phase 2

```groovy
// Jenkinsfile.phase2
pipeline {
    agent any
    
    environment {
        REPORTS_DIR = 'reports/phase2'
    }
    
    stages {
        stage('Security Scanning') {
            parallel {
                stage('Bandit Scan') {
                    steps {
                        sh 'python3 security_scanner.py .'
                    }
                }
                
                stage('OWASP Check') {
                    steps {
                        sh 'python3 owasp_checker.py .'
                    }
                }
                
                stage('Snyk Scan') {
                    when {
                        expression { fileExists('package.json') }
                    }
                    steps {
                        sh 'snyk test --json > ${REPORTS_DIR}/snyk-report.json || true'
                    }
                }
            }
        }
        
        stage('Configuration Validation') {
            steps {
                sh 'python3 config_validator.py .'
            }
        }
        
        stage('Secret Detection') {
            steps {
                sh '''
                    if command -v gitleaks &> /dev/null; then
                        gitleaks detect --source=. --report-path=${REPORTS_DIR}/gitleaks.json
                    fi
                '''
            }
        }
        
        stage('Container Security') {
            when {
                expression { 
                    fileExists('Dockerfile') || fileExists('docker-compose.yml') 
                }
            }
            steps {
                sh '''
                    if command -v trivy &> /dev/null; then
                        trivy config . --format json --output ${REPORTS_DIR}/trivy.json
                    fi
                '''
            }
        }
        
        stage('Generate Report') {
            steps {
                script {
                    sh './phase2-security-check.sh'
                }
            }
        }
    }
    
    post {
        always {
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: env.REPORTS_DIR,
                reportFiles: 'phase2-summary.json',
                reportName: 'Phase 2 Security Report'
            ])
        }
        
        failure {
            emailext (
                subject: "Phase 2 Security Check Failed: ${env.JOB_NAME}",
                body: """
                    Phase 2 security and configuration checks failed.
                    
                    Check console output at: ${env.BUILD_URL}
                    
                    Reports available at: ${env.BUILD_URL}Phase_2_Security_Report
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

## 相關文檔

- [系統架構設計](./SYSTEM_ARCHITECTURE.md)
- [第一階段部署](./DEPLOYMENT_INFRASTRUCTURE.md)
- [代碼品質檢查](./CODE_QUALITY_CHECKS.md)
- [配置文件說明](./configuration/)

## 更新日誌

- **2025-11-21**：初始版本，完成第二階段安全與配置檢查文檔
