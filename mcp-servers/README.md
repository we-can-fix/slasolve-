# AutoExecutionEngine MCP Servers

這個目錄包含 AutoExecutionEngine Custom Agent 使用的 Model Context Protocol (MCP) 服務器。

## 🔧 MCP 服務器列表

### 1. Code Analyzer (`code-analyzer.js`)
分析代碼質量、複雜度和潛在問題。

**功能：**
- 分析代碼複雜度
- 檢測代碼異味
- 檢查 SOLID 原則遵循情況

**使用方法：**
```bash
node code-analyzer.js
```

### 2. Test Generator (`test-generator.js`)
生成單元測試、集成測試和測試向量。

**功能：**
- 生成單元測試
- 生成集成測試
- 生成測試向量

**使用方法：**
```bash
node test-generator.js
```

### 3. Documentation Generator (`doc-generator.js`)
自動生成 API 文檔和 JSDoc 註釋。

**功能：**
- 生成 JSDoc 註釋
- 生成 API 文檔
- 生成使用指南

**使用方法：**
```bash
node doc-generator.js
```

### 4. SLSA Validator (`slsa-validator.js`)
驗證 SLSA Provenance 合規性。

**功能：**
- 驗證 SLSA Level 1-4 合規性
- 檢查簽名
- 驗證構建環境

**使用方法：**
```bash
node slsa-validator.js
```

### 5. Security Scanner (`security-scanner.js`)
掃描安全漏洞和密鑰洩露。

**功能：**
- 掃描安全漏洞
- 檢查依賴安全性
- 檢測硬編碼密鑰

**使用方法：**
```bash
node security-scanner.js
```

### 6. Performance Analyzer (`performance-analyzer.js`)
分析代碼性能並提供優化建議。

**功能：**
- 分析性能問題
- 識別性能瓶頸
- 提供優化建議

**使用方法：**
```bash
node performance-analyzer.js
```

## 📦 安裝

```bash
cd mcp-servers
npm install
```

## 🧪 測試

測試所有 MCP 服務器：

```bash
npm run validate
```

測試單個服務器：

```bash
node code-analyzer.js --validate
node test-generator.js --validate
node doc-generator.js --validate
node slsa-validator.js --validate
node security-scanner.js --validate
node performance-analyzer.js --validate
```

## 🔌 MCP 協議

所有服務器實現了 Model Context Protocol (MCP) 規範：

- 使用 stdio 進行通信
- 支持 JSON-RPC 2.0
- 提供工具列表和調用接口

## 📚 相關資源

- [MCP 規範](https://modelcontextprotocol.io/)
- [GitHub Copilot Custom Agents](https://gh.io/customagents/config)

## 📝 許可證

MIT
