# 📝 Auto-Fix Bot 使用範例

## 實際使用案例

### 案例 1: JavaScript 語法錯誤自動修復

#### 問題代碼（修復前）
> ⚠️ 注意：以下代碼包含故意製造的錯誤，用於演示 Auto-Fix Bot 的修復能力

```javascript
// app.js - 有多個語法錯誤
function calculateTotal(items) {
  let total = 0
  for (let i = 0; i < items.length i++) {  // 缺少分號
    total += items[i].price
  }
  return total
}

const result = calculateTotal([
  { price: 10 },
  { price: 20 }
  { price: 30 }  // 缺少逗號
]);

console.log(result)
```

#### Auto-Fix Bot 執行

```bash
$ autofix analyze app.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Auto-Fix Bot v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 分析 app.js...
⚡ 處理速度: 0.2s

發現問題:
  ❌ Line 4: 語法錯誤 - 缺少分號
  ❌ Line 13: 語法錯誤 - 缺少逗號

✅ 可自動修復: 2/2

$ autofix fix app.js --auto

🔧 開始修復...
  ✅ 修復 Line 4: 添加分號
  ✅ 修復 Line 13: 添加逗號

📊 修復完成！
  修復時間: 0.1s
  成功率: 100%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 修復後代碼
```javascript
// app.js - 已修復
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {  // ✅ 已添加分號
    total += items[i].price;
  }
  return total;
}

const result = calculateTotal([
  { price: 10 },
  { price: 20 },  // ✅ 已添加逗號
  { price: 30 }
]);

console.log(result);
```

---

### 案例 2: Python 代碼優化

#### 原始代碼
```python
# data_processor.py
def process_data(data):
    result = []
    for item in data:
        if item != None:  # 應該使用 is not
            if item > 0:
                result.append(item * 2)
    return result

# 低效的列表操作
numbers = [1, 2, 3, 4, 5]
squared = []
for n in numbers:
    squared.append(n ** 2)
```

#### Auto-Fix Bot 執行

```bash
$ autofix analyze data_processor.py --cloud

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Auto-Fix Bot v1.0.0 (Cloud Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☁️  使用雲端代理程式...
🔍 分析 data_processor.py...

發現優化機會:
  ⚠️  Line 4: 建議使用 'is not' 替代 '!='
  💡 Line 12-14: 可以使用列表推導式優化

✅ 可自動優化: 2/2

$ autofix fix data_processor.py --auto --optimize

🔧 開始優化...
  ✅ 優化 Line 4: 使用 'is not'
  ✅ 優化 Line 12-14: 使用列表推導式

📊 優化完成！
  優化時間: 0.3s
  性能提升: ~15%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 優化後代碼
```python
# data_processor.py
def process_data(data):
    result = []
    for item in data:
        if item is not None:  # ✅ 已優化
            if item > 0:
                result.append(item * 2)
    return result

# 優化的列表操作
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]  # ✅ 使用列表推導式
```

---

### 案例 3: TypeScript 類型錯誤修復

#### 原始代碼
```typescript
// user.ts
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  // 模擬 API 調用
  return {
    id: id,
    name: "John Doe"
    // 缺少 email 屬性
  };
}

const user = getUser(1);
console.log(user.email.toLowerCase());  // 可能拋出錯誤
```

#### Auto-Fix Bot 執行

```bash
$ autofix analyze user.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Auto-Fix Bot v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 TypeScript 分析...
⚡ 處理速度: 0.3s

發現問題:
  ❌ Line 10-13: 返回對象缺少 'email' 屬性
  ⚠️  Line 17: 可能的空值引用

建議修復方案:
  1. 添加缺失的 email 屬性
  2. 添加安全的空值檢查

$ autofix fix user.ts --interactive

🔧 修復選項:

問題 1: 缺少 email 屬性
  選項 A: 添加默認值 ""
  選項 B: 添加默認值 "unknown@example.com"
  選項 C: 使用可選屬性 email?
  
  你的選擇: B

問題 2: 可能的空值引用
  選項 A: 使用可選鏈 user.email?.toLowerCase()
  選項 B: 添加空值檢查
  
  你的選擇: A

✅ 應用修復...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 修復後代碼
```typescript
// user.ts
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  // 模擬 API 調用
  return {
    id: id,
    name: "John Doe",
    email: "unknown@example.com"  // ✅ 已添加默認值
  };
}

const user = getUser(1);
console.log(user.email?.toLowerCase());  // ✅ 使用可選鏈
```

---

### 案例 4: 雲端委派批量處理

#### 場景
一個大型專案有 500+ 個文件需要檢查和修復。

```bash
$ autofix analyze ./src --cloud --full

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Auto-Fix Bot v1.0.0 (Cloud Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☁️  初始化雲端代理程式叢集...
✅ 連接到 10 個代理程式

📋 任務分配:
  Agent 1: 分析 50 個文件 (JavaScript)
  Agent 2: 分析 50 個文件 (TypeScript)
  Agent 3: 分析 50 個文件 (Python)
  Agent 4: 分析 50 個文件 (CSS)
  Agent 5-10: 分析剩餘文件

🔄 執行中...
  [████████████████████] 100% (543/543 文件)
  
⏱️  處理時間: 2.8 分鐘
  (本地預計: 12 分鐘)
  ⚡ 效率提升: 76%

📊 分析結果:
  掃描文件: 543 個
  發現問題: 127 個
  可自動修復: 108 個 (85%)
  需要人工處理: 19 個 (15%)

按類型分類:
  語法錯誤:     45 ✅
  代碼異味:     32 ✅
  性能問題:     18 ✅
  安全漏洞:     13 ✅
  類型錯誤:     19 ⚠️

$ autofix fix ./src --cloud --batch

🔧 批量修復模式...
☁️  委派至雲端代理程式...

修復進度:
  [████████████████████] 100% (108/108 問題)

✅ 修復完成！
  修復時間: 1.5 分鐘
  成功率: 100%

📝 生成報告...
  報告保存至: autofix-report.html

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 雲端委派執行完成！
總耗時: 4.3 分鐘
效率提升: 65%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 案例 5: CI/CD 整合實戰

#### GitHub Actions 工作流

```yaml
# .github/workflows/autofix.yml
name: Auto-Fix Bot CI

on: [push, pull_request]

jobs:
  autofix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: 🤖 Run Auto-Fix Bot
        env:
          AUTOFIX_CLOUD_TOKEN: ${{ secrets.AUTOFIX_TOKEN }}
        run: |
          npm install -g autofix-bot
          autofix analyze --cloud --report
          
      - name: 📊 Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: autofix-report
          path: autofix-report.html
          
      - name: 💬 Comment on PR
        if: github.event_name == 'pull_request'
        run: |
          autofix comment --pr ${{ github.event.number }}
```

#### PR 評論示例

```markdown
## 🤖 Auto-Fix Bot 分析報告

### 📊 執行摘要
- ⏱️ **處理時間**: 0.3 秒
- 🔍 **掃描文件**: 45 個
- ✅ **問題修復**: 12 個
- 📈 **代碼質量**: +15%

### 🔧 修復詳情
1. ✅ 修復了 `app.js` 中的語法錯誤 (Line 23)
2. ✅ 優化了 `utils.js` 的性能 (Line 56-58)
3. ✅ 更新了 `package.json` 的依賴項
4. ✅ 修正了 `types.ts` 的類型定義

### 📈 改善指標
| 指標 | 修復前 | 修復後 | 改善 |
|------|--------|--------|------|
| 代碼異味 | 15 | 3 | -80% |
| 複雜度 | 8.5 | 6.2 | -27% |
| 測試覆蓋 | 75% | 82% | +7% |

### 🎯 建議
- 考慮重構 `processData` 函數以降低複雜度
- 添加更多單元測試以提高覆蓋率
- 更新文檔以反映 API 變更

---
💡 **提示**: 所有修復已自動應用，請重新運行測試。

[查看完整報告](https://autofix-bot.com/reports/abc123) | 
[配置 Auto-Fix Bot](https://docs.autofix-bot.com)
```

---

### 案例 6: 實時監控模式

```bash
$ autofix watch --auto-fix --cloud

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Auto-Fix Bot - 監控模式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👀 監控目錄: ./src
🔧 自動修復: 啟用
☁️  雲端委派: 啟用

正在監控文件變更...

[08:15:23] 📝 檢測到變更: src/app.js
[08:15:23] 🔍 分析中...
[08:15:24] ✅ 無問題發現

[08:16:45] 📝 檢測到變更: src/utils.js
[08:16:45] 🔍 分析中...
[08:16:46] ⚠️  發現 2 個問題
[08:16:46] 🔧 自動修復中...
[08:16:47] ✅ 已修復: 缺少分號 (Line 12)
[08:16:47] ✅ 已修復: 未使用變量 (Line 34)
[08:16:47] 📊 修復完成！

[08:18:12] 📝 檢測到變更: src/api.ts
[08:18:12] 🔍 分析中...
[08:18:13] ☁️  委派至雲端代理程式...
[08:18:15] ✅ 類型檢查通過

按 Ctrl+C 停止監控...
```

---

## 🎨 視覺化輸出示例

### HTML 報告

```html
<!DOCTYPE html>
<html>
<head>
  <title>Auto-Fix Bot 報告</title>
  <style>
    .metric { 
      display: inline-block; 
      padding: 10px; 
      margin: 5px; 
      border-radius: 5px; 
    }
    .success { background: #4CAF50; color: white; }
    .warning { background: #FFC107; color: black; }
    .error { background: #F44336; color: white; }
  </style>
</head>
<body>
  <h1>🤖 Auto-Fix Bot 分析報告</h1>
  
  <div class="metrics">
    <div class="metric success">
      ⚡ 響應時間: 0.3s
    </div>
    <div class="metric success">
      ✅ 問題修復: 12/14
    </div>
    <div class="metric warning">
      ⚠️  需關注: 2
    </div>
  </div>
  
  <!-- 詳細報告內容 -->
</body>
</html>
```

---

**實戰案例，一看就會！** 📝✨
