import AppRouter from './router/AppRouter'
import { ErrorBoundary, Chatbot } from './components/ui'

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      {/* Botpress Chatbot - appears as floating widget */}
      <Chatbot />
    </ErrorBoundary>
  )
}

export default App
