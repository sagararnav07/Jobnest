import { Link } from 'react-router-dom'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto ml-0 lg:ml-4">
            <div className="max-w-7xl mx-auto">
                {/* Main Content */}
                <div className="px-10 md:px-20 lg:px-28 py-24 lg:py-32 mt-8 padding-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-28 padding-8">
                        
                        {/* Brand Section */}
                        <div className="lg:col-span-5 padding-10">
                            <div className="flex items-center gap-5 mb-10 padding-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
                                    <span className="text-2xl font-black text-primary-content tracking-tight">JN</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight mb-1">JobNest</h2>
                                    <p className="text-sm opacity-60">Find your dream career</p>
                                </div>
                            </div>
                            <p className="text-base leading-loose opacity-70 max-w-md mb-10">
                               
                            </p>
                            
                            {/* Social Links */}
                            <div className="flex items-center gap-5 mt-8 padding-10">
                                <span className="text-sm font-medium opacity-60 mr-3">Follow us</span>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                                   className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                                   className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                                   className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                                   className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="lg:col-span-7 pt-10 lg:pt-0 padding-10">
                            <div className="grid grid-cols-3 gap-14 lg:gap-20 padding-8">
                                {/* Company */}
                                <nav className="padding-10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-8 padding-10">Company</h3>
                                    <ul className="space-y-5 padding-10">
                                        <li>
                                            <Link to="/about" className="text-base opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block py-1">
                                                About Us
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/contact" className="text-base opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block py-1">
                                                Contact
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>

                                {/* Support */}
                                <nav className="padding-10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-8 padding-10">Support</h3>
                                    <ul className="space-y-5 padding-10">
                                        <li>
                                            <Link to="/help" className="text-base opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block py-1">
                                                Help Center
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/faq" className="text-base opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block py-1">
                                                FAQ
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>

                                {/* Legal */}
                                <nav className="padding-10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-8 padding-10">Legal</h3>
                                    <ul className="space-y-5 padding-10">
                                        <li>
                                            <Link to="/privacy" className="text-base opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block py-1">
                                                Privacy
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/terms" className="text-base opacity-70 hover:opacity-100 hover:text-primary transition-all duration-200 inline-block py-1">
                                                Terms
                                            </Link>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 padding-8">
                    <div className="px-10 md:px-20 lg:px-28 py-8 padding-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8 padding-10">
                            <p className="text-sm opacity-50 padding-8">
                                © {currentYear} JobNest. All rights reserved.
                            </p>
                            <p className="text-sm opacity-50 padding-6">
                                Built with ❤️ for job seekers
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
