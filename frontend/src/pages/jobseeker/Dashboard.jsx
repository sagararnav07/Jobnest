import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Badge, LoadingSpinner } from '../../components/ui'
import { jobseekerService } from '../../api'
import './../../App.css'
const JobseekerDashboard = () => {
    const { user, isAssessmentComplete } = useAuth()
    const [stats, setStats] = useState({
        applications: 0,
        matchedJobs: 0,
        profileComplete: false
    })
    const [recentJobs, setRecentJobs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            // Load applications
            const appsResponse = await jobseekerService.getMyApplications()

            // Load matched jobs if assessment complete
            let jobs = []
            if (isAssessmentComplete) {
                const jobsResponse = await jobseekerService.getMatchedJobs()
                jobs = jobsResponse.jobs || []
            }

            setStats({
                applications: appsResponse.applications?.length || 0,
                matchedJobs: jobs.length,
                profileComplete: !!(user?.skills?.length > 0)
            })
            setRecentJobs(jobs.slice(0, 3))
        } catch (error) {
            console.error('Error loading dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const assessmentComplete = isAssessmentComplete

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100 }
        }
    }

    const cardHoverVariants = {
        hover: {
            y: -8,
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    }

    const pulseVariants = {
        pulse: {
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 2 }
        }
    }

    if (loading) {
        return (
            <div className=" flex items-center justify-center h-64">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <LoadingSpinner size="lg" />
                </motion.div>
            </div>
        )
    }

    return (
        <motion.div
            className="space-y-8 padding-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Section with animated gradient */}
            <motion.div
                variants={itemVariants}
                style={{ backgroundColor: "#3556d6ff" }}
                className=" relative overflow-hidden rounded-3xl p-8 lg:p-10 indigo"
            // style={{
            //     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
            // }}
            >
                {/* Animated background shapes */}
                <motion.div
                    className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-2xl"
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                />

                <div className=" padding-10 relative z-10">
                    <motion.div

                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <span className="padding-10 inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white/90 text-sm font-medium mb-4">
                            {assessmentComplete ? 'Profile Complete' : 'Getting Started'}
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-3xl lg:text-4xl font-bold text-white mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Welcome, {user?.name?.split(' ')[0] || 'there'}!
                        {/* <motion.span 
                            className="inline-block ml-2"
                            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                        >
                            👋
                        </motion.span> */}
                    </motion.h1>

                    <motion.p
                        className="padding-10 text-white/80 text-lg max-w-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {assessmentComplete
                            ? "You're all set! Check out your matched jobs below and find your dream career."
                            : "Complete your profile and assessment to unlock personalized job matches."}
                    </motion.p>

                    {/* Quick stats in welcome */}
                    <motion.div
                        className="flex flex-wrap gap-4 mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="paddingx-5 padding-10 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <span className="text-xl font-bold text-white">{stats.matchedJobs}</span>
                            <span className="text-white/70 ml-2 text-sm"> Matched Jobs</span>
                        </div>
                        <div className="paddingx-5 padding-10 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <span className=" text-xl font-bold text-white">{stats.applications}</span>
                            <span className="text-white/70 ml-2 text-sm"> Applications</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Action Cards - Show if not complete */}
            {!assessmentComplete && (
                <motion.div variants={itemVariants} className="padding-10 grid md:grid-cols-2 gap-6">
                    {/* <motion.div
                        className='padding-10'
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card className="padding-10 border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 cursor-pointer group">
                            <Link to="/jobseeker/assessment" className="block">
                                <div className="flex items-start gap-4">
                                    <motion.div 
                                        className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
                                        whileHover={{ rotate: 10 }}
                                    >
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                            Take Personality Assessment
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Discover your work style and unlock personalized job matches.
                                        </p>
                                        <span className=" inline-flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all gap-1">
                                            Start Assessment
                                            <svg 
                                                className="w-5 h-5" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    </motion.div> */}
                    <motion.div
                        className='padding-10'
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card className="padding-10 border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 cursor-pointer group">
                            <Link to="/jobseeker/assessment" className="block">
                                <div className="padding-7 flex items-start gap-4">
                                    <motion.div
                                        className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
                                        whileHover={{ rotate: 10 }}
                                    >
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                            Take Personality Assessment
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Discover your work style and unlock personalized job matches.
                                        </p>
                                        <span className="padding-10 inline-flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all gap-1">
                                            Start Assessment
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    </motion.div>
                    <motion.div
                        className='padding-10'
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card className="padding-10 border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 cursor-pointer group">
                            <Link to="/jobseeker/profile" className="block">
                                <div className="padding-7 flex items-start gap-4">
                                    <motion.div
                                        className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
                                        whileHover={{ rotate: -10 }}
                                    >
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </motion.div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                            Complete Your Profile
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Add skills, experience, and upload your resume to stand out.
                                        </p>
                                        <span className="padding-10 inline-flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all gap-1">
                                            Update Profile
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    </motion.div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div variants={itemVariants} className="padding-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    {
                        value: stats.matchedJobs,
                        label: 'Matched Jobs',
                        color: 'from-blue-500 to-indigo-600',
                        bgColor: 'bg-blue-50',
                        icon: '🎯'
                    },
                    {
                        value: stats.applications,
                        label: 'Applications',
                        color: 'from-blue-500 to-indigo-600',
                        bgColor: 'bg-emerald-50',
                        icon: '📄'
                    },
                    {
                        value: assessmentComplete ? '✓' : '○',
                        label: 'Assessment',
                        color: 'from-purple-500 to-pink-600',
                        bgColor: 'bg-purple-50',
                        icon: assessmentComplete ? '🏆' : '📋'
                    },
                    {
                        value: stats.profileComplete ? '✓' : '○',
                        label: 'Profile',
                        color: 'from-orange-500 to-red-500',
                        bgColor: 'bg-orange-50',
                        icon: stats.profileComplete ? '⭐' : '👤'
                    },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        variants={cardHoverVariants}
                        whileHover="hover"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card className={`padding-10 ${stat.bgColor} border-0 p-5 text-center relative overflow-hidden`}>
                            {/* <div 
                                className="absolute -top-4 -right-4 text-6xl opacity-10"
                                transition={{ repeat: Infinity, duration: 4, delay: index * 0.5 }}
                            >
                                {stat.icon}
                            </div> */}
                            <motion.p
                                className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                            >
                                {stat.value}
                            </motion.p>
                            <p className="text-sm text-gray-600 mt-2 font-medium">{stat.label}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Recent Matched Jobs */}
            {assessmentComplete && recentJobs.length > 0 && (
                <motion.div variants={itemVariants}>
                    <div className="padding-10 flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Matched Jobs</h2>
                            <p className="text-gray-500">Based on your personality profile</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/jobseeker/jobs"
                                className="padding-10 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-shadow"
                            >
                                View All Jobs
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </motion.div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {recentJobs.map((job, index) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -8, scale: 1.02 }}
                            >
                                <Card className="padding-10 p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <Link to={`/jobseeker/jobs/${job._id}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                {job.jobTitle?.charAt(0) || 'J'}
                                            </div>
                                            <Badge variant="success" size="sm">New</Badge>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                                            {job.jobTitle}
                                        </h3>
                                        <p className="paddingy-10 text-gray-500 text-sm mb-4 flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {job.location}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.skills?.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="padding-10 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="paddingy-10 flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                ₹{job.salary}
                                            </span>
                                            <span className="text-indigo-600 font-medium text-sm group-hover:underline">
                                                View Details →
                                            </span>
                                        </div>
                                    </Link>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div className='padding-10' variants={itemVariants}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="padding-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {[
                        { to: '/jobseeker/jobs', label: 'Find Jobs', icon: '🔍', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
                        { to: '/jobseeker/applications', label: 'Applications', icon: '📋', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
                        { to: '/jobseeker/messages', label: 'Messages', icon: '💬', color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50' },
                        { to: '/jobseeker/profile', label: 'Profile', icon: '👤', color: 'from-orange-500 to-red-500', bg: 'bg-orange-50' },
                    ].map((action, index) => (
                        <motion.div
                            className='padding-10'
                            key={action.label}
                            whileHover={{ y: -8, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <Link to={action.to}>
                                <Card className={`${action.bg} padding-10 border-0 p-6 text-center cursor-pointer group`}>
                                    {/* <div 
                                        className="text-4xl mb-3"
                                        transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
                                    >
                                        {action.icon}
                                    </div> */}
                                    <p className={`font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:${action.color} group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                                        {action.label}
                                    </p>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default JobseekerDashboard
