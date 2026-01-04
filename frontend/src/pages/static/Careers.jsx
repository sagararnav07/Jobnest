import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Careers = () => {
    const benefits = [
        { icon: '🏥', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
        { icon: '🏖️', title: 'Unlimited PTO', description: 'Take time off when you need it, no limits' },
        { icon: '💻', title: 'Remote Work', description: 'Work from anywhere in the world' },
        { icon: '📚', title: 'Learning Budget', description: '$2,000 annual budget for courses and conferences' },
        { icon: '🏋️', title: 'Wellness Stipend', description: 'Monthly allowance for gym, mental health, etc.' },
        { icon: '👶', title: 'Parental Leave', description: '16 weeks paid leave for all new parents' },
        { icon: '📈', title: 'Equity', description: 'Stock options so you share in our success' },
        { icon: '🎉', title: 'Team Events', description: 'Regular offsites and team building activities' }
    ]

    const openings = [
        {
            department: 'Engineering',
            positions: [
                { title: 'Senior Frontend Engineer', location: 'Remote', type: 'Full-time' },
                { title: 'Backend Engineer', location: 'San Francisco', type: 'Full-time' },
                { title: 'DevOps Engineer', location: 'Remote', type: 'Full-time' },
                { title: 'Machine Learning Engineer', location: 'Remote', type: 'Full-time' }
            ]
        },
        {
            department: 'Product',
            positions: [
                { title: 'Product Manager', location: 'San Francisco', type: 'Full-time' },
                { title: 'UX Designer', location: 'Remote', type: 'Full-time' },
                { title: 'Product Analyst', location: 'Remote', type: 'Full-time' }
            ]
        },
        {
            department: 'Sales & Marketing',
            positions: [
                { title: 'Account Executive', location: 'New York', type: 'Full-time' },
                { title: 'Content Marketing Manager', location: 'Remote', type: 'Full-time' },
                { title: 'Growth Marketing Lead', location: 'San Francisco', type: 'Full-time' }
            ]
        },
        {
            department: 'Customer Success',
            positions: [
                { title: 'Customer Success Manager', location: 'Remote', type: 'Full-time' },
                { title: 'Support Specialist', location: 'Remote', type: 'Full-time' }
            ]
        }
    ]

    const values = [
        {
            title: 'Move Fast',
            description: 'We ship quickly, iterate often, and aren\'t afraid to make mistakes along the way.'
        },
        {
            title: 'Customer Obsessed',
            description: 'Every decision starts with "How does this help our users find their dream job?"'
        },
        {
            title: 'Own It',
            description: 'Take initiative, be accountable, and see things through to the end.'
        },
        {
            title: 'Win Together',
            description: 'We celebrate successes as a team and support each other through challenges.'
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
                        <span className="badge badge-secondary mb-4">We're Hiring!</span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Join Us in Transforming How People Find Work
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                            Help us build the future of job matching. Work with talented people, 
                            solve meaningful problems, and make a real impact.
                        </p>
                        <a href="#openings" className="btn btn-secondary btn-lg">
                            View Open Positions
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Our Values */}
            <div className="py-20">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-14">Our Values</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-8 bg-base-100 rounded-xl shadow"
                            >
                                <h3 className="text-xl font-bold text-primary mb-3">{value.title}</h3>
                                <p className="text-base-content/70">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="py-20 bg-base-200">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Join JobNest?</h2>
                    <p className="text-center text-base-content/70 mb-14 max-w-2xl mx-auto">
                        We believe in taking care of our team so they can do their best work
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="card bg-base-100 shadow-lg p-4"
                            >
                                <div className="card-body items-center text-center px-2 py-4">
                                    <span className="text-4xl mb-2">{benefit.icon}</span>
                                    <h3 className="card-title text-base">{benefit.title}</h3>
                                    <p className="text-sm text-base-content/70">{benefit.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Open Positions */}
            <div id="openings" className="py-20">
                <div className="padding-10 max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
                    <p className="text-center text-base-content/70 mb-14">
                        Find your perfect role at JobNest
                    </p>

                    <div className="space-y-10">
                        {openings.map((dept, deptIndex) => (
                            <motion.div
                                key={dept.department}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: deptIndex * 0.1 }}
                            >
                                <h3 className="text-xl font-bold mb-4 text-primary">{dept.department}</h3>
                                <div className="space-y-5">
                                    {dept.positions.map((position, posIndex) => (
                                        <div
                                            key={posIndex}
                                            className="flex flex-wrap items-center justify-between p-5 bg-base-100 rounded-xl border border-base-300 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                                        >
                                            <div>
                                                <h4 className="font-semibold">{position.title}</h4>
                                                <div className="flex items-center gap-4 text-sm text-base-content/60 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {position.location}
                                                    </span>
                                                    <span>{position.type}</span>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary btn-sm mt-2 sm:mt-0">
                                                Apply Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Don't see your role? */}
            <div className="py-20 bg-primary text-primary-content">
                <div className="padding-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Don't See Your Perfect Role?</h2>
                    <p className="text-lg opacity-90 mb-8">
                        We're always looking for talented people. Send us your resume and 
                        we'll reach out when we have a role that matches your skills.
                    </p>
                    <a href="mailto:careers@jobnest.com" className="btn btn-secondary btn-lg">
                        Send Your Resume
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Careers
