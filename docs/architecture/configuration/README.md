# 配置文件說明

本目錄包含代碼品質檢查系統的所有配置文件和腳本。

## 目錄結構

```
configuration/
├── docker/                      # Docker相關配置
│   ├── docker-compose.yml      # Docker Compose配置文件
│   └── Dockerfile.code-checker # 代碼檢查工具容器
├── jenkins/                     # Jenkins CI/CD配置
│   └── Jenkinsfile.code-quality # Jenkins Pipeline定義
├── kubernetes/                  # Kubernetes部署配置
│   └── k8s-sonarqube.yaml      # SonarQube K8s部署配置
├── monitoring/                  # 監控配置
│   └── prometheus-config.yaml  # Prometheus監控配置
├── scripts/                     # 執行腳本
│   ├── format-check.sh         # 格式檢查腳本
│   ├── security-scan.sh        # 安全掃描腳本
│   └── config-check.sh         # 配置驗證腳本
├── .eslintrc.example.js        # ESLint配置範例
├── .prettierrc.example.json    # Prettier配置範例
├── sonar-project.properties.example  # SonarQube配置範例
└── README.md                    # 本文件
```

## 使用說明

### Docker配置

1. **啟動所有服務**
   ```bash
   cd docker/
   docker-compose up -d
   ```

2. **構建自定義檢查工具容器**
   ```bash
   docker build -f docker/Dockerfile.code-checker -t code-checker:latest .
   ```

3. **停止服務**
   ```bash
   docker-compose down
   ```

### Jenkins配置

1. 將 `jenkins/Jenkinsfile.code-quality` 複製到項目根目錄
2. 在Jenkins中創建Pipeline項目
3. 配置項目使用該Jenkinsfile
4. 設置必要的憑證（SONAR_TOKEN等）

### Kubernetes配置

1. **創建命名空間和部署服務**
   ```bash
   kubectl apply -f kubernetes/k8s-sonarqube.yaml
   ```

2. **查看服務狀態**
   ```bash
   kubectl get pods -n code-quality
   kubectl get services -n code-quality
   ```

3. **訪問SonarQube**
   ```bash
   kubectl port-forward -n code-quality svc/sonarqube-service 9000:9000
   ```

### 執行腳本

所有腳本都需要可執行權限：

```bash
chmod +x scripts/*.sh
```

#### 格式檢查
```bash
./scripts/format-check.sh
```

#### 安全掃描
```bash
./scripts/security-scan.sh
```

#### 配置驗證
```bash
./scripts/config-check.sh
```

### 配置文件範例

#### ESLint配置
複製 `.eslintrc.example.js` 到項目根目錄並重命名為 `.eslintrc.js`：
```bash
cp .eslintrc.example.js /path/to/project/.eslintrc.js
```

#### Prettier配置
複製 `.prettierrc.example.json` 到項目根目錄並重命名為 `.prettierrc.json`：
```bash
cp .prettierrc.example.json /path/to/project/.prettierrc.json
```

#### SonarQube配置
複製 `sonar-project.properties.example` 到項目根目錄並重命名為 `sonar-project.properties`：
```bash
cp sonar-project.properties.example /path/to/project/sonar-project.properties
```

## 環境變量

### 必需的環境變量

```bash
# SonarQube
export SONAR_HOST_URL=http://sonarqube:9000
export SONAR_TOKEN=your_sonar_token_here

# PostgreSQL
export POSTGRES_PASSWORD=sonarqube_password

# Jenkins
export JENKINS_URL=http://jenkins:8080
```

### 環境變量文件

創建 `.env` 文件：

```bash
SONAR_HOST_URL=http://sonarqube:9000
SONAR_TOKEN=your_token
POSTGRES_PASSWORD=your_password
```

## 監控配置

### Prometheus

1. 啟動Prometheus：
   ```bash
   docker run -d \
     -p 9090:9090 \
     -v $(pwd)/monitoring/prometheus-config.yaml:/etc/prometheus/prometheus.yml \
     prom/prometheus
   ```

2. 訪問Prometheus UI：
   打開瀏覽器訪問 `http://localhost:9090`

### Grafana

1. 啟動Grafana：
   ```bash
   docker run -d \
     -p 3000:3000 \
     grafana/grafana
   ```

2. 添加Prometheus作為數據源
3. 導入預定義的儀表板

## 故障排除

### 常見問題

1. **Docker容器啟動失敗**
   - 檢查端口是否被占用
   - 查看日誌：`docker-compose logs service_name`

2. **SonarQube無法連接數據庫**
   - 確認PostgreSQL已啟動
   - 檢查環境變量配置

3. **腳本執行權限錯誤**
   - 執行：`chmod +x scripts/*.sh`

4. **Jenkins Pipeline失敗**
   - 檢查必要的工具是否已安裝
   - 確認憑證配置正確

## 最佳實踐

1. **定期更新鏡像**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

2. **備份數據**
   ```bash
   docker-compose exec postgres pg_dump -U sonarqube sonarqube > backup.sql
   ```

3. **監控資源使用**
   ```bash
   docker stats
   kubectl top pods -n code-quality
   ```

4. **日誌管理**
   - 設置日誌輪換
   - 定期清理舊日誌

## 安全考慮

1. **更改默認密碼**
   - SonarQube: admin/admin
   - PostgreSQL: 使用強密碼

2. **使用Secrets管理**
   - Kubernetes Secrets
   - Docker Secrets
   - 環境變量文件權限設置為600

3. **網絡隔離**
   - 使用內部網絡
   - 限制對外暴露的端口

4. **定期更新**
   - 保持所有組件為最新版本
   - 訂閱安全公告

## 相關文檔

- [系統架構設計](../SYSTEM_ARCHITECTURE.md)
- [部署與基礎設施指南](../DEPLOYMENT_INFRASTRUCTURE.md)
- [代碼品質檢查實現](../CODE_QUALITY_CHECKS.md)

## 維護

### 日常維護任務
- 檢查服務健康狀態
- 查看錯誤日誌
- 監控資源使用

### 定期維護任務
- 更新依賴包
- 清理舊數據
- 審查和更新配置

### 升級流程
1. 備份當前配置和數據
2. 測試新版本
3. 更新生產環境
4. 驗證功能正常

## 支持

如有問題或建議，請：
1. 查看相關文檔
2. 檢查issue列表
3. 提交新issue

## 更新日誌

- **2025-11-21**：初始版本，完成配置文件和腳本
