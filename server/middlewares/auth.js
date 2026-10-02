const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gamestore_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Không có token xác thực!' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token không hợp lệ!' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Phiên làm việc hết hạn hoặc token lỗi!' });
    req.user = decoded;
    next();
  });
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Yêu cầu quyền Quản trị viên (Admin)!' });
    }
    next();
  });
}

module.exports = { verifyToken, verifyAdmin, JWT_SECRET };