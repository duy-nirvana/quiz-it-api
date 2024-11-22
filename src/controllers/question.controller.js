const Question = require('../models/question.model');

// exports.getById = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(404).json({ success: false, message: 'Fail to fetch!', error: error.message });
//     }
// }

exports.createQuestion = async (req, res) => {
    try {
        const payload = req.body;

        const question = new Question({ payload });
        const savedQuestion = await question.save();
        res.status(201).json({
            success: true,
            message: 'Created successfully',
            data: savedQuestion
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to created!', error: error.message });
    }
};
