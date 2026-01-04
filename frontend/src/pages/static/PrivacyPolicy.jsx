import { motion } from 'framer-motion'

const PrivacyPolicy = () => {
    const lastUpdated = 'December 1, 2025'

    const sections = [
        {
            title: '1. Information We Collect',
            content: `We collect information you provide directly to us, including:
            
• **Personal Information**: Name, email address, phone number, and mailing address when you create an account.
• **Profile Information**: Resume, work history, education, skills, and preferences for job seekers; company information, job postings, and hiring preferences for employers.
• **Communication Data**: Messages sent through our platform between job seekers and employers.
• **Usage Data**: How you interact with our platform, including pages visited, features used, and time spent.
• **Device Information**: Browser type, IP address, device identifiers, and operating system.`
        },
        {
            title: '2. How We Use Your Information',
            content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Match job seekers with relevant job opportunities
• Help employers find qualified candidates
• Send you notifications about job matches, messages, and platform updates
• Analyze usage patterns to improve user experience
• Detect and prevent fraud and abuse
• Comply with legal obligations`
        },
        {
            title: '3. Information Sharing',
            content: `We may share your information in the following circumstances:

• **With Employers/Job Seekers**: When you apply for a job or express interest in a candidate, relevant profile information is shared.
• **Service Providers**: We work with third-party service providers who help us operate our platform.
• **Legal Requirements**: When required by law or to protect our rights and safety.
• **Business Transfers**: In connection with a merger, acquisition, or sale of assets.

We do not sell your personal information to third parties for marketing purposes.`
        },
        {
            title: '4. Data Security',
            content: `We implement appropriate technical and organizational measures to protect your personal information, including:

• Encryption of data in transit and at rest
• Regular security assessments and penetration testing
• Access controls and authentication requirements
• Employee training on data protection
• Incident response procedures

While we strive to protect your information, no method of transmission over the Internet is 100% secure.`
        },
        {
            title: '5. Your Rights and Choices',
            content: `You have the following rights regarding your personal information:

• **Access**: Request a copy of the personal information we hold about you.
• **Correction**: Update or correct inaccurate information.
• **Deletion**: Request deletion of your account and associated data.
• **Portability**: Receive your data in a portable format.
• **Opt-out**: Unsubscribe from marketing communications.
• **Restrict Processing**: Limit how we use your data in certain circumstances.

To exercise these rights, please contact us at privacy@jobnest.com.`
        },
        {
            title: '6. Cookies and Tracking',
            content: `We use cookies and similar technologies to:

• Keep you logged in to your account
• Remember your preferences and settings
• Analyze how our platform is used
• Deliver relevant content and advertisements

You can control cookies through your browser settings. Some features may not function properly if cookies are disabled.`
        },
        {
            title: '7. Data Retention',
            content: `We retain your personal information for as long as:

• Your account is active
• Needed to provide our services
• Required by law or for legitimate business purposes

After account deletion, we may retain certain information for legal compliance and dispute resolution for up to 7 years.`
        },
        {
            title: '8. International Data Transfers',
            content: `JobNest operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:

• Standard contractual clauses
• Privacy Shield certification (where applicable)
• Adequacy decisions by relevant authorities`
        },
        {
            title: '9. Children\'s Privacy',
            content: `JobNest is not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.`
        },
        {
            title: '10. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by:

• Posting the updated policy on our website
• Sending you an email notification
• Displaying a prominent notice on our platform

Your continued use of JobNest after changes constitutes acceptance of the updated policy.`
        },
        {
            title: '11. Contact Us',
            content: `If you have questions about this Privacy Policy or our data practices, please contact us:

**Email**: privacy@jobnest.com
**Address**: 123 Innovation Drive, San Francisco, CA 94105
**Phone**: +1 (555) 123-4567

For EU residents, you may also contact our Data Protection Officer at dpo@jobnest.com.`
        }
    ]

    return (
        <div className="padding-10 min-h-screen bg-base-100">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-24">
                <div className="padding-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg opacity-90">
                            Last updated: {lastUpdated}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="py-20">
                <div className="padding-10 max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-lg max-w-none"
                    >
                        <p className="lead text-lg text-base-content/80 mb-8">
                            At JobNest, we take your privacy seriously. This Privacy Policy explains how we collect, 
                            use, disclose, and safeguard your information when you use our platform. Please read this 
                            policy carefully to understand our practices regarding your personal data.
                        </p>

                        {sections.map((section, index) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="mb-8"
                            >
                                <h2 className="text-xl font-bold text-base-content mb-4">{section.title}</h2>
                                <div className="text-base-content/80 whitespace-pre-line">
                                    {section.content}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
