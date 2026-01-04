const verifyCaptcha = async (captchaToken) => {
    // If no token provided, fail verification
    if (!captchaToken) {
        console.log('No CAPTCHA token provided')
        const error = new Error('CAPTCHA verification required')
        error.status = 400
        throw error
    }

    // Accept math captcha token
    if (captchaToken === 'math-captcha-verified') {
        console.log('Math CAPTCHA verified')
        return true
    }

    // Reject invalid tokens
    const error = new Error('Invalid CAPTCHA token')
    error.status = 400
    throw error
}

module.exports = { verifyCaptcha }
