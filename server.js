const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const InitiateMongoServer = require('./src/config/db');

const { createServer } = require('node:http');

const { Server } = require('socket.io');
const useRoutes = require('./src/routes');
const useSocket = require('./src/socket');

const port = 8000;
const app = express();

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for testing
        methods: ['GET', 'POST']
    },
});

InitiateMongoServer();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

useRoutes(app);
useSocket(server, io);

app.get('*', async (req, res) => {
    res.status(200).send('<h3>Welcome to QuizIT API</h3>');
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on localhost:${port}`);
});
