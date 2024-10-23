const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
