const Session = require('../models/session.model');
const Quiz = require('../models/quiz.model');

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findOne({ host_id: id }).populate({
            path: 'quiz',
            populate: {
                path: 'questions',
                populate: {
                    path: 'answers'
                }
            }
        });

        if (!session) throw new Error('Not found session!');

        res.status(200).json({ success: true, message: 'Fetch successfully!', data: session });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to fetch!', error: error.message });
    }
};

exports.createSession = async (req, res) => {
    try {
        const data = req.body;
        const session = new Session({ ...data, quiz: data.quiz_id });

        await Quiz.findByIdAndUpdate(
            data.quiz_id,
            { $push: { hosting_sessions: session._id } },
            { new: true }
        );

        const savedSession = await session.save().then((session) => session.populate('quiz'));

        res.status(201).json({
            success: true,
            message: 'Created successfully',
            data: savedSession
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to created!', error: error.message });
    }
};
