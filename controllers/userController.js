const User = require('../models/User');

// Controller function to get user profile
const getUserProfile = async (req, res) => {
  try {
    // Extract user ID from request
    const IdOfuser = req.user._id;

    // Find user by ID
    const user = await User.findById(IdOfuser);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with user profile data
    res.json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getUserProfile };
