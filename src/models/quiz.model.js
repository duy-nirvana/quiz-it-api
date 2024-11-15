const { Schema, model } = require('mongoose');
const { generateUniqueHostId } = require('../middlewares/quiz.middleware');

const Types = Schema.Types;

const quizSchema = new Schema(
    {
        name: { type: String, require: true },
        is_private: { type: Boolean, require: true, default: false },
        host_id: {
            type: String,
            unique: true, // Ensure the host_id is unique
            immutable: true
        },
        questions: [
            {
                type: Types.ObjectId,
                ref: 'Question'
            }
        ],
        created_by: {
            type: Types.ObjectId,
            ref: 'User',
            required: true
        },
        play_count: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

quizSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id; // Remove _id
        return ret;
    }
});

quizSchema.pre('save', generateUniqueHostId);

module.exports = model('Quiz', quizSchema);
