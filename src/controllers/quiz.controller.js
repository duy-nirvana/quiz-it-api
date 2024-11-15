const Topic = require('../models/quiz.model');

exports.getAll = async (req, res) => {
    try {
        const topics = await Topic.find({});

        res.status(200).json({ success: true, message: 'Fetch successfully!', data: topics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fail to fetch!', error: error.message });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const { host_id, ...rest } = req.body;

        const topic = new Topic(rest);
        const savedTopic = await topic.save();
        res.status(201).json({ success: true, message: 'Created successfully', data: savedTopic });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Fail to created!', error: error.message });
    }
};
