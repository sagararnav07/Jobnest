import api from './axios'

const employerService = {
    // Get employer profile
    getProfile: async () => {
        const response = await api.get('/user/me')
        return response.data
    },

    // Update employer profile
    updateProfile: async (profileData) => {
        const response = await api.post('/employeer/profile', profileData)
        return response.data
    },

    // Create a new job
    createJob: async (jobData) => {
        const response = await api.post('/jobs/create', jobData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    // Get employer's jobs
    getMyJobs: async () => {
        const response = await api.get('/jobs/employer/my-jobs')
        return response.data
    },

    // Get a specific job by ID
    getJobById: async (jobId) => {
        const response = await api.get(`/jobs/${jobId}`)
        return response.data
    },

    // Update a job
    updateJob: async (jobId, jobData) => {
        const response = await api.put(`/jobs/${jobId}`, jobData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    // Delete a job
    deleteJob: async (jobId) => {
        const response = await api.delete(`/jobs/${jobId}`)
        return response.data
    },

    // Get applications for employer
    getApplications: async () => {
        const response = await api.get('/applications/employer/applications')
        return response.data
    },

    // Get applications for a specific job
    getJobApplications: async (jobId) => {
        const response = await api.get(`/applications/job/${jobId}`)
        return response.data
    },

    // Update application status
    updateApplicationStatus: async (applicationId, status) => {
        const response = await api.put(`/applications/${applicationId}/status`, { status })
        return response.data
    }
}

export default employerService
