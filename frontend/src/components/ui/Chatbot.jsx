import { useEffect } from 'react'

/**
 * Botpress Chatbot Component for Jobnests
 * Using Botpress Webchat v3.3
 */

const BOTPRESS_BOT_ID = '31277d6f-7f26-420b-b8fa-686c6c74b86f'
const BOTPRESS_CLIENT_ID = 'bf869549-8493-4b32-b419-da65fab727f2'

const Chatbot = () => {
  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById('botpress-webchat-script')) {
      return
    }

    // Create and inject the Botpress webchat v3.3 script
    const script = document.createElement('script')
    script.id = 'botpress-webchat-script'
    script.src = 'https://cdn.botpress.cloud/webchat/v3.3/inject.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // Initialize Botpress webchat with Bot ID and Client ID
      if (window.botpress) {
        window.botpress.init({
          botId: BOTPRESS_BOT_ID,
          clientId: BOTPRESS_CLIENT_ID,
          configuration: {
            botName: 'Jobnest Chat',
            botDescription: 'Your AI assistant for job search help',
          }
        })
      }
    }

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('botpress-webchat-script')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  // The chatbot widget is rendered by Botpress, no JSX needed
  return null
}

export default Chatbot
