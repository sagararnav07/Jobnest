const express = require('express')
const router = express.Router()
const authMiddleware = require('./../middewares/AuthMiddleware')
const ApplicationController = require('./../Controllers/ApplicationController')

router.use(authMiddleware)

// Jobseeker routes
router.post('/apply/:jobId', async (req, res, next) => {
    try {
        if (req.userType !== 'Jobseeker') {
            let error = new Error('Only jobseekers can apply for jobs')
            error.status = 403
            throw error
        }
        
        const result = await ApplicationController.applyForJob(req.userId, req.params.jobId)
        res.status(201).json({ 
            message: 'Application submitted successfully',
            application: result.application,
            job: result.job
        })
    } catch (error) {
        next(error)
    }
})

router.get('/my-applications', async (req, res, next) => {
    try {
        if (req.userType !== 'Jobseeker') {
            let error = new Error('Only jobseekers can view their applications')
            error.status = 403
            throw error
        }
        
        const applications = await ApplicationController.getMyApplications(req.userId)
        res.json({ applications })
    } catch (error) {
        next(error)
    }
})

// Employer routes
router.get('/employer/applications', async (req, res, next) => {
    try {
        if (req.userType !== 'Employeer') {
            let error = new Error('Only employers can view applications')
            error.status = 403
            throw error
        }
        
        const applications = await ApplicationController.getAllEmployerApplications(req.userId)
        res.json({ applications })
    } catch (error) {
        next(error)
    }
})

router.get('/job/:jobId', async (req, res, next) => {
    try {
        if (req.userType !== 'Employeer') {
            let error = new Error('Only employers can view job applications')
            error.status = 403
            throw error
        }
        
        const applications = await ApplicationController.getApplicationsForJob(
            req.userId, 
            req.params.jobId
        )
        res.json({ applications })
    } catch (error) {
        next(error)
    }
})

router.get('/employer/all', async (req, res, next) => {
    try {
        if (req.userType !== 'Employeer') {
            let error = new Error('Only employers can view applications')
            error.status = 403
            throw error
        }
        
        const applications = await ApplicationController.getAllEmployerApplications(req.userId)
        res.json({ applications })
    } catch (error) {
        next(error)
    }
})

router.put('/:applicationId/status', async (req, res, next) => {
    try {
        if (req.userType !== 'Employeer') {
            let error = new Error('Only employers can update application status')
            error.status = 403
            throw error
        }
        
        const { status } = req.body
        
        // Validate status is provided and valid
        const validStatuses = ['Applied', 'Inprogress', 'Rejected', 'To Be Interviewed', 'Hired']
        if (!status || !validStatuses.includes(status)) {
            let error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
            error.status = 400
            throw error
        }
        
        await ApplicationController.updateApplicationStatus(
            req.userId,
            req.params.applicationId,
            status
        )
        res.json({ message: 'Application status updated successfully' })
    } catch (error) {
        next(error)
    }
})

module.exports = router
