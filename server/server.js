require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const User = require('./models/User');
const Game = require('./models/Game');
const Order = require('./models/Order');
const { verifyToken, verifyAdmin, JWT_SECRET } = require('./middlewares/auth');

const app = express();
app.use(express.json());
app.use(cors());

// Healthcheck endpoint cho Jenkins Pipeline kiểm tra
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// ==================== AUTH ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, name, email });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'Đăng ký thành công!', user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByUsername(username);
    if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác!' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, balance: user.balance }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    res.json({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users/add-balance', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Số tiền không hợp lệ!' });
    const result = await User.addBalance(req.user.id, Number(amount));
    res.json({ balance: result.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== GAMES ====================
app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.getAll();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/games', verifyAdmin, async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/games/:id/stock', verifyAdmin, async (req, res) => {
  try {
    const game = await Game.updateStock(req.params.id, req.body.quantity);
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== ORDERS & CHECKOUT ====================
app.post('/api/orders/checkout', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lấy userId từ JWT token hoặc req.body
    let userId = req.body.userId;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
        } catch {
          // Token không hợp lệ thì dùng tiếp userId từ body
        }
      }
    }

    if (!userId) {
      throw new Error('Vui lòng đăng nhập để thanh toán!');
    }

    const { cart } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      throw new Error('Giỏ hàng trống!');
    }

    const [userRows] = await conn.query('SELECT * FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (userRows.length === 0) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }
    const user = userRows[0];

    // Tính tổng tiền an toàn
    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

    if (Number(user.balance) < totalAmount) {
      throw new Error(`Số dư ví không đủ! Cần ${totalAmount.toLocaleString('vi-VN')}₫ nhưng ví chỉ còn ${Number(user.balance).toLocaleString('vi-VN')}₫.`);
    }

    // Kiểm tra và trừ kho từng game
    for (const item of cart) {
      const [gameRows] = await conn.query('SELECT id, title, stock FROM games WHERE id = ? FOR UPDATE', [item.id]);
      let targetGame = gameRows[0];

      // Hỗ trợ tìm kiếm theo title nếu id trong cache giỏ hàng không khớp
      if (!targetGame) {
        const [fallbackRows] = await conn.query('SELECT id, title, stock FROM games WHERE title = ? FOR UPDATE', [item.title]);
        targetGame = fallbackRows[0];
      }

      if (!targetGame) {
        throw new Error(`Tựa game "${item.title}" không tồn tại trong hệ thống!`);
      }

      if (Number(targetGame.stock) < Number(item.quantity)) {
        throw new Error(`Tựa game "${targetGame.title}" không đủ số lượng trong kho (chỉ còn ${targetGame.stock})!`);
      }

      await conn.query(
        'UPDATE games SET stock = stock - ?, sold = sold + ? WHERE id = ?',
        [Number(item.quantity), Number(item.quantity), targetGame.id]
      );
    }

    // Trừ số dư ví
    const remainingBalance = Number(user.balance) - totalAmount;
    await conn.query('UPDATE users SET balance = ? WHERE id = ?', [remainingBalance, userId]);

    // Tạo đơn hàng mới
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const dateStr = new Date().toLocaleString('vi-VN');
    await conn.query(
      'INSERT INTO orders (orderId, userId, userName, totalAmount, date) VALUES (?, ?, ?, ?, ?)',
      [orderId, user.id, user.name, totalAmount, dateStr]
    );

    // Sinh key bản quyền
    const generatedKeys = [];
    for (const item of cart) {
      for (let i = 0; i < Number(item.quantity); i++) {
        const key = 'STEAM-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        await conn.query(
          'INSERT INTO order_keys (orderId, title, licenseKey) VALUES (?, ?, ?)',
          [orderId, item.title, key]
        );
        generatedKeys.push({ title: item.title, key });
      }
    }

    await conn.commit();
    res.status(200).json({
      message: 'Thanh toán thành công!',
      orderId,
      remainingBalance,
      keys: generatedKeys
    });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    conn.release();
  }
});

app.get('/api/orders/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.getByUserId(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/dashboard', verifyAdmin, async (req, res) => {
  try {
    const games = await Game.getAll();
    const orders = await Order.getAll();
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalSoldUnits = games.reduce((sum, g) => sum + Number(g.sold || 0), 0);
    const totalInStock = games.reduce((sum, g) => sum + Number(g.stock || 0), 0);
    res.json({
      stats: { totalRevenue, totalSoldUnits, totalInStock, orderCount: orders.length },
      games,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`>>> Backend Server đang chạy tại port ${PORT}`));
}
module.exports = app;