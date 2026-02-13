import { useEffect } from 'react'
import AppRouter from './router/AppRouter'
import { ErrorBoundary, Chatbot } from './components/ui'
import { warmUpServer, startKeepAlive } from './utils/keepAlive'

function App() {
  // Warm up the backend server on app load and keep it alive
  useEffect(() => {
    warmUpServer().then(() => startKeepAlive())
    return () => {} // cleanup handled by module
  }, [])

  return (
    <ErrorBoundary>
      <AppRouter />
      {/* Botpress Chatbot - appears as floating widget */}
      <Chatbot />
    </ErrorBoundary>
  )
}

export default App
