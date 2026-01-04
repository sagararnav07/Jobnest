import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('')

    const categories = [
        {
            icon: '🚀',
            title: 'Getting Started',
            description: 'Learn the basics of using JobNest',
            articles: [
                'Creating your account',
                'Setting up your profile',
                'Understanding the dashboard',
                'First steps for job seekers',
                'First steps for employers'
            ],
            link: '/help/getting-started'
        },
        {
            icon: '📝',
            title: 'Applications',
            description: 'Everything about job applications',
            articles: [
                'How to apply for jobs',
                'Tracking your applications',
                'Application best practices',
                'Cover letter tips',
                'Following up on applications'
            ],
            link: '/help/applications'
        },
        {
            icon: '👤',
            title: 'Profile & Resume',
            description: 'Optimize your profile for success',
            articles: [
                'Completing your profile',
                'Uploading your resume',
                'Adding skills and experience',
                'Profile visibility settings',
                'Profile optimization tips'
            ],
            link: '/help/profile'
        },
        {
            icon: '💼',
            title: 'Job Posting',
            description: 'Guide for employers posting jobs',
            articles: [
                'Creating a job posting',
                'Writing effective job descriptions',
                'Setting salary ranges',
                'Managing applications',
                'Promoting your listings'
            ],
            link: '/help/job-posting'
        },
        {
            icon: '💬',
            title: 'Messaging',
            description: 'Connect with employers and candidates',
            articles: [
                'Using the messaging system',
                'Message etiquette',
                'Managing conversations',
                'Notification settings',
                'Blocking and reporting'
            ],
            link: '/help/messaging'
        },
        {
            icon: '🔒',
            title: 'Account & Security',
            description: 'Keep your account safe',
            articles: [
                'Password management',
                'Two-factor authentication',
                'Privacy settings',
                'Deleting your account',
                'Recognizing scams'
            ],
            link: '/help/security'
        }
    ]

    const popularArticles = [
        { title: 'How to create a standout profile', views: '12.5k' },
        { title: 'Tips for writing a great cover letter', views: '10.2k' },
        { title: 'Understanding job match scores', views: '8.7k' },
        { title: 'How to prepare for interviews', views: '7.9k' },
        { title: 'Salary negotiation strategies', views: '6.5k' }
    ]

    return (
        <div className="padding-10 min-h-screen bg-base-100">
            {/* Hero with Search */}
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-24">
                <div className="padding-10 max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">How can we help?</h1>
                        <p className="text-xl opacity-90 mb-8">
                            Search our knowledge base or browse categories below
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input input-lg w-full pl-12 text-base-content"
                            />
                            <svg 
                                className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Categories */}
            <div className="py-20">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-10 text-center">Browse by Category</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow p-4"
                            >
                                <div className="card-body px-2 py-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-3xl">{category.icon}</span>
                                        <div>
                                            <h3 className="card-title text-lg">{category.title}</h3>
                                            <p className="text-sm text-base-content/60">{category.description}</p>
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        {category.articles.slice(0, 4).map((article, i) => (
                                            <li key={i} className="flex items-center gap-2 text-base-content/70 hover:text-primary cursor-pointer">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {article}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="card-actions mt-4">
                                        <Link to={category.link} className="link link-primary text-sm">
                                            View all articles →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Articles */}
            <div className="py-20 bg-base-200">
                <div className="padding-10 max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold mb-10 text-center">Popular Articles</h2>
                    <div className="space-y-6">
                        {popularArticles.map((article, index) => (
                            <motion.div
                                key={article.title}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-5 bg-base-100 rounded-xl hover:bg-base-100/80 cursor-pointer transition-colors shadow"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                        {index + 1}
                                    </div>
                                    <span className="font-medium">{article.title}</span>
                                </div>
                                <span className="text-sm text-base-content/50">{article.views} views</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Support */}
            <div className="py-20">
                <div className="padding-10 max-w-4xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="card bg-primary text-primary-content p-4 shadow-lg"
                        >
                            <div className="card-body px-2 py-4">
                                <h3 className="card-title">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email Support
                                </h3>
                                <p className="opacity-90">Get help via email. We typically respond within 24 hours.</p>
                                <div className="card-actions mt-4">
                                    <a href="mailto:support@jobnest.com" className="btn btn-secondary">
                                        Send Email
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="card bg-secondary text-secondary-content p-4 shadow-lg"
                        >
                            <div className="card-body px-2 py-4">
                                <h3 className="card-title">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Live Chat
                                </h3>
                                <p className="opacity-90">Chat with our support team. Available Mon-Fri, 9AM-6PM PST.</p>
                                <div className="card-actions mt-4">
                                    <button className="btn bg-secondary-content text-secondary hover:bg-secondary-content/90">
                                        Start Chat
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelpCenter
