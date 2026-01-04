const express = require('express');
const EmployeerController = require('../Controllers/EmployeerController');
const authMiddleware = require('./../middewares/AuthMiddleware')
const router = express.Router();

router.use(authMiddleware)
router.use((req, res, next) => {
  try {
    if (req.userType !== 'Employeer') {
      let error = new Error("Jobseeker don't have permission")
      error.status = 403
      throw error
    }
    else next()
  }
  catch (error) {
    next(error)
  }
})
router.post('/profile', EmployeerController.updateProfile);

router.get('/me', EmployeerController.getProfile)

router.post('/jobs', EmployeerController.createJob);
router.get('/jobs', EmployeerController.getMyJobs);
router.get('/jobs/:jobId', EmployeerController.getJobById);
router.put('/jobs/:jobId', EmployeerController.updateJob);
router.delete('/jobs/:jobId', EmployeerController.deleteJob);

router.get('/applications', EmployeerController.getApplications);
router.get('/applications/job/:jobId', EmployeerController.getJobApplications);
router.put('/applications/:applicationId/status', EmployeerController.updateApplicationStatus);

module.exports = router