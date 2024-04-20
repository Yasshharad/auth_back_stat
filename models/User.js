// Import necessary modules
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Define User schema
const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  googleId: {
    type: String
  },
  image: String
});

// attachments
userSchema.methods.generateJwtToken = function () {
  return jwt.sign({ user: this._id.toString() }, process.env.JWT_SECRET);
};

// Create User model
const User = mongoose.model('User', userSchema);

// Export User model
module.exports = User;
