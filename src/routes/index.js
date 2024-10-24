const bookRoute = require('./book.route');
const topicRoute = require('./topic.route');

const useRoutes = (app) => {
    app.use('/api/book', bookRoute);
    app.use('/api/topic', topicRoute);
};

module.exports = useRoutes;
