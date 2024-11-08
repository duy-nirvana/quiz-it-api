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
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.isValidPassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const access_token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        user.last_login = new Date();
        await user.save();

        res.json({ message: 'Login successfuly!', data: { access_token } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
