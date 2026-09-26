require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const User = require('./models/User');
const Game = require('./models/Game');
const Order = require('./models/Order');

const app = express();
app.use(express.json());
app.use(cors());

// ==================== AUTH ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    const existing = await User.findByUsername(username);
    if (existing) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, name, email });
    res.status(201).json({ message: 'Đăng ký thành công!', user });
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

    res.json({
      message: 'Đăng nhập thành công!',
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role, balance: user.balance }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/users/add-balance', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const result = await User.addBalance(userId, amount);
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

app.post('/api/games', async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch('/api/games/:id/stock', async (req, res) => {
  try {
    const game = await Game.updateStock(req.params.id, req.body.quantity);
    res.json(game);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== THANH TOÁN & THỐNG KÊ ====================
app.post('/api/orders/checkout', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { userId, cart } = req.body;

    const [userRows] = await conn.query('SELECT * FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (userRows.length === 0) throw new Error('Không tìm thấy người dùng!');
    const user = userRows[0];

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (user.balance < totalAmount) {
      throw new Error('Số dư ví không đủ để thanh toán!');
    }

    // Giảm số lượng tồn kho và tăng số lượng bán
    for (const item of cart) {
      const [gameRows] = await conn.query('SELECT stock FROM games WHERE id = ? FOR UPDATE', [item.id]);
      if (gameRows.length === 0 || gameRows[0].stock < item.quantity) {
        throw new Error(`Tựa game "${item.title}" không đủ số lượng trong kho!`);
      }
      await conn.query('UPDATE games SET stock = stock - ?, sold = sold + ? WHERE id = ?', [item.quantity, item.quantity, item.id]);
    }

    // Trừ số dư người dùng
    await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [totalAmount, userId]);

    // Tạo đơn hàng lưu lại thống kê
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const dateStr = new Date().toLocaleString('vi-VN');
    await conn.query(
      'INSERT INTO orders (orderId, userId, userName, totalAmount, date) VALUES (?, ?, ?, ?, ?)',
      [orderId, user.id, user.name, totalAmount, dateStr]
    );

    // Sinh key game
    const generatedKeys = [];
    for (const item of cart) {
      for (let i = 0; i < item.quantity; i++) {
        const key = 'STEAM-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        await conn.query('INSERT INTO order_keys (orderId, title, licenseKey) VALUES (?, ?, ?)', [orderId, item.title, key]);
        generatedKeys.push({ title: item.title, key });
      }
    }

    await conn.commit();
    res.status(201).json({
      message: 'Thanh toán thành công!',
      orderId,
      remainingBalance: user.balance - totalAmount,
      keys: generatedKeys
    });
  } catch (error) {
    await conn.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    conn.release();
  }
});

app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.getByUserId(req.params.userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thống kê doanh thu, số lượng bán trả về cho Admin
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const games = await Game.getAll();
    const orders = await Order.getAll();

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalSoldUnits = games.reduce((sum, g) => sum + Number(g.sold), 0);
    const totalInStock = games.reduce((sum, g) => sum + Number(g.stock), 0);

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
app.listen(PORT, () => console.log(`>>> Backend Server MySQL dang chay tai port ${PORT}`));