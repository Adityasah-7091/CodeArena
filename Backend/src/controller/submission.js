const Submission = require('../models/submissionSchema');
const { getLangId, submitBatch, submitToken } = require('../utils/problemUtility');
const Problem = require('../models/problemschema');
const User = require("../models/user");


const submitCode = async (req, res) => {
    try {
        // console.log(req.result);
        // console.log("hello");
        const user_id = req.result._id;
        const problem_id = req.params.id;
        const code = req.body.code;
        let language = req.body.language;

        
        if(!user_id||!problem_id||!code||!language)
            return res.status(400).send("Some field Missing");
        if(language ==='c++') language='cpp'


        const problem = await Problem.findById(problem_id);
        

        const submittedData = await Submission.create({
            user_id: user_id,
            problem_id: problem_id,
            code: code,
            language: language,
            totalTestCases:problem.hiddenTestCases.length,
            status : 'Pending'
        })

        const languageId = getLangId(language);
        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
            cpu_time_limit: 2.0
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const token = resultToken.join(',');
        const testResult = await submitToken(token);

        let runtime = 0;
        let space = 0;
        let errorMessage = null;
        let testCasePassed = 0;
        let status = 'Accepted';
        let failedTestCase = null;

        for (let i = 0; i < testResult.length; i++) {
            const cases = testResult[i];
            if (cases.status.id === 3) {
                testCasePassed++;
                runtime += parseFloat(cases.time || 0);
                space = Math.max(space, cases.memory || 0);
            } else {
                errorMessage = cases.stderr || cases.compile_output || null;
                status = cases.status.description;

                const origTestCase = problem.hiddenTestCases[i];
                if (origTestCase) {
                    failedTestCase = {
                        input: origTestCase.input,
                        expected_output: origTestCase.output,
                        actual_output: cases.stdout || ""
                    };
                }
                break;
            }
        }

        if (status === 'Accepted') {
            submittedData.status = status;
            submittedData.runtime = runtime;
            submittedData.space = space;
            submittedData.testCasePassed = testCasePassed;

            // adding problem to user schema
            if (!req.result.problemsolved.includes(problem_id)) {
                req.result.problemsolved.push(problem_id);
                await req.result.save();
            }
        } else {
            submittedData.status = status;
            submittedData.testCasePassed = testCasePassed;
            submittedData.errorMessage = errorMessage;
            if (failedTestCase) {
                submittedData.failedTestCase = failedTestCase;
            }
        }

        await submittedData.save();
        res.status(201).send(submittedData);
    }
    catch (err) {
        res.status(500).send("Error "+err);
    }


}

const runCode = async (req,res)=>{
    try {
        const user_id = req.result._id;
        const problem_id = req.params.id;
        const code = req.body.code;
        let language = req.body.language;

        
        if(!user_id||!problem_id||!code||!language)
            return res.status(400).send("Some field Missing");
        if(language ==='c++') language='cpp'

        const problem = await Problem.findById(problem_id);

        const languageId = getLangId(language);
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
            cpu_time_limit: 2.0
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const token = resultToken.join(',');
        const testResult = await submitToken(token);

        const responseData = testResult.map((res, i) => {
            const origTestCase = problem.visibleTestCases[i];
            return {
                ...res,
                stdin: origTestCase ? origTestCase.input : "",
                expected_output: origTestCase ? origTestCase.output : ""
            };
        });

        res.status(201).send(responseData);
    }
    catch (err) {
        res.status(500).send("Error "+err);
    }

}

const getSubmissions = async (req, res) => {
    try {
        const userId = req.result._id;
        const submissions = await Submission.find({ user_id: userId })
            .populate({ path: 'problem_id', model: 'problem', select: 'title difficulty' })
            .sort({ createdAt: -1 });
        res.status(200).send(submissions);
    } catch (err) {
        res.status(500).send("Error fetching submissions: " + err.message);
    }
}

module.exports = {submitCode, runCode, getSubmissions};