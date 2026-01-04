// Email service for sending notifications
// Supports Elastic Email, Mailjet, Brevo (HTTP API), Resend API, and SMTP
const nodeMailer = require('nodemailer')
const { Resend } = require('resend')
const Mailjet = require('node-mailjet')
const SibApiV3Sdk = require('@getbrevo/brevo')
require('dotenv').config()

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Mailjet if keys are available
const mailjet = (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) 
    ? Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY)
    : null;

// Initialize Brevo API client
let brevoApiInstance = null;
if (process.env.BREVO_API_KEY) {
    brevoApiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    brevoApiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Check which email method to use (priority: ElasticEmail > Brevo > Mailjet > Resend > SMTP)
const getEmailMethod = () => {
    if (process.env.ELASTICEMAIL_API_KEY) return 'elasticemail';
    if (process.env.BREVO_API_KEY) return 'brevo';
    if (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY) return 'mailjet';
    if (process.env.RESEND_API_KEY) return 'resend';
    if (process.env.SMTP_HOST) return 'smtp';
    return 'none';
}

const createTransporter = () => {
    console.log('SMTP Config:', process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS ? '***' : 'missing');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Creating SMTP transporter...');
    
    return nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });
  }
  console.log('SMTP config missing, using fallback');
  return null;
};

// Generic email sending function that uses Elastic Email, Brevo API, Mailjet, Resend, or SMTP
const sendEmail = async (mailOptions) => {
    const method = getEmailMethod();
    console.log('Using email method:', method);
    
    if (method === 'elasticemail') {
        console.log('Using Elastic Email API to send email...');
        try {
            const senderEmail = process.env.ELASTICEMAIL_SENDER || 'jobnest17@gmail.com';
            const params = new URLSearchParams({
                apikey: process.env.ELASTICEMAIL_API_KEY,
                from: senderEmail,
                fromName: 'JobNest',
                to: mailOptions.to,
                subject: mailOptions.subject,
                bodyHtml: mailOptions.html,
                bodyText: mailOptions.text || '',
                isTransactional: 'true'
            });
            
            const response = await fetch('https://api.elasticemail.com/v2/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
            
            const result = await response.json();
            if (!result.success) {
                console.error('Elastic Email error:', result.error);
                throw new Error(result.error || 'Failed to send email');
            }
            console.log('Email sent via Elastic Email:', result.data?.messageid);
            return { success: true, messageId: result.data?.messageid };
        } catch (err) {
            console.error('Elastic Email send error:', err.message);
            throw err;
        }
    }
    
    if (method === 'brevo') {
        console.log('Using Brevo HTTP API to send email...');
        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.subject = mailOptions.subject;
            sendSmtpEmail.htmlContent = mailOptions.html;
            sendSmtpEmail.textContent = mailOptions.text;
            sendSmtpEmail.sender = { 
                name: 'JobNest', 
                email: process.env.BREVO_SENDER || process.env.BREVO_USER || 'jobnest17@gmail.com'
            };
            sendSmtpEmail.to = [{ email: mailOptions.to }];
            
            const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('Email sent via Brevo API:', result?.body?.messageId || 'success');
            return { success: true, messageId: result?.body?.messageId };
        } catch (err) {
            console.error('Brevo API send error:', err.message);
            console.error('Brevo error details:', JSON.stringify(err?.body || err));
            throw err;
        }
    }
    
    if (method === 'mailjet') {
        console.log('Using Mailjet API to send email...');
        try {
            const fromEmail = process.env.EMAIL_FROM || process.env.MAILJET_SENDER || 'noreply@jobnest.com';
            const result = await mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [{
                    From: {
                        Email: fromEmail,
                        Name: 'JobNest'
                    },
                    To: [{
                        Email: mailOptions.to
                    }],
                    Subject: mailOptions.subject,
                    HTMLPart: mailOptions.html,
                    TextPart: mailOptions.text
                }]
            });
            console.log('Email sent via Mailjet:', result.body?.Messages?.[0]?.Status);
            return { success: true, messageId: result.body?.Messages?.[0]?.MessageID };
        } catch (err) {
            console.error('Mailjet send error:', err.message);
            throw err;
        }
    }
    
    if (method === 'resend') {
        console.log('Using Resend API to send email...');
        try {
            const { data, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'JobNest <onboarding@resend.dev>',
                to: mailOptions.to,
                subject: mailOptions.subject,
                html: mailOptions.html,
                text: mailOptions.text
            });
            if (error) {
                console.error('Resend error:', error);
                throw new Error(error.message);
            }
            console.log('Email sent via Resend:', data?.id);
            return { success: true, messageId: data?.id };
        } catch (err) {
            console.error('Resend send error:', err);
            throw err;
        }
    }
    
    if (method === 'smtp') {
        const transporter = createTransporter();
        if (transporter) {
            console.log('Using SMTP to send email...');
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent via SMTP:', info.messageId);
            return { success: true, messageId: info.messageId };
        }
    }
    
    console.log('No email service configured, logging email:');
    console.log('To:', mailOptions.to, 'Subject:', mailOptions.subject);
    return { success: true, messageId: 'logged' };
};


const sendApplicationEmail = async (recipientEmail, applicantName, jobTitle, companyName, jobDetails = {}) => {
    try {
        const { salary, location, skills, jobType, experience, description } = jobDetails;
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@jobnest.com',
            to: recipientEmail,
            subject: `Application Confirmed - ${jobTitle} at ${companyName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .header .checkmark { font-size: 50px; margin-bottom: 10px; }
                        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .job-card { background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%); border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #667eea; }
                        .job-card h2 { margin: 0 0 5px 0; color: #333; font-size: 20px; }
                        .job-card .company { color: #667eea; font-weight: 600; font-size: 16px; margin-bottom: 15px; }
                        .job-details { display: grid; gap: 12px; }
                        .detail-item { display: flex; align-items: center; }
                        .detail-item .icon { width: 24px; margin-right: 10px; font-size: 16px; }
                        .detail-item .label { color: #666; font-size: 13px; min-width: 80px; }
                        .detail-item .value { color: #333; font-weight: 500; }
                        .skills-container { margin-top: 15px; }
                        .skills-label { color: #666; font-size: 13px; margin-bottom: 8px; }
                        .skills { display: flex; flex-wrap: wrap; gap: 8px; }
                        .skill-tag { background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
                        .status-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
                        .status-box .status { color: #155724; font-weight: bold; font-size: 18px; }
                        .status-box .date { color: #666; font-size: 12px; margin-top: 5px; }
                        .next-steps { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
                        .next-steps h3 { margin: 0 0 10px 0; color: #856404; font-size: 14px; }
                        .next-steps ul { margin: 0; padding-left: 20px; color: #856404; }
                        .next-steps li { margin: 5px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer p { margin: 5px 0; color: #666; font-size: 12px; }
                        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 15px 0; font-weight: 600; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="checkmark">✅</div>
                            <h1>Application Submitted Successfully!</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${applicantName}</strong>,</p>
                            <p>Great news! Your application has been successfully submitted. Here are the details of the position you applied for:</p>
                            
                            <div class="job-card">
                                <h2>${jobTitle}</h2>
                                <div class="company">🏢 ${companyName}</div>
                                <div class="job-details">
                                    ${location ? `
                                    <div class="detail-item">
                                        <span class="icon">📍</span>
                                        <span class="label">Location:</span>
                                        <span class="value">${location}</span>
                                    </div>` : ''}
                                    ${salary ? `
                                    <div class="detail-item">
                                        <span class="icon">💰</span>
                                        <span class="label">Salary:</span>
                                        <span class="value">${salary}</span>
                                    </div>` : ''}
                                    ${jobType ? `
                                    <div class="detail-item">
                                        <span class="icon">💼</span>
                                        <span class="label">Job Type:</span>
                                        <span class="value">${jobType}</span>
                                    </div>` : ''}
                                    ${experience ? `
                                    <div class="detail-item">
                                        <span class="icon">📊</span>
                                        <span class="label">Experience:</span>
                                        <span class="value">${experience}</span>
                                    </div>` : ''}
                                </div>
                                ${skills && Object.values(skills).length > 0 ? `
                                <div class="skills-container">
                                    <div class="skills-label">Required Skills:</div>
                                    <div class="skills">
                                        ${Object.values(skills).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                                    </div>
                                </div>` : ''}
                            </div>
                            
                            <div class="status-box">
                                <div class="status">📋 Status: Applied</div>
                                <div class="date">Applied on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                            
                            <div class="next-steps">
                                <h3>📌 What happens next?</h3>
                                <ul>
                                    <li>The employer will review your application and profile</li>
                                    <li>If shortlisted, you'll receive an interview invitation</li>
                                    <li>Track your application status in your JobNest dashboard</li>
                                    <li>You'll receive email updates on any status changes</li>
                                </ul>
                            </div>
                            
                            <p style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobseeker/applications" class="button">View My Applications</a>
                            </p>
                            
                            <p>Best of luck with your application! 🍀</p>
                            <p>Best regards,<br><strong>The JobNest Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated confirmation email from JobNest.</p>
                            <p>© ${new Date().getFullYear()} JobNest. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Application Confirmation - JobNest

Dear ${applicantName},

Your application for ${jobTitle} at ${companyName} has been submitted successfully!

JOB DETAILS:
- Position: ${jobTitle}
- Company: ${companyName}
${location ? `- Location: ${location}` : ''}
${salary ? `- Salary: ${salary}` : ''}
${jobType ? `- Job Type: ${jobType}` : ''}
${experience ? `- Experience: ${experience}` : ''}
${skills ? `- Skills: ${Object.values(skills).join(', ')}` : ''}

STATUS: Applied
Applied on: ${new Date().toLocaleDateString()}

WHAT'S NEXT?
- The employer will review your application
- If shortlisted, you'll receive an interview invitation
- Track status in your JobNest dashboard

Best of luck!
The JobNest Team
            `
        }
        
        const transporter = createTransporter()
        if (transporter) {
            const info = await transporter.sendMail(mailOptions)
            console.log('Application email sent:', info.messageId)
            return { success: true, message: `Email sent successfully ${info.messageId}` }
        } else {
            console.log(`[DEV] Application email would be sent to ${recipientEmail}`)
            return { success: true, message: 'Email logged (dev mode)' }
        }
    } catch (error) {
        console.error('Error sending application email:', error)
        throw error
    }
}

const sendWelcomeEmail = async (recipientEmail, userName, userType) => {
    try {
        console.log(`
        ======== WELCOME EMAIL ========
        To: ${recipientEmail}
        Subject: Welcome to JobNest!
        
        Dear ${userName},
        
        Welcome to JobNest! Your ${userType} account has been created successfully.
        
        ${userType === 'Jobseeker'
                ? 'Please complete your profile and take the personality assessment to start seeing matched jobs.'
                : 'Please complete your company profile to start posting jobs.'}
        
        Best regards,
        JobNest Team
        ===============================
        `)

        return { success: true, message: 'Email sent successfully' }
    } catch (error) {
        console.error('Error sending email:', error)
        throw error
    }
}

const sendStatusUpdateEmail = async (recipientEmail, applicantName, jobTitle, companyName, newStatus, jobDetails = {}) => {
    try {
        const statusConfig = {
            'Applied': { color: '#6c757d', icon: '📋', message: 'Your application has been received and is being reviewed.' },
            'Inprogress': { color: '#17a2b8', icon: '🔄', message: 'Great news! Your application is being actively reviewed by the hiring team.' },
            'To Be Interviewed': { color: '#28a745', icon: '🎉', message: 'Congratulations! You have been shortlisted for an interview. The employer will contact you soon with interview details.' },
            'Hired': { color: '#28a745', icon: '🏆', message: 'Congratulations! You have been selected for this position. Welcome aboard!' },
            'Rejected': { color: '#dc3545', icon: '📝', message: 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates. Don\'t give up - keep applying!' }
        }
        
        const config = statusConfig[newStatus] || { color: '#6c757d', icon: '📋', message: 'Your application status has been updated.' }
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@jobnest.com',
            to: recipientEmail,
            subject: `Application Update: ${newStatus} - ${jobTitle} at ${companyName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .header .icon { font-size: 50px; margin-bottom: 10px; }
                        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .status-badge { display: inline-block; background: ${config.color}; color: white; padding: 10px 25px; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 15px 0; }
                        .job-info { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; }
                        .job-info h3 { margin: 0 0 10px 0; color: #333; }
                        .job-info p { margin: 5px 0; color: #666; }
                        .message-box { background: ${newStatus === 'Hired' || newStatus === 'To Be Interviewed' ? '#d4edda' : newStatus === 'Rejected' ? '#f8d7da' : '#e7f3ff'}; 
                                       border-left: 4px solid ${config.color}; padding: 20px; margin: 20px 0; border-radius: 0 10px 10px 0; }
                        .message-box p { margin: 0; color: #333; }
                        .cta-section { text-align: center; margin: 25px 0; }
                        .button { display: inline-block; padding: 14px 35px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer p { margin: 5px 0; color: #666; font-size: 12px; }
                        .tips { background: #fff3cd; border-radius: 10px; padding: 15px 20px; margin: 20px 0; }
                        .tips h4 { margin: 0 0 10px 0; color: #856404; }
                        .tips ul { margin: 0; padding-left: 20px; color: #856404; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="icon">${config.icon}</div>
                            <h1>Application Status Update</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>${applicantName}</strong>,</p>
                            <p>There's an update on your job application!</p>
                            
                            <div class="job-info">
                                <h3>📌 ${jobTitle}</h3>
                                <p>🏢 <strong>${companyName}</strong></p>
                                ${jobDetails.location ? `<p>📍 ${jobDetails.location}</p>` : ''}
                            </div>
                            
                            <p style="text-align: center;">Your application status has been updated to:</p>
                            <p style="text-align: center;"><span class="status-badge">${config.icon} ${newStatus}</span></p>
                            
                            <div class="message-box">
                                <p>${config.message}</p>
                            </div>
                            
                            ${newStatus === 'To Be Interviewed' ? `
                            <div class="tips">
                                <h4>💡 Interview Tips:</h4>
                                <ul>
                                    <li>Research the company thoroughly</li>
                                    <li>Prepare answers to common interview questions</li>
                                    <li>Have questions ready to ask the interviewer</li>
                                    <li>Test your tech setup if it's a video interview</li>
                                </ul>
                            </div>
                            ` : ''}
                            
                            ${newStatus === 'Hired' ? `
                            <div class="tips" style="background: #d4edda;">
                                <h4 style="color: #155724;">🎊 Congratulations!</h4>
                                <p style="color: #155724; margin: 0;">The employer will reach out with onboarding details soon. This is the beginning of an exciting new chapter!</p>
                            </div>
                            ` : ''}
                            
                            ${newStatus === 'Rejected' ? `
                            <div class="tips">
                                <h4>💪 Keep Going!</h4>
                                <ul>
                                    <li>Every application is a learning experience</li>
                                    <li>Update your profile with new skills</li>
                                    <li>Check out similar positions on JobNest</li>
                                    <li>Consider taking skill assessments to stand out</li>
                                </ul>
                            </div>
                            ` : ''}
                            
                            <div class="cta-section">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobseeker/applications" class="button">View Application Details</a>
                            </div>
                            
                            <p>Best regards,<br><strong>The JobNest Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated notification from JobNest.</p>
                            <p>© ${new Date().getFullYear()} JobNest. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Application Status Update - JobNest

Dear ${applicantName},

Your application status has been updated!

POSITION: ${jobTitle}
COMPANY: ${companyName}
NEW STATUS: ${newStatus}

${config.message}

View your application: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobseeker/applications

Best regards,
The JobNest Team
            `
        }
        
        const transporter = createTransporter()
        if (transporter) {
            const info = await transporter.sendMail(mailOptions)
            console.log('Status update email sent:', info.messageId)
            return { success: true, message: 'Email sent successfully' }
        } else {
            console.log(`[DEV] Status update email would be sent to ${recipientEmail}`)
            return { success: true, message: 'Email logged (dev mode)' }
        }
    } catch (error) {
        console.error('Error sending status update email:', error)
        throw error
    }
}

// Send OTP email for verification
const sendOtpEmail = async (recipientEmail, otp, userName) => {
    try {
        console.log('Sending OTP to:', recipientEmail);
        console.log('SMTP Config:', process.env.SMTP_HOST, process.env.SMTP_USER);
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@jobnest.com',
            to: recipientEmail,
            subject: `Your JobNest Verification Code: ${otp}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .otp-box { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%); border: 2px dashed #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
                        .otp-code { font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0; }
                        .timer { color: #e74c3c; font-size: 14px; margin-top: 15px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer p { margin: 5px 0; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Email Verification</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>${userName}</strong>,</p>
                            <p>Thank you for registering with JobNest! To complete your registration, please use the verification code below:</p>
                            
                            <div class="otp-box">
                                <p class="otp-code">${otp}</p>
                                <p class="timer">⏱️ This code expires in 10 minutes</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. JobNest staff will never ask for your OTP.
                            </div>
                            
                            <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
                            
                            <p>Best regards,<br><strong>The JobNest Team</strong></p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from JobNest.</p>
                            <p>© ${new Date().getFullYear()} JobNest. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Email Verification - JobNest
                
                Hello ${userName},
                
                Your verification code is: ${otp}
                
                This code will expire in 10 minutes.
                
                If you didn't request this code, please ignore this email.
                
                Best regards,
                The JobNest Team
            `
        }

        console.log('Attempting to send OTP email to:', recipientEmail);
        const result = await sendEmail(mailOptions);
        console.log('OTP Email sent successfully:', result.messageId);
        return { success: true, message: 'OTP sent successfully' }
    } catch (error) {
        console.error('Error sending OTP email:', error)
        throw error
    }
}

module.exports = {
    sendApplicationEmail,
    sendWelcomeEmail,
    sendStatusUpdateEmail,
    sendOtpEmail
}
