import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'

const Captcha = forwardRef(function Captcha({ onVerify, onExpire, onError }, ref) {
    const [num1, setNum1] = useState(0)
    const [num2, setNum2] = useState(0)
    const [operator, setOperator] = useState('+')
    const [userAnswer, setUserAnswer] = useState('')
    const [isVerified, setIsVerified] = useState(false)
    const [error, setError] = useState('')
    const initialized = useRef(false)
    
    // Store callbacks in refs to avoid re-renders
    const onVerifyRef = useRef(onVerify)
    const onExpireRef = useRef(onExpire)
    const onErrorRef = useRef(onError)
    
    useEffect(() => {
        onVerifyRef.current = onVerify
        onExpireRef.current = onExpire
        onErrorRef.current = onError
    }, [onVerify, onExpire, onError])

    const generateChallenge = () => {
        const operators = ['+', '-', '×']
        const op = operators[Math.floor(Math.random() * operators.length)]
        let n1, n2

        if (op === '×') {
            n1 = Math.floor(Math.random() * 10) + 1 // 1-10
            n2 = Math.floor(Math.random() * 10) + 1 // 1-10
        } else if (op === '-') {
            n1 = Math.floor(Math.random() * 20) + 10 // 10-29
            n2 = Math.floor(Math.random() * 10) + 1  // 1-10 (ensure positive result)
        } else {
            n1 = Math.floor(Math.random() * 20) + 1 // 1-20
            n2 = Math.floor(Math.random() * 20) + 1 // 1-20
        }

        setNum1(n1)
        setNum2(n2)
        setOperator(op)
        setUserAnswer('')
        setIsVerified(false)
        setError('')
    }

    // Initialize only once on mount
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            generateChallenge()
        }
    }, [])

    useImperativeHandle(ref, () => ({
        reset: () => {
            generateChallenge()
            if (onExpireRef.current) onExpireRef.current()
        },
        getValue: () => {
            return isVerified ? 'math-captcha-verified' : null
        }
    }))

    const calculateAnswer = () => {
        switch (operator) {
            case '+': return num1 + num2
            case '-': return num1 - num2
            case '×': return num1 * num2
            default: return 0
        }
    }

    const handleVerify = () => {
        const correctAnswer = calculateAnswer()
        const userNum = parseInt(userAnswer, 10)

        if (isNaN(userNum)) {
            setError('Please enter a number')
            if (onErrorRef.current) onErrorRef.current()
            return
        }

        if (userNum === correctAnswer) {
            setIsVerified(true)
            setError('')
            if (onVerifyRef.current) onVerifyRef.current('math-captcha-verified')
        } else {
            setError('Incorrect answer. Try again!')
            setUserAnswer('')
            generateChallenge()
            if (onErrorRef.current) onErrorRef.current()
        }
    }

    const handleRefresh = () => {
        generateChallenge()
        if (onExpireRef.current) onExpireRef.current()
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleVerify()
        }
    }

    return (
        <div className="my-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="  text-sm font-medium text-indigo-800">Security Verification</span>
                </div>

                {isVerified ? (
                    <div className="flex items-center gap-2 py-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-green-700 font-medium">Verified!</span>
                    </div>
                ) : (
                    <>
                        <div className="  flex items-center gap-3 mb-3">
                            <div className="  bg-white px-4 py-3 rounded-lg border border-indigo-200 shadow-inner">
                                <span className="text-2xl font-bold text-gray-800">
                                    {num1} {operator} {num2} = ?
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Get new challenge"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        <div className="  flex gap-2">
                            <input
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Your answer"
                                className="  flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
                            />
                            <button
                                type="button"
                                onClick={handleVerify}
                                className="  my-6 mx-8 px-8 py-6 bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 transition-colors font-small"
                            >
                                Verify
                            </button>
                        </div>

                        {error && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    )
})

export default Captcha
