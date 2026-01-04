import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { Card, Badge, Button, Modal, LoadingSpinner, Toast } from '../../components/ui'
import { employerService } from '../../api'

const Jobs = () => {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteJob, setDeleteJob] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        try {
            setLoading(true)
            const response = await employerService.getMyJobs()
            setJobs(response.jobs || [])
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load jobs',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteJob) return

        try {
            setDeleting(true)
            await employerService.deleteJob(deleteJob._id)
            setJobs(prev => prev.filter(j => j._id !== deleteJob._id))
            setToast({
                show: true,
                message: 'Job deleted successfully',
                type: 'success'
            })
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to delete job',
                type: 'error'
            })
        } finally {
            setDeleting(false)
            setDeleteJob(null)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            'Active': { variant: 'success', label: 'Active' },
            'Draft': { variant: 'warning', label: 'Draft' },
            'Closed': { variant: 'danger', label: 'Closed' },
            'Paused': { variant: 'default', label: 'Paused' }
        }
        const config = statusMap[status] || { variant: 'default', label: status || 'Active' }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
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

            <Modal
                isOpen={!!deleteJob}
                onClose={() => setDeleteJob(null)}
                title="Delete Job"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{deleteJob?.jobTitle}</strong>? 
                        This action cannot be undone and all applications for this job will be removed.
                    </p>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setDeleteJob(null)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="danger"
                            className="flex-1"
                            onClick={handleDelete}
                            loading={deleting}
                        >
                            Delete Job
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="padding-10 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800"
                >
                    {/* Animated background elements */}
                    <motion.div 
                        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                        animate={{ 
                            x: [0, 30, 0], 
                            y: [0, -20, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"
                        animate={{ 
                            x: [0, -20, 0], 
                            y: [0, 30, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    />
                    
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="padding-10">
                            <motion.span 
                                className="padding-10 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                {jobs.length} job postings
                            </motion.span>
                             <h1 className="padding-7 text-center text-2xl lg:text-2xl  text-white mb-2">My Job Postings</h1>
                            <p className="padding-7 text-end text-white/80 text-md">Manage your job listings and track applications</p>
                        </div>
                        <div className="padding-8">
                            <Button 
                                className="bg-white text-indigo-700 hover:bg-gray-100 shadow-lg font-semibold px-6 py-3" 
                                onClick={() => navigate('/employer/jobs/create')}
                            >
                                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Job
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {jobs.length === 0 ? (
                    <motion.div
                        className="padding-10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="padding-10 text-center py-16 border-2 border-dashed border-gray-200 shadow-lg">
                            <motion.div 
                                className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </motion.div>
                            <h3 className="padding-10 text-xl font-bold text-gray-900 mb-2">No job postings yet</h3>
                            <p className="padding-10 text-gray-600 mb-8 max-w-md mx-auto">
                                Create your first job posting to start receiving applications from qualified candidates
                            </p>
                            <Button 
                                className="padding-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-shadow"
                                onClick={() => navigate('/employer/jobs/create')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Job
                            </Button>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {jobs.map((job, index) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -8, scale: 1.02 }}
                            >
                                <br />
                                <Card className="padding-10 p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                            {job.jobTitle?.charAt(0) || 'J'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(job.status)}
                                            {job.postedDate && dayjs(job.postedDate).isAfter(dayjs().subtract(3, 'day')) && (
                                                <Badge variant="success" size="sm">New</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                                        {job.jobTitle}
                                    </h3>
                                    <p className="text-gray-500 text-base mb-5 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {job.location || 'Remote'}
                                        <span className="mx-1">•</span>
                                        {job.jobType || 'Full-time'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {job.skills?.slice(0, 4).map((skill) => (
                                            <span 
                                                key={skill} 
                                                className="padding-10 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {job.skills?.length > 4 && (
                                            <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                                +{job.skills.length - 4}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                            ₹{job.salary || 'Negotiable'}
                                        </span>
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-base font-semibold">{job.applicantsCount || 0} applicants</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                                        <Link
                                            to={`/employer/jobs/${job._id}/edit`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-base font-medium"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </Link>
                                        <Link
                                            to={`/employer/applications?job=${job._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-base font-medium hover:shadow-lg transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Applications
                                        </Link>
                                        <button
                                            onClick={() => setDeleteJob(job)}
                                            className="px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                            
                        ))}
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                    </div>
                )}
            </div>
        </>
    )
}

export default Jobs
