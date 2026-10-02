import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('gs_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Đồng bộ giỏ hàng với LocalStorage
  useEffect(() => {
    localStorage.setItem('gs_cart', JSON.stringify(cart));
  }, [cart]);

  // Lấy dữ liệu games từ Backend khi mount
  const fetchGames = async () => {
    try {
      const data = await apiRequest('/api/games');
      setGames(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Kiểm tra phiên đăng nhập hiện tại từ Token
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const user = await apiRequest('/api/auth/me');
      setCurrentUser(user);
    } catch (err) {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  // Lấy đơn hàng của người dùng
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    try {
      const userOrders = await apiRequest('/api/orders/my-orders');
      setOrders(userOrders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  // Đăng nhập
  const login = async (username, password) => {
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
      notify(`Chào mừng trở lại, ${res.user.name}!`);
      setActiveTab('home');
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  };

  // Đăng ký
  const register = async ({ username, password, name, email }) => {
    try {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, name, email })
      });
      localStorage.setItem('token', res.token);
      setCurrentUser(res.user);
      notify('Đăng ký tài khoản thành công! Tặng 2.000.000đ vào ví.');
      setActiveTab('home');
      return true;
    } catch (err) {
      notify(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    notify('Đã đăng xuất.');
    setActiveTab('home');
  };

  // Quản lý giỏ hàng
  const addToCart = (game) => {
    if (game.stock <= 0) {
      notify('Sản phẩm đã hết hàng trong kho!', 'error');
      return;
    }
    const existing = cart.find(item => item.id === game.id);
    if (existing) {
      if (existing.quantity >= game.stock) {
        notify('Số lượng trong giỏ đã đạt mức tối đa trong kho!', 'error');
        return;
      }
      setCart(cart.map(item => item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...game, quantity: 1 }]);
    }
    notify(`Đã thêm "${game.title}" vào giỏ hàng.`);
  };

  const updateCartQuantity = (id, delta) => {
    const item = cart.find(i => i.id === id);
    const game = games.find(g => g.id === id);
    if (!item || !game) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.id !== id));
      notify(`Đã xóa khỏi giỏ.`);
    } else if (newQty > game.stock) {
      notify('Vượt quá số lượng tồn kho khả dụng!', 'error');
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    }
  };

  // Nạp tiền
  const addBalance = async (amount) => {
    if (!currentUser) return;
    try {
      const res = await apiRequest('/api/users/add-balance', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
      setCurrentUser(prev => ({ ...prev, balance: res.balance }));
      notify(`Đã nạp thành công ${amount.toLocaleString('vi-VN')}₫!`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Thanh toán
  const checkout = async () => {
    if (!currentUser) {
      notify('Vui lòng đăng nhập để tiến hành thanh toán!', 'error');
      setActiveTab('auth');
      return;
    }
    if (cart.length === 0) {
      notify('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }
    try {
      const res = await apiRequest('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ cart })
      });
      setCurrentUser(prev => ({ ...prev, balance: res.remainingBalance }));
      setCart([]);
      await fetchGames();
      await fetchUserOrders();
      notify('Thanh toán thành công! Mã CD-Key đã được lưu vào thư viện cá nhân.');
      setActiveTab('profile');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Admin: Nhập thêm kho hàng
  const addStock = async (gameId, quantityToAdd) => {
    try {
      await apiRequest(`/api/games/${gameId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: quantityToAdd })
      });
      await fetchGames();
      notify(`Đã cập nhật kho thành công!`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  // Admin: Tạo game mới
  const addNewGame = async (gameData) => {
    try {
      await apiRequest('/api/games', {
        method: 'POST',
        body: JSON.stringify(gameData)
      });
      await fetchGames();
      notify(`Đã thêm tựa game mới: ${gameData.title}`);
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <ShopContext.Provider value={{
      games,
      currentUser,
      cart,
      orders,
      activeTab,
      notification,
      loading,
      setActiveTab,
      login,
      register,
      logout,
      addToCart,
      updateCartQuantity,
      checkout,
      addBalance,
      addStock,
      addNewGame
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);