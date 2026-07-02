const mongoose = require("mongoose");
async function main() {
    await mongoose.connect(process.env.DB_URI);
    // console.log(mongoose.connection.name);
    
}

module.exports = main;