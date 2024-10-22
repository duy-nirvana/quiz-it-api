const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, require: true },
    author: { type: String, require: true },
    // publishedDate: { type: Date, required: true }
});

module.exports = mongoose.model('Book', bookSchema);
