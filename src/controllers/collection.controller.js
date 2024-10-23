const Collection = require('../models/collection.model');

exports.getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.find();
        res.status(200).json(collections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCollection = async (req, res) => {
    try {
        const { host_id, ...rest } = req.body;

        const collection = new Collection(rest);
        const savedCollection = await collection.save();
        res.status(201).json(savedCollection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
