#!/usr/bin/env python3
# config_validator.py - Configuration file validation tool

import yaml
import json
import os
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import fnmatch


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


if __name__ == "__main__":
    import sys
    
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
