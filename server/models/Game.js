const db = require('../db');

const Game = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM games ORDER BY id DESC');
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ title, category, price, stock, image, description }) {
    const [result] = await db.query(
      'INSERT INTO games (title, category, price, stock, sold, image, description) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [title, category, Number(price), Number(stock), image, description]
    );
    return { id: result.insertId, title, category, price: Number(price), stock: Number(stock), sold: 0, image, description };
  },

  async updateStock(id, quantity) {
    await db.query('UPDATE games SET stock = stock + ? WHERE id = ?', [Number(quantity), id]);
    const [rows] = await db.query('SELECT * FROM games WHERE id = ?', [id]);
    return rows[0];
  }
};

module.exports = Game;