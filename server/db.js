const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 16798,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initTables() {
  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Tạo bảng users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        balance BIGINT DEFAULT 2000000,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tạo bảng games
    await conn.query(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price BIGINT NOT NULL,
        stock INT DEFAULT 0,
        sold INT DEFAULT 0,
        image TEXT NOT NULL,
        description TEXT,
        rating FLOAT DEFAULT 5.0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tạo bảng orders
    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId VARCHAR(50) UNIQUE NOT NULL,
        userId INT NOT NULL,
        userName VARCHAR(255) NOT NULL,
        totalAmount BIGINT NOT NULL,
        date VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Tạo bảng order_keys
    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        licenseKey VARCHAR(100) NOT NULL
      );
    `);

    // Tự động Seed tài khoản mẫu nếu chưa tồn tại
    const [adminExist] = await conn.query('SELECT id FROM users WHERE username = ?', ['admin']);
    if (adminExist.length === 0) {
      const hashPassword = await bcrypt.hash('123', 10);
      await conn.query(
        'INSERT INTO users (username, password, name, email, role, balance) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', hashPassword, 'Quản trị viên Hệ thống', 'admin@gamestore.vn', 'admin', 5000000]
      );
      await conn.query(
        'INSERT INTO users (username, password, name, email, role, balance) VALUES (?, ?, ?, ?, ?, ?)',
        ['user', hashPassword, 'Khách hàng Thân thiết', 'user@gamestore.vn', 'user', 2000000]
      );
      console.log('>>> Da seed tai khoan mau (admin/123, user/123) thanh cong!');
    }

    // Tự động Seed danh sách game mẫu nếu bảng games đang trống
    const [gamesExist] = await conn.query('SELECT id FROM games LIMIT 1');
    if (gamesExist.length === 0) {
      await conn.query(`
        INSERT INTO games (title, category, price, stock, sold, image, description, rating) VALUES
        ('Cyberpunk 2077: Phantom Liberty', 'RPG / Cyberpunk', 699000, 15, 42, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 'Bản mở rộng cốt truyện hành động kịch tính đưa bạn vào thế giới ngầm Dogtown.', 4.8),
        ('Elden Ring: Shadow of the Erdtree', 'Souls-like / RPG', 890000, 20, 95, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', 'Hành trình huyền bí tiến vào Vùng đất Bóng đêm.', 4.9),
        ('Black Myth: Wukong', 'Action / Adventure', 1290000, 8, 120, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', 'Hóa thân thành Người Mệnh Tự để khám phá sự thật Tây Du Ký.', 4.9);
      `);
      console.log('>>> Da seed danh sach game mau thanh cong!');
    }

    console.log('>>> Ket noi Aiven MySQL & Khoi tao database thanh cong!');
  } catch (err) {
    console.error('Loi khoi tao database:', err.message);
  } finally {
    if (conn) conn.release();
  }
}

initTables();

module.exports = pool;