import { useState, useEffect } from 'react'

// DaisyUI themes list
const themes = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
    "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
    "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade",
    "night", "coffee", "winter", "dim", "nord", "sunset"
]

const ThemeSwitcher = () => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        // Initialize from localStorage or default to 'light'
        if (typeof window !== 'undefined') {
            return localStorage.getItem('jobnest-theme') || 'light'
        }
        return 'light'
    })

    // Apply theme on mount and when it changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme)
        localStorage.setItem('jobnest-theme', currentTheme)
    }, [currentTheme])

    // Handle theme change
    const handleThemeChange = (theme) => {
        setCurrentTheme(theme)
        // Close dropdown after selection
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
    }

    return (
        <div className="dropdown dropdown-end">
            <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost btn-circle"
                title="Change Theme"
            >
                <svg
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 stroke-current"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                </svg>
            </div>
            <div
                tabIndex={0}
                className="dropdown-content bg-base-200 text-base-content rounded-box top-px mt-16 max-h-96 w-56 overflow-y-auto shadow-2xl z-[100]"
            >
                <div className="grid grid-cols-1 gap-3 p-3">
                    {themes.map((theme) => (
                        <button
                            key={theme}
                            className={`outline-base-content text-start outline-offset-4 rounded-lg ${currentTheme === theme ? 'outline outline-2 outline-primary' : ''}`}
                            onClick={() => handleThemeChange(theme)}
                        >
                            <span
                                data-theme={theme}
                                className="bg-base-100 rounded-btn text-base-content block w-full cursor-pointer font-sans"
                            >
                                <span className="grid grid-cols-5 grid-rows-3">
                                    <span className="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className={currentTheme === theme ? 'visible' : 'invisible'}
                                        >
                                            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                                        </svg>
                                        <span className="flex-grow text-sm capitalize">{theme}</span>
                                        <span className="flex h-full shrink-0 flex-wrap gap-1">
                                            <span className="bg-primary rounded-badge w-2"></span>
                                            <span className="bg-secondary rounded-badge w-2"></span>
                                            <span className="bg-accent rounded-badge w-2"></span>
                                            <span className="bg-neutral rounded-badge w-2"></span>
                                        </span>
                                    </span>
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ThemeSwitcher
