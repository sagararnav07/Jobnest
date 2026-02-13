/**
 * Server Keep-Alive Utility
 * Pings the backend health endpoint periodically to prevent Render cold starts.
 * Runs only in production and only when the user is actively using the app.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'
const HEALTH_URL = API_URL.replace('/api/v1', '/health')
const PING_INTERVAL = 4 * 60 * 1000 // 4 minutes (Render sleeps after 15 min of inactivity)

let pingInterval = null
let isWarmedUp = false

/**
 * Warm up the backend server (call once at app start)
 * Returns a promise that resolves when the server responds
 */
export const warmUpServer = async () => {
    if (isWarmedUp) return true
    
    try {
        const response = await fetch(HEALTH_URL, { 
            method: 'GET',
            signal: AbortSignal.timeout(10000) // 10s timeout
        })
        if (response.ok) {
            isWarmedUp = true
            console.log('[KeepAlive] Server is warm')
            return true
        }
    } catch (err) {
        console.warn('[KeepAlive] Server cold start detected, may take a moment:', err.message)
    }
    return false
}

/**
 * Start periodic keep-alive pings
 * Only runs when the tab is visible to save resources
 */
export const startKeepAlive = () => {
    if (pingInterval) return // Already running
    
    // Only in production
    if (import.meta.env.DEV) {
        console.log('[KeepAlive] Skipping in development')
        return
    }

    const ping = async () => {
        if (document.hidden) return // Don't ping if tab is not visible
        
        try {
            await fetch(HEALTH_URL, { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            })
        } catch {
            // Silently ignore failures
        }
    }

    pingInterval = setInterval(ping, PING_INTERVAL)
    
    // Also handle visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            ping() // Ping immediately when tab becomes visible
        }
    })

    console.log('[KeepAlive] Started (interval: 4 min)')
}

/**
 * Stop keep-alive pings
 */
export const stopKeepAlive = () => {
    if (pingInterval) {
        clearInterval(pingInterval)
        pingInterval = null
        console.log('[KeepAlive] Stopped')
    }
}

export default { warmUpServer, startKeepAlive, stopKeepAlive }
