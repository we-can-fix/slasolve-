# AutoExecutionEngine Custom Agent 使用指南

## 📖 概述

AutoExecutionEngine Agent 是一個專門為 SLSA Provenance 驗證和 Test Vector 執行設計的 GitHub Copilot Custom Agent。它集成了 6 個強大的 MCP (Model Context Protocol) 服務器，提供代碼分析、測試生成、文檔創建、安全掃描和性能優化等功能。

## 🎯 主要功能

1. **SLSA Provenance 驗證** - 自動驗證供應鏈安全合規性（Level 1-4）
2. **Test Vector 執行** - 生成和執行全面的測試向量
3. **代碼質量分析** - 檢查複雜度、代碼異味和 SOLID 原則
4. **文檔自動生成** - 創建 JSDoc、API 文檔和使用指南
5. **安全漏洞掃描** - 檢測常見漏洞、依賴問題和密鑰洩露
6. **性能優化建議** - 識別瓶頸並提供優化方案

## 🚀 快速開始

### 1. 安裝依賴

```bash
cd mcp-servers
npm install
```

### 2. 部署驗證

```bash
./deploy-agent.sh
```

### 3. 測試 Agent

```bash
./test-agent.sh
```

### 4. 使用 Agent

在支持 GitHub Copilot 的 IDE 中（如 VS Code）：

1. 打開命令面板：`Cmd/Ctrl + Shift + P`
2. 選擇 `GitHub Copilot: Select Agent`
3. 選擇 `AutoExecutionEngine Agent`
4. 開始與 Agent 交互

## 💡 使用示例

### 驗證 SLSA 合規性

```bash
@agent verify SLSA Level 4 compliance for this build
```

Agent 將：
1. 分析 provenance 文件
2. 檢查所有 SLSA 要求
3. 生成詳細的合規性報告
4. 提供修復建議

### 生成測試向量

```bash
@agent generate test vectors for the validateProvenance function
```

Agent 將：
1. 分析函數簽名
2. 識別關鍵輸入參數
3. 生成邊界情況測試
4. 創建測試執行計劃

### 代碼質量分析

```bash
@agent analyze code quality in src/core/validator.js
```

Agent 將：
1. 計算圈複雜度
2. 檢測代碼異味
3. 驗證 SOLID 原則
4. 提供重構建議

### 生成文檔

```bash
@agent generate API documentation for the SLSA validator module
```

Agent 將：
1. 分析函數和類
2. 生成 JSDoc 註釋
3. 創建 API 參考文檔
4. 添加使用示例

### 安全掃描

```bash
@agent scan for security vulnerabilities in the codebase
```

Agent 將：
1. 檢查 OWASP Top 10 漏洞
2. 掃描依賴安全性
3. 檢測硬編碼密鑰
4. 生成安全報告

### 性能優化

```bash
@agent identify performance bottlenecks in src/executor.js
```

Agent 將：
1. 分析算法複雜度
2. 識別嵌套循環
3. 檢查 I/O 操作
4. 提供優化建議

## 🔧 配置選項

### 環境變量（.env.agent）

```bash
# 日誌級別
LOG_LEVEL=info

# 超時設定
AGENT_TIMEOUT=300000
MCP_SERVER_TIMEOUT=60000

# 模型配置
DEFAULT_MODEL=gpt-4-turbo
TEMPERATURE=0.7
MAX_TOKENS=4096

# 功能開關
ENABLE_CODE_ANALYSIS=true
ENABLE_TEST_GENERATION=true
ENABLE_SECURITY_SCANNING=true
ENABLE_PERFORMANCE_ANALYSIS=true

# SLSA 配置
SLSA_LEVELS=1,2,3,4
SLSA_STRICT_MODE=true

# 安全配置
SCAN_DEPENDENCIES=true
SCAN_SECRETS=true
SECURITY_SEVERITY_THRESHOLD=medium
```

## 📁 項目結構

```
.
├── .github/
│   └── agents/
│       └── my-agent.agent.md        # Agent 配置文件
├── mcp-servers/                     # MCP 服務器目錄
│   ├── code-analyzer.js            # 代碼分析服務器
│   ├── test-generator.js           # 測試生成服務器
│   ├── doc-generator.js            # 文檔生成服務器
│   ├── slsa-validator.js           # SLSA 驗證服務器
│   ├── security-scanner.js         # 安全掃描服務器
│   ├── performance-analyzer.js     # 性能分析服務器
│   ├── package.json                # NPM 依賴配置
│   └── README.md                   # MCP 服務器說明
├── .env.agent                       # Agent 環境配置
├── deploy-agent.sh                  # 部署腳本
├── test-agent.sh                    # 測試腳本
└── AGENT_GUIDE.md                   # 本指南
```

## 🛠️ MCP 服務器詳情

### Code Analyzer

**功能：**
- `analyze_code` - 分析代碼質量和複雜度
- `detect_code_smells` - 檢測代碼異味
- `check_solid_principles` - 檢查 SOLID 原則

**使用方法：**
```bash
node mcp-servers/code-analyzer.js
```

### Test Generator

**功能：**
- `generate_unit_tests` - 生成單元測試
- `generate_integration_tests` - 生成集成測試
- `generate_test_vectors` - 生成測試向量

**使用方法：**
```bash
node mcp-servers/test-generator.js
```

### Documentation Generator

**功能：**
- `generate_jsdoc` - 生成 JSDoc 註釋
- `generate_api_docs` - 生成 API 文檔

**使用方法：**
```bash
node mcp-servers/doc-generator.js
```

### SLSA Validator

**功能：**
- `validate_slsa_level` - 驗證 SLSA 級別合規性
- `check_signature` - 驗證簽名
- `verify_build_environment` - 驗證構建環境

**使用方法：**
```bash
node mcp-servers/slsa-validator.js
```

### Security Scanner

**功能：**
- `scan_vulnerabilities` - 掃描安全漏洞
- `check_dependencies` - 檢查依賴安全性
- `detect_secrets` - 檢測硬編碼密鑰

**使用方法：**
```bash
node mcp-servers/security-scanner.js
```

### Performance Analyzer

**功能：**
- `analyze_performance` - 分析性能問題
- `identify_bottlenecks` - 識別性能瓶頸
- `suggest_optimizations` - 提供優化建議

**使用方法：**
```bash
node mcp-servers/performance-analyzer.js
```

## 📝 開發指南

### 添加新的 MCP 服務器

1. 在 `mcp-servers/` 目錄創建新的 `.js` 文件
2. 實現 MCP 協議接口（initialize, tools/list, tools/call）
3. 在 `my-agent.agent.md` 中添加服務器配置
4. 更新 `deploy-agent.sh` 和 `test-agent.sh`
5. 添加文檔到 `mcp-servers/README.md`

### 測試新功能

```bash
# 驗證語法
node your-server.js --validate

# 手動測試
echo '{"jsonrpc":"2.0","id":1,"method":"initialize"}' | node your-server.js
```

## 🔍 故障排除

### MCP 服務器無法啟動

1. 檢查 Node.js 版本（需要 >= 18.0.0）
2. 確認依賴已安裝：`cd mcp-servers && npm install`
3. 檢查文件權限：`chmod +x mcp-servers/*.js`

### Agent 無響應

1. 檢查 `.env.agent` 配置
2. 確認 MCP 服務器正在運行
3. 查看日誌：`tail -f mcp-servers/logs/*.log`

### 驗證失敗

1. 運行部署腳本：`./deploy-agent.sh`
2. 檢查錯誤輸出
3. 修復報告的問題
4. 重新運行測試：`./test-agent.sh`

## 📚 相關資源

- [GitHub Copilot Custom Agents 官方文檔](https://gh.io/customagents/config)
- [MCP 規範](https://modelcontextprotocol.io/)
- [SLSA 框架](https://slsa.dev/)
- [VS Code Copilot 集成](https://code.visualstudio.com/docs/copilot/customization/custom-agents)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 貢獻流程

1. Fork 本倉庫
2. 創建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 開啟 Pull Request

## 📄 許可證

MIT License

## 🎉 致謝

感謝所有貢獻者和 GitHub Copilot 團隊提供的優秀工具和平台！

---

**版本：** 1.0.0  
**更新日期：** 2025-11-21  
**維護者：** AutoExecutionEngine Team
