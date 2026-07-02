const validator = require("validator");

function validate(data) {
    const mandatoryField = ['firstName','emailId','password'];
    const IsAllowed = mandatoryField.every((k)=>Object.keys(data).includes(k));
    if(!IsAllowed) throw new Error("Field missing");

    if (!validator.isEmail(data.emailId)) {
        throw new Error("Invalid email");
    }

    if(!validator.isStrongPassword(data.password)){
        throw new Error("weak password");
    }
    if(data.firstName.length<3 || data.firstName.length>20){
        throw new Error("First name should be between 3 to 20 in length");
    }
}

module.exports = validate;