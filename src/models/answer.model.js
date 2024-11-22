const { Schema, model } = require('mongoose');

const Types = Schema.Types;

const answerSchema = new Schema(
    {
        question_id: {
            type: Types.ObjectId,
            ref: 'Question',
            required: true
        },
        is_correct: {
            type: Boolean,
            default: false,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

module.exports = model('Answer', answerSchema);
