import api from './axios'

const authService = {
    // Send OTP for email verification
    sendOTP: async (email, userType, name) => {
        const response = await api.post('/user/auth/send-otp', { email, userType, name })
        return response.data
    },

    // Verify OTP
    verifyOTP: async (email, otp) => {
        const response = await api.post('/user/auth/verify-otp', { email, otp })
        return response.data
    },

    // Resend OTP
    resendOTP: async (email, userType, name) => {
        const response = await api.post('/user/auth/resend-otp', { email, userType, name })
        return response.data
    },

    // Register new user
    register: async (userData) => {
        const response = await api.post('/user/auth/signup', userData)
        if (response.data.token) {
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/user/auth/login', credentials)
        // Handle both sessionToken and token for consistency
        const token = response.data.sessionToken || response.data.token
        if (token) {
            localStorage.setItem('token', token)
        }
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user))
        }
        return response.data
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    },

    // Get current user profile
    getProfile: async () => {
        const response = await api.get('/user/me')
        return response.data
    },

    // Get user by ID
    getUserById: async (userId) => {
        const response = await api.get(`/user/profile/${userId}`)
        return response.data
    },

    // Get current token
    getToken: () => {
        return localStorage.getItem('token')
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token')
    }
}

export default authService
