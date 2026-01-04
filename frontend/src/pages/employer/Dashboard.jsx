import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from '../../utils/dayjs'
import { Card, Badge, LoadingSpinner, Toast } from '../../components/ui'
import { employerService } from '../../api'
import { useAuth } from '../../contexts'
import './../../App.css'
const Dashboard = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0
    })
    const [recentApplications, setRecentApplications] = useState([])
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        loadDashboard()
    }, [])

    const loadDashboard = async () => {
        try {
            setLoading(true)
            const [jobsResponse, applicationsResponse] = await Promise.all([
                employerService.getMyJobs(),
                employerService.getApplications()
            ])

            const jobs = jobsResponse.jobs || []
            const applications = applicationsResponse.applications || []

            setStats({
                totalJobs: jobs.length,
                activeJobs: jobs.filter(j => j.status === 'Active').length,
                totalApplications: applications.length,
                pendingApplications: applications.filter(a => a.status === 'Applied').length
            })
            setRecentApplications(applications.slice(0, 5))
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load dashboard data',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            'Applied': { variant: 'info', label: 'New', icon: '🆕' },
            'Inprogress': { variant: 'warning', label: 'Reviewing', icon: '👀' },
            'To Be Interviewed': { variant: 'primary', label: 'Interview', icon: '📅' },
            'Hired': { variant: 'success', label: 'Hired', icon: '✅' },
            'Rejected': { variant: 'danger', label: 'Rejected', icon: '❌' }
        }
        const config = statusMap[status] || { variant: 'default', label: status, icon: '📋' }
        return <Badge variant={config.variant}>{config.icon} {config.label}</Badge>
    }

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <LoadingSpinner size="lg" />
                </motion.div>
                <p className="text-gray-500">Loading your dashboard...</p>
            </div>
        )
    }

    return (
        <>
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <motion.div 
                className="padding-10 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Welcome header with premium gradient */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-xl p-8 lg:p-10"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)'
                    }}
                >
                    {/* Animated background elements */}
                    <motion.div 
                        className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                        animate={{ 
                            x: [0, 50, 0], 
                            y: [0, -30, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"
                        animate={{ 
                            x: [0, -30, 0], 
                            y: [0, 40, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    />
                    
                    <div className="padding-10 relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <motion.span 
                                className="padding-10 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span  className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                Employer Dashboard
                            </motion.span>
                            
                            <motion.h1 
                                className="paddingy-10 text-3xl lg:text-4xl font-bold text-white mb-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Welcome, {user?.companyName || 'Employer'}! 
                                {/* <motion.span 
                                    className="inline-block ml-2"
                                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                                >
                                    👋
                                </motion.span> */}
                            </motion.h1>
                            
                            <motion.p 
                                className="text-white/70 text-lg max-w-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                Manage your job postings, review candidates, and find your next great hire.
                            </motion.p>
                        </div>
                        
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/employer/jobs/create"
                                className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all"
                            >
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <span className="paddingx-10 block">Post New Job</span>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={itemVariants} className="padding-10 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {[
                        { 
                            label: 'Total Jobs', 
                            value: stats.totalJobs, 
                            icon: '💼',
                            color: 'from-blue-500 to-indigo-600',
                            bgColor: 'bg-blue-50',
                            change: '+2 this week'
                        },
                        { 
                            label: 'Active Jobs', 
                            value: stats.activeJobs, 
                            icon: '✅',
                            color: 'from-emerald-500 to-teal-600',
                            bgColor: 'bg-emerald-50',
                            change: 'All performing well'
                        },
                        { 
                            label: 'Applications', 
                            value: stats.totalApplications, 
                            icon: '📄',
                            color: 'from-purple-500 to-pink-600',
                            bgColor: 'bg-purple-50',
                            change: '+12 this week'
                        },
                        { 
                            label: 'Pending Review', 
                            value: stats.pendingApplications, 
                            icon: '⏰',
                            color: 'from-amber-500 to-orange-600',
                            bgColor: 'bg-amber-50',
                            change: 'Action needed'
                        }
                    ].map((stat, index) => (
                        <motion.div
                            className='padding-10'
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                            <Card className={`${stat.bgColor} padding-10  border-0 p-6 relative overflow-hidden group`}>
                                {/* <motion.div 
                                    className="absolute -top-4 -right-4 text-7xl opacity-10 group-hover:opacity-20 transition-opacity"
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, delay: index * 0.5 }}
                                >
                                    {stat.icon}
                                </motion.div> */}
                                
                                <div className="relative z-10">
                                    {/* <span className="text-3xl mb-2 block">{stat.icon}</span> */}
                                    <motion.p 
                                        className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                                    >
                                        {stat.value}
                                    </motion.p>
                                    <p className="text-sm text-gray-600 mt-1 font-medium">{stat.label}</p>
                                    <p className="text-xs text-gray-400 mt-2">{stat.change}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Recent Applications */}
                <motion.div variants={itemVariants}>
                    <Card className="padding-10 border-0 shadow-lg shadow-gray-200/50 overflow-hidden">
                        <div className="padding-10 flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="padding-10">
                                <h2 className="padding-10 text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {/* <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                                        
                                    </span> */}
                                    Recent Applications
                                </h2>
                                <p className="padding-10 paddingy-10 text-gray-500 text-sm mt-1">Latest candidate submissions</p>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link 
                                    to="/employer/applications"
                                    className="padding-10 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
                                >
                                    View All
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </motion.div>
                        </div>

                        {recentApplications.length === 0 ? (
                            <div className="padding-10 text-center py-16 px-6">
                                <motion.div 
                                    className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <span className="text-4xl">📭</span>
                                </motion.div>
                                <h3 className="padding-10 text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
                                <p className="padding-10 text-gray-500 mb-6 max-w-sm mx-auto">
                                    Post your first job to start receiving applications from qualified candidates
                                </p>
                                <Link 
                                    to="/employer/jobs/create"
                                    className="padding-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-shadow"
                                >
                                    Post a Job
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentApplications.map((application, index) => (
                                    <motion.div 
                                        key={application._id}
                                        className="padding-10 flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="padding-10 flex items-center gap-4">
                                            <motion.div 
                                                className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
                                                whileHover={{ rotate: 5 }}
                                            >
                                                <span className="text-white font-bold text-lg">
                                                    {application.applicant?.name?.charAt(0) || 'A'}
                                                </span>
                                            </motion.div>
                                            <div className="padding-10">
                                                <p className="padding-10 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {application.applicant?.name || 'Applicant'}
                                                </p>
                                                <p className="padding-10 text-sm text-gray-500 flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    Applied for <span className="font-medium text-gray-700">{application.job?.jobTitle || 'Job'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400">
                                                {dayjs(application.appliedAt).fromNow()}
                                            </span>
                                            {getStatusBadge(application.status)}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="padding-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { 
                                to: '/employer/jobs/create', 
                                label: 'Create Job Posting', 
                                description: 'Post a new job opportunity',
                                icon: '➕',
                                color: 'from-indigo-500 to-purple-600',
                                bgHover: 'hover:border-indigo-300 hover:bg-indigo-50'
                            },
                            { 
                                to: '/employer/applications', 
                                label: 'Review Applications', 
                                description: 'Manage candidate applications',
                                icon: '📋',
                                color: 'from-emerald-500 to-teal-600',
                                bgHover: 'hover:border-emerald-300 hover:bg-emerald-50'
                            },
                            { 
                                to: '/employer/messages', 
                                label: 'Messages', 
                                description: 'Chat with candidates',
                                icon: '💬',
                                color: 'from-blue-500 to-cyan-600',
                                bgHover: 'hover:border-blue-300 hover:bg-blue-50'
                            }
                        ].map((action, index) => (
                            <motion.div
                                key={action.label}
                                className="padding-10"
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link 
                                    to={action.to}
                                    className={`block p-6 bg-white border-2 border-gray-100 rounded-xl transition-all duration-300 group ${action.bgHover}`}
                                >
                                    <div className="padding-10">
                                        <motion.div 
                                            className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 shadow-lg text-2xl`}
                                            whileHover={{ rotate: 10 }}
                                        >
                                            {action.icon}
                                        </motion.div>
                                        <h3 className="padding-10 font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                            {action.label}
                                        </h3>
                                        <p className="padding-10 text-gray-500 text-sm mb-4">{action.description}</p>
                                        <span className="padding-10 inline-flex items-center text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all gap-1">
                                            Get Started
                                            <motion.svg 
                                                className="w-4 h-4" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </motion.svg>
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </>
    )
}

export default Dashboard
