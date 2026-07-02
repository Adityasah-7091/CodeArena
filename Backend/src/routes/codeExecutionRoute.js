const express = require('express');
const submitRouter = express.Router();
const validatecookie = require("../middleware/validatecookie");
const codeExecutionLimiter = require("../middleware/rateLimiter");
const {submitCode,runCode,getSubmissions} = require('../controller/submission');

submitRouter.post('/submit/:id', validatecookie, codeExecutionLimiter, submitCode);
submitRouter.post('/run/:id', validatecookie, codeExecutionLimiter, runCode);
submitRouter.get('/submissions', validatecookie, getSubmissions);

module.exports = submitRouter;