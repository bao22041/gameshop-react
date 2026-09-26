const db = require('../db');

const User = {
  async findByUsername(username) {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ username, password, name, email, role = 'user', balance = 2000000 }) {
    const [result] = await db.query(
      'INSERT INTO users (username, password, name, email, role, balance) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, name, email, role, balance]
    );
    return { id: result.insertId, username, name, email, role, balance };
  },

  async addBalance(id, amount) {
    await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, id]);
    const [rows] = await db.query('SELECT balance FROM users WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = User;