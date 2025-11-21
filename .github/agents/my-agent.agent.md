---
# GitHub Copilot Custom Agent Configuration
# 文檔：https://gh.io/customagents/config
# CLI 測試：https://gh.io/customagents/cli

name: AutoExecutionEngine Agent
description: 專門為 SLSA Provenance 驗證和 Test Vector 執行設計的智能開發助手

# Agent 的唯一標識符
id: auto-execution-engine-agent

# Agent 版本
version: 1.0.0

# Agent 類別
category: development

# 支持的模型
models:
  - gpt-4-turbo
  - gpt-4
  - claude-3-opus

# 預設模型
default-model: gpt-4-turbo

# 啟用的功能
features:
  - code-generation
  - code-analysis
  - test-generation
  - documentation
  - security-scanning
  - performance-analysis

# MCP 服務器配置
mcp-servers:
  # 代碼分析服務器
  - name: code-analyzer
    type: stdio
    command: node
    args:
      - ./mcp-servers/code-analyzer.js
    env:
      NODE_ENV: production
      LOG_LEVEL: info
    capabilities:
      - analyze-code
      - detect-issues
      - suggest-improvements
    timeout: 30000

  # 測試生成服務器
  - name: test-generator
    type: stdio
    command: node
    args:
      - ./mcp-servers/test-generator.js
    env:
      NODE_ENV: production
    capabilities:
      - generate-unit-tests
      - generate-integration-tests
      - generate-e2e-tests
    timeout: 45000

  # 文檔生成服務器
  - name: doc-generator
    type: stdio
    command: node
    args:
      - ./mcp-servers/doc-generator.js
    capabilities:
      - generate-jsdoc
      - generate-api-docs
      - generate-guides
    timeout: 30000

  # SLSA 驗證服務器
  - name: slsa-validator
    type: stdio
    command: node
    args:
      - ./mcp-servers/slsa-validator.js
    env:
      SLSA_LEVELS: "1,2,3,4"
    capabilities:
      - validate-provenance
      - check-slsa-compliance
      - generate-compliance-report
    timeout: 60000

  # 安全掃描服務器
  - name: security-scanner
    type: stdio
    command: node
    args:
      - ./mcp-servers/security-scanner.js
    capabilities:
      - scan-vulnerabilities
      - check-dependencies
      - analyze-secrets
    timeout: 90000

  # 性能分析服務器
  - name: performance-analyzer
    type: stdio
    command: node
    args:
      - ./mcp-servers/performance-analyzer.js
    capabilities:
      - analyze-performance
      - identify-bottlenecks
      - suggest-optimizations
    timeout: 45000

---

# AutoExecutionEngine 智能開發助手

## 🎯 Agent 目標

AutoExecutionEngine Agent 是一個專門化的 AI 開發助手，旨在：

1. **簡化 SLSA Provenance 驗證** - 自動驗證供應鏈安全合規性
2. **加速 Test Vector 執行** - 生成和執行全面的測試向量
3. **增強代碼質量** - 提供智能代碼分析和改進建議
4. **自動化文檔生成** - 創建完整的 API 和架構文檔
5. **強化安全防護** - 掃描漏洞和安全問題
6. **優化性能** - 識別和解決性能瓶頸

## 📋 Agent 功能

### 1. **SLSA Provenance 驗證**

```typescript
// 示例：Agent 可以幫助驗證 SLSA 合規性
// 用戶：@agent verify-slsa-compliance

/**
 * 驗證 SLSA Level 4 合規性
 * 
 * Agent 將：
 * 1. 分析 provenance 文件
 * 2. 檢查所有 SLSA 要求
 * 3. 生成詳細的合規性報告
 * 4. 提供修復建議
 */
async function verifySLSACompliance(provenanceFile: string): Promise<ComplianceReport> {
  // Agent 自動實現
}
