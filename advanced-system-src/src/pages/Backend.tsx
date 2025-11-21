
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Database, Lock, Server, Shield } from 'lucide-react';

export default function Backend() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-6">
        <div className="mb-12">
          <span className="text-green-500 font-mono text-sm tracking-wider uppercase">Backend Engineering</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">堅實的後端核心</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            基於 Node.js 構建的高效能 API 服務。採用分層架構 (Layered Architecture)，確保業務邏輯清晰、易於測試與擴展。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* API Architecture */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Server className="text-green-400" /> API 架構設計
            </h2>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
              <p className="text-slate-400">
                我們將後端邏輯嚴格區分為 <strong>路由 (Routes)</strong>、<strong>控制器 (Controllers)</strong> 與 <strong>服務層 (Services)</strong>。
              </p>
              
              <div className="font-mono text-sm">
                <div className="mb-4">
                  <div className="text-purple-400 font-bold mb-1">// 1. Route Layer</div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-300">
                    router.post('/users', UserController.create);
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-blue-400 font-bold mb-1">// 2. Controller Layer (處理 Request/Response)</div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-300">
                    const create = async (req, res) ={'>'} {'{'}<br/>
                    &nbsp;&nbsp;const data = validate(req.body);<br/>
                    &nbsp;&nbsp;const user = await UserService.register(data);<br/>
                    &nbsp;&nbsp;res.json(user);<br/>
                    {'}'}
                  </div>
                </div>
                <div>
                  <div className="text-green-400 font-bold mb-1">// 3. Service Layer (純業務邏輯)</div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800 text-slate-300">
                    class UserService {'{'}<br/>
                    &nbsp;&nbsp;static async register(data) {'{'}<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;// Hash password, save to DB...<br/>
                    &nbsp;&nbsp;{'}'}<br/>
                    {'}'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database & Security */}
          <div className="space-y-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Database className="text-yellow-500" /> 資料存儲策略
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <span className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-300 mt-1">PostgreSQL</span>
                   <p className="text-slate-400 text-sm">主要關聯式資料庫，儲存用戶資料、訂單與結構化內容。使用 ORM (Prisma/TypeORM) 進行管理。</p>
                </div>
                <div className="flex items-start gap-3">
                   <span className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-300 mt-1">MongoDB</span>
                   <p className="text-slate-400 text-sm">用於儲存日誌 (Logs)、非結構化配置與靈活的 JSON 數據。</p>
                </div>
                <div className="flex items-start gap-3">
                   <span className="bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-300 mt-1">Redis</span>
                   <p className="text-slate-400 text-sm">快取層，用於 Session 管理與高頻數據讀取加速。</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <Shield className="text-red-500" /> 安全性與認證
              </h3>
              <ul className="list-disc list-inside text-slate-400 space-y-2">
                <li><span className="text-slate-200">JWT (JSON Web Token):</span> 無狀態身份驗證機制。</li>
                <li><span className="text-slate-200">Middleware 攔截:</span> 統一處理權限驗證與錯誤捕捉。</li>
                <li><span className="text-slate-200">Input Validation:</span> 所有輸入均經過嚴格的 Schema 驗證 (Zod/Joi)，防止 SQL Injection 與 XSS 攻擊。</li>
                <li><span className="text-slate-200">HTTPS/TLS:</span> 全程加密傳輸。</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
