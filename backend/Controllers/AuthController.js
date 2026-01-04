const Auth = {}
const JwtController = require('./JwtController')
const bcrypt = require('bcryptjs')
const { getJobSeekerCollection, getEmployeerCollection } = require('./../utlities/connection')
const { validateName, validateEmail, validatePassword } = require('./../utlities/Validation')
const { verifyCaptcha } = require('./../utlities/captchaVerify')
const OtpController = require('./OtpController')

Auth.register = async (user) => {
    try {
        // Verify CAPTCHA first
        if (user.captchaToken) {
            await verifyCaptcha(user.captchaToken)
        }
        
        //validations             
        validateName(user.name)
        validateEmail(user.emailId)
        validatePassword(user.password)
        
        // Verify that email has been verified via OTP
        if (!OtpController.isEmailVerified(user.emailId)) {
            let error = new Error('Email not verified. Please verify your email first.')
            error.status = 400
            throw error
        }
        
        if (user.userType === 'Jobseeker')
            return Auth.jobSeekerRegister(user)
        else if (user.userType === 'Employeer')
            return Auth.employeerRegister(user)
        else {
            let error = new Error('Invalid user type')
            error.status = 406
            throw error
        }
    }
    catch (error) {
        throw error
    }
}

Auth.jobSeekerRegister = async (user) => {
    try {
        //check user exists
        const userCollection = await getJobSeekerCollection()
        const existingUser = await userCollection.findOne({ emailId: user.emailId })
        if (existingUser) {
            let error = new Error('Email already exists')
            error.status = 400
            throw error
        }
        //hash password
        const hashedPassword = await bcrypt.hash(user.password, 11)
        user.password = hashedPassword
        // create user
        const newUser = await userCollection.create({ name: user.name, emailId: user.emailId, password: user.password, userType: user.userType })
        // Clear OTP after successful registration
        OtpController.clearOTP(user.emailId)
        // create token
        const token = JwtController.generateToken({_id: newUser._id, userType: user.userType })
        return { newUser, token }
    }
    catch (error) {
        throw error
    }

}

Auth.employeerRegister = async (user) => {
    try {
        //check user exists
        const userCollection = await getEmployeerCollection()
        const existingUser = await userCollection.findOne({ emailId: user.emailId })
        if (existingUser) {
            let error = new Error('Email already exists')
            error.status = 400
            throw error
        }
        //hash password
        const hashedPassword = await bcrypt.hash(user.password, 11)
        user.password = hashedPassword
        // create user
        const newUser = await userCollection.create({ name: user.name, emailId: user.emailId, password: user.password, userType: user.userType })
        // Clear OTP after successful registration
        OtpController.clearOTP(user.emailId)
        // create token
        const token = JwtController.generateToken({ _id: newUser._id, userType: user.userType })
        return { newUser, token }
    }
    catch (error) {
        throw error
    }
}

//login
Auth.login = async (user) => {
    try {
        // Verify CAPTCHA first
        if (user.captchaToken) {
            await verifyCaptcha(user.captchaToken)
        }
        
        //validations
        validateEmail(user.emailId)
        validatePassword(user.password)
        if(user.userType === 'Jobseeker')
            return Auth.jobSeekerLogin(user)
        else if(user.userType === 'Employeer')
            return Auth.employeerLogin(user)
        else {
            let error = new Error('Invalid user type')
            error.status = 406
            throw error
        }
    }
    catch (error) {
        throw error
    }
}

Auth.jobSeekerLogin = async (user) => {
    try{
        const jobSeekerCollection = await getJobSeekerCollection()
        //check user exists
        const userData = await jobSeekerCollection.findOne({emailId:user.emailId})
        if(!userData) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        // compare password
        const isMatch = await bcrypt.compare(user.password, userData.password)
        if(!isMatch) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        // create token
        const token = JwtController.generateToken({ _id: userData._id, userType:user.userType })
        if(!token) {
            let error = new Error('Unable to generate session token')
            error.status = 500
            throw error
        }
        else
        return token
    }
    catch(error) {
        throw error
    }
}

Auth.employeerLogin = async (user) => {
    try{
        const employeerCollection = await getEmployeerCollection()
        //check user exists
        const userData = await employeerCollection.findOne({emailId:user.emailId})
        if(!userData) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        // compare password
        const isMatch = await bcrypt.compare(user.password, userData.password)
        if(!isMatch) {
            let error = new Error('Invalid Email or Password')
            error.status = 400
            throw error
        }
        // create token
        const token = JwtController.generateToken({ _id: userData._id, userType:user.userType  })
        if(!token) {
            let error = new Error('Unable to generate session token')
            error.status = 500
            throw error
        }
        else
        return token
    }
    catch(error) {
        throw error
    }
}
module.exports = Auth