const Session = require('../models/session.model');
const Quiz = require('../models/quiz.model');

exports.createSession = async (req, res) => {
    try {
        const { host_id, ...rest } = req.body;

        const session = new Session({ ...rest });

        await Quiz.findByIdAndUpdate(
            rest.quiz_id,
            { $push: { hosting_sessions: session._id } },
            { new: true }
        );

        const savedSession = await session.save();
        res.status(201).json({
            success: true,
            message: 'Created successfully',
            data: savedSession
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to created!', error: error.message });
    }
};
