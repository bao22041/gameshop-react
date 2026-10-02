import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, PackagePlus, DollarSign, ShoppingCart, Layers, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const { games, orders, addStock, addNewGame, currentUser } = useShop();

  const [stockInputs, setStockInputs] = useState({});
  const [newGameForm, setNewGameForm] = useState({
    title: '',
    category: 'Action',
    price: '',
    stock: '',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: ''
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="text-center py-16 text-rose-400 font-bold">
        Bạn không có quyền truy cập khu vực Quản trị Admin!
      </div>
    );
  }

  // Thống kê tổng hợp
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSoldUnits = games.reduce((sum, g) => sum + g.sold, 0);
  const totalInStock = games.reduce((sum, g) => sum + g.stock, 0);

  const handleStockChange = (id, val) => {
    setStockInputs({ ...stockInputs, [id]: val });
  };

  const submitAddStock = (id) => {
    const val = stockInputs[id];
    if (val) {
      addStock(id, val);
      setStockInputs({ ...stockInputs, [id]: '' });
    }
  };

  const handleCreateGame = (e) => {
    e.preventDefault();
    if (!newGameForm.title || !newGameForm.price || !newGameForm.stock) return;
    addNewGame(newGameForm);
    setNewGameForm({
      title: '',
      category: 'Action',
      price: '',
      stock: '',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      description: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2 rounded-xl bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Bảng Thống Kê & Quản Trị Hệ Thống</h2>
          <p className="text-xs text-slate-400">Theo dõi doanh thu đơn hàng, kho sản phẩm và bổ sung số lượng</p>
        </div>
      </div>

      {/* Thẻ Thống kê (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tổng doanh thu bán</div>
            <div className="text-xl font-bold text-white">{totalRevenue.toLocaleString('vi-VN')}₫</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Số đơn hoàn tất</div>
            <div className="text-xl font-bold text-white">{orders.length} đơn</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Lượt game đã bán</div>
            <div className="text-xl font-bold text-white">{totalSoldUnits} bản</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tồn kho hiện tại</div>
            <div className="text-xl font-bold text-white">{totalInStock} bản</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bảng quản lý kho & Nhập hàng */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Quản Lý Kho & Nhập Thêm Số Lượng
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-800/40">
                <tr>
                  <th className="py-3 px-3">Tên Game</th>
                  <th className="py-3 px-2">Đơn Giá</th>
                  <th className="py-3 px-2">Đã Bán</th>
                  <th className="py-3 px-2">Kho</th>
                  <th className="py-3 px-3 text-right">Nhập Thêm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {games.map(game => (
                  <tr key={game.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-medium text-slate-200 flex items-center gap-2">
                      <img src={game.image} alt="" className="w-8 h-8 rounded object-cover" />
                      <span className="truncate max-w-[160px]">{game.title}</span>
                    </td>
                    <td className="py-3 px-2 text-cyan-400 font-semibold">{game.price.toLocaleString('vi-VN')}₫</td>
                    <td className="py-3 px-2 text-emerald-400 font-bold">{game.sold}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded font-bold ${game.stock > 5 ? 'bg-slate-800 text-slate-300' : 'bg-rose-500/20 text-rose-400'}`}>
                        {game.stock}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          placeholder="+Qty"
                          min="1"
                          value={stockInputs[game.id] || ''}
                          onChange={(e) => handleStockChange(game.id, e.target.value)}
                          className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          onClick={() => submitAddStock(game.id)}
                          className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                        >
                          Lưu
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form thêm tựa game mới */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-fuchsia-400" /> Thêm Tựa Game Mới
          </h3>

          <form onSubmit={handleCreateGame} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium mb-1 block">Tên game:</label>
              <input
                type="text"
                required
                value={newGameForm.title}
                onChange={e => setNewGameForm({ ...newGameForm, title: e.target.value })}
                placeholder="VD: Resident Evil 4"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-medium mb-1 block">Giá (VNĐ):</label>
                <input
                  type="number"
                  required
                  value={newGameForm.price}
                  onChange={e => setNewGameForm({ ...newGameForm, price: e.target.value })}
                  placeholder="590000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium mb-1 block">Kho ban đầu:</label>
                <input
                  type="number"
                  required
                  value={newGameForm.stock}
                  onChange={e => setNewGameForm({ ...newGameForm, stock: e.target.value })}
                  placeholder="20"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium mb-1 block">Thể loại:</label>
              <input
                type="text"
                value={newGameForm.category}
                onChange={e => setNewGameForm({ ...newGameForm, category: e.target.value })}
                placeholder="Action / RPG"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium mb-1 block">Mô tả ngắn:</label>
              <textarea
                rows="2"
                value={newGameForm.description}
                onChange={e => setNewGameForm({ ...newGameForm, description: e.target.value })}
                placeholder="Nội dung tóm tắt..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold transition shadow-md shadow-fuchsia-500/20"
            >
              Tạo Game Lên Kệ
            </button>
          </form>
        </div>
      </div>

      {/* Lịch sử tất cả đơn hàng đã phát sinh */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Lịch Sử Mua Hàng Toàn Hệ Thống</h3>
        {orders.length === 0 ? (
          <p className="text-xs text-slate-500">Chưa có giao dịch mua hàng nào được ghi nhận.</p>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.orderId} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 flex flex-wrap justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-cyan-400">{o.orderId}</span> - Người mua: <span className="text-slate-200 font-semibold">{o.userName}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Gồm: {o.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">{o.totalAmount.toLocaleString('vi-VN')}₫</div>
                  <div className="text-[10px] text-slate-500">{o.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}