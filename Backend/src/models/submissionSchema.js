const mongoose = require('mongoose');
const { Schema } = mongoose;

const submitSchema = new Schema({
    user_id:{
        type : Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    problem_id:{
        type : Schema.Types.ObjectId,
        ref : 'problemschema',
        required : true
    },
    code:{
        type: String,
        required:true
    },
    language:{
        type:String,
        enum:['c','cpp','javascript','java','python'],
        required:true
    },
    status:{
        type:String,
        default:'pending',
        required:true
    },
    runtime:{
        type:Number,
        default:0
    },
    space:{
        type:Number,
        default:0
    },
    errorMessage:{
        type:String,
        default:''
    },
    testCasePassed:{
        type:Number,
        default:0
    },
    totalTestCases:{
        type:Number
    },
    failedTestCase: {
        input: { type: String, default: "" },
        expected_output: { type: String, default: "" },
        actual_output: { type: String, default: "" }
    }
},{
    timestamps:true
})

const Submission = mongoose.model('submission',submitSchema);
module.exports = Submission;