const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        required: true,
        enum: ['Easy', 'Medium', 'Hard']
    },

    topics: {
        type: [String],
        required: true
    },

    hint: {
        type: [String]
    },

    visibleTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            }
        }
    ],

    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }
    ],

    startCode: [
        {
            language: {
                type: String,
                // required : true
            },
            initialCode: {
                type: String,
                // required : true
            }
        }
    ],

    refSoln: [
        {
            language: {
                type: String,
                required: true,
            },
            soln: {
                type: String,
                required: true
            }
        }
    ],

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
})

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;