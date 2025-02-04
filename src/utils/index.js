exports.generate5CharCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

exports.populateQuiz = (session) => {
    return session.populate({
        path: 'quiz',
        populate: {
            path: 'questions',
            populate: {
                path: 'answers'
            }
        }
    });
};
