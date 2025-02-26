const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const Types = Schema.Types;

const authProviderSchema = Schema({
    provider: { type: String, required: true },
    provider_id: { type: String, required: true },
    access_token: String,
    refresh_token: String,
    token_expiry: Date
});

const passwordResetTokenSchema = Schema({
    token: String,
    expires_at: Date
});

const userSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password_hash: { type: String },
        salt: { type: String },
        roles: [{ type: String, default: 'user' }],
        is_verified: { type: Boolean, default: false },
        auth_providers: [authProviderSchema],
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now },
        last_login: Date,
        account_status: { type: String, default: 'active' }, // e.g., 'active', 'suspended'
        failed_login_attempts: { type: Number, default: 0 },
        password_reset_token: passwordResetTokenSchema,
        google_id: { type: String },
        name: { type: String }
    },
    { timestamps: true }
);

// Hash password before saving the user
// userSchema.pre('save', async function (next) {
//     console.log('BBBBBBBBB', this);
//     if (this.isModified('password')) {
//         const salt = await bcrypt.genSalt(10);
//         this.salt = salt;
//         this.password_hash = await bcrypt.hash(this.password_hash, salt);
//         this.password = undefined; // Remove the plain password after hashing
//     }

//     next();
// });

// compare password
userSchema.methods.isValidPassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

module.exports = model('User', userSchema);
