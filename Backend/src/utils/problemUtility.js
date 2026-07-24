const axios = require('axios');
const { JUDGE0_URL } = require("../config/judge0");

const getLangId = (lang) => {
    const language = {
        c: 50,
        cpp: 54,
        java: 62,
        javascript: 63,
        python: 71
    };
    return language[lang.toLowerCase()];
};

const waiting = (timer) =>
    new Promise(resolve => setTimeout(resolve, timer));



const submitBatch = async (submissions) => {
    try {
        const response = await axios.post(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`, { submissions })
        return response.data;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

const submitToken = async (token) => {
    while (true) {
        const result = await axios.get(`${JUDGE0_URL}/submissions/batch?tokens=${token}&base64_encoded=false`);
        // console.log(result.data.submissions);
        const IsResultObtained = result.data.submissions.every((r) => r.status.id > 2);
        if (IsResultObtained)
            return result.data.submissions;
        await waiting(1000);
    }
}
module.exports = { getLangId, submitBatch, submitToken }