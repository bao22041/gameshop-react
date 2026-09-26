const db = require('../db');

const Order = {
  async getByUserId(userId) {
    const [orders] = await db.query('SELECT * FROM orders WHERE userId = ? ORDER BY id DESC', [userId]);
    for (let order of orders) {
      const [keys] = await db.query('SELECT title, licenseKey as `key` FROM order_keys WHERE orderId = ?', [order.orderId]);
      order.keys = keys;
    }
    return orders;
  },

  async getAll() {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY id DESC');
    for (let order of orders) {
      const [keys] = await db.query('SELECT title, licenseKey as `key` FROM order_keys WHERE orderId = ?', [order.orderId]);
      order.keys = keys;
    }
    return orders;
  }
};

module.exports = Order;