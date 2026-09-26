const mysql = require('mysql2/promise');
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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderId VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        licenseKey VARCHAR(100) NOT NULL
      );
    `);

    console.log('>>> Ket noi Aiven MySQL & Khoi tao database thanh cong!');
  } catch (err) {
    console.error('Loi khoi tao database:', err.message);
  } finally {
    if (conn) conn.release();
  }
}

initTables();

module.exports = pool;