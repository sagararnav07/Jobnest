import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, Button, Input, Select, Textarea, Toast, LoadingSpinner } from '../../components/ui'
import { employerService } from '../../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const CreateJob = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditMode = !!id

    const [loading, setLoading] = useState(isEditMode)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [errors, setErrors] = useState({})
    const [skillInput, setSkillInput] = useState('')
    const [logoFile, setLogoFile] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const logoInputRef = useRef(null)

    const [formData, setFormData] = useState({
        jobTitle: '',
        description: '',
        requirements: '',
        location: '',
        jobPreference: 'Day Shift',
        minExperience: '',
        maxExperience: '',
        salary: '',
        currencytype: 'INR',
        skills: [],
        benefits: '',
        deadline: '',
        status: 'Active'
    })

    useEffect(() => {
        if (isEditMode) {
            loadJob()
        }
    }, [id])

    const loadJob = async () => {
        try {
            setLoading(true)
            const response = await employerService.getJobById(id)
            const job = response.job
            setFormData({
                jobTitle: job.jobTitle || '',
                description: job.description || '',
                requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || '',
                location: job.location || '',
                jobPreference: job.jobPreference || 'Day Shift',
                minExperience: job.experience?.minExperience?.toString() || '',
                maxExperience: job.experience?.maxExperience?.toString() || '',
                salary: job.salary?.toString() || '',
                currencytype: job.currencytype || 'INR',
                skills: job.skills || [],
                benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits || '',
                deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
                status: job.status || 'Active'
            })
            // Set logo preview if exists
            if (job.companyLogo) {
                setLogoPreview(`${API_URL}${job.companyLogo}`)
            }
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load job',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const jobPreferences = ['Day Shift', 'Night Shift', 'Work From Home', 'Hybrid', 'Onsite', 'Remote']
    const currencyTypes = [
        { value: 'INR', label: 'INR (₹)' },
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleAddSkill = () => {
        const skill = skillInput.trim()
        if (skill && !formData.skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }))
            setSkillInput('')
        }
    }

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddSkill()
        }
    }

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }))
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                setToast({
                    show: true,
                    message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.',
                    type: 'error'
                })
                return
            }
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setToast({
                    show: true,
                    message: 'File too large. Maximum size is 2MB.',
                    type: 'error'
                })
                return
            }
            setLogoFile(file)
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
        if (logoInputRef.current) {
            logoInputRef.current.value = ''
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.jobTitle.trim()) {
            newErrors.jobTitle = 'Job title is required'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Job description is required'
        } else if (formData.description.length < 50) {
            newErrors.description = 'Description should be at least 50 characters'
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required'
        }

        if (formData.skills.length === 0) {
            newErrors.skills = 'At least one skill is required'
        }

        if (!formData.salary.trim()) {
            newErrors.salary = 'Salary is required'
        }

        if (formData.deadline) {
            const deadlineDate = new Date(formData.deadline)
            if (deadlineDate < new Date()) {
                newErrors.deadline = 'Deadline must be in the future'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            setToast({
                show: true,
                message: 'Please fix the errors before submitting',
                type: 'error'
            })
            return
        }

        try {
            setSaving(true)
            
            // Use FormData to support file upload
            const submitData = new FormData()
            submitData.append('jobTitle', formData.jobTitle)
            submitData.append('description', formData.description)
            submitData.append('location', formData.location)
            submitData.append('jobPreference', formData.jobPreference)
            submitData.append('salary', formData.salary || '0')
            submitData.append('currencytype', formData.currencytype)
            submitData.append('skills', JSON.stringify(formData.skills))
            submitData.append('experience', JSON.stringify({
                minExperience: formData.minExperience ? Number(formData.minExperience) : 0,
                maxExperience: formData.maxExperience ? Number(formData.maxExperience) : 0
            }))
            if (formData.deadline) {
                submitData.append('expiryDate', new Date(formData.deadline).toISOString())
            }
            submitData.append('requirements', JSON.stringify(formData.requirements.split('\n').filter(r => r.trim())))
            submitData.append('benefits', JSON.stringify(formData.benefits.split('\n').filter(b => b.trim())))
            
            // Add company logo if selected
            if (logoFile) {
                submitData.append('companyLogo', logoFile)
            }

            if (isEditMode) {
                await employerService.updateJob(id, submitData)
                setToast({
                    show: true,
                    message: 'Job updated successfully!',
                    type: 'success'
                })
            } else {
                await employerService.createJob(submitData)
                setToast({
                    show: true,
                    message: 'Job created successfully!',
                    type: 'success'
                })
            }

            setTimeout(() => {
                navigate('/employer/jobs')
            }, 1500)
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job`,
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
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

            <div className="padding-10 max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="padding-10 text-2xl font-bold text-gray-900 mb-2">
                        {isEditMode ? 'Edit Job Posting' : 'Create Job Posting'}
                    </h1>
                    <p className="padding-10 text-gray-600">
                        {isEditMode ? 'Update the job listing details' : 'Fill in the details to create a new job listing'}
                    </p>
                </motion.div>

                <form style={{ flexDirection: "column", gap: "15px" }} onSubmit={handleSubmit} className="space-y-6 flex">
                    {/* Basic Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                            <div className="padding-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input
                                        label="Job Title *"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        error={errors.jobTitle}
                                        placeholder="e.g., Senior Frontend Developer"
                                    />
                                </div>
                                <Input
                                    label="Location *"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    error={errors.location}
                                    placeholder="e.g., San Francisco, CA or Remote"
                                />
                                <Select

                                    label="Job Preference"
                                    name="jobPreference"
                                    value={formData.jobPreference}
                                    onChange={handleChange}
                                    options={jobPreferences.map(type => ({ value: type, label: type }))}
                                />
                                <Input
                                    label="Min Experience (years)"
                                    name="minExperience"
                                    type="number"
                                    value={formData.minExperience}
                                    onChange={handleChange}
                                    placeholder="e.g., 1"
                                />
                                <Input
                                    label="Max Experience (years)"
                                    name="maxExperience"
                                    type="number"
                                    value={formData.maxExperience}
                                    onChange={handleChange}
                                    placeholder="e.g., 5"
                                />
                                <Input
                                    label="Application Deadline"
                                    name="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    error={errors.deadline}
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Job Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Job Description</h2>
                            <div className="padding-10 space-y-6">
                                <Textarea
                                    label="Description *"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    error={errors.description}
                                    rows={6}
                                    placeholder="Provide a detailed description of the role, responsibilities, and what makes this opportunity exciting..."
                                />
                                <Textarea
                                    label="Requirements (one per line)"
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="3+ years of experience with React&#10;Strong understanding of JavaScript/TypeScript&#10;Experience with RESTful APIs&#10;Excellent communication skills"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Skills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Required Skills</h2>
                            <div className="padding-10 space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a skill and press Enter"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={handleSkillKeyDown}
                                        className="flex-1"
                                    />
                                    <Button className='padding-20' type="button" onClick={handleAddSkill}>
                                        Add
                                    </Button>
                                </div>
                                {errors.skills && (
                                    <p className="text-sm text-red-600">{errors.skills}</p>
                                )}
                                {formData.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-1 hover:text-indigo-900"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Compensation & Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Compensation & Benefits</h2>
                            <div className="padding-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Salary"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    error={errors.salary}
                                    placeholder="e.g., 12 LPA or 120000"
                                />
                                <Select
                                    label="Currency"
                                    name="currencytype"
                                    value={formData.currencytype}
                                    onChange={handleChange}
                                    options={currencyTypes}
                                />
                            </div>
                            <div className="padding-10 mt-6">
                                <Textarea
                                    //className='padding-10 grayborder rounded'
                                    label="Benefits (one per line)"
                                    name="benefits"
                                    value={formData.benefits}
                                    onChange={handleChange}
                                    rows={5}
                                    cols={80}
                                    placeholder="Health insurance&#10;401(k) matching&#10;Remote work flexibility&#10;Professional development budget&#10;Unlimited PTO"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Company Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Company Logo</h2>
                            <div className="padding-10 space-y-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Upload your company logo to make your job posting stand out. Supported formats: JPEG, PNG, GIF, WEBP (max 2MB)
                                </p>
                                
                                {logoPreview ? (
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={logoPreview}
                                                alt="Company logo preview"
                                                className="w-24 h-24 object-contain border rounded-lg bg-gray-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Logo uploaded</p>
                                            <button
                                                type="button"
                                                onClick={() => logoInputRef.current?.click()}
                                                className="text-sm text-indigo-600 hover:text-indigo-700"
                                            >
                                                Change logo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => logoInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                                    >
                                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-600 mb-2">Click to upload company logo</p>
                                        <p className="text-sm text-gray-400">JPEG, PNG, GIF, WEBP up to 2MB</p>
                                    </div>
                                )}
                                
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-4 justify-end"
                    >
                        <Button
                            className='padding-10'
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/employer/jobs')}
                        >
                            Cancel
                        </Button>
                        <Button className='padding-10' type="submit" size="lg" loading={saving}>
                            {isEditMode ? 'Update Job Posting' : 'Create Job Posting'}
                        </Button>
                    </motion.div>
                </form>
            </div>
        </>
    )
}

export default CreateJob
