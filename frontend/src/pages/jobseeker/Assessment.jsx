import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button, LoadingSpinner, Toast } from '../../components/ui'
import { quizService } from '../../api'
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts'
import './../../App.css'
const Assessment = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [quiz, setQuiz] = useState(null)
    const [result, setResult] = useState(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

    useEffect(() => {
        loadAssessment()
    }, [])

    const loadAssessment = async () => {
        try {
            setLoading(true)
            // Try to get existing results first
            const resultsResponse = await quizService.getQuizResult()
            if (resultsResponse.result) {
                setResult(resultsResponse.result)
                setLoading(false)
                return
            }
        } catch {
            // No existing results, load quiz questions
        }

        try {
            const startQuiz = await quizService.startQuiz()
            console.log('ln 39 ', startQuiz.questions);
            
            // Store as { questions: [...] } format for consistency
            setQuiz({ questions: startQuiz.questions || [] })
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to load assessment',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = useCallback((questionId, score, category) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { score, category }
        }))
    }, [])

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1)
        }
    }

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quiz.questions.length) {
            setToast({
                show: true,
                message: 'Please answer all questions before submitting',
                type: 'warning'
            })
            return
        }

        try {
            setSubmitting(true)
            // Format answers for backend - each answer has questionId, score, and category
            const response = await quizService.submitQuiz({
                answers: Object.entries(answers).map(([questionId, answerData]) => ({
                    questionId,
                    answer: answerData.score,
                    category: answerData.category
                }))
            })
            setResult(response.result)
            
            // Download PDF report if available
            if (response.result?.reportUrl) {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'
                const baseUrl = API_URL.replace('/api/v1', '')
                const downloadUrl = `${baseUrl}${response.result.reportUrl}`
                
                // Create a link and trigger download
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = response.result.reportFilename || 'Assessment_Report.pdf'
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                setToast({
                    show: true,
                    message: 'Assessment completed! Your PDF report is downloading...',
                    type: 'success'
                })
            } else {
                setToast({
                    show: true,
                    message: 'Assessment completed successfully!',
                    type: 'success'
                })
            }
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to submit assessment',
                type: 'error'
            })
        } finally {
            setSubmitting(false)
        }
    }

    const retakeAssessment = async () => {
        try {
            setLoading(true)
            // Reset quiz on backend first
            await quizService.resetQuiz()
            
            // Clear local state
            setResult(null)
            setAnswers({})
            setCurrentQuestion(0)
            
            // Load fresh quiz
            const startQuiz = await quizService.startQuiz()
            setQuiz({ questions: startQuiz.questions || [] })
            
            setToast({
                show: true,
                message: 'Assessment reset! You can now retake the quiz.',
                type: 'success'
            })
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to reset assessment',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    // Show results if available
    if (result) {
        return (
            <AssessmentResults 
                result={result} 
                onRetake={retakeAssessment}
                toast={toast}
                setToast={setToast}
            />
        )
    }

    // Show quiz if available
    if (!quiz || !quiz.questions?.length) {
        return (
            <Card className="padding-10 text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center"> No assessment available</h3>
                <p className="text-gray-600 text-center">Please check back later for personality assessments</p>
            </Card>
        )
    }

    const question = quiz.questions[currentQuestion]
    const progress = (Object.keys(answers).length / quiz.questions.length) * 100

    return (
        <>
            <Toast 
                
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <div  className="padding-10 max-w-3xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Personality Assessment</h1>
                    <p className="text-gray-600 paddingy-10 ">Answer honestly to get the best job matches for your personality</p>
                </motion.div>

                {/* Progress bar */}
                <Card>
                    <div className="padding-10 flex items-center justify-between mb-2">
                        <span className="padding-10 text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">
                            {Object.keys(answers).length} of {quiz.questions.length} answered
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                            className="bg-indigo-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </Card>

                {/* Question card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className='padding-10'>
                            <div className="padding-10 flex items-center gap-2 mb-4">
                                <Badge className='padding-10 ' variant="primary">Question {currentQuestion + 1}</Badge>
                                {question.category && (
                                    <Badge className='padding-10' style variant="default">{question.category}</Badge>
                                )}
                            </div>
                            
                            <h2 className="padding-10 text-lg font-semibold text-gray-900 mb-6">
                                {question.text || question.question}
                            </h2>

                            <div style={{flexDirection:"column", gap:"10px"}} className="space-y-3 padding-10 flex ">
                                {/* Use Likert scale options (1-5) for personality assessment */}
                                {[
                                    { value: 1, label: 'Strongly Disagree' },
                                    { value: 2, label: 'Disagree' },
                                    { value: 3, label: 'Neutral' },
                                    { value: 4, label: 'Agree' },
                                    { value: 5, label: 'Strongly Agree' }
                                ].map((option) => (
                                    <motion.button
                                        key={option.value}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => handleAnswer(question.id || question._id, option.value, question.category)}
                                        className={`padding-10 w-full p-4 text-left rounded-lg border-2 transition-all ${
                                            answers[question.id || question._id]?.score === option.value
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                answers[question.id || question._id]?.score === option.value
                                                    ? 'border-indigo-600 bg-indigo-600'
                                                    : 'border-gray-300'
                                            }`}>
                                                {answers[question.id || question._id]?.score === option.value && (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-700">{option.label}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        className='padding-10'
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2 ">
                        {quiz.questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    idx === currentQuestion
                                        ? 'bg-indigo-600'
                                        : answers[q.id || q._id]
                                        ? 'bg-indigo-300'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    {currentQuestion === quiz.questions.length - 1 ? (
                        <div className='padding-10'>
                        <Button
                            onClick={handleSubmit}
                            loading={submitting}
                            disabled={Object.keys(answers).length < quiz.questions.length}
                        >
                            Submit
                        </Button>
                        </div>
                    ) : (
                        <div className='padding-10'>
                        <Button className='padding-10' onClick={handleNext}>
                            Next
                        </Button>
                        </div>
                    )}
                    
                </div>
            </div>
        </>
    )
}

// Results component with charts
const AssessmentResults = ({ result, onRetake, toast, setToast }) => {
    const navigate = useNavigate()

    // Prepare data for charts - use categories from result
    const personalityData = result.categories?.map((cat) => ({
        name: cat.categoryName,
        value: Math.round(cat.score) || 0,
        fullMark: 100
    })) || result.personalityTraits?.map((trait) => ({
        name: trait.trait || trait.name,
        value: trait.score || trait.value || 0,
        fullMark: 100
    })) || []

    const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

    // Use overAllTags as strengths
    const strengthsData = (result.overAllTags || result.strengths || []).slice(0, 6).map((tag, index) => ({
        name: tag,
        value: 100 - (index * 10)
    }))

    // Download PDF handler
    const handleDownloadPDF = () => {
        if (result.reportUrl) {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'
            const baseUrl = API_URL.replace('/api/v1', '')
            const downloadUrl = `${baseUrl}${result.reportUrl}`
            window.open(downloadUrl, '_blank')
        } else {
            setToast({
                show: true,
                message: 'PDF report not available',
                type: 'warning'
            })
        }
    }

    return (
        <>
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <div className="padding-10 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="padding-10 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="padding-10 text-2xl font-bold text-gray-900 mb-2">Assessment Results</h1>
                            <p className="padding-10 text-gray-600">Your personality profile and job recommendations</p>
                        </div>
                        <div className="padding-10 flex gap-3">
                            {result.reportUrl && (
                                <Button className='padding-10 ' variant="primary" onClick={handleDownloadPDF}>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </Button>
                            )}
                            <Button className='padding-10 ' variant="outline" onClick={onRetake}>
                                Retake Assessment
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Personality Type */}
                <motion.div
                    className='padding-10 '
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="padding-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <div className="text-center py-6">
                            <h2 className="padding-10 text-lg font-medium opacity-90 mb-2">Your Top Personality Traits</h2>
                            <p className="text-4xl font-bold mb-4">
                                {result.categories?.[0]?.categoryName || result.personalityType || 'Balanced'}
                            </p>
                            <p className="paddingy-10 text-white/80 max-w-md mx-auto">
                                {result.description || `Your dominant traits are ${result.categories?.map(c => c.categoryName).join(', ') || 'well-balanced across all dimensions'}.`}
                            </p>
                        </div>
                    </Card>
                </motion.div>

                <div className="padding-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart - Personality Traits */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className='padding-10 '>
                            <h3 className="font-semibold text-gray-900 mb-4">Personality Traits</h3>
                            {personalityData.length > 0 ? (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={personalityData}>
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis 
                                                dataKey="name" 
                                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                            />
                                            <PolarRadiusAxis 
                                                angle={30} 
                                                domain={[0, 100]} 
                                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                            />
                                            <Radar
                                                name="Score"
                                                dataKey="value"
                                                stroke="#6366f1"
                                                fill="#6366f1"
                                                fillOpacity={0.5}
                                            />
                                            <Tooltip />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-72 flex items-center justify-center text-gray-500">
                                    No trait data available
                                </div>
                            )}
                        </Card>
                    </motion.div>

                    {/* Pie Chart - Strengths Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <h3 className="padding-10 font-semibold text-gray-900 mb-4">Core Strengths</h3>
                            {strengthsData.length > 0 ? (
                                <div className="padding-10 h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={strengthsData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {strengthsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={36}
                                                formatter={(value) => <span className="text-gray-700">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-72 flex items-center justify-center text-gray-500">
                                    No strengths data available
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </div>

                {/* Recommended Career Paths */}
                <div className='flex' style={{flexDirection:"column", gap:"10px"}}>
                    <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className='padding-10 '>
                        <h3 className="padding-10 font-semibold text-gray-900 mb-4">Recommended Career Paths</h3>
                        <div className="padding-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(result.careerPaths || ['Software Engineer', 'Data Analyst', 'Product Manager']).map((career, index) => (
                                <motion.div
                                    key={career}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="padding-10 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium text-gray-900">{career}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <h3 className="padding-10 font-semibold text-gray-900 mb-4">Work Style Preferences</h3>
                        <div className="padding-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(result.workPreferences || [
                                { label: 'Environment', value: 'Quiet, focused workspace' },
                                { label: 'Team Size', value: 'Small teams (3-5 people)' },
                                { label: 'Communication', value: 'Written over verbal' },
                                { label: 'Work Style', value: 'Independent with check-ins' }
                            ]).map((pref, index) => (
                                <div key={index} className="padding-10 flex items-start gap-3">
                                    <div className="bg-indigo-600 rounded-full mt-2" />
                                    <div>
                                        <p className="font-medium text-gray-900">{pref.label}</p>
                                        <p className="text-gray-600">{pref.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
                </div>
                
                
                {/* Work Style Preferences */}
                

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="padding-10 text-center py-6"
                >
                    <Button className='padding-10 ' size="lg" onClick={() => navigate('/jobseeker/jobs')}>
                        View Matched Jobs
                    </Button>
                </motion.div>
            </div>
        </>
    )
}

export default Assessment
