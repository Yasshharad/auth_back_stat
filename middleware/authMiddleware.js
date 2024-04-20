const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware function to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from request headers
    const token = req.header('Authorization').replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded token
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    // Check if user exists and token is valid
    if (!user) {
      throw new Error();
    }

    // Attach user and token to request object
    req.user = user;
    req.token = token;

    // Call next middleware
    next();
  } catch (error) {
    res.status(401).send({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
