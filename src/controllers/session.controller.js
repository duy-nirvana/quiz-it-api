const Session = require('../models/session.model');
const Quiz = require('../models/quiz.model');

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.find({ host_id: id });

        if (!session.length) throw new Error('Not found session!');

        res.status(200).json({ success: true, message: 'Fetch successfully!', data: session[0] });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to fetch!', error: error.message });
    }
};

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
