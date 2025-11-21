# 🔌 Auto-Fix Bot 整合指南

## 快速整合

### GitHub Actions 整合

#### 1. 基本配置

在 `.github/workflows/autofix.yml` 中添加:

```yaml
name: Auto-Fix Bot

on: [push, pull_request]

jobs:
  autofix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Auto-Fix Bot
        run: |
          echo "Running Auto-Fix Bot..."
          # 實際整合時替換為真實命令
```

#### 2. 進階配置

```yaml
name: Auto-Fix Bot Advanced

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Auto-Fix Bot
        env:
          AUTOFIX_CLOUD_TOKEN: ${{ secrets.AUTOFIX_TOKEN }}
        run: |
          npm install -g autofix-bot
          
      - name: Run Analysis
        run: |
          autofix analyze --cloud-delegation
          
      - name: Apply Fixes
        if: github.event_name == 'pull_request'
        run: |
          autofix fix --auto-commit
```

## CI/CD 平台整合

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - analyze
  - fix
  - test

autofix:analyze:
  stage: analyze
  script:
    - autofix analyze --report
  artifacts:
    reports:
      autofix: autofix-report.json

autofix:fix:
  stage: fix
  script:
    - autofix fix --cloud-delegation
  only:
    - merge_requests
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    stages {
        stage('Auto-Fix Analysis') {
            steps {
                sh 'autofix analyze'
            }
        }
        
        stage('Cloud Delegation') {
            steps {
                sh 'autofix delegate --tasks all'
            }
        }
        
        stage('Report') {
            steps {
                publishHTML([
                    reportName: 'Auto-Fix Report',
                    reportDir: 'autofix-reports',
                    reportFiles: 'index.html'
                ])
            }
        }
    }
}
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  autofix: autofix/bot@1.0

workflows:
  main:
    jobs:
      - autofix/analyze:
          cloud-delegation: true
      - autofix/fix:
          requires:
            - autofix/analyze
```

## IDE 整合

### VS Code 擴展

#### 安裝
```bash
code --install-extension autofix-bot.vscode
```

#### 配置 `.vscode/settings.json`
```json
{
  "autofix.enabled": true,
  "autofix.cloudDelegation": true,
  "autofix.autoFixOnSave": true,
  "autofix.languages": [
    "javascript",
    "typescript",
    "python",
    "java"
  ]
}
```

### JetBrains IDEs

#### 插件安裝
1. File → Settings → Plugins
2. 搜索 "Auto-Fix Bot"
3. 點擊 Install

#### 配置
```xml
<!-- .idea/autofix.xml -->
<autofix-configuration>
  <enabled>true</enabled>
  <cloudDelegation>true</cloudDelegation>
  <autoFixOnSave>true</autoFixOnSave>
</autofix-configuration>
```

## 命令列工具整合

### 安裝 CLI

```bash
# npm
npm install -g autofix-bot-cli

# yarn
yarn global add autofix-bot-cli

# pip
pip install autofix-bot

# homebrew (macOS)
brew install autofix-bot
```

### 基本用法

```bash
# 分析代碼
autofix analyze

# 自動修復
autofix fix

# 雲端委派
autofix delegate --task analyze

# 生成報告
autofix report --format html

# 監控模式
autofix watch --auto-fix
```

### 配置檔案 `.autofixrc.json`

```json
{
  "version": "1.0",
  "cloudDelegation": {
    "enabled": true,
    "endpoint": "https://cloud.autofix-bot.com",
    "maxConcurrent": 10
  },
  "rules": {
    "autoFix": true,
    "severity": "warning",
    "excludePatterns": [
      "node_modules/**",
      "dist/**"
    ]
  },
  "languages": {
    "javascript": {
      "enabled": true,
      "extensions": [".js", ".jsx"]
    },
    "typescript": {
      "enabled": true,
      "extensions": [".ts", ".tsx"]
    }
  }
}
```

## Git Hooks 整合

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running Auto-Fix Bot..."

# 分析暫存的文件
autofix analyze --staged

# 自動修復
autofix fix --staged --auto-stage

# 如果有錯誤，阻止提交
if [ $? -ne 0 ]; then
  echo "❌ Auto-Fix Bot 發現問題，請修復後再提交"
  exit 1
fi

echo "✅ Auto-Fix Bot 檢查通過"
exit 0
```

### Pre-push Hook

```bash
# .git/hooks/pre-push
#!/bin/bash

echo "Running comprehensive analysis..."

# 完整掃描
autofix analyze --full --cloud-delegation

# 生成報告
autofix report --format text

exit 0
```

### 使用 Husky

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "autofix fix --staged",
      "pre-push": "autofix analyze --full"
    }
  }
}
```

## Docker 整合

### Dockerfile

```dockerfile
FROM node:18-alpine

# 安裝 Auto-Fix Bot
RUN npm install -g autofix-bot

# 設置工作目錄
WORKDIR /app

# 複製代碼
COPY . .

# 運行分析
RUN autofix analyze --report

# 自動修復
RUN autofix fix --cloud-delegation

CMD ["autofix", "watch"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  autofix-bot:
    image: autofix-bot:latest
    environment:
      - AUTOFIX_CLOUD_TOKEN=${AUTOFIX_TOKEN}
      - AUTOFIX_CLOUD_DELEGATION=true
    volumes:
      - ./src:/app/src
      - ./autofix-reports:/reports
    command: autofix watch --auto-fix
```

## Webhook 整合

### GitHub Webhook

```javascript
// webhook-handler.js
const express = require('express');
const { AutoFixBot } = require('autofix-bot');

const app = express();
app.use(express.json());

app.post('/webhook/github', async (req, res) => {
  const { action, pull_request } = req.body;
  
  if (action === 'opened' || action === 'synchronize') {
    const bot = new AutoFixBot({
      cloudDelegation: true
    });
    
    await bot.analyzePullRequest(pull_request);
    await bot.commentOnPR(pull_request);
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### GitLab Webhook

```python
# webhook_handler.py
from flask import Flask, request
from autofix_bot import AutoFixBot

app = Flask(__name__)
bot = AutoFixBot(cloud_delegation=True)

@app.route('/webhook/gitlab', methods=['POST'])
def handle_gitlab_webhook():
    data = request.json
    
    if data['object_kind'] == 'merge_request':
        bot.analyze_merge_request(data['object_attributes'])
        bot.add_mr_comment(data['object_attributes'])
    
    return 'OK', 200

if __name__ == '__main__':
    app.run(port=3000)
```

## API 整合

### REST API

```javascript
// API 客戶端示例
const axios = require('axios');

class AutoFixBotAPI {
  constructor(token) {
    this.client = axios.create({
      baseURL: 'https://api.autofix-bot.com/v1',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
  
  async analyze(code, options = {}) {
    const response = await this.client.post('/analyze', {
      code,
      cloudDelegation: options.cloudDelegation || true,
      language: options.language || 'auto-detect'
    });
    return response.data;
  }
  
  async fix(analysisId) {
    const response = await this.client.post(`/fix/${analysisId}`);
    return response.data;
  }
  
  async getReport(analysisId) {
    const response = await this.client.get(`/reports/${analysisId}`);
    return response.data;
  }
}

// 使用示例
const api = new AutoFixBotAPI(process.env.AUTOFIX_TOKEN);

const analysis = await api.analyze(sourceCode, {
  cloudDelegation: true,
  language: 'javascript'
});

const fixed = await api.fix(analysis.id);
const report = await api.getReport(analysis.id);
```

### GraphQL API

```graphql
# GraphQL 查詢示例
mutation AnalyzeCode($input: AnalyzeInput!) {
  analyze(input: $input) {
    id
    status
    issues {
      severity
      message
      line
      column
    }
    metrics {
      responseTime
      issuesFound
      autoFixed
    }
  }
}

query GetAnalysisReport($id: ID!) {
  analysis(id: $id) {
    id
    status
    report {
      summary
      details
      recommendations
    }
  }
}
```

## 監控整合

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'autofix-bot'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "Auto-Fix Bot Metrics",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "autofix_response_time_seconds"
          }
        ]
      },
      {
        "title": "Success Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "autofix_success_rate"
          }
        ]
      }
    ]
  }
}
```

## 故障排除

### 常見問題

**問題**: 連接雲端失敗
```bash
# 檢查配置
autofix config --check

# 測試連接
autofix test-connection

# 查看日誌
autofix logs --tail 100
```

**問題**: 授權失敗
```bash
# 重新設置令牌
autofix login

# 驗證令牌
autofix verify-token
```

---

**無縫整合，高效開發！** 🔌✨
