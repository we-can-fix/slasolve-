🚀 網站部署指南
===========================

📋 準備工作：
確保您已經擁有 dist/ 目錄 — 這包含了網站的最終構建

💡 部署到雲平台（推薦）：

🌟 Vercel (vercel.com) – 最簡單
1. 前往 vercel.com 並註冊
2. 點擊「New Project」
3. 選擇「Browse All Templates」→「Static」
4. 將 dist/ 文件夾拖放到上傳區域
5. 輸入專案名稱，點擊「Deploy」
6. 幾分鐘內獲得免費的 HTTPS URL！

☁️ Cloudflare Pages (pages.cloudflare.com) – 最快
1. 前往 pages.cloudflare.com 並登入
2. 點擊「Create a project」→「Upload assets」
3. 壓縮 dist/ 文件夾
4. 上傳壓縮文件
5. 設置專案名稱，點擊「Deploy site」
6. 享受全球 CDN 加速！

🔥 Netlify (netlify.com) – 用戶友好
1. 前往 netlify.com 並註冊
2. 將 dist/ 文件夾拖放到首頁上傳區域
3. 等待上傳完成
4. 您將獲得一個隨機域名（可在設置中自訂）

📘 GitHub Pages (pages.github.com) – 免費且可靠
1. 在 GitHub 上創建一個新倉庫
2. 將 dist/ 文件夾的內容上傳到倉庫
3. 前往倉庫設置 → Pages
4. 選擇「Deploy from a branch」→ 主分支
5. 通過 username.github.io/repository-name 訪問您的網站

---

🔧 高級部署（適合開發者）：

基於 Git 的自動部署
1. 將整個專案（包括原始碼）推送到 GitHub/GitLab
2. 將您的倉庫連接到 Vercel/Netlify
3. 配置構建設置：
   - 構建命令：npm run build
   - 發佈目錄：dist
   - Node.js 版本：16.x 或更高
4. 每次推送將自動觸發構建和部署

傳統伺服器部署
如果您有自己的伺服器：
1. 將 dist/ 目錄中的所有文件上傳到伺服器的 web 根目錄
2. 確保伺服器支持靜態文件託管
3. 通過您的域名訪問您的網站

---

💰 價格資訊：
- Vercel：免費方案足夠個人使用
- Cloudflare Pages：完全免費，無限制
- Netlify：免費方案包含 100GB 帶寬/月
- GitHub Pages：完全免費，100GB 帶寬/月

---

🎯 推薦：
- 初學者：Vercel 或 Netlify（拖放上傳）
- 速度優先：Cloudflare Pages
- 長期專案：GitHub Pages
- 開發者：基於 Git 的自動部署

---

⚡ 提示：
- 所有平台提供免費的 HTTPS 證書
- 您可以綁定自訂域名（某些需要付費方案）
- 部署後，在不同設備上測試您的網站

---

🆘 疑難排解：
1. 確保您上傳的是 dist/ 的內容，而不是整個專案
2. 確認 index.html 在根目錄
3. 檢查託管平台上的錯誤日誌
4. 確保所有文件均正確上傳