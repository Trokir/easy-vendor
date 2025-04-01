const jwt = require('jsonwebtoken');
const { query } = require('../utils/db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows[0]) {
      throw new Error();
    }

    req.user = rows[0];
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth; 