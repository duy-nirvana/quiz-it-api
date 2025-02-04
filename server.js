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
    }
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

// app.set('view engine', 'html');
// app.set('views', './src/views');
// app.engine('html', require('ejs').renderFile);

// io.on('connection', (socket) => {
//     console.log('A user connected: ', socket.id);
//     let currentSessionId = null;
//     // When a participant joins the session
//     socket.on('join_session', async (hostId, name, user) => {
//         try {
//             const session = await Session.findOne({ host_id: hostId });
//             if (!session) {
//                 socket.emit('session_error', 'Session not found');
//                 return;
//             }

//             // Check if the participant is already in the session
//             const existingParticipant = session.participants.find(
//                 (participant) => participant.socket_id === socket.id
//             );

//             if (existingParticipant) {
//                 socket.emit('session_error', 'You are already a participant in this session');
//                 return; // Prevent joining if already a participant
//             }

//             let newParticipant = {
//                 socket_id: socket.id
//             };
//             if (user) {
//                 // Add the participant (just simulate participant for now)
//                 newParticipant.user = user;
//             } else {
//                 newParticipant.name = name;
//             }

//             session.participants.push(newParticipant);
//             await session.save();

//             // Track the session ID for the participant
//             currentSessionId = session._id;

//             // Emit the session info to the participant
//             // socket.emit('session_info', session);

//             // Notify the host of the new participant
//             io.to(hostId).emit('new_participant', newParticipant);
//         } catch (error) {
//             console.error('Error joining session:', error);
//         }
//     });

//     // Host joins the session (this could be more comprehensive)
//     socket.on('host_join', async (hostId) => {
//         try {
//             const session = await Session.findOne({ host_id: hostId });
//             if (!session) {
//                 socket.emit('session_error', 'Session not found');
//                 return;
//             }
//             socket.join(hostId); // Host listens for updates
//             socket.emit('session_info', session);
//         } catch (error) {
//             console.error('Error hosting session:', error);
//         }
//     });

//     // When the host starts the game
//     socket.on('start_game', async (hostId, name) => {
//         try {
//             const session = await Session.findOne({ host_id: hostId });
//             if (!session) {
//                 socket.emit('session_error', 'Session not found');
//                 return;
//             }

//             session.active = true; // Game started
//             await session.save();

//             // Emit game started event to all participants
//             io.to(hostId).emit('game_started');
//             io.emit('session_info', session); // Broadcast session info
//         } catch (error) {
//             console.error('Error starting game:', error);
//         }
//     });

//     // When the host ends the game
//     socket.on('end_game', async (hostId) => {
//         try {
//             const session = await Session.findOne({ host_id: hostId });
//             if (!session) {
//                 socket.emit('session_error', 'Session not found');
//                 return;
//             }

//             session.active = false; // Game ended
//             session.ended_at = new Date();
//             await session.save();

//             // Emit session end to all participants
//             io.to(hostId).emit('session_info', session);
//             io.emit('session_info', session); // Broadcast session info
//         } catch (error) {
//             console.error('Error ending game:', error);
//         }
//     });

//     socket.on('disconnect', async () => {
//         console.log('A user disconnected: ', socket.id);

//         if (currentSessionId) {
//             try {
//                 // Find the session by its ID
//                 const session = await Session.findById(currentSessionId);
//                 if (!session) {
//                     return;
//                 }

//                 // Find the user associated with this socket
//                 const disconnectedParticipant = session.participants.find(
//                     (participant) => participant.socket_id === socket.id
//                 );

//                 if (!disconnectedParticipant) {
//                     return;
//                 }

//                 session.participants = session.participants.filter(
//                     (participant) => participant.socket_id !== disconnectedParticipant.socket_id
//                 );

//                 await session.save();

//                 const hostId = session.host_id;
//                 io.to(hostId).emit('participant_left', {
//                     socket_id: disconnectedParticipant.socket_id
//                 });
//             } catch (error) {
//                 console.error('Error removing participant from session:', error);
//             }
//         }
//     });
// });

server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on localhost:${port}`);
});
