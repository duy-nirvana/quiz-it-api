const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const InitiateMongoServer = require('./src/config/db');

const useRoutes = require('./src/routes');

const app = express();
const port = 8000;

InitiateMongoServer();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

useRoutes(app);

app.get('*', async (req, res) => {
    res.status(200).send('<h3>Welcome to QuizIT API</h3>');
});

// app.set('view engine', 'html');
// app.set('views', './src/views');
// app.engine('html', require('ejs').renderFile);

app.listen(port, () => {
    console.log(`Server is running on localhost:${port}`);
});
