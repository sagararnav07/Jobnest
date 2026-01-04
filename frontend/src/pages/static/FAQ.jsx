import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null)

    const categories = [
        {
            name: 'Job Seekers',
            icon: '👤',
            faqs: [
                {
                    question: 'How do I create a job seeker account?',
                    answer: 'Click on "Get Started" or "Register" on the homepage, select "Job Seeker", and fill in your details. You\'ll need to provide your name, email, and password. After registration, you can complete your profile with your resume, skills, and preferences.'
                },
                {
                    question: 'Is JobNest free for job seekers?',
                    answer: 'Yes! Creating an account, building your profile, searching for jobs, and applying to positions is completely free for job seekers. We also offer premium features like profile boosting and priority applications for a small fee.'
                },
                {
                    question: 'How does the job matching work?',
                    answer: 'Our AI-powered matching algorithm analyzes your skills, experience, preferences, and career goals to find jobs that are the best fit for you. The more complete your profile is, the better our matching becomes.'
                },
                {
                    question: 'Can I upload my resume?',
                    answer: 'Absolutely! You can upload your resume in PDF, DOC, or DOCX format. Our system will parse your resume to help auto-fill your profile. You can also manually edit all information after upload.'
                },
                {
                    question: 'How do I know if an employer viewed my application?',
                    answer: 'You can track all your applications in the "My Applications" section. We show you when employers view your application and update the status as it progresses through their hiring process.'
                },
                {
                    question: 'Can I message employers directly?',
                    answer: 'Once you complete your profile, you can message employers through our built-in messaging system. This helps you ask questions about positions and stand out from other candidates.'
                }
            ]
        },
        {
            name: 'Employers',
            icon: '🏢',
            faqs: [
                {
                    question: 'How do I post a job?',
                    answer: 'After creating an employer account and completing your company profile, go to "Post Job" in your dashboard. Fill in the job details including title, description, requirements, and salary range. Your job will be live immediately after posting.'
                },
                {
                    question: 'What does it cost to post jobs?',
                    answer: 'We offer flexible pricing plans. You can start with our free plan which includes basic job posting features. Premium plans offer additional features like featured listings, advanced analytics, and priority support.'
                },
                {
                    question: 'How do I find qualified candidates?',
                    answer: 'Our AI matching system automatically suggests candidates based on your job requirements. You can also search our candidate database using filters for skills, experience, location, and more.'
                },
                {
                    question: 'Can I schedule interviews through JobNest?',
                    answer: 'Yes! Our platform includes interview scheduling tools. You can send interview requests to candidates and manage your interview calendar all in one place.'
                },
                {
                    question: 'How do I manage multiple job postings?',
                    answer: 'Your employer dashboard provides a comprehensive view of all your job postings. You can easily edit, pause, or close postings, and track applications for each position.'
                }
            ]
        },
        {
            name: 'Account & Security',
            icon: '🔒',
            faqs: [
                {
                    question: 'How do I reset my password?',
                    answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a password reset link that\'s valid for 24 hours.'
                },
                {
                    question: 'How do I delete my account?',
                    answer: 'Go to your profile settings and click "Delete Account". You\'ll be asked to confirm this action. Note that account deletion is permanent and all your data will be removed.'
                },
                {
                    question: 'Is my personal information secure?',
                    answer: 'Yes, we take security seriously. We use industry-standard encryption, secure servers, and follow best practices for data protection. Read our Privacy Policy for more details.'
                },
                {
                    question: 'Can I have multiple accounts?',
                    answer: 'Each person should have only one account. However, if you\'re both a job seeker and an employer, you can switch between these roles within a single account.'
                }
            ]
        },
        {
            name: 'Technical Support',
            icon: '🛠️',
            faqs: [
                {
                    question: 'What browsers are supported?',
                    answer: 'JobNest works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
                },
                {
                    question: 'Is there a mobile app?',
                    answer: 'Our website is fully responsive and works great on mobile devices. A dedicated mobile app is coming soon!'
                },
                {
                    question: 'Why am I not receiving email notifications?',
                    answer: 'Check your spam/junk folder first. Make sure notifications are enabled in your account settings. Add noreply@jobnest.com to your contacts to prevent emails from being filtered.'
                },
                {
                    question: 'How do I report a bug or issue?',
                    answer: 'Please contact our support team at support@jobnest.com with details about the issue. Include your browser, device, and steps to reproduce the problem if possible.'
                }
            ]
        }
    ]

    const toggleFAQ = (categoryIndex, faqIndex) => {
        const key = `${categoryIndex}-${faqIndex}`
        setOpenIndex(openIndex === key ? null : key)
    }

    return (
        <div className="padding-10 min-h-screen bg-base-100">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-24">
                <div className="padding-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl opacity-90">
                            Find answers to common questions about JobNest
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="py-20">
                <div className="padding-10 max-w-4xl mx-auto px-6">
                    {categories.map((category, categoryIndex) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: categoryIndex * 0.1 }}
                            className="mb-16"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">{category.icon}</span>
                                <h2 className="text-2xl font-bold">{category.name}</h2>
                            </div>

                            <div className="space-y-6">
                                {category.faqs.map((faq, faqIndex) => {
                                    const key = `${categoryIndex}-${faqIndex}`
                                    const isOpen = openIndex === key

                                    return (
                                        <div
                                            key={faqIndex}
                                            className="collapse collapse-arrow bg-base-200 rounded-xl p-3 shadow"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isOpen}
                                                onChange={() => toggleFAQ(categoryIndex, faqIndex)}
                                            />
                                            <div className="collapse-title text-lg font-medium">
                                                {faq.question}
                                            </div>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="collapse-content"
                                                    >
                                                        <p className="text-base-content/80">{faq.answer}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    ))}

                    {/* Still have questions? */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-20 p-10 bg-base-200 rounded-2xl shadow"
                    >
                        <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                        <p className="text-base-content/70 mb-6">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <a href="/contact" className="btn btn-primary">
                            Contact Support
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default FAQ
