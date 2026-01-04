import { motion } from 'framer-motion'

const Terms = () => {
    const lastUpdated = 'December 1, 2025'

    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: `By accessing or using JobNest ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.

These Terms apply to all users, including job seekers, employers, and any other visitors to our Platform. We reserve the right to modify these Terms at any time, and such modifications will be effective immediately upon posting.`
        },
        {
            title: '2. Eligibility',
            content: `To use JobNest, you must:

• Be at least 16 years of age
• Have the legal capacity to enter into a binding agreement
• Not be prohibited from using our services under applicable law
• Provide accurate and complete registration information

If you are using JobNest on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.`
        },
        {
            title: '3. Account Registration',
            content: `To access certain features, you must create an account. You agree to:

• Provide accurate, current, and complete information
• Maintain and promptly update your account information
• Keep your password secure and confidential
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate accounts that violate these Terms or for any other reason at our discretion.`
        },
        {
            title: '4. User Conduct',
            content: `You agree not to:

• Post false, misleading, or fraudulent content
• Impersonate any person or entity
• Harass, threaten, or discriminate against other users
• Send spam or unsolicited communications
• Upload malicious code or attempt to breach security
• Scrape or collect data without permission
• Use the Platform for illegal purposes
• Circumvent any access restrictions or rate limits
• Interfere with the proper functioning of the Platform

Violations may result in immediate account termination and potential legal action.`
        },
        {
            title: '5. Job Seeker Terms',
            content: `As a job seeker, you agree to:

• Provide truthful information in your profile and applications
• Only apply for positions you are genuinely interested in and qualified for
• Respond professionally to employer communications
• Not misrepresent your qualifications, experience, or identity
• Respect employer confidentiality
• Comply with all applicable employment laws

JobNest does not guarantee employment and is not responsible for hiring decisions made by employers.`
        },
        {
            title: '6. Employer Terms',
            content: `As an employer, you agree to:

• Post accurate and non-discriminatory job listings
• Comply with all applicable employment and labor laws
• Protect the confidentiality of candidate information
• Not use candidate information for purposes other than hiring
• Provide a safe and legal work environment
• Pay any applicable fees for premium services
• Not engage in deceptive recruiting practices

Job postings must comply with anti-discrimination laws and may not contain illegal requirements.`
        },
        {
            title: '7. Content and Intellectual Property',
            content: `**Your Content**: You retain ownership of content you post but grant JobNest a worldwide, non-exclusive, royalty-free license to use, display, and distribute such content in connection with our services.

**Our Content**: JobNest and its content, features, and functionality are owned by us and protected by copyright, trademark, and other intellectual property laws.

**Restrictions**: You may not copy, modify, distribute, sell, or lease any part of our Platform or services without our written permission.`
        },
        {
            title: '8. Fees and Payment',
            content: `**Free Services**: Basic job seeker features are provided free of charge.

**Premium Services**: Certain employer features and premium job seeker features may require payment.

**Payment Terms**: All fees are non-refundable unless otherwise stated. We may change our fees at any time with reasonable notice.

**Taxes**: You are responsible for all applicable taxes related to your use of our services.`
        },
        {
            title: '9. Privacy',
            content: `Your use of JobNest is also governed by our Privacy Policy, which describes how we collect, use, and share your information. By using our Platform, you consent to our data practices as described in the Privacy Policy.`
        },
        {
            title: '10. Disclaimers',
            content: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.

We do not guarantee:
• Continuous, uninterrupted access to the Platform
• That the Platform will be error-free or secure
• The accuracy or reliability of any content
• Employment outcomes for job seekers
• Quality of candidates for employers

Use of the Platform is at your own risk.`
        },
        {
            title: '11. Limitation of Liability',
            content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, JOBNEST SHALL NOT BE LIABLE FOR:

• Indirect, incidental, special, or consequential damages
• Loss of profits, revenue, or data
• Business interruption
• Any damages exceeding the amount you paid to us in the past 12 months

Some jurisdictions do not allow limitations on liability, so these may not apply to you.`
        },
        {
            title: '12. Indemnification',
            content: `You agree to indemnify and hold harmless JobNest and its officers, directors, employees, and agents from any claims, damages, losses, and expenses (including legal fees) arising from:

• Your use of the Platform
• Your violation of these Terms
• Your violation of any third-party rights
• Your content posted on the Platform`
        },
        {
            title: '13. Dispute Resolution',
            content: `**Informal Resolution**: Before filing a claim, you agree to contact us to attempt informal resolution.

**Arbitration**: Any disputes not resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

**Class Action Waiver**: You agree to resolve disputes individually and waive any right to participate in class actions.

**Governing Law**: These Terms are governed by the laws of the State of California.`
        },
        {
            title: '14. Termination',
            content: `We may terminate or suspend your access to JobNest at any time, with or without cause, and with or without notice.

Upon termination:
• Your right to use the Platform ceases immediately
• We may delete your account and associated data
• Provisions that should survive termination will remain in effect

You may terminate your account at any time by contacting us or using account settings.`
        },
        {
            title: '15. Contact Information',
            content: `For questions about these Terms, please contact us:

**Email**: legal@jobnest.com
**Address**: 123 Innovation Drive, San Francisco, CA 94105
**Phone**: +1 (555) 123-4567`
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-lg opacity-90">
                            Last updated: {lastUpdated}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-lg max-w-none"
                    >
                        <p className="lead text-lg text-base-content/80 mb-8">
                            Welcome to JobNest. These Terms of Service govern your use of our platform and services. 
                            Please read them carefully before using JobNest.
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

export default Terms
