
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Database, Globe, Layout, Lock, Server, Settings } from 'lucide-react';

export default function Architecture() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-6">系統架構設計</h1>
        <p className="text-slate-400 text-lg mb-12 max-w-3xl">
          採用現代化微服務與事件驅動架構思想，確保系統的高可用性、擴展性與安全性。
          遵循 SOLID 原則與 DDD (領域驅動設計) 實踐。
        </p>

        {/* High-Level Architecture Diagram */}
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 mb-16 overflow-hidden">
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <Settings className="text-blue-500" /> 系統架構概覽圖
          </h2>
          
          {/* SVG Diagram */}
          <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center justify-center">
            <svg viewBox="0 0 800 400" className="w-full h-full max-w-4xl drop-shadow-2xl">
              {/* Definitions */}
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
                </marker>
              </defs>

              {/* Client Layer */}
              <rect x="50" y="50" width="150" height="300" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <text x="125" y="40" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">Client Layer</text>
              <rect x="70" y="80" width="110" height="60" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
              <text x="125" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="12">Web (React)</text>
              <rect x="70" y="170" width="110" height="60" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
              <text x="125" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12">Mobile</text>

              {/* API Gateway */}
              <rect x="280" y="50" width="80" height="300" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <text x="320" y="200" textAnchor="middle" fill="#e2e8f0" fontSize="12" style={{writingMode: 'vertical-rl'}}>API Gateway / Load Balancer</text>

              {/* Service Layer */}
              <rect x="440" y="50" width="180" height="300" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <text x="530" y="40" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">Backend Services</text>
              <rect x="460" y="80" width="140" height="60" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <text x="530" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="12">Core API (Node.js)</text>
              <rect x="460" y="170" width="140" height="60" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <text x="530" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="12">Auth Service</text>
              <rect x="460" y="260" width="140" height="60" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <text x="530" y="295" textAnchor="middle" fill="#e2e8f0" fontSize="12">Worker / Jobs</text>

              {/* Data Layer */}
              <rect x="680" y="50" width="80" height="300" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <text x="720" y="40" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">Data</text>
              <circle cx="720" cy="110" r="30" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="720" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="10">SQL</text>
              <circle cx="720" cy="200" r="30" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="720" y="205" textAnchor="middle" fill="#e2e8f0" fontSize="10">NoSQL</text>
              <circle cx="720" cy="290" r="30" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="720" y="295" textAnchor="middle" fill="#e2e8f0" fontSize="10">Redis</text>

              {/* Connectors */}
              <line x1="200" y1="110" x2="280" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="200" y1="200" x2="280" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="360" y1="200" x2="440" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="360" y1="200" x2="440" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="360" y1="200" x2="440" y2="290" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="620" y1="110" x2="690" y2="110" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="4" />
              <line x1="620" y1="110" x2="690" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)" strokeDasharray="4" />
            </svg>
          </div>
        </div>

        {/* Tech Stack Details */}
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                <Layout className="h-6 w-6" /> 前端生態 (Frontend)
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>核心框架：</strong>React 18, TypeScript, Vite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>UI 系統：</strong>Tailwind CSS, Shadcn UI, Framer Motion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>狀態管理：</strong>Zustand / React Query (Server State)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                <Server className="h-6 w-6" /> 後端核心 (Backend)
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>運行環境：</strong>Node.js (LTS), Express / NestJS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>資料儲存：</strong>PostgreSQL (關聯式), MongoDB (文件型), Redis (快取)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span><strong>安全性：</strong>JWT 認證, OAuth 2.0, Rate Limiting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Infrastructure */}
        <div className="mt-12 bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-200">
             <Globe className="h-5 w-5" /> 基礎設施與 DevOps
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Docker 容器化', 'Kubernetes 編排', 'CI/CD 自動化流水線', 'AWS / GCP 雲端部署', 'Prometheus 監控', 'Terraform IaC'].map(tech => (
                <div key={tech} className="bg-slate-900 px-4 py-2 rounded text-center text-sm text-slate-400 border border-slate-800">
                  {tech}
                </div>
              ))}
           </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
