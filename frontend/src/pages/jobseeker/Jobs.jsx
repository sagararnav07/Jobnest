import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from '../../utils/dayjs'
import { Card, Badge, Button, Input, Select, LoadingSpinner, Toast } from '../../components/ui'
import { jobseekerService } from '../../api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faGoogle, 
    faMicrosoft, 
    faAmazon, 
    faApple, 
    faMeta, 
    faLinkedin, 
    faTwitter, 
    faUber, 
    faAirbnb, 
    faSpotify, 
    faSlack, 
    faDropbox, 
    faPaypal, 
    faStripe, 
    faShopify, 
    faSalesforce,
    faGithub,
    faDocker,
    faAws,
    faFigma
} from '@fortawesome/free-brands-svg-icons'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'

// Company icon mapping
const companyIcons = {
    'google': { icon: faGoogle, color: 'from-red-500 via-yellow-500 to-green-500', bgColor: 'bg-white', textColor: 'text-blue-500' },
    'microsoft': { icon: faMicrosoft, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-gradient-to-br from-blue-500 to-cyan-500', textColor: 'text-white' },
    'amazon': { icon: faAmazon, color: 'from-orange-400 to-orange-600', bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600', textColor: 'text-white' },
    'apple': { icon: faApple, color: 'from-gray-700 to-gray-900', bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900', textColor: 'text-white' },
    'meta': { icon: faMeta, color: 'from-blue-500 to-blue-700', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700', textColor: 'text-white' },
    'facebook': { icon: faMeta, color: 'from-blue-500 to-blue-700', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700', textColor: 'text-white' },
    'linkedin': { icon: faLinkedin, color: 'from-blue-600 to-blue-800', bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800', textColor: 'text-white' },
    'twitter': { icon: faTwitter, color: 'from-sky-400 to-sky-600', bgColor: 'bg-gradient-to-br from-sky-400 to-sky-600', textColor: 'text-white' },
    'x': { icon: faTwitter, color: 'from-gray-800 to-black', bgColor: 'bg-gradient-to-br from-gray-800 to-black', textColor: 'text-white' },
    'uber': { icon: faUber, color: 'from-gray-800 to-black', bgColor: 'bg-gradient-to-br from-gray-800 to-black', textColor: 'text-white' },
    'airbnb': { icon: faAirbnb, color: 'from-rose-500 to-pink-600', bgColor: 'bg-gradient-to-br from-rose-500 to-pink-600', textColor: 'text-white' },
    'spotify': { icon: faSpotify, color: 'from-green-500 to-green-700', bgColor: 'bg-gradient-to-br from-green-500 to-green-700', textColor: 'text-white' },
    'slack': { icon: faSlack, color: 'from-purple-500 to-pink-500', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500', textColor: 'text-white' },
    'dropbox': { icon: faDropbox, color: 'from-blue-500 to-blue-700', bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700', textColor: 'text-white' },
    'paypal': { icon: faPaypal, color: 'from-blue-600 to-blue-800', bgColor: 'bg-gradient-to-br from-blue-600 to-blue-800', textColor: 'text-white' },
    'stripe': { icon: faStripe, color: 'from-indigo-500 to-purple-600', bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600', textColor: 'text-white' },
    'shopify': { icon: faShopify, color: 'from-green-500 to-lime-600', bgColor: 'bg-gradient-to-br from-green-500 to-lime-600', textColor: 'text-white' },
    'salesforce': { icon: faSalesforce, color: 'from-sky-400 to-blue-600', bgColor: 'bg-gradient-to-br from-sky-400 to-blue-600', textColor: 'text-white' },
    'github': { icon: faGithub, color: 'from-gray-700 to-gray-900', bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900', textColor: 'text-white' },
    'docker': { icon: faDocker, color: 'from-blue-400 to-blue-600', bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600', textColor: 'text-white' },
    'aws': { icon: faAws, color: 'from-orange-400 to-orange-600', bgColor: 'bg-gradient-to-br from-orange-400 to-orange-600', textColor: 'text-white' },
    'figma': { icon: faFigma, color: 'from-purple-500 via-pink-500 to-orange-500', bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500', textColor: 'text-white' },
    'netflix': { icon: null, letter: 'N', color: 'from-red-600 to-red-800', bgColor: 'bg-gradient-to-br from-red-600 to-red-800', textColor: 'text-white' },
}

// List of demo companies to assign when no company name exists
const demoCompanies = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'linkedin', 'spotify', 'netflix', 'uber', 'airbnb', 'slack', 'github', 'stripe', 'shopify', 'figma']

// Function to get a consistent company for a job (based on job ID hash)
const getAssignedCompany = (jobId) => {
    if (!jobId) return demoCompanies[0]
    let hash = 0
    for (let i = 0; i < jobId.length; i++) {
        const char = jobId.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return demoCompanies[Math.abs(hash) % demoCompanies.length]
}

// Function to get company icon info
const getCompanyIcon = (companyName, jobId) => {
    // First try to match by company name
    if (companyName) {
        const normalizedName = companyName.toLowerCase().trim()
        for (const [key, value] of Object.entries(companyIcons)) {
            if (normalizedName.includes(key) || key.includes(normalizedName)) {
                return { ...value, companyKey: key }
            }
        }
    }
    
    // If no company name or no match, assign a demo company based on job ID
    const assignedCompany = getAssignedCompany(jobId)
    return { ...companyIcons[assignedCompany], companyKey: assignedCompany }
}

const Jobs = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
    
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        type: searchParams.get('type') || '',
        experience: searchParams.get('experience') || ''
    })

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        try {
            setLoading(true)
            const response = await jobseekerService.getMatchedJobs()
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        if (value) {
            searchParams.set(key, value)
        } else {
            searchParams.delete(key)
        }
        setSearchParams(searchParams)
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            location: '',
            type: '',
            experience: ''
        })
        setSearchParams({})
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = !filters.search || 
            job.jobTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.skills?.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()))
        
        const matchesLocation = !filters.location ||
            job.location?.toLowerCase().includes(filters.location.toLowerCase())
        
        const matchesType = !filters.type || job.jobType === filters.type
        
        const matchesExperience = !filters.experience || job.experienceRequired === filters.experience

        return matchesSearch && matchesLocation && matchesType && matchesExperience
    })

    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']
    const experienceLevels = ['Entry', 'Mid', 'Senior', 'Lead', 'Manager']

    const hasActiveFilters = Object.values(filters).some(v => v)

    return (
        <>
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <div className="padding-10 space-y-6">
                {/* Header with premium styling */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-800 via-purple-800 to-blue-800"
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
                    
                    <div className="relative z-10 padding-10 ">
                        <motion.span 
                            className="padding-10 inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="padding-10 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            {jobs.length} opportunities matched for you
                        </motion.span>
                        
                        <h1 className="padding-10 text-3xl lg:text-4xl font-bold text-white mb-2">
                            Jobs For You
                        </h1>
                        <p className="padding-10 text-white/80 text-lg">
                            AI-matched opportunities based on your profile and preferences
                        </p>
                    </div>
                </motion.div>
                <br />
                {/* Filters Card */}
                <motion.div
                    className='padding-20 '
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-0 shadow-lg shadow-gray-200/50">
                        <div className="p-6">
                            <div className="padding-10 flex items-center justify-between mb-4">
                                <h2 className="padding-10 font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filter Jobs
                                </h2>
                                
                                {/* View Mode Toggle */}
                                <div className="padding-10 flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`padding-10 p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`padding-10 p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="padding-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="lg:col-span-2">
                                    <Input
                                        
                                        type="text"
                                        placeholder="Search jobs, skills, companies..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        icon={
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        }
                                    />
                                </div>
                                <Input
                                    type="text"
                                    placeholder=" Location"
                                    value={filters.location}
                                    onChange={(e) => handleFilterChange('location', e.target.value)}
                                />
                                <Select
    
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    options={[
                                        { value: '', label: ' Job Type' },
                                        ...jobTypes.map(type => ({ value: type, label: type }))
                                    ]}
                                />
                                <Select
                                    value={filters.experience}
                                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                                    options={[
                                        { value: '', label: ' Experience' },
                                        ...experienceLevels.map(level => ({ value: level, label: level }))
                                    ]}
                                />
                            </div>
                            
                            {/* Active Filters & Results Count */}
                            <AnimatePresence>
                                {hasActiveFilters && (
                                    <motion.div 
                                        className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm text-gray-500">Active filters:</span>
                                            {filters.search && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                                    "{filters.search}"
                                                    <button onClick={() => handleFilterChange('search', '')} className="hover:text-indigo-900">×</button>
                                                </span>
                                            )}
                                            {filters.location && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                                                    📍 {filters.location}
                                                    <button onClick={() => handleFilterChange('location', '')} className="hover:text-emerald-900">×</button>
                                                </span>
                                            )}
                                            {filters.type && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                                    {filters.type}
                                                    <button onClick={() => handleFilterChange('type', '')} className="hover:text-purple-900">×</button>
                                                </span>
                                            )}
                                            {filters.experience && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                                                    {filters.experience}
                                                    <button onClick={() => handleFilterChange('experience', '')} className="hover:text-orange-900">×</button>
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold text-indigo-600">{filteredJobs.length}</span> of {jobs.length} jobs
                                            </p>
                                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                                Clear All
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </motion.div>
                <br />
                {/* Jobs list */}
                {loading ? (
                    <div className="padding-10 flex flex-col items-center justify-center h-64 gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <LoadingSpinner size="lg" />
                        </motion.div>
                        <p className="text-gray-500">Finding your perfect matches...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="padding-10 text-center py-16 border-2 border-dashed border-gray-200">
                            <div 
                                className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto text-center">
                                {jobs.length === 0 
                                    ? 'Complete your profile and assessment to unlock personalized job matches' 
                                    : 'Try adjusting your filters or search terms to find more opportunities'}
                            </p>
                            {jobs.length === 0 ? (
                                <Link 
                                    to="/jobseeker/profile"
                                    className="padding-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-900 via-purple-800 to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-shadow"
                                >
                                    Complete Profile
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            ) : (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear All Filters
                                </Button>
                            )}
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={viewMode === 'grid' ? 'padding-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'spadding-10 pace-y-4'}
                    >
                        {filteredJobs.map((job, index) => (
                            <JobCard key={job._id} job={job} index={index} viewMode={viewMode} />
                        ))}
                    </motion.div>
                )}
            </div>
        </>
    )
}

const JobCard = ({ job, index, viewMode }) => {
    // Generate consistent matchScore based on job ID (not random on each render)
    const getSeededScore = (id) => {
        if (!id) return 75
        let hash = 0
        for (let i = 0; i < id.length; i++) {
            const char = id.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash
        }
        return 70 + Math.abs(hash % 30) // Score between 70-99
    }
    const matchScore = job.matchScore || getSeededScore(job._id)
    
    const scoreColor = matchScore >= 85 
        ? 'from-emerald-500 to-teal-500' 
        : matchScore >= 70 
        ? 'from-amber-500 to-orange-500' 
        : 'from-gray-400 to-gray-500'

    // Get company icon - now always returns an icon (assigns demo company if needed)
    const companyIconInfo = getCompanyIcon(job.companyName, job._id)

    // Company Logo Component
    const CompanyLogo = ({ size = 'normal' }) => {
        const sizeClasses = size === 'normal' 
            ? 'w-14 h-14 text-xl' 
            : 'w-12 h-12 text-lg'
        
        return (
            <motion.div 
                className={`${sizeClasses} ${companyIconInfo.bgColor} rounded-2xl flex items-center justify-center ${companyIconInfo.textColor || 'text-white'} font-bold shadow-lg`}
                whileHover={{ rotate: 5, scale: 1.05 }}
            >
                {companyIconInfo.icon ? (
                    <FontAwesomeIcon icon={companyIconInfo.icon} className={size === 'normal' ? 'text-2xl' : 'text-xl'} />
                ) : (
                    <span className={size === 'normal' ? 'text-2xl' : 'text-xl'}>{companyIconInfo.letter || job.companyName?.charAt(0) || job.jobTitle?.charAt(0) || 'J'}</span>
                )}
            </motion.div>
        )
    }

    if (viewMode === 'grid') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
            >
                <Link to={`/jobseeker/jobs/${job._id}`}>
                    <Card className="padding-10 h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg shadow-gray-200/50 group overflow-hidden">
                        {/* Match Score Header */}
                        <div className={`h-1 bg-gradient-to-r ${scoreColor}`} />
                        
                        <div className="p-6">
                            <div className="padding-10 flex items-start justify-between mb-4">
                                <CompanyLogo />
                                <div className={`padding-10 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${scoreColor} text-white text-sm font-bold shadow-lg`}>
                                    {matchScore}%
                                    <span className="text-xs opacity-80">match</span>
                                </div>
                            </div>
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {job.jobTitle}
                            </h3>
                            <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {job.location || 'Remote'}
                            </p>
                            
                            <p className="padding-9_ text-sm text-gray-600 line-clamp-2 mb-4">
                                {job.description}
                            </p>
                            
                            <div className="padding-9_ flex flex-wrap gap-2 mb-4">
                                {job.skills?.slice(0, 3).map((skill) => (
                                    <span 
                                        key={skill} 
                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                            
                            <div className=" padding-9_ flex items-center justify-between pt-4 border-t border-gray-100">
                                {job.salary && (
                                    <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                        ₹{job.salary}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">
                                    {job.postedDate ? dayjs(job.postedDate).format('DD MMM YYYY') : 'Recently posted'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </Link>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
        >
            <Link to={`/jobseeker/jobs/${job._id}`}>
                <Card className="padding-10 hover:shadow-xl transition-all duration-300 border-0 shadow-lg shadow-gray-200/50 group overflow-hidden">
                    <div className="flex">
                        {/* Match Score Indicator */}
                        <div className={`w-1.5 bg-gradient-to-b ${scoreColor}`} />
                        
                        <div className="flex-1 p-6 padding-10">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <CompanyLogo />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {job.jobTitle}
                                                </h3>
                                                {job.featured && (
                                                    <Badge variant="warning" size="sm">⭐ Featured</Badge>
                                                )}
                                                {job.postedDate && dayjs(job.postedDate).isAfter(dayjs().subtract(3, 'day')) && (
                                                    <Badge variant="success" size="sm">New</Badge>
                                                )}
                                            </div>
                                            <p className="paddingy-10 text-sm text-gray-500 mb-2 flex items-center gap-2">
                                                <span className="font-medium">{job.companyName || 'Company'}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    </svg>
                                                    {job.location || 'Remote'}
                                                </span>
                                            </p>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {job.description}
                                            </p>
                                            <div className="paddingy-10 flex flex-wrap gap-2">
                                                {job.skills?.slice(0, 4).map((skill) => (
                                                    <Badge className='padding-10' key={skill} variant="default" size="sm">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {job.skills?.length > 4 && (
                                                    <Badge variant="default" size="sm">
                                                        +{job.skills.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-4 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${scoreColor} text-white shadow-lg`}>
                                            <span className="font-bold text-lg">{matchScore}</span>
                                            <span className="absolute -bottom-1 text-[10px] bg-white text-gray-600 px-1.5 py-0.5 rounded-full shadow">match</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {job.salary && (
                                            <p className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                ₹{job.salary}
                                                {job.salaryPeriod && <span className="text-sm text-gray-400 font-normal">/{job.salaryPeriod}</span>}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {job.postedDate ? dayjs(job.postedDate).format('DD MMM YYYY') : 'Recently posted'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                                <Badge variant={job.jobType === 'Remote' ? 'success' : 'info'} size="sm">
                                    {job.jobType || 'Full-time'}
                                </Badge>
                                {job.experienceRequired && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        {job.experienceRequired} level
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 ml-auto flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {job.applicantsCount || 0} applicants
                                </span>
                                <motion.span 
                                    className="padding-10 text-indigo-600 font-semibold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    initial={{ x: -10 }}
                                    animate={{ x: 0 }}
                                >
                                    View Details
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </motion.span>
                            </div>
                        </div>
                    </div>
            
                </Card>
                <br/>
            </Link>
        </motion.div>
    )
}

export default Jobs
