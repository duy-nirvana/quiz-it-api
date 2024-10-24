const Topic = require('../models/topic.model');

exports.getAllTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.status(200).json({ success: true, msg: 'Fetch successfully!', data: topics });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Fail to fetch!', error: error.message });
    }
};

exports.createTopic = async (req, res) => {
    try {
        const { host_id, ...rest } = req.body;

        const topic = new Topic(rest);
        const savedTopic = await topic.save();
        res.status(201).json({ success: true, msg: 'Created successfully', data: savedTopic });
    } catch (error) {
        res.status(500).json({ success: false, msg: 'Fail to created!', error: error.message });
    }
};
