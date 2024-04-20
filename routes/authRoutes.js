const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require("passport");

// initial google ouath login
router.get("/google",passport.authenticate("google",{scope:["profile","email"]}));

router.get("/google/callback",passport.authenticate("google",{
    successRedirect:"http://localhost:3000",
    failureRedirect:"http://localhost:3000/login"
}))

router.get("/login/sucess",async(req,res)=>{

    if(req.user){
        res.status(200).json({message:"user Login",user:req.user})
    }else{
        res.status(400).json({message:"Not Authorized"})
    }
})

router.get('/logoutGoogle', function(req, res, next){
    req.logout();
    setTimeout(() => {
        res.redirect('http://localhost:3000');
    }, 3000);
  });

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

module.exports = router;
