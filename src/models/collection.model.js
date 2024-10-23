const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
    {
        name: { type: String, require: true },
        host_id: {
            type: String,
            unique: true,  // Ensure the host_id is unique
            default: generate5CharCode,  // It must be present, but it will be auto-generated,
            immutable: true,
          },
    },
    { timestamps: true }
);

// Function to generate a 5-character alphanumeric code
function generate5CharCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Pre-save hook to generate a unique 5-character alphanumeric code
// collectionSchema.pre('save', async function (next) {
//     const doc = this;

//     console.log('mongoose.models', mongoose.models)

//     if (!doc.host_id) {
//         let isUnique = false;
//         let newCode;

//         // Keep generating a new code until it's unique
//         while (!isUnique) {
//             newCode = generate5CharCode();
//             const existingDoc = await mongoose.models.Collection.findOne({
//                 host_id: newCode
//             });

//             if (!existingDoc) {
//                 isUnique = true;
//             }
//         }

//         doc.host_id = newCode;
//     }

//     next();
// });

module.exports = mongoose.model('Collection', collectionSchema);
