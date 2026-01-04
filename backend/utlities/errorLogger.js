//Import required modules
const fs = require('fs')

//Implement errorLogger function as per the requirement
let errorLogger = async (err, req, res, next) => {
    const timestamp = new Date().toISOString()
    
    fs.appendFile('Errorlogger.txt', `${timestamp} ${err.stack}\n`, (error) => {
        if (error) {
            console.log("Failed in logging error")
        }
    })
    if (err.status) {
        res.status(err.status)
    } else {
        res.status(500)
    }
    res.json({ "message": err.message })
}

module.exports = errorLogger;