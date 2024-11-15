const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
