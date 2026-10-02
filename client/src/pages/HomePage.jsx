import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingCart, Star, Search, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const { games, addToCart } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(games.map(g => g.category.split('/')[0].trim()))];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || game.category.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 sm:p-12 border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-widest">
            Flash Sale Mùa Hè 2026
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-wide leading-tight">
            NÂNG TẦM TRẢI NGHIỆM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">GAMING</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Sở hữu bản quyền các siêu phẩm AAA với mức giá ưu đãi nhất. Nhận CD-Key kích hoạt tức thì.
          </p>
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
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

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? 'Tất cả thể loại' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGames.map(game => (
          <div
            key={game.id}
            className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-cyan-500/10"
          >
            {/* Ảnh game */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-amber-400 flex items-center gap-1 border border-amber-500/30">
                <Star className="w-3 h-3 fill-amber-400" /> {game.rating}
              </span>
              <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] font-semibold text-cyan-400 border border-cyan-500/30">
                {game.category}
              </span>
            </div>

            {/* Chi tiết */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-bold text-base group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {game.title}
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-cyan-400">
                    {game.price.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Kho: <b className={game.stock > 0 ? 'text-slate-300' : 'text-rose-400'}>{game.stock}</b></span>
                    <span>•</span>
                    <span>Đã bán: <b>{game.sold}</b></span>
                  </div>
                </div>

                <button
                  disabled={game.stock <= 0}
                  onClick={() => addToCart(game)}
                  className={`p-2.5 rounded-xl font-medium transition flex items-center justify-center ${
                    game.stock > 0
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                  title={game.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}