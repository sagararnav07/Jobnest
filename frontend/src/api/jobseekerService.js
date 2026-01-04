import api from './axios'

const jobseekerService = {
    // Get jobseeker profile
    getProfile: async () => {
        const response = await api.get('/user/me')
        return response.data
    },

    // Update jobseeker profile
    updateProfile: async (profileData) => {
        const response = await api.post('/jobSeeker/updateProfile', profileData)
        return response.data
    },

    // Update profile with files (resume, cover letter)
    updateProfileWithFiles: async (formData) => {
        console.log('ln 18 ', formData);
        
        const response = await api.post('/jobSeeker/updateProfile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    // Get matched jobs
    getMatchedJobs: async () => {
        const response = await api.get('/user/jobs')
        return response.data
    },

    // Get all jobs (public)
    getAllJobs: async () => {
        const response = await api.get('/jobs')
        return response.data
    },

    // Get job by ID
    getJobById: async (jobId) => {
        const response = await api.get(`/jobs/${jobId}`)
        return response.data
    },

    // Apply for a job
    applyForJob: async (jobId, data = {}) => {
        const response = await api.post(`/applications/apply/${jobId}`, data)
        return response.data
    },

    // Get my applications
    getMyApplications: async () => {
        const response = await api.get('/applications/my-applications')
        return response.data
    },

    // Get assessment results
    getAssessmentResults: async () => {
        const response = await api.get('/user/assessment-results')
        return response.data
    },

    // Get dashboard stats
    getDashboardStats: async () => {
        const response = await api.get('/jobSeeker/dashboard')
        return response.data
    }
}

export default jobseekerService
