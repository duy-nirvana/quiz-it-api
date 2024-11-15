const mongoose = require('mongoose');
const { generate5CharCode } = require('../utils');

// Middleware to generate a unique host_id before saving a new document
const generateUniqueHostId = async function (next) {
    const doc = this;

    // Only generate host_id if it's a new document
    if (!doc.host_id) {
        let unique = false;
        let generatedCode;

        // Keep generating a new code until we find one that's unique
        while (!unique) {
            generatedCode = generate5CharCode();

            // Check if the generated code already exists
            const existingDoc = await mongoose.models.Topic.findOne({ host_id: generatedCode });

            if (!existingDoc) {
                unique = true;
            }
        }

        doc.host_id = generatedCode;
    }

    next();
};

module.exports = { generateUniqueHostId };
