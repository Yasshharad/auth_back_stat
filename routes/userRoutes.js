const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// GET route to fetch user profile (protected route)
router.get('/profile', authMiddleware, userController.getUserProfile);

module.exports = router;
