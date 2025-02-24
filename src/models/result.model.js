const { Schema, model } = require('mongoose');
const { QUESTION_TYPE, QUESTION_POINT_TYPE, ANSWER_TYPE } = require('../enums');

const Types = Schema.Types;

const resultSchema = new Schema(
    {
        title: { type: String, required: true },
        scored_participants: { type: Array, required: true },
        host_id: { type: String, required: true },
        session_id: {
            type: Types.ObjectId,
            ref: 'Session',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = model('Result', resultSchema);
