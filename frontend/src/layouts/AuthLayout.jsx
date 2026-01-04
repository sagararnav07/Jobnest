import { Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Footer } from '../components/ui'
import './../App.css'
// Import local images
import teamCollaborationImg from '../assets/images/external/team-collaboration.jpg'
import testimonialSarahImg from '../assets/images/external/testimonial-sarah.jpg'

const AuthLayout = () => {
    // Premium features list
    const features = [
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: 'AI-Powered Matching',
            description: 'Smart algorithms find your perfect fit'
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Instant Connections',
            description: 'Direct chat with employers'
        },
        {
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            title: 'Verified Companies',
            description: 'Only trusted employers'
        }
    ]

    return (
        <div className="min-h-screen flex">
            {/* Left side - Premium image with overlay */}
            <div className="hidden lg:flex lg:w-1/2 padding-10 relative overflow-hidden">
                {/* Background Image */}
                <img 
                    src={teamCollaborationImg}
                    alt="Team collaboration"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="padding-10 absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-indigo-900/90" />
                
                {/* Animated gradient orbs */}
                <motion.div 
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"
                    animate={{ 
                        x: [0, 50, 0], 
                        y: [0, 30, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl"
                    animate={{ 
                        x: [0, -30, 0], 
                        y: [0, -50, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link to="/" className="flex items-center gap-3">
                            <motion.div 
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/20"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <span className="text-xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">JN</span>
                            </motion.div>
                            <span className="text-2xl font-bold text-white">JobNest</span>
                        </Link>
                    </motion.div>
                    
                    {/* Main Content */}
                    <motion.div 
                        className="max-w-lg"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <motion.span 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-medium mb-6 border border-white/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="padding-10 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            10,000+ active opportunities
                        </motion.span>
                        
                        <h1 className="padding-10 text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
                            Your dream career is
                            <span className="block bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                                one step away
                            </span>
                        </h1>
                        
                        <p className="padding-10 text-lg text-white/70 mb-10 leading-relaxed">
                            Join thousands of professionals who found their perfect match through 
                            our AI-powered platform. Your skills deserve the right opportunity.
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-4 flex gap-4" style={{flexDirection:"column"}}>
                            {features.map((feature, index) => (
                                <motion.div 
                                    key={feature.title}
                                    className="padding-10 flex items-start gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{feature.title}</h3>
                                        <p className="text-sm text-white/60">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    
                    {/* Testimonial */}
                    <motion.div 
                        className="padding-10 flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <img 
                            src={testimonialSarahImg}
                            alt="Sarah M."
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                        />
                        <div>
                            <p className="text-white/80 text-sm italic">
                                "Found my dream job in just 2 weeks! The AI matching is incredible."
                            </p>
                            <p className="text-white/50 text-xs mt-1">Sarah M. — Product Designer at Stripe</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Auth Forms */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-xl"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link to="/" className="flex items-center gap-3">
                            <motion.div 
                                className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                                <span className="text-xl font-black text-white">JN</span>
                            </motion.div>
                            <span className="text-2xl font-bold text-gray-900">JobNest</span>
                        </Link>
                    </div>
                    
                    {/* Form Card */}
                    <div className="w-full bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 p-10 lg:p-12">
                        <Outlet />
                    </div>
                    
                    {/* Footer */}
                    <motion.p 
                        className="text-center text-sm text-gray-500 mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-indigo-600 hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    )
}

export default AuthLayout
