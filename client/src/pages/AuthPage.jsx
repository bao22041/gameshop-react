import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { KeyRound, UserPlus, LogIn, Mail, ShieldAlert } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useShop();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginMode) {
      login(username, password);
    } else {
      if (!username || !password || !name || !email) return;
      register({ username, password, name, email });
    }
  };

  const fillSampleUser = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto my-8">
      {/* Box thông báo tài khoản mẫu có sẵn */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 mb-6 shadow-md shadow-cyan-500/10">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
          <ShieldAlert className="w-4 h-4" /> Tài khoản mẫu có sẵn để thử nghiệm:
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillSampleUser('admin', '123')}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700"
          >
            <div className="font-semibold text-fuchsia-400">Admin Quản trị</div>
            <div className="text-slate-400">admin / 123</div>
          </button>
          <button
            type="button"
            onClick={() => fillSampleUser('user', '123')}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-left border border-slate-700"
          >
            <div className="font-semibold text-cyan-400">Khách hàng</div>
            <div className="text-slate-400">user / 123</div>
          </button>
        </div>
      </div>

      {/* Khung Đăng nhập / Đăng ký */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              isLoginMode ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" /> Đăng Nhập
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              !isLoginMode ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Đăng Ký Mới
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition shadow-lg shadow-cyan-500/20 mt-2"
          >
            {isLoginMode ? 'Đăng Nhập Vào Hệ Thống' : 'Tạo Tài Khoản & Nhận 1 Triệu ₫'}
          </button>
        </form>
      </div>
    </div>
  );
}