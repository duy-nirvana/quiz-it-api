const Session = require('../models/session.model');

const { Server } = require('socket.io');
const { populateQuiz } = require('../utils');

const emitQuizDetail = async (socket, session) => {
    const newSession = await session.populate({
        path: 'quiz',
        populate: {
            path: 'questions',
            populate: {
                path: 'answers',
                select: '-is_correct'
            }
        }
    });

    socket.emit('quiz_info', newSession);
};

const useSocket = (server, io) => {
    // const io = new Server(server, {
    //     cors: {
    //         origin: '*',
    //         methods: ['GET', 'POST']
    //     }
    // });

    io.on('connection', (socket) => {
        console.log('A user connected: ', socket.id);
        let currentSessionId = null;
        // When a participant joins the session
        socket.on('join_session', async ({ hostId, name, user }) => {
            try {
                const session = await Session.findOne({ host_id: hostId });
                if (!session) {
                    socket.emit('session_error', 'Session not found');
                    return;
                }

                // Check if the participant is already in the session
                const existingParticipant = session.participants.find(
                    (participant) => participant.socket_id === socket.id
                );

                if (existingParticipant) {
                    socket.emit('session_error', 'You are already a participant in this session');
                    return;
                }

                if (user) {
                    const isHostMember = session.host_user.toString() === user;

                    if (isHostMember) {
                        socket.emit('session_error', 'You are a host');
                        return;
                    }
                }

                // if (!user)
                // const matchName = session.participants.find(participant => partici)

                let newParticipant = {
                    socket_id: socket.id
                };
                if (user) {
                    // Add the participant (just simulate participant for now)
                    newParticipant.user = user;
                } else {
                    newParticipant.name = name;
                }

                session.participants.push(newParticipant);
                await session.save();

                // Track the session ID for the participant
                currentSessionId = session._id;

                // Emit the session info to the participant
                // socket.emit('session_info', session);
                // socket.emit('session_active', false);
                // emitSessionInfo(socket, session);
                
                // Notify the host of the new participant
                io.to(hostId).emit('new_participant', newParticipant);
                emitQuizDetail(socket, session);
            } catch (error) {
                console.error('Error joining session:', error);
            }
        });

        // Host joins the session (this could be more comprehensive)
        socket.on('host_join', async (hostId) => {
            try {
                console.log(`HOST ${hostId} CONNECTED`);
                const session = await Session.findOne({ host_id: hostId });
                if (!session) {
                    socket.emit('session_error', 'Session not found');
                    return;
                }

                socket.join(hostId); // Host listens for updates
                socket.emit('session_info', session);

                socket.on('disconnect', async () => {
                    console.log(`HOST ${hostId} disconnected`);

                    session.is_active = false;
                    await session.save();

                    io.emit('session_active', false);
                    socket.leave(hostId);
                });
            } catch (error) {
                console.error('Error hosting session:', error);
            }
        });

        // When the host starts the game
        socket.on('start_countdown', async (hostId) => {
            try {
                // const session = await Session.findOne({ host_id: hostId });
                // if (!session) {
                //     socket.emit('session_error', 'Session not found');
                //     return;
                // }
                io.emit('countdown_started'); // Broadcast session info
            } catch (error) {
                console.error('Error starting game:', error);
            }
        });

        socket.on('start_game', async (hostId) => {
            try {
                const session = await Session.findOne({ host_id: hostId });
                if (!session) {
                    socket.emit('session_error', 'Session not found');
                    return;
                }

                io.emit('session_active', true);
                session.is_active = true; // Game started
                await session.save();

                // Emit game started event to all participants
                // io.emit('session_info', session); // Broadcast session info
            } catch (error) {
                console.error('Error starting game:', error);
            }
        });

        // When the host ends the game
        socket.on('end_game', async (hostId) => {
            try {
                const session = await Session.findOne({ host_id: hostId });
                if (!session) {
                    socket.emit('session_error', 'Session not found');
                    return;
                }

                session.is_active = false; // Game ended
                session.ended_at = new Date();
                await session.save();

                // Emit session end to all participants
                io.to(hostId).emit('session_info', session);
                io.emit('session_info', session); // Broadcast session info
            } catch (error) {
                console.error('Error ending game:', error);
            }
        });

        socket.on('disconnect', async () => {
            console.log('A user disconnected: ', socket.id);

            if (currentSessionId) {
                try {
                    // Find the session by its ID
                    const session = await Session.findById(currentSessionId);
                    if (!session) {
                        return;
                    }

                    // Find the user associated with this socket
                    const disconnectedParticipant = session.participants.find(
                        (participant) => participant.socket_id === socket.id
                    );

                    if (!disconnectedParticipant) {
                        return;
                    }

                    session.participants = session.participants.filter(
                        (participant) => participant.socket_id !== disconnectedParticipant.socket_id
                    );

                    await session.save();

                    const hostId = session.host_id;
                    io.to(hostId).emit('participant_left', {
                        socket_id: disconnectedParticipant.socket_id
                    });
                } catch (error) {
                    console.error('Error removing participant from session:', error);
                }
            }
        });
    });
};

module.exports = useSocket;
