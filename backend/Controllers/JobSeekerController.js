const { getJobSeekerCollection, getJobCollection, getResultCollection, getApplicationCollection } = require('../utlities/connection');

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userId; // Extracted from token by middleware

        // Support both jobPreference and jobPreferences from frontend
        const { jobPreference, jobPreferences, skills, experience, socialProfiles } = req.body;
        console.log('ln 9 ', req.body);
        
        // Files - now saved to disk, get the file paths
        const resumeFile = req.files && req.files.resume ? req.files.resume[0] : null;
        const coverLetterFile = req.files && req.files.coverLetter ? req.files.coverLetter[0] : null;
        
        const collection = await getJobSeekerCollection();

        // Update the jobseeker document - handle both field names
        const updateData = {
            jobPreference: jobPreference || jobPreferences,
            skills: skills ? skills : [], // Assuming skills is sent as JSON string
            experience: experience,
            socialProfiles: socialProfiles ? socialProfiles : [],
        };

        if (resumeFile) {
            updateData.resume = {
                filename: resumeFile.filename,
                originalName: resumeFile.originalname,
                path: `/uploads/${resumeFile.filename}`,
                contentType: resumeFile.mimetype,
                size: resumeFile.size
            };
        }

        if (coverLetterFile) {
            updateData.coverLetter = {
                filename: coverLetterFile.filename,
                originalName: coverLetterFile.originalname,
                path: `/uploads/${coverLetterFile.filename}`,
                contentType: coverLetterFile.mimetype,
                size: coverLetterFile.size
            };
        }

        const result = await collection.updateOne(
            { _id: userId },
            { $set: updateData },
            { new: true, upsert: false } // Don't create new, only update existing
        );

        if (!result) {
            return res.status(404).json({ message: 'JobSeeker not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully', data: result });
    } catch (error) {
        next(error);
    }
};

// Get matched jobs for jobseeker
const getMatchedJobs = async (req, res, next) => {
    try {
        const userId = req.userId;
        const jobCollection = await getJobCollection();
        const jobSeekerCollection = await getJobSeekerCollection();
        
        const user = await jobSeekerCollection.findOne({ _id: userId });
        if (!user) {
            let error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        let jobPreference = user.jobPreference;
        let skills = user.skills || [];

        // Build filter
        let query = {};
        if (jobPreference && skills.length > 0) {
            query = { $and: [{ jobPreference: jobPreference }, { skills: { $in: skills } }] };
        } else if (jobPreference) {
            query = { jobPreference: jobPreference };
        } else if (skills.length > 0) {
            query = { skills: { $in: skills } };
        }

        let jobs = await jobCollection.find(query);

        // Fallback if no matches
        if (!jobs || jobs.length === 0) {
            if (jobPreference) {
                jobs = await jobCollection.find({ jobPreference: jobPreference });
            }
            if ((!jobs || jobs.length === 0) && skills.length > 0) {
                jobs = await jobCollection.find({ skills: { $in: skills } });
            }
            if (!jobs || jobs.length === 0) {
                // Return all jobs if no specific match
                jobs = await jobCollection.find({});
            }
        }

        res.json({ jobs });
    } catch (error) {
        next(error);
    }
};

// Get assessment results for jobseeker
const getAssessmentResults = async (req, res, next) => {
    try {
        const userId = req.userId;
        const resultCollection = await getResultCollection();
        
        const result = await resultCollection.findOne({ userId: userId });
        
        if (!result) {
            let error = new Error('Assessment not completed yet');
            error.status = 404;
            throw error;
        }

        res.json({ result });
    } catch (error) {
        next(error);
    }
};

// Get dashboard stats for jobseeker
const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.userId;
        const applicationCollection = await getApplicationCollection();
        const jobCollection = await getJobCollection();
        const jobSeekerCollection = await getJobSeekerCollection();
        
        const user = await jobSeekerCollection.findOne({ _id: userId });
        const applications = await applicationCollection.find({ userId: userId });
        
        // Get matched jobs count
        let skills = user?.skills || [];
        let jobPreference = user?.jobPreference;
        let matchedJobsCount = 0;
        
        if (jobPreference || skills.length > 0) {
            let query = {};
            if (jobPreference && skills.length > 0) {
                query = { $or: [{ jobPreference }, { skills: { $in: skills } }] };
            } else if (jobPreference) {
                query = { jobPreference };
            } else {
                query = { skills: { $in: skills } };
            }
            matchedJobsCount = await jobCollection.countDocuments(query);
        }

        res.json({
            stats: {
                applications: applications.length,
                matchedJobs: matchedJobsCount,
                profileComplete: !!(user?.skills?.length > 0 && user?.jobPreference),
                assessmentComplete: user?.test || false
            }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = { updateProfile, getMatchedJobs, getAssessmentResults, getDashboardStats };
