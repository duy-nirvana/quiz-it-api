require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exist!' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, salt, password_hash });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, is_remember_me } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await user.isValidPassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        let options = {};
        if (!is_remember_me) {
            options = {
                expiresIn: '7h'
            };
        }

        const access_token = jwt.sign(
            { id: user._id, roles: user.roles },
            process.env.JWT_SECRET,
            options
        );
        user.last_login = new Date();
        await user.save();

        res.json({ message: 'Login successfuly!', data: { access_token } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.google = async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ message: 'Access token is required' });
    }

    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            method: 'POST',
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const payload = await response.json();

        let user = await User.findOne({ google_id: payload.sub });

        if (!user) {
            console.log('IN CREARETE NEW USER');
            user = new User({
                google_id: payload.sub,
                name: payload.name,
                email: payload.email
            });
            await user.save();
            console.log({ user });
        }

        // Generate JWT for your app's auth
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.json({ message: 'Login successfuly!', data: { access_token: token } });
    } catch (error) {
        console.log({ error });
        res.status(500).json({ message: 'Invalid Google token' });
    }
};
