const mongoose = require('mongoose')

let Validator = {}

// Validates MongoDB ObjectId format
Validator.validateObjectId = (id, fieldName = 'ID') => {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        let error = new Error(`Invalid ${fieldName} format`)
        error.status = 400
        throw error
    }
}

//validates name field
Validator.validateName = (name) => {
    const nameReg = /^[A-Z][a-zA-Z]{2,}( [A-Z][a-zA-Z]{2,})*$/
    if (!nameReg.test(name) || name.length < 3) {
        let error = new Error("Name must start with capital letter and contain atleast 3 letters");
        error.status = 406;
        throw error;
    }
}

//validates email field
Validator.validateEmail = (email) => {
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailReg.test(email)) {
        let error = new Error("Invalid Email");
        error.status = 406;
        throw error;
    }
}

//validates password field
Validator.validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
    if (password.length < 8) {
        let error = new Error('Minimum Password Length is eight')
        error.status = 406
        throw error
    }
    else if (!passwordRegex.test(password)) {
        let error = new Error('Invalid Password')
        error.status = 406
        throw error
    }

}

Validator.validateJob = (job) => {
    console.log('ln 51 ', job);
    
    if (!job.jobTitle || job.jobTitle.length === 0) {
        let error = new Error('Invalid Job Title')
        error.status = 406
        throw error
    }
    if (job.experience) {
        let { minExperience, maxExperience } = job.experience
        if (minExperience < 0 || maxExperience < 0) {
            let error = new Error('Invalid Job Experience')
            error.status = 406
            throw error
        }
    }
    if (job.salary) {
        let salary = parseInt(job.salary)
        if (isNaN(salary) || salary < 0) {
            let error = new Error('Invalid Job Salary')
            error.status = 406
            throw error
        }
    }
    if (!job.location || job.location.length === 0) {
        let error = new Error('Invalid Job location')
        error.status = 406
        throw error
    }
    console.log(".....",job.expiryDate);
    
    if(!job.expiryDate) {
         let error = new Error('Invalid Job Expiry Date')
        error.status = 406
        throw error
    }
    else {
        let deadline = new Date(job.expiryDate)
        if(deadline<=Date.now()) {
        let error = new Error('Job expiry date should be greater than postedDate')
        error.status = 406
        throw error
        }
        
    }
}
module.exports = Validator