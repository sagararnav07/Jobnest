const dbModel = require('./../utlities/connection')
const { validateJob } = require('./../utlities/Validation')
const {getEmployerNameById} = require('./EmployeerController')
const { getCache, setCache, invalidateJobCaches, TTL, KEYS } = require('./../utlities/redisClient')

const createJob = async (job, employeerId) =>{
    try{
        const jobCollection = await dbModel.getJobCollection()
        validateJob(job)
        const newJob = await jobCollection.create({
            jobTitle: job.jobTitle,
            salary: job.salary,
            currencytype: job.currencytype,
            skills: job.skills,
            description: job.description,
            jobPreference: job.jobPreference,
            experience: job.experience,
            location: job.location,
            postedDate: new Date(),
            expiryDate: job.expiryDate,
            employeerId: employeerId,
            companyLogo: job.companyLogo || null
        })
        if(!newJob) {
            let error = new Error('Unable to create job')
            error.status = 500
            throw error
        }
        // Invalidate all job-related caches
        await invalidateJobCaches()
        return newJob 
    }
    catch(error) {throw error}
}


const getFilteredJobs = async (userId) => {
    try{
        // Check Redis cache first
        const cached = await getCache(KEYS.FILTERED_JOBS(userId))
        if (cached) return cached

        const jobCollection = await dbModel.getJobCollection()
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()
        const employeerCollection = await dbModel.getEmployeerCollection()
        const jobSeeker = await jobSeekerCollection.findOne({_id:userId}, {tags:1, jobPreference:1, skills:1, _id:0})

        // If user has no tags (hasn't completed assessment), return all jobs with skills-based matching only
        const hasTags = jobSeeker && jobSeeker.tags && jobSeeker.tags.length > 0

        const allJobs = await jobCollection.find({})
        
        // Batch fetch all employers instead of N+1 queries
        const employerIds = [...new Set(allJobs.map(j => j.employeerId?.toString()).filter(Boolean))]
        const employers = await employeerCollection.find({ _id: { $in: employerIds } }, { name: 1, tags: 1 })
        const employerMap = {}
        employers.forEach(emp => { employerMap[emp._id.toString()] = emp })

        const filteredJobs = []

        for (const job of allJobs) {
            const employer = employerMap[job.employeerId?.toString()] || null
                                 
            let matchScore = 0
            let commonTags = []

            // Tag matching logic (only if user has completed assessment)
            if (hasTags && employer && employer.tags && employer.tags.length > 0) {
                commonTags = jobSeeker.tags.filter(tag => employer.tags.includes(tag))
                if (commonTags.length > 0) {
                    matchScore += (commonTags.length / Math.max(jobSeeker.tags.length, employer.tags.length)) * 50
                }
            }

            // Job preference matching
            if (job.jobPreference && jobSeeker && jobSeeker.jobPreference && job.jobPreference === jobSeeker.jobPreference) {
                matchScore += 25
            }

            // Skills matching
            if (job.skills && jobSeeker && jobSeeker.skills && job.skills.length > 0 && jobSeeker.skills.length > 0) {
                const commonSkills = job.skills.filter(skill => 
                    jobSeeker.skills.some(s => s.toLowerCase() === skill.toLowerCase())
                )
                if (commonSkills.length > 0) {
                    matchScore += (commonSkills.length / Math.max(job.skills.length, jobSeeker.skills.length)) * 25
                }
            }

            // Show ALL jobs, but prioritize by match score
            const displayScore = matchScore > 0 ? matchScore : (hasTags ? 10 : 50)
            
            filteredJobs.push({
                _id:job._id,
                companyName:(employer)? employer.name:"",
                jobTitle:job.jobTitle,
                salary:job.salary,
                currencyType:job.currencyType,
                skills:job.skills,
                description:job.description,
                jobPreference:job.jobPreference,
                minExperience: job.experience?.minExperience ? {...job.experience.minExperience} : null,
                maxExperience: job.experience?.maxExperience ? {...job.experience.maxExperience} : null,
                location:job.location,
                expiryDate:job.expiryDate,
                posteddate:job.postedDate,
                matchPercentage: Math.round(displayScore),
                commonTags: commonTags
            })
        }

        filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage)
        
        // Cache result
        await setCache(KEYS.FILTERED_JOBS(userId), filteredJobs, TTL.FILTERED_JOBS)
        return filteredJobs
    }
    catch(err) {
        throw err
    }
}


// const getFilteredJobs = async (userId) => {
//     try{
//         const jobCollection = await dbModel.getJobCollection()
//         const jobSeekerCollection = await dbModel.getJobSeekerCollection()
//         const employeerCollection = await dbModel.getEmployeerCollection()
//         const jobSeekerTags = await jobCollection.findOne({_id:userId}, {tags:1, _id:0})
        
        


//     }
//     catch(err) {
//         throw err
//     }
// }

const getAllJobs = async () => {
    try {
        // Check Redis cache first
        const cached = await getCache(KEYS.ALL_JOBS)
        if (cached) return cached

        const jobCollection = await dbModel.getJobCollection()
        const employeerCollection = await dbModel.getEmployeerCollection()
        let jobs = await jobCollection.find({})
        
        // Batch fetch all employers instead of N+1 queries
        const employerIds = [...new Set(jobs.map(j => j.employeerId?.toString()).filter(Boolean))]
        const employers = await employeerCollection.find({ _id: { $in: employerIds } })
        const employerMap = {}
        employers.forEach(emp => { employerMap[emp._id.toString()] = emp })

        const jobsWithCompany = jobs.map(job => {
            const doc = job._doc || job
            const employer = employerMap[job.employeerId?.toString()]
            return {
                ...doc,
                companyName: employer?.name || '',
                companyIcon: employer?.companyIcon || ''
            }
        })
        
        // Cache result
        await setCache(KEYS.ALL_JOBS, jobsWithCompany, TTL.ALL_JOBS)
        return jobsWithCompany
    } catch(error) {
        throw error
    }
}

const getJobById = async (jobId) => {
    try {
        // Check Redis cache first
        const cached = await getCache(KEYS.JOB_DETAIL(jobId))
        if (cached) return cached

        const jobCollection = await dbModel.getJobCollection()
        let job = await jobCollection.findOne({ _id: jobId })
        if(!job) {
            let error = new Error('Job not found')
            error.status = 404
            throw error
        }
        const employeer = await getEmployerNameById(job.employeerId)
        const doc = job._doc
        const result = {...doc, companyIcon:employeer.companyIcon, companyName:employeer.name}
        
        // Cache result
        await setCache(KEYS.JOB_DETAIL(jobId), result, TTL.JOB_DETAIL)
        return result
    } catch(error) {
        throw error
    }
}

const getJobsByEmployer = async (employeerId) => {
    try {
        // Check Redis cache first
        const cached = await getCache(KEYS.EMPLOYER_JOBS(employeerId))
        if (cached) return cached

        const jobCollection = await dbModel.getJobCollection()
        const employeerCollection = await dbModel.getEmployeerCollection()
        let jobs = await jobCollection.find({ employeerId: employeerId })
        
        // Single employer fetch instead of N+1
        const employer = await employeerCollection.findOne({ _id: employeerId })
        
        const jobsWithCompany = jobs.map(job => {
            const doc = job._doc || job
            return {
                ...doc,
                companyName: employer?.name || '',
                companyIcon: employer?.companyIcon || ''
            }
        })
        
        // Cache result
        await setCache(KEYS.EMPLOYER_JOBS(employeerId), jobsWithCompany, TTL.EMPLOYER_JOBS)
        return jobsWithCompany
    } catch(error) {
        throw error
    }
}

const updateJob = async (jobId, jobData, employeerId) => {
    try {
        const jobCollection = await dbModel.getJobCollection()
        const job = await jobCollection.findOne({ _id: jobId })
        
        if (!job) {
            let error = new Error('Job not found')
            error.status = 404
            throw error
        }
        
        if (job.employeerId.toString() !== employeerId.toString()) {
            let error = new Error('Not authorized to update this job')
            error.status = 403
            throw error
        }
        
        const updatedJob = await jobCollection.findByIdAndUpdate(
            jobId,
            { ...jobData, updatedAt: new Date() },
            { new: true }
        )
        // Invalidate caches
        await invalidateJobCaches()
        return updatedJob
    } catch(error) {
        throw error
    }
}

const deleteJob = async (jobId, employeerId) => {
    try {
        const jobCollection = await dbModel.getJobCollection()
        const job = await jobCollection.findOne({ _id: jobId })
        
        if (!job) {
            let error = new Error('Job not found')
            error.status = 404
            throw error
        }
        
        if (job.employeerId.toString() !== employeerId.toString()) {
            let error = new Error('Not authorized to delete this job')
            error.status = 403
            throw error
        }
        
        await jobCollection.findByIdAndDelete(jobId)
        // Invalidate caches
        await invalidateJobCaches()
        return { message: 'Job deleted successfully' }
    } catch(error) {
        throw error
    }
}

module.exports = { createJob, getAllJobs, getJobById, getJobsByEmployer, updateJob, deleteJob, getFilteredJobs }