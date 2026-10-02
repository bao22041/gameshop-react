import React from 'react';
import { Gamepad2, Shield, Zap, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-2">
            <Gamepad2 className="text-cyan-400 w-5 h-5" />
            <span>CYBER STORE</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống phân phối bản quyền game số 1. Nhận CD-Key tự động ngay sau khi thanh toán.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-cyan-400" /> Kích hoạt key tự động 24/7
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" /> Bảo hành trọn đời mọi tựa game
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-fuchsia-400" /> Thưởng nạp ví & quà tặng liên tục
          </div>
        </div>

        <div className="text-xs text-slate-500 md:text-right">
          <p>© 2026 CYBERSTORE. Tất cả các quyền được bảo lưu.</p>
          <p className="mt-1">Hệ thống React Modular Storefront</p>
        </div>
      </div>
    </footer>
  );
}