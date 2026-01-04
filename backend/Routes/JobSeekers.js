const express = require('express');
const router = express.Router();
const { updateProfile, getMatchedJobs, getAssessmentResults, getDashboardStats } = require('./../Controllers/JobSeekerController');
const authMiddleware = require('../middewares/AuthMiddleware');
const { multiUpload } = require('../utlities/multerSetup');

router.use(authMiddleware);
router.use(async (req, res, next) => {
    try {
        if (req.userType !== 'Jobseeker') {
            let error = new Error("Employer don't have permission");
            error.status = 403;
            throw error;
        }
        else next();
    }
    catch (error) {
        next(error);
    }
});

router.post('/updateProfile', multiUpload, updateProfile);

router.get('/jobs', getMatchedJobs);

router.get('/assessment-results', getAssessmentResults);

router.get('/dashboard', getDashboardStats);

module.exports = router;
