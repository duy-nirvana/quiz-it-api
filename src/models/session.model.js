const { Schema, model } = require('mongoose');
const { generateUniqueHostId } = require('../middlewares/quiz.middleware');

const Types = Schema.Types;

const sessionSchema = new Schema(
    {
        quiz: {
            type: Types.ObjectId,
            ref: 'Quiz',
            required: true
        },
        host_id: {
            type: String,
            unique: true,
            immutable: true
        },
        host_user: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        access_code: {
            type: String
        },
        participants: [
            {
                socket_id: { type: String },
                user: { type: Types.ObjectId, ref: 'User' },
                name: { type: String },
                joined_at: { type: Date, default: Date.now }
            }
        ],
        is_active: { type: Boolean, default: false },
        game_settings: {
            // time_limit: { type: Number, default: 0 }, // Time limit per question in seconds
            max_participants: { type: Number, default: 9999 }
        },
        started_at: { type: Date, default: Date.now },
        ended_at: { type: Date }
    },
    { timestamps: true }
);

sessionSchema.pre('save', generateUniqueHostId);

module.exports = model('Session', sessionSchema);
