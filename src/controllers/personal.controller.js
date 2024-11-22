const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
    try {
        // Use userId from token payload
        const user = await User.findById(req.user.id).select(['-password_hash', '-salt']); // Exclude sensitive data

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Fetch successfully!', data: user });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error', error: err });
    }
};
