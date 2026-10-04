import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { User, Wallet, Key, PlusCircle, CheckCircle2, PackageX } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, orders, addBalance } = useShop();
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  if (!currentUser) return null;

  // Đảm bảo orders luôn là một mảng an toàn trước khi filter
  const safeOrders = Array.isArray(orders) ? orders : [];
  const userOrders = safeOrders.filter(o => o && o.userId === currentUser.id);

  const handleQuickDeposit = async (amt) => {
    try {
      setLoadingDeposit(true);
      await addBalance(amt);
    } finally {
      setLoadingDeposit(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Thông tin ví và cá nhân */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{currentUser.name || 'Người dùng'}</h3>
              <p className="text-xs text-slate-400 truncate">@{currentUser.username}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-cyan-500/30">
                Vai trò: {currentUser.role || 'user'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 truncate">
            Email: <span className="text-slate-200">{currentUser.email || 'Chưa cập nhật'}</span>
          </div>
        </div>

        {/* Nạp tiền số dư ví */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-cyan-400" /> Ví Game Cyber
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-medium">
                Hoạt động
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-cyan-400 mt-2">
              {Number(currentUser.balance || 0).toLocaleString('vi-VN')}₫
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-300 mr-2">Nạp nhanh:</span>
            {[200000, 500000, 1000000].map(amt => (
              <button
                key={amt}
                disabled={loadingDeposit}
                onClick={() => handleQuickDeposit(amt)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-white border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <PlusCircle className="w-3.5 h-3.5" /> +{amt.toLocaleString('vi-VN')}₫
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lịch sử CD-Key đã mua */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-400" /> Thư Viện Bản Quyền & CD-Key Đã Mua
        </h3>

        {userOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
            <PackageX className="w-10 h-10 text-slate-600" />
            <p className="text-sm">Bạn chưa mua tựa game nào trong tài khoản này.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map(order => {
              // Phòng thủ an toàn nếu đơn hàng chưa có danh sách key
              const orderKeys = Array.isArray(order.keys) ? order.keys : [];

              return (
                <div key={order.orderId || Math.random()} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
                  <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 border-b border-slate-700/80 pb-2 mb-3 gap-2">
                    <span>Mã đơn: <b className="text-cyan-400">{order.orderId}</b></span>
                    <span>Thời gian: {order.date}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Thanh toán thành công ({Number(order.totalAmount || 0).toLocaleString('vi-VN')}₫)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {orderKeys.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Không tìm thấy mã kích hoạt cho đơn hàng này.</p>
                    ) : (
                      orderKeys.map((k, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs gap-2">
                          <span className="text-slate-200 font-medium">{k.title}</span>
                          <div className="font-mono bg-slate-950 px-3 py-1 rounded text-cyan-400 border border-cyan-500/30 tracking-wider select-all">
                            {k.key}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}