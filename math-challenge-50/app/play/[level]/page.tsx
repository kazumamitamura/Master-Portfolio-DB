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
    // Allow empty string or valid number (including multi-digit)
    const numValue = value === '' ? null : parseInt(value)
    if (value !== '' && (numValue === null || isNaN(numValue) || numValue < 0)) return

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

    // Check completion
    if (newAnswers.every((a) => a !== null)) {
      checkCompletion(newAnswers)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter or Tab: move to next field
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (index < 49) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus()
        }, 10)
      }
    }
    // Arrow keys: navigate
    else if (e.key === 'ArrowRight' && index < 49) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
    else if (e.key === 'ArrowDown' && index < 45) {
      e.preventDefault()
      inputRefs.current[index + 5]?.focus()
    }
    else if (e.key === 'ArrowUp' && index >= 5) {
      e.preventDefault()
      inputRefs.current[index - 5]?.focus()
    }
  }

  const handleBlur = (index: number) => {
    // When field loses focus, move to next if current field has a value
    if (index < 49 && answers[index] !== null && answers[index] !== undefined) {
      // Small delay to allow for potential click on next field
      setTimeout(() => {
        // Only move if next field is empty and current field has value
        if (answers[index + 1] === null || answers[index + 1] === undefined) {
          inputRefs.current[index + 1]?.focus()
        }
      }, 200)
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

    // Save result (always save, not just for perfect score)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Check if this is a new best time (for perfect score)
      if (correct === 50) {
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
      } else if (correct >= 40) {
        // Confetti for good score (80% or more)
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.6 }
        })
      }

      // Save result (all scores)
      // Note: Using 'mistakes' instead of 'incorrect_count' to match schema
      const { error: insertError } = await supabase.from('game_results').insert({
        user_id: user.id,
        level,
        score: correct,
        time_seconds: timeSeconds,
        mistakes: incorrect,
      })

      if (insertError) {
        console.error('Error saving result:', insertError)
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-white hover:text-yellow-200 transition-colors text-sm md:text-base">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              ダッシュボードへ移動
            </button>
          </Link>
          <div className="text-white text-xl md:text-2xl font-bold">
            Level {level}
          </div>
        </div>

        {/* Timer and Progress */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <div className="text-white text-2xl md:text-4xl font-bold">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-white text-base md:text-xl">
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
        <div className="bg-white rounded-2xl p-2 md:p-6 shadow-2xl overflow-x-auto">
          {/* Operation indicator with instructions */}
          <div className="mb-4 md:mb-6 text-center">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 md:p-6 mb-4">
              <h2 className="text-2xl md:text-4xl font-bold text-blue-900 mb-2">
                {level === 1 ? '足し算をしましょう！' :
                 level === 2 ? '引き算をしましょう！' :
                 level === 3 ? '掛け算をしましょう！' :
                 'ミックス計算をしましょう！'}
              </h2>
              <p className="text-lg md:text-2xl text-blue-700 font-semibold">
                {level === 1 ? '縦の数字と横の数字を足し算して答えを入力してください' :
                 level === 2 ? '縦の数字から横の数字を引き算して答えを入力してください' :
                 level === 3 ? '縦の数字と横の数字を掛け算して答えを入力してください' :
                 '縦の数字と横の数字で計算して答えを入力してください'}
              </p>
            </div>
            <span className="text-lg md:text-2xl font-bold text-gray-700">
              {level === 1 ? '足し算 (+)' :
               level === 2 ? '引き算 (-)' :
               level === 3 ? '掛け算 (×)' :
               'ミックス (+ - ×)'}
            </span>
          </div>
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="w-12 md:w-20 h-12 md:h-16 border-2 border-gray-300 bg-gray-100 font-bold text-sm md:text-lg"></th>
                {colValues.map((val, col) => (
                  <th key={col} className="w-12 md:w-20 h-12 md:h-16 border-2 border-gray-300 bg-blue-100 font-bold text-sm md:text-lg text-black">
                    {val}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowValues.map((rowVal, row) => (
                <tr key={row}>
                  <td className="w-12 md:w-20 h-12 md:h-16 border-2 border-gray-300 bg-blue-100 font-bold text-sm md:text-lg text-center text-black">
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
                        className={`w-12 md:w-20 h-12 md:h-16 border-2 border-gray-300 ${
                          isCorrect === true ? 'bg-green-200' :
                          isCorrect === false ? 'bg-red-200' :
                          'bg-white'
                        }`}
                      >
                        {isComplete ? (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-sm md:text-lg font-semibold">
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
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={answers[index] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '')
                              if (value === '' || parseInt(value) >= 0) {
                                handleAnswerChange(index, value)
                              }
                            }}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onBlur={() => handleBlur(index)}
                            className="w-full h-full text-center text-sm md:text-lg font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black touch-manipulation"
                            disabled={isComplete}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
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
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg transition-colors text-sm md:text-base touch-manipulation">
                ダッシュボードへ移動
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
