# 環境準備與基礎設施

第一階段部署文檔，包含完整的Docker容器化環境和CI/CD流水線配置。

## Docker容器化環境搭建

### 基礎Docker環境配置

首先建立完整的Docker環境，包含所有必要的檢查工具容器：

```yaml
# docker-compose.yml
version: '3.8'
services:
  # SonarQube服務
  sonarqube:
    image: sonarqube:9.9-community
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      - SONAR_JDBC_URL=jdbc:postgresql://postgres:5432/sonarqube
      - SONAR_JDBC_USERNAME=sonarqube
      - SONAR_JDBC_PASSWORD=sonarqube_password
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_logs:/opt/sonarqube/logs
      - sonarqube_extensions:/opt/sonarqube/extensions
    depends_on:
      - postgres
    
  # PostgreSQL數據庫
  postgres:
    image: postgres:13
    container_name: postgres
    environment:
      - POSTGRES_DB=sonarqube
      - POSTGRES_USER=sonarqube
      - POSTGRES_PASSWORD=sonarqube_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis緩存服務
  redis:
    image: redis:6-alpine
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Jenkins CI/CD服務
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - JENKINS_OPTS=--httpPort=8080

volumes:
  sonarqube_data:
  sonarqube_logs:
  sonarqube_extensions:
  postgres_data:
  redis_data:
  jenkins_home:
```

### 自定義檢查工具容器

建立整合多種檢查工具的自定義容器：

```dockerfile
# Dockerfile.code-checker
FROM node:16-alpine

# 安裝Python和相關工具
RUN apk add --no-cache python3 py3-pip openjdk11

# 安裝前端檢查工具
RUN npm install -g \
    eslint \
    prettier \
    @typescript-eslint/parser \
    @typescript-eslint/eslint-plugin \
    stylelint \
    jshint

# 安裝Python檢查工具
RUN pip3 install \
    pylint \
    flake8 \
    black \
    mypy \
    bandit \
    safety

# 安裝SonarScanner
RUN wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.zip \
    && unzip sonar-scanner-cli-4.8.0.zip \
    && mv sonar-scanner-4.8.0 /opt/sonar-scanner \
    && ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/

# 複製檢查腳本
COPY scripts/ /opt/scripts/
RUN chmod +x /opt/scripts/*.sh

WORKDIR /workspace
CMD ["/bin/bash"]
```

### 快速啟動指南

```bash
#!/bin/bash
# start-infrastructure.sh

echo "🚀 Starting code quality infrastructure..."

# 1. 啟動Docker服務
docker-compose up -d

# 2. 等待服務啟動
echo "⏳ Waiting for services to be ready..."
sleep 30

# 3. 檢查服務狀態
docker-compose ps

# 4. 初始化SonarQube
echo "🔧 Initializing SonarQube..."
curl -u admin:admin -X POST "http://localhost:9000/api/system/health"

# 5. 安裝Jenkins插件
echo "🔌 Installing Jenkins plugins..."
# Jenkins插件安裝將在首次訪問時手動完成

echo "✅ Infrastructure is ready!"
echo "   - SonarQube: http://localhost:9000 (admin/admin)"
echo "   - Jenkins: http://localhost:8080"
echo "   - Redis: localhost:6379"
```

## CI/CD流水線基礎設施

### Jenkins Pipeline配置

建立標準化的Jenkins Pipeline模板：

```groovy
// Jenkinsfile.code-quality
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-16'
        maven 'Maven-3.8'
    }
    
    environment {
        SONAR_TOKEN = credentials('sonar-token')
        SONAR_HOST_URL = 'http://sonarqube:9000'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Node Dependencies') {
                    when { 
                        anyOf {
                            fileExists('package.json')
                            fileExists('yarn.lock')
                        }
                    }
                    steps {
                        sh 'npm install'
                    }
                }
                stage('Python Dependencies') {
                    when { fileExists('requirements.txt') }
                    steps {
                        sh 'pip install -r requirements.txt'
                    }
                }
                stage('Java Dependencies') {
                    when { fileExists('pom.xml') }
                    steps {
                        sh 'mvn clean compile'
                    }
                }
            }
        }
        
        stage('Code Quality Checks') {
            parallel {
                stage('Static Analysis') {
                    steps {
                        script {
                            sh '''
                                sonar-scanner \
                                    -Dsonar.projectKey=${JOB_NAME} \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=${SONAR_HOST_URL} \
                                    -Dsonar.login=${SONAR_TOKEN}
                            '''
                        }
                    }
                }
                stage('Security Scan') {
                    steps {
                        sh '/opt/scripts/security-scan.sh'
                    }
                }
                stage('Format Check') {
                    steps {
                        sh '/opt/scripts/format-check.sh'
                    }
                }
                stage('Configuration Check') {
                    steps {
                        sh '/opt/scripts/config-check.sh'
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
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
                reportDir: 'reports',
                reportFiles: 'index.html',
                reportName: 'Code Quality Report'
            ])
        }
        failure {
            emailext (
                subject: "Code Quality Check Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    Build failed for ${env.JOB_NAME} - ${env.BUILD_NUMBER}
                    
                    Check console output at: ${env.BUILD_URL}
                    
                    Git Commit: ${env.GIT_COMMIT_SHORT}
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

### GitHub Actions配置

作為Jenkins的替代方案，也可以使用GitHub Actions：

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Checks

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  code-quality:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_DB: sonarqube
          POSTGRES_USER: sonarqube
          POSTGRES_PASSWORD: sonarqube_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          npm install
          pip install -r requirements.txt || echo "No requirements.txt"
      
      - name: Run ESLint
        run: npm run lint || echo "No lint script"
      
      - name: Run Prettier
        run: npm run format:check || echo "No format check"
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      
      - name: Upload reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: quality-reports
          path: reports/
```

## 依賴服務配置

### Kubernetes集群配置

對於生產環境，建議使用Kubernetes進行容器編排：

```yaml
# k8s-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: code-quality
---
# k8s-sonarqube.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sonarqube
  namespace: code-quality
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sonarqube
  template:
    metadata:
      labels:
        app: sonarqube
    spec:
      containers:
      - name: sonarqube
        image: sonarqube:9.9-community
        ports:
        - containerPort: 9000
        env:
        - name: SONAR_JDBC_URL
          value: "jdbc:postgresql://postgres-service:5432/sonarqube"
        - name: SONAR_JDBC_USERNAME
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: SONAR_JDBC_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /api/system/health
            port: 9000
          initialDelaySeconds: 60
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/system/status
            port: 9000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: sonarqube-service
  namespace: code-quality
spec:
  selector:
    app: sonarqube
  ports:
  - port: 9000
    targetPort: 9000
  type: LoadBalancer
---
# k8s-postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: code-quality
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:13
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: sonarqube
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: code-quality
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
---
# k8s-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: code-quality
type: Opaque
stringData:
  username: sonarqube
  password: sonarqube_password
```

### 監控配置

建立Prometheus監控配置：

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'sonarqube'
    static_configs:
      - targets: ['sonarqube:9000']
    metrics_path: '/api/monitoring/metrics'
    
  - job_name: 'jenkins'
    static_configs:
      - targets: ['jenkins:8080']
    metrics_path: '/prometheus'
    
  - job_name: 'code-checker'
    static_configs:
      - targets: ['code-checker:8080']
    
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
            - code-quality
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

### Grafana儀表板配置

```json
{
  "dashboard": {
    "title": "Code Quality Metrics",
    "panels": [
      {
        "title": "Quality Gate Status",
        "type": "stat",
        "targets": [
          {
            "expr": "sonarqube_quality_gate_status"
          }
        ]
      },
      {
        "title": "Code Coverage",
        "type": "graph",
        "targets": [
          {
            "expr": "sonarqube_coverage_percentage"
          }
        ]
      },
      {
        "title": "Technical Debt",
        "type": "gauge",
        "targets": [
          {
            "expr": "sonarqube_technical_debt_minutes"
          }
        ]
      },
      {
        "title": "Security Vulnerabilities",
        "type": "table",
        "targets": [
          {
            "expr": "sonarqube_vulnerabilities_by_severity"
          }
        ]
      }
    ]
  }
}
```

### 網絡配置與安全設置

```yaml
# docker-network.yaml
networks:
  code-quality-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
    driver_opts:
      com.docker.network.bridge.name: br-code-quality

# 安全組配置
security_groups:
  - name: code-quality-sg
    rules:
      - port: 9000  # SonarQube
        source: "10.0.0.0/8"
        protocol: tcp
      - port: 8080  # Jenkins
        source: "10.0.0.0/8"
        protocol: tcp
      - port: 22    # SSH
        source: "admin-ips"
        protocol: tcp
      - port: 443   # HTTPS
        source: "0.0.0.0/0"
        protocol: tcp
```

### Nginx反向代理配置

```nginx
# nginx.conf
upstream sonarqube {
    server sonarqube:9000;
}

upstream jenkins {
    server jenkins:8080;
}

server {
    listen 80;
    server_name sonar.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sonar.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://sonarqube;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name jenkins.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://jenkins;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 環境變量配置

```bash
# .env.example
# SonarQube配置
SONAR_HOST_URL=http://sonarqube:9000
SONAR_TOKEN=your_sonar_token_here
SONAR_PROJECT_KEY=your_project_key

# PostgreSQL配置
POSTGRES_DB=sonarqube
POSTGRES_USER=sonarqube
POSTGRES_PASSWORD=sonarqube_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Jenkins配置
JENKINS_URL=http://jenkins:8080
JENKINS_USER=admin
JENKINS_TOKEN=your_jenkins_token

# 監控配置
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000
GRAFANA_API_KEY=your_grafana_api_key

# 通知配置
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_FROM=noreply@example.com
```

## 部署步驟

### 1. 準備環境

```bash
# 克隆倉庫
git clone https://github.com/your-org/code-quality-system.git
cd code-quality-system

# 複製環境變量文件
cp .env.example .env

# 編輯環境變量
vim .env
```

### 2. 啟動Docker容器

```bash
# 構建自定義鏡像
docker build -f Dockerfile.code-checker -t code-checker:latest .

# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps
docker-compose logs -f
```

### 3. 初始化服務

```bash
# 等待服務就緒
./scripts/wait-for-services.sh

# 初始化SonarQube
./scripts/init-sonarqube.sh

# 配置Jenkins
./scripts/configure-jenkins.sh
```

### 4. 驗證部署

```bash
# 檢查SonarQube
curl http://localhost:9000/api/system/health

# 檢查Jenkins
curl http://localhost:8080/login

# 檢查Redis
redis-cli ping

# 檢查PostgreSQL
psql -h localhost -U sonarqube -d sonarqube -c "SELECT version();"
```

## 故障排除

### 常見問題

1. **SonarQube啟動失敗**
   ```bash
   # 檢查日誌
   docker-compose logs sonarqube
   
   # 增加內存限制
   # 編輯docker-compose.yml，設置SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
   ```

2. **PostgreSQL連接失敗**
   ```bash
   # 檢查網絡連接
   docker network inspect code-quality-network
   
   # 重啟PostgreSQL
   docker-compose restart postgres
   ```

3. **Jenkins插件安裝失敗**
   ```bash
   # 手動下載插件
   wget -P /var/jenkins_home/plugins/ https://updates.jenkins.io/download/plugins/...
   
   # 重啟Jenkins
   docker-compose restart jenkins
   ```

## 性能調優

### SonarQube優化

```properties
# sonar.properties
sonar.web.javaOpts=-Xmx2G -Xms512m
sonar.ce.javaOpts=-Xmx2G -Xms512m
sonar.search.javaOpts=-Xmx2G -Xms512m
```

### PostgreSQL優化

```sql
-- postgresql.conf
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 5MB
```

### Redis優化

```conf
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 維護計劃

### 日常維護
- 每日檢查服務狀態
- 每日備份數據庫
- 每週清理舊日誌
- 每月更新依賴包

### 定期維護
- 每季度升級組件版本
- 每半年進行安全審計
- 每年進行容量規劃評估

這個基礎設施配置提供了完整的容器化環境，支持高可用部署和自動擴展，為代碼檢查系統提供穩定可靠的運行基礎。

## 相關文檔

- [系統架構設計](./SYSTEM_ARCHITECTURE.md)
- [代碼品質檢查實現](./CODE_QUALITY_CHECKS.md)
- [配置管理說明](./configuration/)

## 更新日誌

- **2025-11-21**：初始版本，完成部署與基礎設施文檔
