const dbModel = require('./../utlities/connection')
const { sendApplicationEmail, sendStatusUpdateEmail } = require('./../utlities/emailService')
const { getEmployerNameById } = require('./EmployeerController')
const ApplicationController = {}

// Apply for a job
ApplicationController.applyForJob = async (userId, jobId) => {
    try {
        const applicationCollection = await dbModel.getApplicationCollection()
        const jobCollection = await dbModel.getJobCollection()
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()
        const employeerCollection = await dbModel.getEmployeerCollection()

        // Check if job exists
        const job = await jobCollection.findOne({ _id: jobId })
        if (!job) {
            let error = new Error('Job not found')
            error.status = 404
            throw error
        }
        const employeer = await employeerCollection.findOne({_id:job.employeerId})
        //check employeer exists
        if(!employeer) {
            let error = new Error('Employeer not found')
            error.status = 404
            throw error
        }
        // Check if user has already applied
        const existingApplication = await applicationCollection.findOne({ 
            jobId: jobId, 
            userId: userId 
        })
        if (existingApplication) {
            let error = new Error('You have already applied for this job')
            error.status = 400
            throw error
        }

        // Get jobseeker details to check if profile is complete
        const jobSeeker = await jobSeekerCollection.findOne({ _id: userId })
        if (!jobSeeker) {
            let error = new Error('Jobseeker profile not found')
            error.status = 404
            throw error
        }

        // Check if profile is complete (has taken assessment)
        if (!jobSeeker.test) {
            let error = new Error('Please complete your personality assessment before applying')
            error.status = 403
            throw error
        }

        // Check job relevance (skills match)
        const userSkills = [...(Object.values(jobSeeker.skills)[0]).split(",")] || []
        const jobSkills = Object.values(job.skills) || []        
        const matchingSkills = userSkills.filter(skill =>{ 
            console.log(skill);
            
           return jobSkills.some(jobSkill => {
                return jobSkill.toLowerCase().trim() === skill.toLowerCase().trim()
            }
            )}
        )

        if (matchingSkills.length === 0 && jobSkills.length > 0) {            
            let error = new Error('Your skills do not match this job requirements')
            error.status = 403
            throw error
        }

        let employeerTags = employeer.tags
        let jobSeekerTags = jobSeeker.tags
        
         let matchedTags = employeerTags.filter((empployerTag)=>{
            return jobSeekerTags.some((jobSeekerTag)=>jobSeekerTag.toLowerCase().trim()===empployerTag.toLowerCase().trim())
         })
        if(matchedTags.length===0 && employeerTags.length>0) {
            let error = new Error('Your personality traits do not match this did not match with company')
            error.status = 403
            throw error
        }
        // Create application
        const application = await applicationCollection.create({
            jobId: jobId,
            userId: userId,
            appliedAt: new Date(),
            status: 'Applied'
        })

        // Send confirmation email with full job details
        try {
            console.log('ln 80 ', job);
            const companyName = await getEmployerNameById(job.employeerId)
            const jobDetails = {
                salary: job.salary,
                location: job.location,
                skills: job.skills,
                jobType: job.jobType,
                experience: job.experience,
                description: job.description
            }
            await sendApplicationEmail(jobSeeker.emailId, jobSeeker.name, job.jobTitle, companyName, jobDetails)
        } catch (emailError) {
            console.log('Email sending failed:', emailError.message)
        }

        return { application, job }
    } catch (error) {
        throw error
    }
}

// Get applications by jobseeker
ApplicationController.getMyApplications = async (userId) => {
    try {
        const applicationCollection = await dbModel.getApplicationCollection()
        const jobCollection = await dbModel.getJobCollection()

        const applications = await applicationCollection.find({ userId: userId })
        
        // Populate job details
        const populatedApplications = await Promise.all(
            applications.map(async (app) => {
                const job = await jobCollection.findOne({ _id: app.jobId })
                return {
                    _id: app._id,
                    jobId: app.jobId,
                    appliedAt: app.appliedAt,
                    status: app.status,
                    job: job ? {
                        jobTitle: job.jobTitle,
                        salary: job.salary,
                        location: job.location,
                        skills: job.skills
                    } : null
                }
            })
        )

        return populatedApplications
    } catch (error) {
        throw error
    }
}

// Get applications for employer's jobs
ApplicationController.getApplicationsForJob = async (employerId, jobId) => {
    try {
        const applicationCollection = await dbModel.getApplicationCollection()
        const jobCollection = await dbModel.getJobCollection()
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()

        // Verify job belongs to employer
        const job = await jobCollection.findOne({ _id: jobId })
        if (!job) {
            let error = new Error('Job not found')
            error.status = 404
            throw error
        }

        if (job.employeerId.toString() !== employerId.toString()) {
            let error = new Error('Unauthorized access')
            error.status = 403
            throw error
        }

        const applications = await applicationCollection.find({ jobId: jobId })

        // Populate applicant details
        const populatedApplications = await Promise.all(
            applications.map(async (app) => {
                const applicant = await jobSeekerCollection.findOne({ _id: app.userId })
                return {
                    _id: app._id,
                    appliedAt: app.appliedAt,
                    status: app.status,
                    applicant: applicant ? {
                        name: applicant.name,
                        emailId: applicant.emailId,
                        skills: applicant.skills,
                        experience: applicant.experience,
                        jobPreference: applicant.jobPreference
                    } : null
                }
            })
        )

        return populatedApplications
    } catch (error) {
        throw error
    }
}

// Update application status (employer only)
ApplicationController.updateApplicationStatus = async (employerId, applicationId, status) => {
    try {
        const applicationCollection = await dbModel.getApplicationCollection()
        const jobCollection = await dbModel.getJobCollection()
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()

        const application = await applicationCollection.findOne({ _id: applicationId })
        if (!application) {
            let error = new Error('Application not found')
            error.status = 404
            throw error
        }

        // Verify job belongs to employer
        const job = await jobCollection.findOne({ _id: application.jobId })
        if (!job || job.employeerId.toString() !== employerId.toString()) {
            let error = new Error('Unauthorized access')
            error.status = 403
            throw error
        }

        const validStatuses = ['Applied', 'Inprogress', 'Rejected', 'To Be Interviewed', 'Hired']
        if (!validStatuses.includes(status)) {
            let error = new Error('Invalid status')
            error.status = 400
            throw error
        }

        const updated = await applicationCollection.updateOne(
            { _id: applicationId },
            { $set: { status: status } }
        )

        // Send status update email to the applicant
        try {
            const jobSeeker = await jobSeekerCollection.findOne({ _id: application.userId })
            if (jobSeeker) {
                const companyName = await getEmployerNameById(job.employeerId)
                const jobDetails = {
                    location: job.location,
                    salary: job.salary
                }
                await sendStatusUpdateEmail(
                    jobSeeker.emailId,
                    jobSeeker.name,
                    job.jobTitle,
                    companyName,
                    status,
                    jobDetails
                )
            }
        } catch (emailError) {
            console.log('Status update email failed:', emailError.message)
        }

        return updated
    } catch (error) {
        throw error
    }
}

// Get all applications for employer's jobs
ApplicationController.getAllEmployerApplications = async (employerId) => {
    try {
        const applicationCollection = await dbModel.getApplicationCollection()
        const jobCollection = await dbModel.getJobCollection()
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()

        // Get all jobs by employer
        const jobs = await jobCollection.find({ employeerId: employerId })
        const jobIds = jobs.map(job => job._id)

        // Get all applications for those jobs
        const applications = await applicationCollection.find({ 
            jobId: { $in: jobIds } 
        })

        // Populate details
        const populatedApplications = await Promise.all(
            applications.map(async (app) => {
                const job = await jobCollection.findOne({ _id: app.jobId })
                const applicant = await jobSeekerCollection.findOne({ _id: app.userId })
                return {
                    _id: app._id,
                    appliedAt: app.appliedAt,
                    status: app.status,
                    job: job ? { jobTitle: job.jobTitle, location: job.location } : null,
                    applicant: applicant ? {
                        name: applicant.name,
                        emailId: applicant.emailId,
                        skills: applicant.skills
                    } : null
                }
            })
        )

        return populatedApplications
    } catch (error) {
        throw error
    }
}

module.exports = ApplicationController
