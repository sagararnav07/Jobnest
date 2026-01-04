const { config } = require('dotenv')
const dbModel = require('./../utlities/connection')
const { categoryDb } = require('./../utlities/dbsetup')
const { generateAssessmentReport } = require('./../utlities/pdfReportGenerator')
//get questions from DB 
const getQuestions = async (questionsIds = []) => {
    try {
        if (questionsIds.length!=0) {
            const questionCollection = await dbModel.getQuestionCollection()
            let questionData = null                
            questionData = await questionCollection.find({ id: { $in: questionsIds } })
            if (!questionData || questionData.length === 0) {
                let error = new Error('Unable to fetch questions')
                error.status = 500
                throw error
            }
            else return questionData
        }
        else {
            const questionCollection = await dbModel.getQuestionCollection()
            questionData = await questionCollection.find({})
            let actualQuestions = []
            let length = questionData.length
            // Group questions by category
            const categoryMap = {
                "Openness": [],
                "Conscientiousness": [],
                "Extraversion": [],
                "Agreeableness": [],
                "Neuroticism": []
            }
            questionData.forEach(question => {
                if (categoryMap[question.category]) {
                    categoryMap[question.category].push(question)
                }
            })
            // For each category, select 2 questions randomly
            Object.keys(categoryMap).forEach(category => {
                const questions = categoryMap[category]
                // Shuffle the array
                for (let i = questions.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [questions[i], questions[j]] = [questions[j], questions[i]];
                }
                // Take first 2
                actualQuestions.push(...questions.slice(0, 2))
            })
            return actualQuestions
        }
    }
    catch (error) {
        throw error
    }
}

//Starts quiz for a jobseeker
const startQuiz = async (userId) => {
    try {
        console.log('lnnn');

        const quizCollection = await dbModel.getQuizCollection()
        const existingQuiz = await quizCollection.findOne({ userId: userId })
        const isQuizStarted = await (existingQuiz) ? true : false
        if (isQuizStarted) {
            return { "message": "Quiz already started", questions: await getQuestions() }
        }

        const createdQuiz = await quizCollection.create({ userId: userId });
        if (!createdQuiz) {
            let error = new Error('Unable to start quiz')
            error.status = 500
            throw error
        }
        else return { "message": "Quiz started successfully", questions: await getQuestions() }
    }
    catch (error) {
        throw error
    }
}

//Ends Quiz
const endQuiz = async (userId, responses) => {
    try {
        const quizCollection = await dbModel.getQuizCollection()
        // Convert questionId strings to mongoose ObjectId in all responses
        const transformedResponses = responses.map(resp => ({
            questionId: resp.questionId,
            score: resp.score,
            category: resp.category
        }))
        const questionIds = []
        transformedResponses.forEach((response) => {
            questionIds.push(response.questionId)
        })
        //get questions of all Ids
        let questions = []
        await getQuestions(questionIds)
            .then((data) => {
                questions = data.sort((a, b) => {
                    const aValue = parseInt(a.id.substring(1, a.length))
                    const bValue = parseInt(b.id.substring(1, b.length))
                    return aValue - bValue
                })
            })
        const sortedResponsesById = transformedResponses.sort((a, b) => {
            const aValue = parseInt(a.questionId.substring(1, a.length))
            const bValue = parseInt(b.questionId.substring(1, b.length))
            return aValue - bValue
        })
        const categoryMap = {
            "Openness": 0,
            "Conscientiousness": 1,
            "Extraversion": 2,
            "Agreeableness": 3,
            "Neuroticism": 4
        }
        let categoryObject = {
            categoryName: "",
            tags: [],
            score: 0,
            total: 0,
        }
        let categories = []
        for (let i = 0; i < 5; i++) categories.push({ ...categoryObject })
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].isReversed)
                sortedResponsesById[i].score = 6 - sortedResponsesById[i].score
            const categoryName = sortedResponsesById[i].category
            const categoryIndex = categoryMap[categoryName]
            categories[categoryIndex].score += sortedResponsesById[i].score
            categories[categoryIndex].total += 5
            if (!categories[categoryIndex].tags || categories[categoryIndex].tags.length === 0) {
                categories[categoryIndex].categoryName = categoryName
                categories[categoryIndex].tags = categoryDb[categoryName]
            }
        }
        const updatedQuiz = await quizCollection.updateOne(
            { userId: userId },
            { $set: { responses: responses, submittedAt: new Date() } }
        );
        if (updatedQuiz.modifiedCount === 0) {
            let error = new Error('Unable to update quiz object')
            error.status = 500
            throw error
        }
        //converts score to percent
        categories.map((category) => {
            category.score = (category.score / category.total) * 100
            return category
        })
        //sorts in descending order by score
        categories.sort((a, b) => b.score - a.score)
        //returns top three (filter out categories with no score/tags)
        let topThreeCategories = categories.filter(cat => cat.categoryName && cat.tags && cat.tags.length > 0).slice(0, 3)
        //get overalltags
        let overAllTags = []
        topThreeCategories.forEach((category) => {
            if (category.tags && Array.isArray(category.tags)) {
                overAllTags.push(...category.tags)
            }
        })
        categories = topThreeCategories.map((category) => {

            return { categoryName: category.categoryName, score: category.score, tags: category.tags }
        })
        //insert result object
        const resultCollection = await dbModel.getResultCollection()
        
        // Check if result already exists, if so update it instead of creating
        const existingResult = await resultCollection.findOne({ userId: userId })
        let insertedResult
        if (existingResult) {
            insertedResult = await resultCollection.updateOne(
                { userId: userId },
                { $set: { generatedAt: new Date(), overAllTags, categories: categories } }
            )
        } else {
            insertedResult = await resultCollection.create({
                userId,
                generatedAt: new Date(),
                overAllTags,
                categories: categories
            })
        }
        if (!insertedResult) {
            let error = new Error('Unable to insert/update result object')
            error.status = 500
            throw error
        }
        // update test to true in jobseeker collection
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()
        const jobSeeker = await jobSeekerCollection.findOne({ _id: userId })
        
        if (!jobSeeker) {
            let error = new Error('Jobseeker not found')
            error.status = 404
            throw error
        }
        
        // Update jobseeker - use updateOne but don't fail if nothing modified (already has same values)
        await jobSeekerCollection.updateOne(
            { _id: userId }, 
            { $set: { test: true, tags: overAllTags } }
        )
        // get the matched employeers based on tags
        const employeerCollection = await dbModel.getEmployeerCollection()
        const potentialEmployeers = await employeerCollection.find({ tags: { $in: overAllTags } }, { _id: 0, name: 1 })

        // It's okay to have no matches - return empty array
        const potentialEmployeersName = potentialEmployeers.map((employeer) => employeer.name)

        // Get matched jobs for the PDF report
        const jobCollection = await dbModel.getJobCollection()
        const allJobs = await jobCollection.find({}).limit(15)
        const matchedJobs = allJobs.map(job => ({
            jobTitle: job.jobTitle,
            salary: job.salary,
            location: job.location,
            skills: job.skills,
            description: job.description,
            jobPreference: job.jobPreference,
            experience: job.experience
        }))

        // Generate PDF Report
        let reportInfo = null
        try {
            reportInfo = await generateAssessmentReport(
                userId,
                jobSeeker?.name || 'User',
                jobSeeker?.emailId || '',
                categories,
                overAllTags,
                potentialEmployeersName,
                matchedJobs
            )
            console.log('PDF Report generated:', reportInfo.filename)
        } catch (pdfError) {
            console.error('PDF generation failed:', pdfError.message)
            // Continue even if PDF fails - don't block the quiz completion
        }

        return {
            potentialEmployeers: potentialEmployeersName,
            categories,
            overAllTags,
            reportUrl: reportInfo ? `/reports/${reportInfo.filename}` : null,
            reportFilename: reportInfo?.filename || null
        }
    }
    catch (error) {
        throw error
    }
}


module.exports = { getQuestions, startQuiz, endQuiz }