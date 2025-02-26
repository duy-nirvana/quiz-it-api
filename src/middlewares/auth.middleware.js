const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (req.query.is_temp)
        return res.status(200).json({
            message: 'Fetch temp personal successfully!',
            data: {
                is_temp: true
            }
        });

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
