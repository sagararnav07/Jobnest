import { Outlet, Link, useLocation } from 'react-router-dom'
import { Footer } from '../components/ui'
import { useAuth } from '../contexts'

const StaticLayout = ({ children }) => {
    const { isAuthenticated, isJobseeker } = useAuth()
    const location = useLocation()

    const getDashboardLink = () => {
        if (!isAuthenticated) return '/login'
        return isJobseeker ? '/jobseeker/dashboard' : '/employer/dashboard'
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto w-full px-4">
                    <div className="flex-1">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                <span className="text-lg font-black text-primary-content">JN</span>
                            </div>
                            <span className="text-xl font-bold">JobNest</span>
                        </Link>
                    </div>
                    <div className="flex-none gap-2">
                        <Link to={getDashboardLink()} className="btn btn-primary btn-sm">
                            {isAuthenticated ? 'Dashboard' : 'Sign In'}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                {children || <Outlet />}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default StaticLayout
