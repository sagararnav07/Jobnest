import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, useChat } from '../contexts'
import { useEffect } from 'react'
import { ThemeSwitcher, Footer } from '../components/ui'
import './Dashboard.css'
const DashboardLayout = () => {
    const { user, logout, isJobseeker, isEmployer, isProfileComplete } = useAuth()
    const { unreadCount } = useChat()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const profileComplete = isProfileComplete()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const jobseekerNavItems = [
        { path: '/jobseeker/dashboard', label: 'Dashboard', icon: 'home' },
        { path: '/jobseeker/profile', label: 'My Profile', icon: 'user' },
        { path: '/jobseeker/assessment', label: 'Assessment', icon: 'clipboard' },
        { path: '/jobseeker/jobs', label: 'Find Jobs', icon: 'briefcase' },
        { path: '/jobseeker/applications', label: 'My Applications', icon: 'document' },
        { path: '/jobseeker/messages', label: 'Messages', icon: 'chat', badge: unreadCount, requiresProfile: true },
    ]

    const employerNavItems = [
        { path: '/employer/dashboard', label: 'Dashboard', icon: 'home' },
        { path: '/employer/profile', label: 'Company Profile', icon: 'building' },
        { path: '/employer/jobs/create', label: 'Post Job', icon: 'plus' },
        { path: '/employer/jobs', label: 'Manage Jobs', icon: 'briefcase' },
        { path: '/employer/applications', label: 'Applications', icon: 'document' },
        { path: '/employer/messages', label: 'Messages', icon: 'chat', badge: unreadCount, requiresProfile: true },
    ]

    const allNavItems = isJobseeker ? jobseekerNavItems : employerNavItems
    const navItems = allNavItems.filter(item => !item.requiresProfile || profileComplete)

    const getIcon = (iconName) => {
        const icons = {
            home: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            user: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            clipboard: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            briefcase: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            document: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            chat: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            users: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            building: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            plus: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
            ),
        }
        return icons[iconName] || icons.home
    }
    const sidebarRef = useRef(null)
    useEffect(() => {
        function handleClickOutside(e) {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target))
                setSidebarOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    const isActive = (path) => location.pathname === path

    const navItemVariants = {
        hover: {
            scale: 1.02,
            x: 5,
            transition: { type: "spring", stiffness: 400, damping: 10 }
        }
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>
            <div className="flex min-h-screen">

                {/* Sidebar */}
                <aside
                    ref={sidebarRef}
                    className={`sticky top-0 left-0 z-50 h-screen w-72 flex-shrink-0 transform transition-transform duration-300 ease-in-out lg:translate-x-0`}
                >
                    <div className="flex flex-col h-full bg-primary text-primary-content shadow-2xl">
                        {/* Logo */}
                        <motion.div
                            className=" padding-10 flex items-center gap-3 p-6 border-b border-primary-content/10"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <motion.div
                                className="w-12 h-12 bg-base-100 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-xl font-black text-primary">JN</span>
                            </motion.div>
                            <div>
                                <span className="text-xl font-bold">JobNest</span>
                                <p className="text-xs opacity-70">Find Your Match</p>
                            </div>
                            {/* Mobile close button */}
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden ml-auto p-2 rounded-lg hover:bg-primary-content/10"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {navItems.map((item, index) => (
                                <div className='padding-10' key={item.path}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                        variants={navItemVariants}
                                        whileHover="hover"
                                    >
                                        <Link
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                        padding-10
                                        flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300
                                        ${isActive(item.path)
                                                    ? 'bg-base-100 text-primary shadow-lg'
                                                    : 'hover:bg-primary-content/10'
                                                }
                                    `}
                                        >
                                            <span className={isActive(item.path) ? 'text-primary' : ''}>
                                                {getIcon(item.icon)}
                                            </span>
                                            <span className="font-medium">{item.label}</span>
                                            {item.badge > 0 && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="ml-auto bg-secondary text-secondary-content text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
                                                >
                                                    {item.badge}
                                                </motion.span>
                                            )}
                                        </Link>
                                    </motion.div>
                                </div>
                            ))}
                        </nav>

                        {/* User info & logout */}
                        <motion.div
                            className="p-4 border-t border-primary-content/10 mt-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className=" padding-10 flex items-center gap-3 p-3 rounded-xl bg-primary-content/5">
                                <motion.div
                                    className="w-11 h-11 bg-secondary rounded-full flex items-center justify-center shadow-lg"
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <span className="text-secondary-content font-bold text-lg">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs opacity-70 truncate">
                                        {user?.emailId}
                                    </p>
                                </div>
                            </div>
                            <div className='padding-10'>
                                <motion.button
                                    onClick={handleLogout}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-content/10 hover:bg-error hover:text-error-content rounded-xl transition-all duration-300 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Sign Out</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </aside>



                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1">

                        {/* Top bar */}
                        <motion.header
                            className="sticky top-0 z-30 w-full bg-base-100/80 backdrop-blur-xl border-b border-base-300 shadow-sm"
                            initial={{ y: -100 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                                {/* Mobile menu button */}
                                <motion.button
                                    onClick={() => setSidebarOpen(true)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="lg:hidden p-2.5 rounded-xl bg-primary text-primary-content shadow-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </motion.button>

                                {/* Page title */}
                                <div className="padding-10 hidden lg:block">
                                    <h1 className="text-xl font-bold text-primary">
                                        {isJobseeker ? 'Jobseeker Portal' : 'Employer Portal'}
                                    </h1>
                                    <p className="text-sm text-base-content/60">Welcome back! Let's find your perfect match</p>
                                </div>

                                {/* Quick actions */}
                                <div className="flex items-center gap-3">
                                    {/* Search bar - desktop */}
                                    <div className="hidden md:flex items-center">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search..."
                                                className="padding-10 w-64 px-4 py-6 pl-10 rounded-xl bg-base-200 border-0 focus:bg-base-100 focus:ring-2 focus:ring-primary transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    {/* Theme Switcher */}
                                    <ThemeSwitcher />

                                    {/* Notifications - only show if profile is complete */}
                                    {profileComplete && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Link
                                                to={isJobseeker ? '/jobseeker/messages' : '/employer/messages'}
                                                className="relative p-2.5 rounded-xl bg-base-200 hover:bg-primary/10 transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                                {unreadCount > 0 && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-content text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
                                                    >
                                                        {unreadCount}
                                                    </motion.span>
                                                )}
                                            </Link>
                                        </motion.div>
                                    )}

                                    {/* User avatar - mobile */}
                                    <motion.div
                                        className="lg:hidden w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <span className="text-primary-content font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.header>

                        {/* Page content */}
                        <main className="p-4 lg:p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Outlet />
                            </motion.div>
                        </main>
                    </div>
                    
                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default DashboardLayout
