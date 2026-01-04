import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// Import team images
import teamSarah from '../../assets/images/team-sarah.jpg'
import teamMichael from '../../assets/images/team-michael.jpg'
import teamEmily from '../../assets/images/team-emily.jpg'
import teamDavid from '../../assets/images/team-david.jpg'

const About = () => {
    const stats = [
        { number: '50K+', label: 'Jobs Posted' },
        { number: '100K+', label: 'Successful Hires' },
        { number: '10K+', label: 'Companies' },
        { number: '500K+', label: 'Active Users' }
    ]

    const team = [
        {
            name: 'Sarah Johnson',
            role: 'CEO & Co-Founder',
            image: teamSarah,
            bio: 'Former HR Director at Fortune 500 companies with 15+ years of experience.'
        },
        {
            name: 'Michael Chen',
            role: 'CTO & Co-Founder',
            image: teamMichael,
            bio: 'Tech visionary with expertise in AI and machine learning.'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Head of Product',
            image: teamEmily,
            bio: 'Product leader passionate about creating intuitive user experiences.'
        },
        {
            name: 'David Kim',
            role: 'Head of Engineering',
            image: teamDavid,
            bio: 'Engineering leader with a track record of building scalable platforms.'
        }
    ]

    const values = [
        {
            icon: '🎯',
            title: 'Mission-Driven',
            description: 'We believe everyone deserves a fulfilling career that matches their skills and aspirations.'
        },
        {
            icon: '🤝',
            title: 'Trust & Transparency',
            description: 'We build trust through honest communication and transparent practices.'
        },
        {
            icon: '💡',
            title: 'Innovation',
            description: 'We continuously innovate to provide the best job-matching experience.'
        },
        {
            icon: '🌍',
            title: 'Inclusivity',
            description: 'We champion diversity and create equal opportunities for everyone.'
        }
    ]

    return (
        <div className="padding-10 min-h-screen bg-base-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-24">
                <div className="padding-10 max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About JobNest</h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            We're on a mission to transform how people find their dream careers. 
                            Through AI-powered matching and a human-first approach, we connect 
                            talent with opportunity.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-20 bg-base-200">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-base-content/70">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Story */}
            <div className="py-20">
                <div className="padding-10 max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
                        <div className="prose prose-lg max-w-none">
                            <p>
                                JobNest was founded in 2020 with a simple belief: finding the right job 
                                shouldn't be a job in itself. Our founders, having experienced the 
                                frustrations of traditional job searching, set out to create something better.
                            </p>
                            <p>
                                Today, JobNest has grown into a thriving platform that serves hundreds of 
                                thousands of job seekers and employers worldwide. Our AI-powered matching 
                                algorithm goes beyond keywords to understand skills, culture fit, and career 
                                aspirations, creating meaningful connections that last.
                            </p>
                            <p>
                                We're proud to have helped countless professionals land their dream jobs and 
                                assisted thousands of companies in building world-class teams. But we're just 
                                getting started. Our vision is a world where every person can find work that 
                                fulfills them and every company can find the talent they need to thrive.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Values */}
            <div className="py-20 bg-base-200">
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
                                className="card bg-base-100 shadow-lg p-4"
                            >
                                <div className="card-body text-center px-2 py-4">
                                    <div className="text-4xl mb-4">{value.icon}</div>
                                    <h3 className="card-title justify-center">{value.title}</h3>
                                    <p className="text-base-content/70">{value.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team */}
            <div className="py-20">
                <div className="padding-10 max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-14">Our Leadership Team</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {team.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="card bg-base-100 shadow-lg p-4"
                            >
                                <figure className="px-6 pt-6 flex justify-center">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="rounded-full w-32 h-32 object-cover border-2 border-primary"
                                    />
                                </figure>
                                <div className="card-body text-center px-2 py-4">
                                    <h3 className="card-title justify-center text-lg">{member.name}</h3>
                                    <p className="text-primary font-medium text-sm">{member.role}</p>
                                    <p className="text-sm text-base-content/70">{member.bio}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-20 bg-primary text-primary-content">
                <div className="padding-10 max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Find Your Dream Job?</h2>
                    <p className="text-lg opacity-90 mb-8">
                        Join thousands of professionals who have found their perfect career match with JobNest.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/register/jobseeker" className="btn btn-secondary btn-lg">
                            Get Started
                        </Link>
                        <Link to="/contact" className="btn btn-outline btn-lg border-primary-content text-primary-content hover:bg-primary-content hover:text-primary">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About
