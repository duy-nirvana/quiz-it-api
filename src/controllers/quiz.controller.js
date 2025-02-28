const mongoose = require('mongoose');

const Quiz = require('../models/quiz.model');
const Question = require('../models/question.model');
const Answer = require('../models/answer.model');

exports.getAll = async (req, res) => {
    try {
        const { limit, page, search, excluded_id, ...query } = req.query || {};

        if (excluded_id) {
            query.created_by = { $ne: excluded_id };
        }

        const pageOptions = {
            page: parseInt(page - 1, 10) || 0,
            limit: parseInt(limit, 10) || 10
        };

        const regex = new RegExp(search, 'i');

        const total = await Quiz.countDocuments({
            ...query,
            title: { $regex: regex }
        });
        const quizzes = await Quiz.find({ ...query, title: { $regex: regex } })
            .collation({
                locale: 'vi',
                strength: 1
            })
            .skip(pageOptions.page * pageOptions.limit)
            .limit(pageOptions.limit)
            .populate('questions', 'thumbnail');

        res.status(200).json({
            success: true,
            message: 'Fetch successfully!',
            total,
            data: quizzes
        });
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

// exports.updateQuiz = async (req, res) => {
//     const session = await Quiz.startSession();

//     try {
//         session.startTransaction();

//         const { id: quiz_id, questions, ...rest } = req.body;

//         if (!quiz_id) {
//             throw new Error('Quiz ID is required');
//         }

//         const quiz = await Quiz.findById(quiz_id).session(session);
//         if (!quiz) {
//             throw new Error('Quiz not found');
//         }

//         // Update quiz's main details
//         Object.assign(quiz, rest);
//         await quiz.save({ session });

//         const existingQuestions = await Question.find({ quiz_id }).session(session);
//         const existingQuestionIds = existingQuestions.map((q) => q._id.toString());

//         const updatedQuestionIds = [];
//         for (const question of questions) {
//             let questionDoc;
//             if (question._id) {
//                 // If the question has an ID, update it
//                 questionDoc = await Question.findById(question._id).session(session);
//                 if (!questionDoc) {
//                     throw new Error(`Question with ID ${question._id} not found`);
//                 }

//                 Object.assign(questionDoc, {
//                     text: question.text,
//                     type: question.type,
//                     thumbnail: question.thumbnail,
//                     time_limit: question.time_limit,
//                     point_type: question.point_type,
//                     answer_type: question.answer_type
//                 });
//             } else {
//                 // If the question doesn't have an ID, create a new one
//                 questionDoc = new Question({
//                     text: question.text,
//                     type: question.type,
//                     thumbnail: question.thumbnail,
//                     time_limit: question.time_limit,
//                     point_type: question.point_type,
//                     answer_type: question.answer_type,
//                     quiz_id
//                 });
//             }

//             await questionDoc.save({ session });
//             updatedQuestionIds.push(questionDoc._id);

//             const existingAnswers = await Answer.find({ question_id: questionDoc._id }).session(
//                 session
//             );
//             const existingAnswerIds = existingAnswers.map((a) => a._id.toString());

//             const updatedAnswerIds = [];
//             for (const answer of question.answers) {
//                 let answerDoc;
//                 if (answer._id) {
//                     // If the answer has an ID, update it
//                     answerDoc = await Answer.findById(answer._id).session(session);
//                     if (!answerDoc) {
//                         throw new Error(`Answer with ID ${answer._id} not found`);
//                     }

//                     Object.assign(answerDoc, {
//                         text: answer.text,
//                         is_correct: answer.is_correct
//                     });
//                 } else {
//                     // If the answer doesn't have an ID, create a new one
//                     answerDoc = new Answer({
//                         text: answer.text,
//                         is_correct: answer.is_correct,
//                         question_id: questionDoc._id
//                     });
//                 }

//                 await answerDoc.save({ session });
//                 updatedAnswerIds.push(answerDoc._id);
//             }

//             // Remove answers that are no longer in the updated list
//             const removedAnswerIds = existingAnswerIds.filter(
//                 (id) => !updatedAnswerIds.includes(id)
//             );
//             await Answer.deleteMany({ _id: { $in: removedAnswerIds } }).session(session);

//             questionDoc.answers = updatedAnswerIds;
//             await questionDoc.save({ session });
//         }

//         // Remove questions that are no longer in the updated list
//         const removedQuestionIds = existingQuestionIds.filter(
//             (id) => !updatedQuestionIds.includes(id)
//         );

//         await Answer.deleteMany({ question_id: { $in: removedQuestionIds } }).session(session);
//         await Question.deleteMany({ _id: { $in: removedQuestionIds } }).session(session);

//         // Update quiz's questions array
//         quiz.questions = updatedQuestionIds;
//         await quiz.save({ session });

//         await session.commitTransaction();
//         session.endSession();

//         const updatedQuiz = await Quiz.findById(quiz_id).populate({
//             path: 'questions',
//             populate: { path: 'answers' }
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Quiz updated successfully',
//             data: updatedQuiz
//         });
//     } catch (error) {
//         if (session.inTransaction()) {
//             await session.abortTransaction();
//         }
//         session.endSession();

//         console.error('Error updating quiz:', error);
//         res.status(500).json({ success: false, error: 'Failed to update quiz' });
//     }
// };

exports.updateQuiz = async (req, res) => {
    const session = await Quiz.startSession();

    try {
        session.startTransaction();

        const { id: quiz_id, questions, ...rest } = req.body;

        if (!quiz_id) {
            throw new Error('Quiz ID is required');
        }

        const quiz = await Quiz.findById(quiz_id).session(session);
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        Object.assign(quiz, rest); // Update only the provided quiz fields (e.g., title)
        await quiz.save({ session });

        // Check if `questions` is provided and is an array
        if (questions && Array.isArray(questions)) {
            const updatedQuestionIds = [];
            const bulkQuestions = [];
            const bulkAnswers = [];
            const removedAnswerIds = [];
            const newAnswers = [];

            for (const question of questions) {
                let questionId;

                if (question._id) {
                    questionId = question._id;
                    bulkQuestions.push({
                        updateOne: {
                            filter: { _id: questionId },
                            update: {
                                text: question.text,
                                type: question.type,
                                thumbnail: question.thumbnail,
                                time_limit: question.time_limit,
                                point_type: question.point_type,
                                answer_type: question.answer_type
                            }
                        }
                    });

                    const existingAnswers = await Answer.find({ question_id: questionId }).session(
                        session
                    );
                    const existingAnswerIds = existingAnswers.map((a) => a._id.toString());
                    const updatedAnswerIds = [];

                    for (const answer of question.answers || []) {
                        if (answer._id) {
                            updatedAnswerIds.push(answer._id);
                            bulkAnswers.push({
                                updateOne: {
                                    filter: { _id: answer._id },
                                    update: { text: answer.text, is_correct: answer.is_correct }
                                }
                            });
                        } else {
                            newAnswers.push({
                                text: answer.text,
                                is_correct: answer.is_correct,
                                question_id: questionId
                            });
                        }
                    }

                    const toRemove = existingAnswerIds.filter(
                        (id) => !updatedAnswerIds.includes(id)
                    );
                    removedAnswerIds.push(...toRemove);
                } else {
                    const newQuestion = new Question({
                        text: question.text,
                        type: question.type,
                        thumbnail: question.thumbnail,
                        time_limit: question.time_limit,
                        point_type: question.point_type,
                        answer_type: question.answer_type,
                        quiz_id
                    });

                    const savedQuestion = await newQuestion.save({ session });
                    questionId = savedQuestion._id;

                    const answers = question.answers.map((answer) => ({
                        text: answer.text,
                        is_correct: answer.is_correct,
                        question_id: questionId
                    }));

                    const createdAnswers = await Answer.insertMany(answers, { session });
                    savedQuestion.answers = createdAnswers.map((answer) => answer._id);
                    await savedQuestion.save({ session });
                }

                updatedQuestionIds.push(questionId);
            }

            if (bulkQuestions.length > 0) {
                await Question.bulkWrite(bulkQuestions, { session });
            }

            if (bulkAnswers.length > 0) {
                await Answer.bulkWrite(bulkAnswers, { session });
            }

            if (newAnswers.length > 0) {
                const createdAnswers = await Answer.insertMany(newAnswers, { session });
                for (const answer of createdAnswers) {
                    await Question.updateOne(
                        { _id: answer.question_id },
                        { $push: { answers: answer._id } },
                        { session }
                    );
                }
            }

            if (removedAnswerIds.length > 0) {
                await Answer.deleteMany({ _id: { $in: removedAnswerIds } }).session(session);
            }

            quiz.questions = updatedQuestionIds;
            await quiz.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        const populatedQuiz = await Quiz.findById(quiz_id).populate({
            path: 'questions',
            populate: { path: 'answers' }
        });

        res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            data: populatedQuiz
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error('Error updating quiz:', error.stack || error);
        res.status(500).json({ success: false, error: error.message || 'Failed to update quiz' });
    }
};

exports.deleteQuiz = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { quiz_id } = req.params;

        if (!quiz_id) {
            throw new Error('Quiz ID is required');
        }

        console.log('Fetching quiz with id:', quiz_id);

        // Find the quiz by ID
        const quiz = await Quiz.findById(quiz_id).session(session);
        if (!quiz) {
            throw new Error('Quiz not found');
        }

        console.log('Deleting quiz and related data...');

        // Find all questions associated with the quiz
        const questions = await Question.find({ quiz_id }).session(session);
        const questionIds = questions.map((question) => question._id);

        // Find all answers associated with the questions
        if (questionIds.length > 0) {
            await Answer.deleteMany({ question_id: { $in: questionIds } }).session(session);
            console.log('Deleted all answers related to the quiz.');
        }

        // Delete all questions associated with the quiz
        await Question.deleteMany({ quiz_id }).session(session);
        console.log('Deleted all questions related to the quiz.');

        // Delete the quiz itself
        await Quiz.findByIdAndDelete(quiz_id).session(session);
        console.log('Deleted the quiz.');

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Quiz and all associated data deleted successfully'
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error('Error deleting quiz:', error.stack || error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete quiz',
            error: error.message || 'An error occurred'
        });
    }
};
