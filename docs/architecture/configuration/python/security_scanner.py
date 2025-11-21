#!/usr/bin/env python3
# security_scanner.py - Comprehensive security scanning tool

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
            report_path = os.path.join(self.reports_dir, 'bandit-report.json')
            if os.path.exists(report_path):
                with open(report_path, 'r') as f:
                    report = json.load(f)
            else:
                return {'tool': 'bandit', 'error': 'Report file not created'}
            
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
        cmd = ['safety', 'check', '--json']
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=self.project_path)
            
            # 解析輸出
            report = json.loads(result.stdout) if result.stdout else []
            
            # 保存報告
            with open(os.path.join(self.reports_dir, 'safety-report.json'), 'w') as f:
                json.dump(report, f, indent=2)
            
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
            
            report = json.loads(result.stdout) if result.stdout else {}
            
            # 保存報告
            with open(os.path.join(self.reports_dir, 'npm-audit.json'), 'w') as f:
                json.dump(report, f, indent=2)
            
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
            # 排除常見的依賴目錄
            dirs[:] = [d for d in dirs if d not in ['venv', '.venv', 'node_modules', '.git']]
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
