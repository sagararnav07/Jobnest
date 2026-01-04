import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Card, Badge, Button, Modal, Textarea, LoadingSpinner, Toast } from '../../components/ui'
import { jobseekerService } from '../../api'
import './../../App.css'

dayjs.extend(relativeTime)

const JobDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [showApplyModal, setShowApplyModal] = useState(false)
    const [coverLetter, setCoverLetter] = useState('')
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        loadJob()
    }, [id])

    const loadJob = async () => {
        try {
            setLoading(true)
            console.log('ln 28 ', id);
            const response = await jobseekerService.getJobById(id)
            setJob(response.job)
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load job details',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async () => {
        try {
            setApplying(true)
            await jobseekerService.applyForJob(id, { coverLetter })
            setToast({
                show: true,
                message: 'Application submitted successfully!',
                type: 'success'
            })
            setShowApplyModal(false)
            // Refresh job to update application status
            await loadJob()
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to apply for job',
                type: 'error'
            })
        } finally {
            setApplying(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!job) {
        return (
            <Card className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job not found</h3>
                <p className="text-gray-600 mb-6">This job may have been removed or the link is invalid</p>
                <Button onClick={() => navigate('/jobseeker/jobs')}>Browse Jobs</Button>
            </Card>
        )
    }

    const matchScore = job.matchScore || Math.floor(Math.random() * 30) + 70

    return (
        <>
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <Modal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                title="Apply for this position"
            >
                <div className="space-y-4 padding-10">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{job.jobTitle}</h4>
                        <p className="text-sm text-gray-500">
                            {job.companyName || 'Company'} • {job.location}
                        </p>
                    </div>
                    
                    <Textarea
                        label="Cover Letter (Optional)"
                        placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                    />

                    <p className="padding-10 text-sm text-gray-500">
                        Your profile information, resume, and cover letter will be shared with the employer.
                    </p>

                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setShowApplyModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 text-lg"
                            onClick={handleApply}
                            loading={applying}
                        >
                            Submit Application
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="space-y-6">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link 
                        to="/jobseeker/jobs"
                        className="padding-10 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Jobs
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="padding-10 lg:col-span-2 space-y-6">
                        {/* Job header */}
                        <motion.div className='padding-10'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <div className="padding-10 flex items-start gap-4">
                                    <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                            {job.jobTitle}
                                        </h1>
                                        <p className="text-lg text-gray-600 mb-3">
                                            {job.companyName || 'Company Name'}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="info">{job.jobType || 'Full-time'}</Badge>
                                            {job.experienceRequired && (
                                                <Badge variant="default">{job.experienceRequired} level</Badge>
                                            )}
                                            <Badge variant="success">{job.location || 'Remote'}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                           className='padding-10'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className='padding-10'>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                                <div className="prose prose-gray max-w-none">
                                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Requirements */}
                        {job.requirements && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                                    <ul className="space-y-2">
                                        {(Array.isArray(job.requirements) 
                                            ? job.requirements 
                                            : job.requirements.split('\n')
                                        ).map((req, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </motion.div>
                        )}

                        {/* Skills */}
                        {job.skills?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill) => (
                                            <Badge key={skill} variant="primary" size="lg">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Benefits */}
                        {job.benefits?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {job.benefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-6 padding-10"
                        >
                            <Card>
                                {/* Match score */}
                                <div className="text-center mb-6">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${
                                        matchScore >= 80 
                                            ? 'bg-green-100 text-green-700'
                                            : matchScore >= 60
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {matchScore}%
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Match Score</p>
                                </div>

                                {/* Job details */}
                                <div className="space-y-4 mb-6">
                                    {job.salary && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Salary</p>
                                                <p className="font-semibold text-gray-900">
                                                    ₹{job.salary}
                                                    {job.salaryPeriod && `/${job.salaryPeriod}`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-3 padding-10">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Location</p>
                                            <p className="font-semibold text-gray-900">{job.location || 'Remote'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 padding-10">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Posted</p>
                                            <p className="font-semibold text-gray-900">{job.postedDate ? dayjs(job.postedDate).format('DD MMM YYYY') : 'Recently posted'}</p>
                                        </div>
                                    </div>
                                    {job.expiryDate && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Apply by</p>
                                                <p className="font-semibold text-gray-900">
                                                    {dayjs(job.expiryDate).format('DD MMM YYYY')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Apply button */}
                                {job.hasApplied ? (
                                    <div className="text-center">
                                        <Badge variant="success" size="lg">Already Applied</Badge>
                                        <Link 
                                            to="/jobseeker/applications"
                                            className="block mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                                        >
                                            View your applications
                                        </Link>
                                    </div>
                                ) : (
                                    <Button 
                                        className="w-full padding-10" 
                                        size="lg"
                                        onClick={() => setShowApplyModal(true)}
                                    >
                                        Apply Now
                                    </Button>
                                )}

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    {job.applicantsCount || 0} people have applied
                                </p>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default JobDetails
