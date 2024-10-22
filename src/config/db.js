const mongoose = require('mongoose');

// Replace this with your MONGOURI.
// const MONGOURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nsqjy.mongodb.net/attendance-manage?retryWrites=true&w=majority`;
const MONGOURI = 'mongodb+srv://duynirvana:KMB7MmAu7Q1ECibx@quiz-it.ag4mg.mongodb.net/';

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false
        });
        console.log('Connected to DB !!');
    } catch (e) {
        console.error(e);
        console.log('LỖI LỖI')
        throw e;
    }
};

module.exports = InitiateMongoServer;
