const express = require("express");
const problemRouter = express.Router();
const adminValidation = require("../middleware/adminValidation")
const {createProblem,updateProblem,deleteProblem,getProblem,fetchAllProblem, solvedProblem} = require("../controller/problemcontrol");
const validatecookie = require("../middleware/validatecookie");

//create
problemRouter.post("/create",adminValidation,createProblem);
//update
problemRouter.put("/update/:id",adminValidation,updateProblem);
//delete
problemRouter.delete("/delete/:id",adminValidation,deleteProblem);
//only admin can do above request

//fetch
problemRouter.get("/getProblem/:id",validatecookie,getProblem);
//fetchAll
problemRouter.get("/getAllProblem",validatecookie, fetchAllProblem);
//both can do above request

//problem solved by user
problemRouter.get("/problemsolved",validatecookie, solvedProblem)

module.exports = problemRouter;