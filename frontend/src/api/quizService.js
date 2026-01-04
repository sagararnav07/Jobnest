import api from './axios'

const quizService = {
    // Start a new quiz
    startQuiz: async () => {
        const response = await api.post('/quiz/createQuiz')
        return response.data
    },

    // Get quiz questions
    getQuiz: async () => {
        const response = await api.get('/quiz/getQuestions')
        return response.data
    },

    // Submit quiz answers
    submitQuiz: async (data) => {
        // Transform answers to responses format expected by backend
        const responses = data.answers.map(ans => ({
            questionId: ans.questionId,
            score: ans.answer, // The answer is the score value (1-5)
            category: ans.category || ''
        }))
        const response = await api.put('/quiz/endQuiz', { responses })
        return response.data
    },

    // Get quiz result
    getQuizResult: async () => {
        const response = await api.get('/quiz/result')
        return response.data
    },

    // Reset quiz for retake
    resetQuiz: async () => {
        const response = await api.delete('/quiz/reset')
        return response.data
    }
}

export default quizService
