const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { getUserProfile } = require('./userController');

// Function to send email
const sendEmail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error in sending email:', error);
    throw new Error('Failed to send email');
  }
};

const signup = async (req, res) => {
  try {
    // Extract user data from request body
    const { name, email, phoneNumber, password } = req.body;

    // Check if password meets the minimum length requirement
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password should be at least 8 characters long' });
    }

    // Generate a unique userId combining the name and a random string
    const userId = name.replace(/\s+/g, '') + '_' + Math.random().toString(36).substr(2, 5);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with generated userId
    const newUser = new User({ userId, name, email, phoneNumber, password: hashedPassword });
    await newUser.save();

    // Send verification email with userId
    const subject = 'Welcome to stat.';
    const message = `Hi Champ,\n\nWelcome to stat.\nWe are all things sports!\n\nYour UserID: ${userId}\n\nRegards,\nstat. Team`;
    await sendEmail(email, subject, message);

    // Respond with success message
    res.status(201).json({ message: 'Account created successfully. Please login using your credentials.' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const login = async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found. Kindly register.' });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
    // Respond with token and user data
    res.status(200).json({ message: 'Logged in successfully.', token, user });
    
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller function for forgot password
const forgotPassword = async (req, res) => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Generate unique token for password reset link
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set the reset token and expiry time in the user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Send email with reset password link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const subject = 'Reset Your Password';
    const message = `Dear ${user.name},\n\nPlease click on the following link to reset your password:\n\n${resetLink}\n\nRegards,\nstat. Team`;
    await sendEmail(email, subject, message);


    // Respond with success message
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Controller function for resetting password
const resetPassword = async (req, res) => {
  try {
    // Extract email and new password from request body
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Send password change confirmation email
    const subject = 'Password Changed';
    const message = `Dear ${user.name},\n\nYour password has been successfully changed.\n\nRegards,\nstat. Team`;
    await sendEmail(email, subject, message);

    // Respond with success message
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = { signup, login, forgotPassword, resetPassword };
