const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const dotenv = require('dotenv');
const User = require('./models/User');
const nodemailer = require('nodemailer');
dotenv.config();

// Function to generate a random password
const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Function to generate a random 10-digit phone number
const generateRandomPhoneNumber = () => {
    let phoneNumber = '';
    for (let i = 0; i < 10; i++) {
        phoneNumber += Math.floor(Math.random() * 10);
    }
    return phoneNumber;
};

// Function to send email using Nodemailer
const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const googleAuthConfig = (passport) => {
    passport.use(
        new OAuth2Strategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
            scope: ["profile", "email"]
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    // Generate userId for new user
                    const userId = profile.displayName.replace(/\s+/g, '') + '_' + Math.random().toString(36).substr(2, 5);
                    const randomPassword = generateRandomPassword();
                    const randomPhoneNumber = generateRandomPhoneNumber();
                    // User doesn't exist, create a new user
                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value,
                        phoneNumber: randomPhoneNumber,
                        password: randomPassword,
                        userId
                    });

                    await user.save();

                    // Send welcome email to the user only if it's a new user
                    const welcomeEmailText = `Hi Champ,\n\nWelcome to stat.\nWe are all things sports!\n\nYour UserID: ${userId}\n\nRegards,\nstat. Team`;
                    await sendEmail(profile.emails[0].value, 'Welcome to stat.', welcomeEmailText);
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
};

module.exports = googleAuthConfig;
