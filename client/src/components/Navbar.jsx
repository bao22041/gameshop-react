import React from 'react';
import { useShop } from '../context/ShopContext';
import { Gamepad2, ShoppingCart, User, ShieldCheck, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { currentUser, cart, activeTab, setActiveTab, logout } = useShop();
  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-slate-900/90 border-b border-cyan-500/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
              CYBER<span className="text-white">STORE</span>
            </h1>
            <p className="text-[10px] text-cyan-400 tracking-widest uppercase">Digital Game Distribution</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === 'home' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Trang Chủ
          </button>

          {/* Giỏ hàng */}
          <button
            onClick={() => setActiveTab('cart')}
            className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              activeTab === 'cart' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Giỏ hàng</span>
            {totalCartCount > 0 && (
              <span className="bg-fuchsia-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Nút Admin nếu là Admin */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                activeTab === 'admin' 
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40' 
                  : 'text-fuchsia-400 hover:text-fuchsia-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản Trị</span>
            </button>
          )}

          {/* Tài khoản cá nhân hoặc nút Đăng nhập */}
          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                  activeTab === 'profile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200 hidden sm:inline">{currentUser.name}</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/30">
                  {currentUser.balance.toLocaleString('vi-VN')}₫
                </span>
              </button>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}