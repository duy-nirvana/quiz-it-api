const Session = require('../models/session.model');

const { Server } = require('socket.io');
const { populateQuiz } = require('../utils');

const emitQuizDetail = async (socket, session) => {
    const updatedSession = await session.populate({
        path: 'quiz',
        populate: {
            path: 'questions',
            populate: {
                path: 'answers',
                select: '-is_correct'
            }
        }
    });

    socket.emit('quiz_info', updatedSession);
};

const useSocket = (server, io) => {
    io.on('connection', (socket) => {
        console.log('A user connected: ', socket.id);
        let currentSessionId = null;
        // When a participant joins the session
        socket.on('join_session', async ({ hostId, name, user, avatar }) => {
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

                socket.join(hostId);
                socket.join(`${hostId}-player`);

                // if (!user)
                // const matchName = session.participants.find(participant => partici)

                let newParticipant = {
                    socket_id: socket.id,
                    avatar
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
                socket.emit('session_active', false);
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
                socket.join(`${hostId}-host`); // Host listens for updates

                socket.to(hostId).emit('session_info', session);

                socket.on('disconnect', async () => {
                    console.log(`HOST ${hostId} disconnected`);

                    console.log('RUN HEEEEEEEEEEEEEEEEEEEEEEEEEEEERRRRRRRRRE');

                    await Session.updateOne({ _id: session._id }, { $set: { is_active: false } });

                    // io.emit('quiz_info', session);
                    io.to(hostId).emit('session_active', false);
                    socket.leave(hostId);
                });
            } catch (error) {
                console.error('Error hosting session:', error);
            }
        });

        // When the host starts the game
        socket.on('start_countdown', async (hostId) => {
            try {
                io.to(hostId).emit('countdown_started');
            } catch (error) {
                console.error('Error starting game:', error);
            }
        });

        socket.on('start_game', async (hostId) => {
            try {
                const session = await Session.findOne({ host_id: hostId });
                if (!session) {
                    socket.to(hostId).emit('session_error', 'Session not found');
                    return;
                }

                io.to(hostId).emit('session_active', true);

                await Session.updateOne({ _id: session._id }, { $set: { is_active: true } });
            } catch (error) {
                console.error('Error starting game:', error);
            }
        });

        socket.on('count_submit', (data) => {
            try {
                const { hostId, submittedTotal } = data;

                io.to(`${hostId}-player`).emit('total_submitted', submittedTotal);
            } catch (error) {
                console.error('Something went wrong: ', error);
            }
        });

        socket.on('navigate_question', async (data) => {
            try {
                const { hostId, ...props } = data;

                io.to(`${hostId}-player`).emit('question_changed_index', props);
            } catch (error) {
                console.error('Something went wrong: ', error);
            }
        });

        socket.on('set_countdown_question', async (data) => {
            try {
                const { hostId, time } = data;

                io.to(`${hostId}-player`).emit('question_countdown', time);
            } catch (error) {
                console.error('Something went wrong:', error);
            }
        });

        socket.on('select_answer', async (data) => {
            try {
                const { hostId, ...props } = data;

                io.to(`${hostId}-host`).emit('participant_selected', props);
            } catch (error) {
                console.error('Fail to select answer:', error);
            }
        });

        // When the host ends the game
        socket.on('end_game', async (hostId) => {
            try {
                const session = await Session.findOne({ host_id: hostId });
                if (!session) {
                    socket.to(hostId).emit('session_error', 'Session not found');
                    return;
                }

                session.is_active = false; // Game ended
                session.ended_at = new Date();
                await session.save();

                // Emit session end to all participants
                io.to(hostId).emit('session_info', session);
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
                    // socket.emit('session_active', false);
                } catch (error) {
                    console.error('Error removing participant from session:', error);
                }
            }
        });
    });
};

module.exports = useSocket;
