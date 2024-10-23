const bookRoute = require('./book.route');
const collectionRoute = require('./collection.route');

const useRoutes = (app) => {
    app.use('/api/book', bookRoute);
    app.use('/api/collection', collectionRoute);
};

module.exports = useRoutes;
