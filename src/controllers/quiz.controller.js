const mongoose = require('mongoose');

const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Answer = require('../models/answer.model');

exports.getAll = async (req, res) => {
    try {
        const quizzes = await Quiz.find(req.query || {}).populate({
            path: 'questions',
            populate: { path: 'answers' }
        });

        res.status(200).json({ success: true, message: 'Fetch successfully!', data: quizzes });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to fetch!', error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const quiz = await Quiz.findById(id).populate({
            path: 'questions',
            populate: { path: 'answers' }
        });

        res.status(200).json({ success: true, message: 'Fetch successfully!', data: quiz });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Fail to fetch!', error: error.message });
    }
};

exports.createQuiz = async (req, res) => {
    const session = await Quiz.startSession();

    try {
        session.startTransaction();

        const { host_id, questions, ...rest } = req.body;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('Questions are required');
        }

        const quiz = await Quiz.create(
            [
                {
                    ...rest
                }
            ],
            { session }
        );

        const quizId = quiz[0]._id;

        const questionIds = [];
        for (const question of questions) {
            const { text, type, thumbnail, time_limit, point_type, answer_type } = question;
            const questionDoc = await Question.create(
                [
                    {
                        text,
                        type,
                        thumbnail,
                        answer_type,
                        time_limit,
                        point_type,
                        quiz_id: quizId
                    }
                ],
                { session }
            );

            questionIds.push(questionDoc[0]._id);

            const answers = question.answers.map((answer) => ({
                text: answer.text,
                is_correct: answer.is_correct,
                question_id: questionDoc[0]._id
            }));

            const createdAnswers = await Answer.insertMany(answers, { session });

            const answerIds = createdAnswers.map((answer) => answer._id);
            questionDoc[0].answers = answerIds;
            await questionDoc[0].save({ session });
        }

        quiz[0].questions = questionIds;
        await quiz[0].save({ session });

        await session.commitTransaction();
        session.endSession();

        const populatedQuiz = await Quiz.findById(quizId).populate({
            path: 'questions',
            populate: { path: 'answers' }
        });

        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: populatedQuiz
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, error: 'Failed to create quiz' });
    }
};
