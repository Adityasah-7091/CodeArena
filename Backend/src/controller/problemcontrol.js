const Problem = require('../models/problemschema');
const Submission = require("../models/submissionSchema");
const User = require('../models/user');

const { getLangId, submitBatch, submitToken } = require("../utils/problemUtility");
//create problem
const createProblem = async (req, res) => {
    const { title, description, difficulty, topics, hint, visibleTestCases, hiddenTestCases, startCode, refSoln } = req.body;

    try {
        for (const { language, soln } of refSoln) {
            const languageId = getLangId(language);

            const submissions = hiddenTestCases.map((testcase) => ({
                source_code: soln,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
                cpu_time_limit: 2.0
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const token = resultToken.join(',');
            const testResult = await submitToken(token);
            console.log(testResult);

            for (const test of testResult) {
                if (test.status.id != 3) {
                    return res.status(400).send("Error occured");
                }
            }
        }
        const problem = await Problem.create({
            ...req.body,
            createdBy: req.result._id
        })
        res.status(201).send("problem created successfully");
    }
    catch (err) {
        res.status(500).send("Error" + err);
    }
}

//update problem
const updateProblem = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(402).send("Invalid Id");

    const user = await Problem.findById(id);
    if (!user) return res.status(402).send("Invalid Id");

    const { title, description, difficulty, topics, hint, visibleTestCases, hiddenTestCases, startCode, refSoln, createdBy } = req.body;

    try {
        for (const { language, soln } of refSoln) {
            const languageId = getLangId(language);

            const submissions = hiddenTestCases.map((testcase) => ({
                source_code: soln,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
                cpu_time_limit: 2.0
            }));

            const submitResult = await submitBatch(submissions);
            const resultToken = submitResult.map((value) => value.token);
            const token = resultToken.join(',');
            const testResult = await submitToken(token);

            for (const test of testResult) {
                if (test.status.id != 3) {
                    return res.status(400).send("Error occured");
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.status(202).send("Problem Updated", newProblem);
    }
    catch (err) {
        res.status(500).send("Error" + err);
    }

}

//delete problem
const deleteProblem = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).send("Invalid Id");

    try {

        const deleted = await Problem.findByIdAndDelete(id);
        if (!deleted) return res.status(404).send("Invalid Id or Problem is missing");

        res.status(200).send("Problem Deleted");
    }
    catch (err) {
        res.status(500).send("Error" + err);
    }

}

//get problem by Id
const getProblem = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(402).send("Invalid Id");

    try {
        const prob = await Problem.findById(id).select('_id title description difficulty topics hint visibleTestCases');
        if (!prob) return res.status(404).send("Problem is Missing");

        res.status(201).send(prob);
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }

}

//getAllProblems
const fetchAllProblem = async (req, res) => {
    try {
        const problems = await Problem.find({}).select('_id title difficulty topics');
        if (problems.length == 0) return res.status(404).send("No problems");
        res.status(201).send(problems);
    }
    catch (err) {
        res.status(500).send("Error" + err);
    }
}

//problem solved by user
const solvedProblem = async (req, res) => {
    try {
        // const count = req.result.problemsolved.length;
        // // res.send(count);
        // let arr = []
        // for(let id of req.result.problemsolved){
        //     const title = await Problem.findById(id).select('title');
        //     arr.push(title);
        // }
        // res.send(arr);

        const userId = req.result._id;
        const user = await User.findById(userId).populate('problemsolved','title difficulty');
        res.send(user.problemsolved);

    }
    catch (err) {
        res.status(401).send(err);
    }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblem, fetchAllProblem, solvedProblem };