const { Schema, model } = require('mongoose');
const { QUESTION_TYPE, QUESTION_POINT_TYPE, ANSWER_TYPE } = require('../enums');

const Types = Schema.Types;

const questionSchema = new Schema(
    {
        type: { type: String, enum: [...QUESTION_TYPE], default: QUESTION_TYPE.QUIZ },
        thumbnail: {
            type: String
        },
        time_limit: {
            type: Number,
            default: 5
        },
        point_type: {
            type: String,
            enum: [...QUESTION_POINT_TYPE],
            default: QUESTION_POINT_TYPE.STANDARD
        },
        answer_type: {
            type: String,
            enum: [...ANSWER_TYPE],
            default: ANSWER_TYPE.SINGLE
        },
        answers: [
            {
                type: Types.ObjectId,
                ref: 'Answer',
                required: true
            }
        ]
    },
    { timestamps: true }
);

module.exports = model('Question', questionSchema);