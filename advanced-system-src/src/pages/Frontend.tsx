
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Code, Component, Paintbrush, Zap } from 'lucide-react';

export default function Frontend() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-6">
        <div className="mb-12">
          <span className="text-blue-500 font-mono text-sm tracking-wider uppercase">Frontend Engineering</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">現代化前端體驗構建</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            我們不僅僅是編寫 UI，而是構建一個可維護、高性能且體驗卓越的應用程式生態。
            注重組件的複用性與代碼的清晰度。
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Component Architecture */}
            <section className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <Component className="text-blue-400 h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">組件化設計架構</h2>
              </div>
              <p className="text-slate-400 mb-6">
                遵循 Atomic Design 理念，將介面拆解為原子級別的元件，確保高度一致性與複用率。
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border-l-4 border-blue-500">
                  <div className="w-24 font-mono text-sm text-slate-500">Atoms</div>
                  <div>
                    <h4 className="font-medium text-slate-200">基礎元件</h4>
                    <p className="text-sm text-slate-400">Button, Input, Icon, Typography (Shadcn UI)</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border-l-4 border-indigo-500">
                  <div className="w-24 font-mono text-sm text-slate-500">Molecules</div>
                  <div>
                    <h4 className="font-medium text-slate-200">複合元件</h4>
                    <p className="text-sm text-slate-400">SearchForm, UserCard, NavbarItem</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-slate-900 rounded-lg border-l-4 border-purple-500">
                  <div className="w-24 font-mono text-sm text-slate-500">Organisms</div>
                  <div>
                    <h4 className="font-medium text-slate-200">區塊模組</h4>
                    <p className="text-sm text-slate-400">Header, ProductList, PricingTable</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Management */}
            <section className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-900/30 rounded-lg">
                  <Zap className="text-amber-400 h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">數據流與狀態管理</h2>
              </div>
              <ul className="space-y-4 text-slate-300 list-disc list-inside">
                <li><strong className="text-white">Client State (Zustand):</strong> 用於管理 UI 交互狀態，如側邊欄開關、主題切換，輕量且高效。</li>
                <li><strong className="text-white">Server State (React Query):</strong> 處理 API 數據的獲取、緩存、同步與失效，大幅減少 useEffect 的副作用代碼。</li>
                <li><strong className="text-white">Form Handling (React Hook Form):</strong> 搭配 Zod 進行 Schema 驗證，確保用戶輸入數據的準確性。</li>
              </ul>
            </section>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-24">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Paintbrush className="h-5 w-5 text-pink-400" /> UI 設計原則
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium">視覺層次</h4>
                  <p className="text-sm text-slate-400 mt-1">利用字體大小、顏色對比 (Slate-900 vs White) 和間距來引導用戶視線。</p>
                </div>
                <div className="w-full h-px bg-slate-800" />
                <div>
                  <h4 className="text-white font-medium">響應式佈局</h4>
                  <p className="text-sm text-slate-400 mt-1">Mobile First 策略，確保在手機、平板與桌面端均有完美表現。</p>
                </div>
                <div className="w-full h-px bg-slate-800" />
                <div>
                  <h4 className="text-white font-medium">互動反饋</h4>
                  <p className="text-sm text-slate-400 mt-1">所有按鈕與連結皆具備 Hover/Active 狀態，操作過渡使用平滑的 transition。</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-mono text-slate-500 mb-2">TECH STACK</h4>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Tailwind', 'Vite', 'Framer Motion'].map(t => (
                    <span key={t} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
