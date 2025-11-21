# 🚀 Auto-Fix Bot 快速開始指南

## 5 分鐘快速上手

### 第一步：安裝

選擇你喜歡的安裝方式：

```bash
# NPM
npm install -g autofix-bot

# Yarn
yarn global add autofix-bot

# Homebrew (macOS)
brew install autofix-bot

# pip (Python)
pip install autofix-bot
```

### 第二步：初始化

```bash
# 進入你的項目目錄
cd your-project

# 初始化 Auto-Fix Bot
autofix init

# 這會創建 .autofixrc.json 配置文件
```

### 第三步：運行第一次分析

```bash
# 分析整個項目
autofix analyze

# 輸出示例：
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🤖 Auto-Fix Bot v1.0.0
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✨ 開始分析...
# 🔍 掃描文件: 234 個
# ⚡ 處理速度: 0.3s
# ✅ 發現問題: 8 個
# 🔧 可自動修復: 7 個
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 第四步：自動修復

```bash
# 自動修復所有可修復的問題
autofix fix --auto

# 或者逐個確認修復
autofix fix --interactive
```

### 第五步：啟用雲端委派（可選）

```bash
# 登錄雲端服務
autofix login

# 啟用雲端委派
autofix config set cloudDelegation.enabled true

# 運行分析時使用雲端資源
autofix analyze --cloud
```

## 🎯 常用命令

### 基本命令

| 命令 | 說明 | 示例 |
|------|------|------|
| `autofix analyze` | 分析代碼 | `autofix analyze ./src` |
| `autofix fix` | 修復問題 | `autofix fix --auto` |
| `autofix watch` | 監控模式 | `autofix watch --auto-fix` |
| `autofix report` | 生成報告 | `autofix report --format html` |

### 雲端委派命令

| 命令 | 說明 | 示例 |
|------|------|------|
| `autofix delegate` | 委派任務 | `autofix delegate --task analyze` |
| `autofix cloud status` | 查看雲端狀態 | `autofix cloud status` |
| `autofix cloud agents` | 查看代理程式 | `autofix cloud agents --active` |

### 配置命令

| 命令 | 說明 | 示例 |
|------|------|------|
| `autofix config` | 查看配置 | `autofix config list` |
| `autofix config set` | 設置配置 | `autofix config set rules.autoFix true` |
| `autofix config reset` | 重置配置 | `autofix config reset` |

## 💡 實用技巧

### 技巧 1: 在保存時自動修復

在 `.autofixrc.json` 中配置：

```json
{
  "autoFixOnSave": true,
  "rules": {
    "autoFix": true
  }
}
```

### 技巧 2: 忽略特定文件

```json
{
  "rules": {
    "excludePatterns": [
      "node_modules/**",
      "dist/**",
      "*.min.js",
      "vendor/**"
    ]
  }
}
```

### 技巧 3: 自定義嚴重級別

```json
{
  "rules": {
    "severity": "warning",
    "customRules": {
      "no-console": "error",
      "prefer-const": "warning",
      "no-unused-vars": "error"
    }
  }
}
```

### 技巧 4: Pre-commit Hook

使用 Husky 設置自動檢查：

```bash
# 安裝 Husky
npm install -D husky

# 初始化 Husky
npx husky init

# 添加 pre-commit hook
npx husky add .husky/pre-commit "autofix fix --staged"
```

## 🔧 配置檔案範例

### 基本配置

```json
{
  "version": "1.0",
  "cloudDelegation": {
    "enabled": false
  },
  "rules": {
    "autoFix": true,
    "severity": "warning"
  },
  "languages": {
    "javascript": { "enabled": true },
    "typescript": { "enabled": true },
    "python": { "enabled": true }
  }
}
```

### 進階配置（含雲端委派）

```json
{
  "version": "1.0",
  "cloudDelegation": {
    "enabled": true,
    "endpoint": "https://cloud.autofix-bot.com",
    "mode": "intelligent",
    "agents": {
      "maxConcurrent": 10,
      "timeout": 300
    },
    "routing": {
      "strategy": "load-balanced"
    }
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
      "extensions": [".js", ".jsx"],
      "rules": {
        "no-console": "warning"
      }
    },
    "typescript": {
      "enabled": true,
      "extensions": [".ts", ".tsx"],
      "rules": {
        "strict": true
      }
    }
  },
  "logging": {
    "level": "info",
    "cloudDelegation": {
      "enabled": true
    }
  }
}
```

## 📊 使用場景示例

### 場景 1: 日常開發

```bash
# 啟動監控模式，自動修復
autofix watch --auto-fix

# 在另一個終端繼續開發
# Auto-Fix Bot 會自動檢測並修復問題
```

### 場景 2: PR 提交前檢查

```bash
# 完整掃描
autofix analyze --full

# 修復問題
autofix fix --all

# 生成報告
autofix report --format markdown > AUTOFIX_REPORT.md

# 提交 PR
git add .
git commit -m "Fixed issues with Auto-Fix Bot"
git push
```

### 場景 3: CI/CD 整合

```bash
# 在 CI 環境中
autofix analyze --cloud-delegation --report

# 如果發現問題，自動修復
if [ $? -ne 0 ]; then
  autofix fix --auto
  git add .
  git commit -m "Auto-fix by CI"
fi
```

### 場景 4: 大型專案優化

```bash
# 使用雲端委派處理大型專案
autofix analyze --cloud \
  --max-agents 20 \
  --priority high

# 批量修復
autofix fix --batch --cloud
```

## 🎓 學習資源

### 官方文檔
- [完整文檔](https://docs.autofix-bot.com)
- [API 參考](https://docs.autofix-bot.com/api)
- [最佳實踐](https://docs.autofix-bot.com/best-practices)

### 社群資源
- [GitHub 討論區](https://github.com/autofix-bot/discussions)
- [Discord 社群](https://discord.gg/autofix-bot)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/autofix-bot)

### 視頻教程
- [5 分鐘快速入門](https://youtube.com/watch?v=quick-start)
- [雲端委派深度解析](https://youtube.com/watch?v=cloud-delegation)
- [CI/CD 整合實戰](https://youtube.com/watch?v=cicd-integration)

## ❓ 常見問題

### Q: Auto-Fix Bot 是免費的嗎？
A: 基本功能完全免費。雲端委派功能需要訂閱，提供免費試用期。

### Q: 支援哪些程式語言？
A: 支援 15+ 種語言，包括 JavaScript, TypeScript, Python, Java, Go, C++, Rust 等。

### Q: 雲端委派安全嗎？
A: 是的，使用端到端加密，敏感數據不會離開本地環境。

### Q: 可以在離線環境使用嗎？
A: 可以，基本功能支援完全離線使用。雲端委派需要網絡連接。

### Q: 如何取得支援？
A: 訪問 [support.autofix-bot.com](https://support.autofix-bot.com) 或發送郵件至 support@autofix-bot.com

## 🚀 下一步

1. ✅ 完成快速開始
2. 📚 閱讀[完整文檔](../AUTO_FIX_BOT.md)
3. ☁️  了解[雲端委派](./CLOUD_DELEGATION.md)
4. 🎨 查看[視覺元素指南](./VISUAL_ELEMENTS.md)
5. 🔌 探索[整合選項](./INTEGRATION_GUIDE.md)

---

**5 分鐘上手，終身受益！** 🚀✨
