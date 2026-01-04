const express = require('express');
const router = express.Router();
const {getQuestions, startQuiz, endQuiz }= require('./../Controllers/QuizController')
const authMiddleware = require('./../middewares/AuthMiddleware')
const dbModel = require('./../utlities/connection')

router.use(authMiddleware)
router.post('/createQuiz', async (req, res, next)=>{
    try{
        const userId = req.userId
        const createdQuiz = await startQuiz(userId)
        res.json(createdQuiz)
    }
    catch(error) {
        next(error)
    }
})
router.get('/getQuestions', async (req, res, next)=>{
    try{
        const questionData = await getQuestions()
        res.json({ quiz: { questions: questionData } })
    }
    catch(error) {
        next(error)
    }
})

// Get quiz result
router.get('/result', async (req, res, next) => {
    try {
        const resultCollection = await dbModel.getResultCollection()
        const result = await resultCollection.findOne({ userId: req.userId })
        
        if (!result) {
            return res.json({ result: null })
        }
        
        res.json({ result })
    } catch(error) {
        next(error)
    }
})

// Reset quiz for retake
router.delete('/reset', async (req, res, next) => {
    try {
        const userId = req.userId        
        // Delete existing quiz record
        const quizCollection = await dbModel.getQuizCollection()
        await quizCollection.deleteOne({ userId: userId })
        
        // Delete existing result record
        const resultCollection = await dbModel.getResultCollection()
        await resultCollection.deleteOne({ userId: userId })
        
        // Reset test flag AND clear tags in jobseeker collection
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()
        await jobSeekerCollection.updateOne(
            { _id: userId }, 
            { $set: { test: false, tags: [] } }
        )
        
        res.json({ message: 'Quiz reset successfully. You can now retake the assessment.' })
    } catch(error) {
        next(error)
    }
})

router.put('/endQuiz/:userId', async (req, res, next)=>{
    try{
        const userId = req.params.userId
        
        // Verify the param matches the authenticated user for security
        if (userId !== req.userId.toString()) {
            let error = new Error('Unauthorized: Cannot modify another user\'s quiz')
            error.status = 403
            throw error
        }
        
        const quizReport = await endQuiz(userId, req.body.responses)
        if(quizReport) {
            res.json({message:"Quiz completed successfully", result: quizReport})
        }
        else {
            let error = new Error('Unable to complete quiz')
            error.status = 500
            throw error
        }
    }
    catch(error) {
        next(error)
    }
})

// Also support PUT without userId param (uses auth token)
router.put('/endQuiz', async (req, res, next)=>{
    try{
        const userId = req.userId
        const quizReport = await endQuiz(userId, req.body.answers || req.body.responses)
        if(quizReport) {
            res.json({message:"Quiz completed successfully", result: quizReport})
        }
        else {
            let error = new Error('Unable to complete quiz')
            error.status = 500
            throw error
        }
    }
    catch(error) {
        next(error)
    }
})

module.exports = router