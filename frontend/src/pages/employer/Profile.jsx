import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, Button, Input, Textarea, LoadingSpinner, Toast } from '../../components/ui'
import { employerService } from '../../api'
import { useAuth } from '../../contexts'
import './../../App.css'

const Profile = () => {
    const { user, updateUser, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        phone: '',
        website: '',
        industry: '',
        companySize: '',
        foundedYear: '',
        description: '',
        location: '',
        address: '',
        linkedin: '',
        twitter: '',
        culture: '',
        benefits: ''
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const response = await employerService.getProfile()
            const profile = response.profile || response.user || {}
            
            setFormData({
                companyName: profile.companyName || user?.companyName || '',
                email: profile.email || user?.email || '',
                phone: profile.phone || '',
                website: profile.website || '',
                industry: profile.industry || '',
                companySize: profile.companySize || '',
                foundedYear: profile.foundedYear || '',
                description: profile.description || '',
                location: profile.location || '',
                address: profile.address || '',
                linkedin: profile.linkedin || profile.socialLinks?.linkedin || '',
                twitter: profile.twitter || profile.socialLinks?.twitter || '',
                culture: profile.culture || '',
                benefits: Array.isArray(profile.benefits) ? profile.benefits.join('\n') : profile.benefits || ''
            })
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load profile',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format'
        }

        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number'
        }

        if (formData.website && !/^https?:\/\//.test(formData.website)) {
            newErrors.website = 'Website must start with http:// or https://'
        }

        if (formData.foundedYear) {
            const year = parseInt(formData.foundedYear)
            const currentYear = new Date().getFullYear()
            if (year < 1800 || year > currentYear) {
                newErrors.foundedYear = `Year must be between 1800 and ${currentYear}`
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
            const profileData = {
                ...formData,
                benefits: formData.benefits.split('\n').filter(b => b.trim()),
                socialLinks: {
                    linkedin: formData.linkedin,
                    twitter: formData.twitter
                }
            }
            
            await employerService.updateProfile(profileData)
            await refreshProfile()
            updateUser({ ...user, companyName: formData.companyName })
            
            setToast({
                show: true,
                message: 'Profile updated successfully!',
                type: 'success'
            })
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to update profile',
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
                    <h1 className="padding-10 text-2xl font-bold text-gray-900 mb-2">Company Profile</h1>
                    <p className="padding-10 text-gray-600">Manage your company information to attract the best candidates</p>
                </motion.div>

                <form onSubmit={handleSubmit} style={{flexDirection:"column", gap:"15px"}} className="flex padding-10 space-y-6">
                    {/* Basic Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                            <div className="padding-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Company Name *"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    error={errors.companyName}
                                    placeholder="Your company name"
                                />
                                <Input
                                    label="Email *"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    placeholder="contact@company.com"
                                />
                                <Input
                                    label="Phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                    placeholder={"Enter Phone Number"}
                                />
                                <Input
                                    label="Website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    error={errors.website}
                                    placeholder="https://company.com"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Company Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Company Details</h2>
                            <div className="padding-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Industry"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    placeholder="e.g., Technology, Healthcare"
                                />
                                <Input
                                    label="Company Size"
                                    name="companySize"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                    placeholder="e.g., 50-100 employees"
                                />
                                <Input
                                    label="Founded Year"
                                    name="foundedYear"
                                    type="number"
                                    value={formData.foundedYear}
                                    onChange={handleChange}
                                    error={errors.foundedYear}
                                    placeholder="2015"
                                />
                                <Input
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                />
                            </div>
                            <div className="mt-6 padding-10 ">
                                <Textarea
                                    label="Company Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    cols={80}
                                    placeholder="Tell candidates about your company, mission, and values..."
                                />
                            </div>
                            <div className="padding-10 mt-6">
                                <Textarea
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Full company address"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Social Links</h2>
                            <div className="padding-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="LinkedIn"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/company/yourcompany"
                                    icon={
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                        </svg>
                                    }
                                />
                                <Input
                                    label="Twitter"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="https://twitter.com/yourcompany"
                                    icon={
                                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                                        </svg>
                                    }
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Culture & Benefits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="padding-10">
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">Culture & Benefits</h2>
                            <div className="padding-10 space-y-6">
                                <Textarea
                                    label="Company Culture"
                                    name="culture"
                                    value={formData.culture}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe your company culture, work environment, and team values..."
                                />
                                <Textarea
                                    label="Benefits (one per line)"
                                    name="benefits"
                                    value={formData.benefits}
                                    onChange={handleChange}
                                    rows={6}
                                    placeholder="Health insurance&#10;401(k) matching&#10;Remote work options&#10;Professional development&#10;Unlimited PTO"
                                />
                            </div>
                        </Card>
                    </motion.div>

                    {/* Submit */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="padding-10 flex justify-end"
                    >
                        <Button className="padding-10" type="submit" size="lg" loading={saving}>
                            Save Changes
                        </Button>
                    </motion.div>
                </form>
            </div>
        </>
    )
}

export default Profile
