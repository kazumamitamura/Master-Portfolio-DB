'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { generateRowValues, generateColValues, generateQuestions, calculateAnswer } from '@/lib/gameLogic'
import { formatTime, calculateProgress } from '@/lib/utils'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function PlayPage() {
  const router = useRouter()
  const params = useParams()
  const level = parseInt(params.level as string)
  const supabase = createSupabaseClient()

  const [rowValues, setRowValues] = useState<number[]>([])
  const [colValues, setColValues] = useState<number[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>(Array(50).fill(null))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showNewRecord, setShowNewRecord] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
    }
    checkAuth()

    // Initialize game
    const rows = generateRowValues(level)
    const cols = generateColValues(level, rows)
    const qs = generateQuestions(level)

    setRowValues(rows)
    setColValues(cols)
    setQuestions(qs)
    setStartTime(Date.now())

    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [level, router, supabase])

  useEffect(() => {
    if (startTime && !isComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [startTime, isComplete])

  const handleAnswerChange = (index: number, value: string) => {
    const numValue = value === '' ? null : parseInt(value)
    if (numValue !== null && isNaN(numValue)) return

    const newAnswers = [...answers]
    const oldValue = newAnswers[index]
    newAnswers[index] = numValue
    setAnswers(newAnswers)

    // Recalculate correct count
    let correct = 0
    newAnswers.forEach((answer, idx) => {
      if (answer !== null) {
        const q = questions[idx]
        const correctAnswer = calculateAnswer(rowValues[q.row], colValues[q.col], q)
        if (answer === correctAnswer) {
          correct++
        }
      }
    })
    setCorrectCount(correct)

    // Auto-focus next input
    if (index < 49 && value !== '') {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus()
      }, 50)
    }

    // Check completion
    if (newAnswers.every((a) => a !== null)) {
      checkCompletion(newAnswers)
    }
  }

  const checkCompletion = async (finalAnswers: (number | null)[]) => {
    let correct = 0
    let incorrect = 0

    questions.forEach((question, index) => {
      const answer = finalAnswers[index]
      if (answer !== null) {
        const correctAnswer = calculateAnswer(rowValues[question.row], colValues[question.col], question)
        if (answer === correctAnswer) {
          correct++
        } else {
          incorrect++
        }
      }
    })

    setCorrectCount(correct)
    setIsComplete(true)

    const timeSeconds = Math.floor((Date.now() - (startTime || 0)) / 1000)

    // Check if perfect score for celebration
    const { data: { user } } = await supabase.auth.getUser()
    if (user && correct === 50) {
      // Check if this is a new best time
      const { data: bestResult } = await supabase
        .from('game_results')
        .select('time_seconds')
        .eq('user_id', user.id)
        .eq('level', level)
        .eq('score', 50)
        .order('time_seconds', { ascending: true })
        .limit(1)
        .single()

      if (!bestResult || timeSeconds < bestResult.time_seconds) {
        setShowNewRecord(true)
        // Confetti celebration for new record
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } else {
        // Confetti for perfect score
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 }
        })
      }

      // Save result
      await supabase.from('game_results').insert({
        user_id: user.id,
        level,
        score: correct,
        time_seconds: timeSeconds,
        mistakes: incorrect,
      })
    }
  }

  const getCellAnswer = (row: number, col: number): number | null => {
    const index = row * 5 + col
    return answers[index]
  }

  const isCellCorrect = (row: number, col: number): boolean | null => {
    if (!isComplete) return null
    const index = row * 5 + col
    const answer = answers[index]
    if (answer === null) return null
    const question = questions[index]
    const correctAnswer = calculateAnswer(rowValues[question.row], colValues[question.col], question)
    return answer === correctAnswer
  }

  const getOperationSymbol = (question: any): string => {
    switch (question.operation) {
      case '+': return '+'
      case '-': return '-'
      case '*': return '×'
      default: return '?'
    }
  }

  if (rowValues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-white hover:text-yellow-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              ダッシュボードに戻る
            </button>
          </Link>
          <div className="text-white text-2xl font-bold">
            Level {level}
          </div>
        </div>

        {/* Timer and Progress */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-4xl font-bold">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-white text-xl">
              正解: {correctCount} / 50
            </div>
          </div>
          <motion.div
            className="h-4 bg-white/30 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress(correctCount)}%` }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>

        {/* New Record Banner */}
        <AnimatePresence>
          {showNewRecord && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-yellow-400 text-red-600 text-center py-4 rounded-2xl mb-6 font-bold text-2xl shadow-2xl"
            >
              🎉 New Record! 🎉
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          {/* Operation indicator */}
          <div className="mb-4 text-center">
            <span className="text-2xl font-bold text-gray-700">
              {level === 1 ? '足し算 (+)' :
               level === 2 ? '引き算 (-)' :
               level === 3 ? '掛け算 (×)' :
               'ミックス (+ - ×)'}
            </span>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-20 h-16 border-2 border-gray-300 bg-gray-100 font-bold text-lg"></th>
                {colValues.map((val, col) => (
                  <th key={col} className="w-20 h-16 border-2 border-gray-300 bg-blue-100 font-bold text-lg">
                    {val}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowValues.map((rowVal, row) => (
                <tr key={row}>
                  <td className="w-20 h-16 border-2 border-gray-300 bg-blue-100 font-bold text-lg text-center">
                    {rowVal}
                  </td>
                  {colValues.map((colVal, col) => {
                    const index = row * 5 + col
                    const question = questions[index]
                    const isCorrect = isCellCorrect(row, col)
                    const operation = getOperationSymbol(question)

                    return (
                      <td
                        key={col}
                        className={`w-20 h-16 border-2 border-gray-300 ${
                          isCorrect === true ? 'bg-green-200' :
                          isCorrect === false ? 'bg-red-200' :
                          'bg-white'
                        }`}
                      >
                        {isComplete ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-lg font-semibold">
                              {answers[index] !== null ? answers[index] : '-'}
                            </span>
                            {isCorrect === false && (
                              <span className="text-xs text-red-600 ml-1">
                                ({calculateAnswer(rowVal, colVal, question)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <input
                            ref={(el) => { inputRefs.current[index] = el }}
                            type="number"
                            value={answers[index] ?? ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className="w-full h-full text-center text-lg font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            disabled={isComplete}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-white rounded-2xl p-6 text-center"
          >
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">
              {correctCount === 50 ? '完璧！🎉' : 'お疲れ様でした！'}
            </h2>
            <p className="text-xl mb-4">
              正解数: {correctCount} / 50
            </p>
            <p className="text-lg mb-6">
              タイム: {formatTime(elapsedTime)}
            </p>
            <Link href="/dashboard">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                ダッシュボードに戻る
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
