import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { Card, Badge, LoadingSpinner, Toast } from '../../components/ui'
import { jobseekerService } from '../../api'

const MyApplications = () => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        loadApplications()
    }, [])

    const loadApplications = async () => {
        try {
            setLoading(true)
            const response = await jobseekerService.getMyApplications()
            setApplications(response.applications || [])
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load applications',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            'Applied': { variant: 'info', label: 'Applied' },
            'Inprogress': { variant: 'warning', label: 'In Progress' },
            'To Be Interviewed': { variant: 'primary', label: 'Interview Scheduled' },
            'Hired': { variant: 'success', label: 'Hired' },
            'Rejected': { variant: 'danger', label: 'Not Selected' }
        }
        const config = statusMap[status] || { variant: 'default', label: status }
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

            <div className="padding-10 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="padding-10 text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
                    <p className="text-gray-600">Track the status of your job applications</p>
                </motion.div>

                {applications.length === 0 ? (
                    <motion.div
                        className='padding-10 '
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="padding-10 text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="padding-10 text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
                            <p className="padding-10 text-gray-600 mb-6">Start applying for jobs to see them here</p>
                            <Link 
                                to="/jobseeker/jobs"
                                className="padding-10 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Browse Jobs
                            </Link>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        {applications.map((application, index) => (
                            <motion.div
                                className='padding-10 '
                                key={application._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className='padding-10 ' hover>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="padding-10 font-semibold text-gray-900">
                                                        {application.job?.jobTitle || 'Job Title'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Location - {application.job?.location || 'Location'}
                                                    </p>
                                                    <div className="padding-10 flex flex-wrap gap-2 mt-2">
                                                        {application.job?.skills?.slice(0, 3).map((skill) => (
                                                            <Badge className='padding-10' key={skill} variant="default" size="sm">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="padding-10 flex flex-col items-end gap-2">
                                            {getStatusBadge(application.status)}
                                            <p className="padding-10 text-gray-500">
                                                Applied {dayjs(application.appliedAt).format('MMM D, YYYY')}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </>
    )
}

export default MyApplications
