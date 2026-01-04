const jwt= require('jsonwebtoken')
const dotenv = require('dotenv').config()
const bcrypt = require('bcryptjs')

const SECRET_KEY = process.env.JWT_SECRET
if (!SECRET_KEY) {
    console.error('WARNING: JWT_SECRET environment variable is not set!')
}
const expireTime = process.env.JWT_EXPIRES_IN || '10h'

//generate jwt token
const generateToken = (payload) => {
    return jwt.sign(payload, SECRET_KEY, {expiresIn:("10h")})
}

//verify jwt token
const verifyToken = (token) => {
    try{
        return jwt.verify(token, SECRET_KEY)
    }
    catch(error) {
        return null
    }
}
module.exports = {generateToken, verifyToken} 