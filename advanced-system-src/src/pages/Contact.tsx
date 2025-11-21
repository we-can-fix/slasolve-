
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('訊息已發送！我們將盡快與您聯繫。');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navbar />
      
      <div className="pt-32 pb-20 container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">開始您的技術升級之旅</h1>
          <p className="text-slate-400 text-lg">無論是架構諮詢、代碼審查還是專案開發，Auto-Fix Bot 隨時待命。</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* Contact Info */}
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-8">聯絡方式</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">電子郵件</h4>
                  <p className="text-slate-400">support@autofixbot.dev</p>
                  <p className="text-slate-500 text-sm mt-1">通常在 24 小時內回覆</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">服務據點</h4>
                  <p className="text-slate-400">Cloud & AI Innovation Lab</p>
                  <p className="text-slate-500 text-sm mt-1">全球分佈式遠端協作</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">技術熱線</h4>
                  <p className="text-slate-400">+1 (800) AUTO-FIX</p>
                  <p className="text-slate-500 text-sm mt-1">Mon-Fri, 9am - 6pm UTC</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-8">發送訊息</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">您的姓名</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">電子郵件</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">諮詢內容</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="請描述您的需求或技術問題..."
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '發送中...' : (
                  <>
                    送出訊息 <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
      <Footer />
    </div>
  );
}
