require('dotenv').config();
const mongoose = require('mongoose');

const MONGOURI = `mongodb+srv://duynirvana:${process.env.DB_PASSWORD}@quiz-it.ag4mg.mongodb.net/`;

const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false
        });
        console.log('Connected to DB !!');
    } catch (e) {
        console.error(e);
        throw e;
    }
};

module.exports = InitiateMongoServer;
