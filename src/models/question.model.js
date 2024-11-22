const { Schema, model } = require('mongoose');
const { QUESTION_TYPE, QUESTION_POINT_TYPE, ANSWER_TYPE } = require('../enums');

const Types = Schema.Types;

const questionSchema = new Schema(
    {
        text: { type: String, required: true },
        type: { type: String, enum: Object.values(QUESTION_TYPE), default: QUESTION_TYPE.QUIZ },
        thumbnail: {
            type: String
        },
        time_limit: {
            type: Number,
            default: 5
        },
        point_type: {
            type: String,
            enum: Object.values(QUESTION_POINT_TYPE),
            default: QUESTION_POINT_TYPE.STANDARD
        },
        answer_type: {
            type: String,
            enum: Object.values(ANSWER_TYPE),
            default: ANSWER_TYPE.SINGLE
        },
        answers: [
            {
                type: Types.ObjectId,
                ref: 'Answer',
            }
        ],
        quiz_id: {
            type: Types.ObjectId,
            ref: 'Quiz',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = model('Question', questionSchema);
