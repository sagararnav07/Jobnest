const crypto = require('crypto')
const { getJobSeekerCollection, getEmployeerCollection } = require('./../utlities/connection')
const { sendOtpEmail } = require('./../utlities/emailService')

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map()

// OTP configuration
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_RESEND_ATTEMPTS = 3
const RESEND_COOLDOWN_SECONDS = 60

const OtpController = {}

// Generate a random OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}

// Store OTP with metadata
const storeOTP = (email, otp, userType) => {
    const expiryTime = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000)
    const existing = otpStore.get(email)
    
    otpStore.set(email, {
        otp,
        userType,
        expiryTime,
        attempts: 0,
        resendCount: existing?.resendCount || 0,
        lastResendTime: Date.now(),
        verified: false
    })
    
    // Auto-cleanup after expiry
    setTimeout(() => {
        const stored = otpStore.get(email)
        if (stored && stored.otp === otp) {
            otpStore.delete(email)
        }
    }, OTP_EXPIRY_MINUTES * 60 * 1000)
}

// Send OTP for email verification
OtpController.sendOTP = async (email, userType, name) => {
    try {
        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(email)) {
            let error = new Error('Invalid email format')
            error.status = 400
            throw error
        }

        // Check if email already exists
        const jobSeekerCollection = await getJobSeekerCollection()
        const employeerCollection = await getEmployeerCollection()
        
        let existingUser = await jobSeekerCollection.findOne({ emailId: email })
        if (!existingUser) {
            existingUser = await employeerCollection.findOne({ emailId: email })
        }
        
        if (existingUser) {
            let error = new Error('Email already registered')
            error.status = 400
            throw error
        }

        // Check resend cooldown
        const existing = otpStore.get(email)
        if (existing) {
            const timeSinceLastResend = (Date.now() - existing.lastResendTime) / 1000
            if (timeSinceLastResend < RESEND_COOLDOWN_SECONDS) {
                let error = new Error(`Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - timeSinceLastResend)} seconds before requesting a new OTP`)
                error.status = 429
                throw error
            }
            
            if (existing.resendCount >= MAX_RESEND_ATTEMPTS) {
                let error = new Error('Maximum OTP requests exceeded. Please try again later.')
                error.status = 429
                throw error
            }
        }

        // Generate and store OTP
        const otp = generateOTP()
        storeOTP(email, otp, userType)
        
        // Update resend count
        const stored = otpStore.get(email)
        stored.resendCount = (existing?.resendCount || 0) + 1
        otpStore.set(email, stored)

        // Send OTP via email
        await sendOtpEmail(email, otp, name || 'User')

        return {
            success: true,
            message: 'OTP sent successfully',
            expiresIn: OTP_EXPIRY_MINUTES * 60 // in seconds
        }
    } catch (error) {
        throw error
    }
}

// Verify OTP
OtpController.verifyOTP = async (email, otp) => {
    try {
        const stored = otpStore.get(email)

        if (!stored) {
            let error = new Error('OTP expired or not found. Please request a new OTP.')
            error.status = 400
            throw error
        }

        // Check if OTP is expired
        if (Date.now() > stored.expiryTime) {
            otpStore.delete(email)
            let error = new Error('OTP has expired. Please request a new OTP.')
            error.status = 400
            throw error
        }

        // Check max verification attempts
        if (stored.attempts >= 5) {
            otpStore.delete(email)
            let error = new Error('Too many failed attempts. Please request a new OTP.')
            error.status = 429
            throw error
        }

        // Verify OTP
        if (stored.otp !== otp) {
            stored.attempts += 1
            otpStore.set(email, stored)
            let error = new Error(`Invalid OTP. ${5 - stored.attempts} attempts remaining.`)
            error.status = 400
            throw error
        }

        // Mark as verified
        stored.verified = true
        otpStore.set(email, stored)

        return {
            success: true,
            message: 'Email verified successfully',
            verified: true
        }
    } catch (error) {
        throw error
    }
}

// Check if email is verified
OtpController.isEmailVerified = (email) => {
    const stored = otpStore.get(email)
    return stored?.verified === true && Date.now() <= stored.expiryTime
}

// Clear OTP after successful registration
OtpController.clearOTP = (email) => {
    otpStore.delete(email)
}

// Resend OTP
OtpController.resendOTP = async (email, userType, name) => {
    return OtpController.sendOTP(email, userType, name)
}

module.exports = OtpController
