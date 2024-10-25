const bookRoute = require('./book.route');
const topicRoute = require('./topic.route');
const authRoute = require('./auth.route');

const useRoutes = (app) => {
    app.use('/api/book', bookRoute);
    app.use('/api/topic', topicRoute);
    app.use('/api/auth', authRoute);
};

module.exports = useRoutes;
