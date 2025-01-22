const quizRoute = require('./quiz.route');
const authRoute = require('./auth.route');
const personalRoute = require('./personal.route');
const sessionRoute = require('./session.route');

const useRoutes = (app) => {
    app.use('/api/quiz', quizRoute);
    app.use('/api/auth', authRoute);
    app.use('/api/personal', personalRoute);
    app.use('/api/session', sessionRoute);
};

module.exports = useRoutes;
