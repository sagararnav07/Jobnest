import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { Card, Badge, Button, Select, Modal, LoadingSpinner, Toast } from '../../components/ui'
import { employerService } from '../../api'

const Applications = () => {
    const [searchParams] = useSearchParams()
    const jobFilter = searchParams.get('job')
    
    const [applications, setApplications] = useState([])
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState(jobFilter || '')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedApplication, setSelectedApplication] = useState(null)
    const [updating, setUpdating] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [applicationsResponse, jobsResponse] = await Promise.all([
                employerService.getApplications(),
                employerService.getMyJobs()
            ])
            setApplications(applicationsResponse.applications || [])
            setJobs(jobsResponse.jobs || [])
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

    const handleStatusUpdate = async (applicationId, newStatus) => {
        try {
            setUpdating(true)
            await employerService.updateApplicationStatus(applicationId, newStatus)
            setApplications(prev => 
                prev.map(app => 
                    app._id === applicationId 
                        ? { ...app, status: newStatus }
                        : app
                )
            )
            setToast({
                show: true,
                message: 'Application status updated',
                type: 'success'
            })
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to update status',
                type: 'error'
            })
        } finally {
            setUpdating(false)
            setSelectedApplication(null)
        }
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            'Applied': { variant: 'info', label: 'New' },
            'Inprogress': { variant: 'warning', label: 'Reviewing' },
            'To Be Interviewed': { variant: 'primary', label: 'Interview' },
            'Hired': { variant: 'success', label: 'Hired' },
            'Rejected': { variant: 'danger', label: 'Rejected' }
        }
        const config = statusMap[status] || { variant: 'default', label: status }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const filteredApplications = applications.filter(app => {
        const matchesJob = !selectedJob || app.job?._id === selectedJob
        const matchesStatus = !selectedStatus || app.status === selectedStatus
        return matchesJob && matchesStatus
    })

    const statuses = ['Applied', 'Inprogress', 'To Be Interviewed', 'Hired', 'Rejected']

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

            {/* Application detail modal */}
            <Modal
                isOpen={!!selectedApplication}
                onClose={() => setSelectedApplication(null)}
                title="Application Details"
                size="lg"
            >
                {selectedApplication && (
                    <div className="space-y-6">
                        {/* Applicant info */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl text-indigo-600 font-bold">
                                    {selectedApplication.applicant?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedApplication.applicant?.name || 'Applicant'}
                                </h3>
                                <p className="text-gray-500">
                                    {selectedApplication.applicant?.email}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Applied {dayjs(selectedApplication.appliedAt).format('MMM D, YYYY')}
                                </p>
                            </div>
                        </div>

                        {/* Job info */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 mb-1">Applied for</p>
                            <p className="font-medium text-gray-900">
                                {selectedApplication.job?.jobTitle}
                            </p>
                        </div>

                        {/* Cover letter */}
                        {selectedApplication.coverLetter && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {selectedApplication.coverLetter}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {selectedApplication.applicant?.skills?.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplication.applicant.skills.map((skill) => (
                                        <Badge key={skill} variant="default">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume link */}
                        {selectedApplication.applicant?.resumeUrl && (
                            <div>
                                <a
                                    href={selectedApplication.applicant.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View Resume
                                </a>
                            </div>
                        )}

                        {/* Status update */}
                        <div className="border-t pt-6">
                            <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(selectedApplication._id, status)}
                                        disabled={updating || selectedApplication.status === status}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedApplication.status === status
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {status === 'Inprogress' ? 'In Progress' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
                    
                    <div className="padding-8 relative z-10">
                        <motion.span 
                            className="padding-8 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            {applications.length} total applications
                        </motion.span>
                        <h1 className="padding-8 text-center text-2xl lg:text-2xl  text-white mb-2">Applications</h1>
                        <p className="padding-8 text-white/80 text-lg">Review and manage job applications</p>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className='padding-10'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <div className="padding-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Select
                                label="Filter by Job"
                                value={selectedJob}
                                onChange={(e) => setSelectedJob(e.target.value)}
                                options={[
                                    { value: '', label: 'All Jobs' },
                                    ...jobs.map(job => ({ 
                                        value: job._id, 
                                        label: job.jobTitle 
                                    }))
                                ]}
                            />
                            <Select
                                label="Filter by Status"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                options={[
                                    { value: '', label: 'All Statuses' },
                                    ...statuses.map(status => ({ 
                                        value: status, 
                                        label: status === 'Inprogress' ? 'In Progress' : status 
                                    }))
                                ]}
                            />
                            <div className="flex items-end">
                                <p className="text-sm text-gray-500">
                                    Showing {filteredApplications.length} of {applications.length} applications
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
                 <br />
                 <br />
                 <br />
                {/* Applications list */}
                {filteredApplications.length === 0 ? (
                    <motion.div
                        className="padding-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="padding-8 py-7 border-2 border-dashed border-gray-200 shadow-lg">
                            <motion.div 
                                className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </motion.div>
                            <h3 className="padding-8 text-xl font-bold text-gray-900 mb-2">No applications found</h3>
                            <p className="padding-8 text-gray-600 max-w-md mx-auto">
                                {applications.length === 0 
                                    ? 'You haven\'t received any applications yet. Post a job to start receiving applications!'
                                    : 'No applications match your current filters. Try adjusting your filter criteria.'}
                            </p>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        {filteredApplications.map((application, index) => (
                            <motion.div
                                key={application._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -8, scale: 1.02 }}
                            >
                                <Card className="padding-10 p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                                            {application.applicant?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(application.status)}
                                            {application.appliedAt && dayjs(application.appliedAt).isAfter(dayjs().subtract(3, 'day')) && (
                                                <Badge variant="success" size="sm">New</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                                        {application.applicant?.name || 'Applicant'}
                                    </h3>
                                    <p className="text-gray-500 text-base mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {application.applicant?.email}
                                    </p>
                                    
                                    {/* Job Applied For */}
                                    <div className="flex items-center gap-2 mb-5 p-3 bg-indigo-50 rounded-xl">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">Applied for</span>
                                        <span className="font-semibold text-indigo-700">{application.job?.jobTitle}</span>
                                    </div>
                                    
                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {application.applicant?.skills?.slice(0, 4).map((skill) => (
                                            <span 
                                                key={skill} 
                                                className="padding-10 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {application.applicant?.skills?.length > 4 && (
                                            <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                                +{application.applicant.skills.length - 4}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-base font-medium">
                                                {dayjs(application.appliedAt).format('MMM D, YYYY')}
                                            </span>
                                        </div>
                                        {application.applicant?.resumeUrl && (
                                            <a
                                                href={application.applicant.resumeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Resume
                                            </a>
                                        )}
                                    </div>
                                    
                                    {/* Action Button */}
                                    <div className="mt-5 pt-5 border-t border-gray-100">
                                        <Button
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-base font-medium hover:shadow-lg transition-all"
                                            onClick={() => setSelectedApplication(application)}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                        
                    </div>
                )}
                <br />
                        <br />
                        <br />
                        <br />
                        
            </div>
        </>
    )
}

export default Applications
