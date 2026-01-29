'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { generateRowValues, generateColValues, generateQuestions, calculateAnswer } from '@/lib/gameLogic'
import { formatTime, calculateProgress } from '@/lib/utils'
import { ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function PlayPageContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const level = parseInt(params.level as string)
  const cellCountParam = searchParams.get('cells')
  const cellCount = cellCountParam ? parseInt(cellCountParam) : 50
  const supabase = createSupabaseClient()

  const [rowValues, setRowValues] = useState<number[]>([])
  const [colValues, setColValues] = useState<number[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<(number | null)[]>(Array(cellCount).fill(null))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showNewRecord, setShowNewRecord] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
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

    // Initialize game with custom cell count
    const qs = generateQuestions(level, cellCount)
    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(cellCount))
    const rows = Math.ceil(cellCount / cols)
    
    const generatedRows = generateRowValues(level, rows)
    const generatedCols = generateColValues(level, cols, generatedRows)

    setRowValues(generatedRows)
    setColValues(generatedCols)
    setQuestions(qs)
    setAnswers(Array(cellCount).fill(null))
    setStartTime(Date.now())

    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 100)
  }, [level, cellCount, router, supabase])

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

    // Don't auto-complete - user must click finish button
    // This allows multi-digit input in the last cell
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const cols = Math.ceil(Math.sqrt(cellCount))
    const maxIndex = cellCount - 1
    
    // Enter or Tab: move to next field
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      if (index < maxIndex) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus()
        }, 10)
      }
    }
    // Arrow keys: navigate
    else if (e.key === 'ArrowRight' && index < maxIndex) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
    else if (e.key === 'ArrowDown' && index < maxIndex - cols + 1) {
      e.preventDefault()
      const nextIndex = Math.min(index + cols, maxIndex)
      inputRefs.current[nextIndex]?.focus()
    }
    else if (e.key === 'ArrowUp' && index >= cols) {
      e.preventDefault()
      inputRefs.current[index - cols]?.focus()
    }
  }

  const handleBlur = (index: number) => {
    const maxIndex = cellCount - 1
    // When field loses focus, move to next if current field has a value
    if (index < maxIndex && answers[index] !== null && answers[index] !== undefined) {
      // Small delay to allow for potential click on next field
      setTimeout(() => {
        // Only move if next field is empty and current field has value
        if (answers[index + 1] === null || answers[index + 1] === undefined) {
          inputRefs.current[index + 1]?.focus()
        }
      }, 200)
    }
  }

  const handleFinish = async () => {
    // Check if all cells are filled
    const allFilled = answers.every((a) => a !== null)
    if (!allFilled) {
      alert('すべてのマスに入力してください。')
      return
    }

    setIsSaving(true)
    await checkCompletion(answers)
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
      if (correct === cellCount) {
        const { data: bestResult } = await supabase
          .from('game_results')
          .select('time_seconds')
          .eq('user_id', user.id)
          .eq('level', level)
          .eq('score', cellCount)
          .eq('cell_count', cellCount)
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
      } else if (correct >= cellCount * 0.8) {
        // Confetti for good score (80% or more)
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { y: 0.6 }
        })
      }

      // Save result (all scores)
      // Note: Using 'mistakes' instead of 'incorrect_count' to match schema
      try {
        const { data, error: insertError } = await supabase.from('game_results').insert({
          user_id: user.id,
          level,
          score: correct,
          time_seconds: timeSeconds,
          mistakes: incorrect,
          cell_count: cellCount,
        }).select()

        if (insertError) {
          console.error('Error saving result:', insertError)
          console.error('Error details:', JSON.stringify(insertError, null, 2))
          alert(`成績の保存に失敗しました: ${insertError.message}\nもう一度お試しください。`)
          setIsSaving(false)
          setIsComplete(false) // Allow retry
          return
        } else {
          console.log('Result saved successfully:', { 
            id: data?.[0]?.id,
            user_id: user.id,
            level,
            score: correct,
            time_seconds: timeSeconds,
            mistakes: incorrect 
          })
          // Show success message briefly
          setTimeout(() => {
            console.log('Score recorded in database')
          }, 100)
        }
      } catch (err) {
        console.error('Unexpected error saving result:', err)
        alert('予期しないエラーが発生しました。もう一度お試しください。')
        setIsSaving(false)
        setIsComplete(false) // Allow retry
        return
      }
    } else {
      console.warn('No user found, cannot save result')
    }
    setIsSaving(false)
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
              正解: {correctCount} / {cellCount}
            </div>
          </div>
          <motion.div
            className="h-4 bg-white/30 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress(correctCount, cellCount)}%` }}
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
              {rowValues.map((rowVal, row) => {
                const cols = Math.ceil(Math.sqrt(cellCount))
                return (
                  <tr key={row}>
                    <td className="w-12 md:w-20 h-12 md:h-16 border-2 border-gray-300 bg-blue-100 font-bold text-sm md:text-lg text-center text-black">
                      {rowVal}
                    </td>
                    {colValues.map((colVal, col) => {
                      const index = row * cols + col
                      if (index >= cellCount) return null
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
                              // Allow multi-digit numbers (up to 3 digits should be enough)
                              if (value === '' || (parseInt(value) >= 0 && value.length <= 3)) {
                                handleAnswerChange(index, value)
                              }
                            }}
                            onKeyDown={(e) => {
                              // Prevent Enter key from submitting on last cell
                              if (index === cellCount - 1 && e.key === 'Enter') {
                                e.preventDefault()
                                // Don't auto-submit, let user click finish button
                                return
                              }
                              handleKeyDown(index, e)
                            }}
                            onBlur={() => handleBlur(index)}
                            className="w-full h-full text-center text-sm md:text-lg font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black touch-manipulation"
                            disabled={isComplete || isSaving}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                          />
                        )}
                      </td>
                    )
                      })}
                    </tr>
                  )
                })}
            </tbody>
          </table>
          
          {/* Finish Button */}
          {!isComplete && (
            <div className="mt-6 text-center">
              <button
                onClick={handleFinish}
                disabled={isSaving || !answers.every((a) => a !== null)}
                className={`px-8 py-4 rounded-lg font-bold text-lg md:text-xl transition-all touch-manipulation ${
                  answers.every((a) => a !== null) && !isSaving
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? '保存中...' : '終了して結果を見る'}
              </button>
              {!answers.every((a) => a !== null) && (
                <p className="text-sm text-gray-600 mt-2">
                  すべてのマスに入力してください
                </p>
              )}
            </div>
          )}
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
              正解数: {correctCount} / {cellCount}
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

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">読み込み中...</div>
      </div>
    }>
      <PlayPageContent />
    </Suspense>
  )
}
