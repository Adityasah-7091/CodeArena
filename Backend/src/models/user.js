const mongoose = require("mongoose");
const { Schema } = mongoose;
const Userschema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    emailId: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        immutable: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    problemsolved: [
        {
            type: Schema.Types.ObjectId,
            ref: 'problem'
        }]

}, {
    timestamps: true
})

const User = mongoose.model("user", Userschema);
module.exports = User;