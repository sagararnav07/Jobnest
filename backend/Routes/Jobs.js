const express = require('express');
const router = express.Router();
const authMiddleware = require('./../middewares/AuthMiddleware')
const { createJob, getAllJobs, getFilteredJobs,  getJobById, getJobsByEmployer, updateJob, deleteJob } = require('./../Controllers/JobController')
const { jobUpload } = require('./../utlities/multerSetup')

// Public route - get all jobs (no auth required)
router.get('/', async (req, res, next) => {
    try {
        const jobs = await getAllJobs()
        res.json({ jobs })
    } catch(error) {
        next(error)
    }
})

// Get job by ID (no auth required)
router.get('/:jobId', async (req, res, next) => {
    try {
        const job = await getJobById(req.params.jobId)
        console.log('ln 25 ', job);
        
        res.json({ job })
    } catch(error) {
        next(error)
    }
})

// Protected routes below
router.use(authMiddleware)

// Employer only middleware for create/update/delete
const employerOnly = (req, res, next) => {
    try {
        if(req.userType === 'Jobseeker') {
            let error = new Error("Jobseeker don't have permission")
            error.status = 403
            throw error 
        }
        next()
    } catch(err) {
        next(err)
    }
}

// Create job (employer only)
router.post('/create', employerOnly, (req, res, next) => {
    jobUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message })
        }
        try {
            const body = req.body
            // Parse JSON fields that may have been stringified
            if (typeof body.skills === 'string') {
                body.skills = JSON.parse(body.skills)
            }
            if (typeof body.experience === 'string') {
                body.experience = JSON.parse(body.experience)
            }
            if (typeof body.requirements === 'string') {
                try { body.requirements = JSON.parse(body.requirements) } catch(e) {}
            }
            if (typeof body.benefits === 'string') {
                try { body.benefits = JSON.parse(body.benefits) } catch(e) {}
            }
            // Add logo path if uploaded
            if (req.file) {
                body.companyLogo = `/uploads/${req.file.filename}`
            }
            const newJob = await createJob(body, req.userId)
            res.status(201).json({ message: "Job created successfully", job: newJob })
        } catch(error) {
            next(error)
        }
    })
})

// Get jobs by employer
router.get('/employer/my-jobs', employerOnly, async (req, res, next) => {
    try {
        const jobs = await getJobsByEmployer(req.userId)
        res.json({ jobs })
    } catch(error) {
        next(error)
    }
})

// Update job (employer only)
router.put('/:jobId', employerOnly, (req, res, next) => {
    jobUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message })
        }
        try {
            const body = req.body
            // Parse JSON fields that may have been stringified
            if (typeof body.skills === 'string') {
                body.skills = JSON.parse(body.skills)
            }
            if (typeof body.experience === 'string') {
                body.experience = JSON.parse(body.experience)
            }
            if (typeof body.requirements === 'string') {
                try { body.requirements = JSON.parse(body.requirements) } catch(e) {}
            }
            if (typeof body.benefits === 'string') {
                try { body.benefits = JSON.parse(body.benefits) } catch(e) {}
            }
            // Add logo path if uploaded
            if (req.file) {
                body.companyLogo = `/uploads/${req.file.filename}`
            }
            const updatedJob = await updateJob(req.params.jobId, body, req.userId)
            res.json({ message: "Job updated successfully", job: updatedJob })
        } catch(error) {
            next(error)
        }
    })
})

// Delete job (employer only)
router.delete('/:jobId', employerOnly, async (req, res, next) => {
    try {
        await deleteJob(req.params.jobId, req.userId)
        res.json({ message: "Job deleted successfully" })
    } catch(error) {
        next(error)
    }
})

module.exports = router