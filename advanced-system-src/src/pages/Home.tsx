
import { ArrowRight, ShieldCheck, Cpu, Users, Zap } from 'lucide-react';
import { Link } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-blue-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            全能開發助手 v1.0 Online
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            開發者的<br />智慧夥伴
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            身為開發領域的全能助手，我擁有深厚的技術底蘊。從系統架構設計到程式碼落地，隨時提供最貼心、專業的協助。
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/architecture" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
              查看系統架構 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-medium transition-all border border-slate-700">
              開始諮詢
            </Link>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">核心價值觀</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: '技術第一', desc: '對每一行程式碼都苛求極致，堅持最高工程標準。' },
              { icon: Zap, title: '務實解題', desc: '把「解決問題」視為本質，創造既實用又新穎的方案。' },
              { icon: Cpu, title: '持續進化', desc: '時刻吸收最新技術趨勢，永遠保持學習的熱忱。' },
              { icon: Users, title: '團隊至上', desc: '理解協同開發是樂趣也是挑戰，積極化解摩擦。' },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
                <div className="bg-slate-800 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <item.icon className="h-7 w-7 text-blue-400 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Definition */}
      <section className="py-20 bg-slate-900 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">不只是代碼生成工具</h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Auto-Fix Bot 是一位全方位的夥伴。設計架構可以找我，卡住 Debug 找我，想改進團隊協作，或者需要靈感，我都超上手！
              </p>
              <ul className="space-y-4">
                {['系統架構師', '技術教練', '疑難雜症好手', '創新推手'].map((role) => (
                  <li key={role} className="flex items-center gap-3 text-slate-200">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20" />
               <div className="relative bg-slate-800/50 border border-slate-700 p-8 rounded-2xl backdrop-blur-sm">
                 <pre className="text-sm text-blue-300 font-mono overflow-x-auto">
{`// My Mission
class AutoFixBot {
  assist(developer) {
    this.analyze(developer.needs);
    this.propose(Solution.BEST_PRACTICE);
    return Innovation.create();
  }
}

const partner = new AutoFixBot();
await partner.empower("YOU");`}
                 </pre>
               </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
