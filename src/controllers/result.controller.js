const Result = require('../models/result.model');

exports.getById = async (req, res) => {
    try {
        const { id: host_id } = req.params;
        const result = await Result.findOne({ host_id });

        console.log({result});
        if (!result) throw Error();

        res.status(200).json({ success: true, message: 'Fetch successfully!', data: result });
    } catch (error) {
        res.status(404).json({ success: false, message: 'Fail to fetch!', error: error.message });
    }
};

exports.createResult = async (req, res) => {
    try {
        const payload = req.body;

        const result = new Result(payload);
        const savedResult = await result.save();

        res.status(201).json({
            success: true,
            message: 'Created successfully',
            data: savedResult
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to created!', error: error.message });
    }
};
