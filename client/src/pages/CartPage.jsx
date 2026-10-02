import React from 'react';
import { useShop } from '../context/ShopContext';
import { Trash2, Plus, Minus, CreditCard, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { cart, updateCartQuantity, checkout, currentUser, setActiveTab } = useShop();

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 p-8">
        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Giỏ hàng của bạn đang trống!</h3>
        <p className="text-slate-400 text-sm mb-6">Hãy dạo quanh cửa hàng và chọn cho mình những tựa game ưng ý.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold transition"
        >
          Khám Phá Cửa Hàng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-cyan-400" /> Giỏ Hàng Của Bạn
        </h2>
        <button
          onClick={() => setActiveTab('home')}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Tiếp tục xem game
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách vật phẩm trong giỏ */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map(item => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-16 object-cover rounded-lg border border-slate-700"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm truncate">{item.title}</h4>
                <div className="text-xs text-cyan-400 font-bold mt-1">
                  {item.price.toLocaleString('vi-VN')}₫
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Tồn kho: {item.stock}</div>
              </div>

              {/* Điều khiển số lượng */}
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => updateCartQuantity(item.id, -1)}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.id, 1)}
                  className="p-1 hover:bg-slate-700 text-slate-300 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </div>
                <button
                  onClick={() => updateCartQuantity(item.id, -item.quantity)}
                  className="text-xs text-rose-400 hover:text-rose-300 mt-1 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hóa đơn tóm tắt */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-fit space-y-4">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Tóm Tắt Đơn Hàng</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Tổng tiền hàng:</span>
              <span className="text-white">{totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Phí kích hoạt key:</span>
              <span className="text-emerald-400 font-medium">Miễn phí</span>
            </div>
            {currentUser && (
              <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Số dư ví hiện tại:</span>
                <span className={`font-semibold ${currentUser.balance >= totalAmount ? 'text-cyan-400' : 'text-rose-400'}`}>
                  {currentUser.balance.toLocaleString('vi-VN')}₫
                </span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-sm text-slate-300 font-semibold">Cần thanh toán:</span>
            <span className="text-xl font-black text-cyan-400">
              {totalAmount.toLocaleString('vi-VN')}₫
            </span>
          </div>

          <button
            onClick={checkout}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" /> Thanh Toán Ngay
          </button>

          {!currentUser && (
            <p className="text-[11px] text-center text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              Bạn chưa đăng nhập. Nhấn thanh toán hệ thống sẽ chuyển đến trang Đăng nhập.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}