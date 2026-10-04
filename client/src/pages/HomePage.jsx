import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingCart, Star, Search, Layers } from 'lucide-react';

export default function HomePage() {
  const { games, addToCart, loading } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Đảm bảo games luôn là một mảng an toàn
  const safeGames = Array.isArray(games) ? games : [];

  // Trích xuất danh mục an toàn, tránh crash khi category undefined hoặc rỗng
  const categories = [
    'All',
    ...new Set(
      safeGames
        .filter(g => g && typeof g.category === 'string')
        .map(g => g.category.split('/')[0].trim())
        .filter(Boolean)
    )
  ];

  // Lọc game theo ô tìm kiếm và danh mục được chọn
  const filteredGames = safeGames.filter(game => {
    if (!game) return false;
    const titleMatch = (game.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (game.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch;
    const matchesCat = selectedCategory === 'All' || (game.category || '').includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 sm:p-12 border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-widest">
            Flash Sale Mùa Hè 2026
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight">
            NÂNG TẦM TRẢI NGHIỆM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">GAMING</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Sở hữu bản quyền các siêu phẩm AAA với mức giá ưu đãi nhất. Nhận CD-Key kích hoạt tức thì ngay sau khi thanh toán.
          </p>
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
        {/* Ô Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tựa game..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* Danh mục (Categories) */}
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat === 'All' ? 'Tất cả thể loại' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Game Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 flex flex-col justify-between p-4">
              <div className="bg-slate-800 h-40 rounded-xl w-full"></div>
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-slate-800 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Không tìm thấy tựa game nào phù hợp với bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-cyan-500/10"
            >
              {/* Ảnh game */}
              <div className="relative h-48 overflow-hidden bg-slate-950">
                <img
                  src={game.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-amber-400 flex items-center gap-1 border border-amber-500/30">
                  <Star className="w-3 h-3 fill-amber-400" /> {Number(game.rating || 5.0).toFixed(1)}
                </span>
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] font-semibold text-cyan-400 border border-cyan-500/30">
                  {game.category || 'General'}
                </span>
              </div>

              {/* Chi tiết */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-base group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {game.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {game.description || 'Không có mô tả chi tiết cho tựa game này.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-cyan-400">
                      {Number(game.price || 0).toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Kho: <b className={Number(game.stock) > 0 ? 'text-slate-300' : 'text-rose-400'}>{game.stock ?? 0}</b></span>
                      <span>•</span>
                      <span>Đã bán: <b>{game.sold ?? 0}</b></span>
                    </div>
                  </div>

                  <button
                    disabled={Number(game.stock) <= 0}
                    onClick={() => addToCart(game)}
                    className={`p-2.5 rounded-xl font-medium transition flex items-center justify-center ${
                      Number(game.stock) > 0
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                    title={Number(game.stock) > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}