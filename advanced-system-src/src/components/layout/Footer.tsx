
import { Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
      <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="text-blue-500 h-6 w-6" />
            <span className="text-xl font-bold text-slate-100">
              Auto-Fix Bot
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed max-w-md">
            您的全能開發助手。從靈感誕生到產品落地，我們提供最專業的架構設計、代碼審查與技術諮詢服務。
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4">快速連結</h4>
          <ul className="space-y-2">
            <li><a href="/#" className="hover:text-blue-400 transition-colors">首頁概覽</a></li>
            <li><a href="/#architecture" className="hover:text-blue-400 transition-colors">系統架構</a></li>
            <li><a href="/#frontend" className="hover:text-blue-400 transition-colors">前端技術</a></li>
            <li><a href="/#backend" className="hover:text-blue-400 transition-colors">後端實現</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">聯絡資訊</h4>
          <ul className="space-y-2">
            <li>Email: support@autofixbot.dev</li>
            <li>Location: Cloud & AI Lab</li>
            <li>Status: System Online</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
        &copy; {new Date().getFullYear()} Auto-Fix Bot System. All rights reserved.
      </div>
    </footer>
  );
}
