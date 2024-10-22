const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const InitiateMongoServer = require('./src/config/db');

const bookRoute = require('./src/routes/book.route');

const app = express();
const port = 8000;

InitiateMongoServer();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/books', bookRoute);

app.set('view engine', 'html');
app.set('views', './src/views');
// app.engine('html', require('ejs').renderFile);

mongoose.connection.useDb('QuizITData')

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
