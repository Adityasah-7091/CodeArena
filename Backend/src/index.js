const express = require("express");
require("dotenv").config();
const cookieParser = require('cookie-parser')
const user = require("./models/user");
//login,logout,register,getprofile 
const authRouter = require("./routes/userAuth");
//DB connections
const main = require("./config/db");
const redisClient = require("./config/redis")
const problemRouter = require("./routes/problemRoutes");
const submitRouter = require('./routes/codeExecutionRoute')
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}))

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/code',submitRouter);


const initializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB connected");
        app.listen(process.env.PORT, () =>
            console.log("listening on port " + process.env.PORT))

    }
    catch (err) {
        console.log(err);
    }
}

initializeConnection();