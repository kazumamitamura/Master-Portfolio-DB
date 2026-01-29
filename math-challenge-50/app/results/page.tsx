'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { Trophy, Clock, Target, TrendingUp, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'

interface GameResult {
  id: string
  level: number
  score: number
  time_seconds: number
  mistakes: number
  created_at: string
}

interface LevelStats {
  level: number
  name: string
  color: string
  totalAttempts: number
  bestTime: number | null
  bestScore: number
  recentResults: GameResult[]
  improvement: number | null // Percentage improvement
}

const levels = [
  { id: 1, name: 'Novice', description: '足し算のみ', color: 'from-green-400 to-green-600' },
  { id: 2, name: 'Normal', description: '引き算あり', color: 'from-blue-400 to-blue-600' },
  { id: 3, name: 'Hard', description: '掛け算 (九九)', color: 'from-yellow-400 to-yellow-600' },
  { id: 4, name: 'Master', description: 'ランダムミックス', color: 'from-red-400 to-red-600' },
]

interface Profile {
  name: string
  grade: number
  class_name: string
}

export default function ResultsPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [levelStats, setLevelStats] = useState<LevelStats[]>([])
  const [totalGames, setTotalGames] = useState(0)
  const [perfectScores, setPerfectScores] = useState(0)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const loadResults = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, name, grade, class_name')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.full_name || profileData.name || 'ユーザー',
          grade: profileData.grade || 0,
          class_name: profileData.class_name || 'A',
        })
      }

      const { data: results, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading results:', error)
        setLoading(false)
        return
      }

      setTotalGames(results?.length || 0)
      setPerfectScores(results?.filter(r => r.score === 50).length || 0)

      // Calculate stats for each level
      const stats: LevelStats[] = levels.map(level => {
        const levelResults = results?.filter(r => r.level === level.id) || []
        const perfectResults = levelResults.filter(r => r.score === 50)
        const bestTime = perfectResults.length > 0
          ? Math.min(...perfectResults.map(r => r.time_seconds))
          : null
        const bestScore = levelResults.length > 0
          ? Math.max(...levelResults.map(r => r.score))
          : 0

        // Calculate improvement (compare last 5 vs previous 5)
        let improvement: number | null = null
        if (levelResults.length >= 10) {
          const recent5 = levelResults.slice(0, 5)
          const previous5 = levelResults.slice(5, 10)
          const recentAvg = recent5.reduce((sum, r) => sum + r.score, 0) / 5
          const previousAvg = previous5.reduce((sum, r) => sum + r.score, 0) / 5
          if (previousAvg > 0) {
            improvement = ((recentAvg - previousAvg) / previousAvg) * 100
          }
        }

        return {
          level: level.id,
          name: level.name,
          color: level.color,
          totalAttempts: levelResults.length,
          bestTime,
          bestScore,
          recentResults: levelResults.slice(0, 10),
          improvement,
        }
      })

      setLevelStats(stats)
      setLoading(false)
    }

    loadResults()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              ダッシュボードに戻る
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              あなたの成績
            </h1>
            <p className="text-white/90 text-lg mb-2">
              これまでの挑戦を振り返ろう！
            </p>
            {profile && (
              <p className="text-black text-base md:text-lg font-semibold bg-white/30 rounded-lg px-4 py-2 inline-block">
                {profile.grade}年生 {profile.class_name}組
              </p>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/20 backdrop-blur rounded-2xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8" />
              <h3 className="text-xl font-bold">総挑戦回数</h3>
            </div>
            <p className="text-4xl font-bold">{totalGames}</p>
            <p className="text-sm opacity-80 mt-1">回</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur rounded-2xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <h3 className="text-xl font-bold">完全クリア</h3>
            </div>
            <p className="text-4xl font-bold">{perfectScores}</p>
            <p className="text-sm opacity-80 mt-1">回</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur rounded-2xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-8 h-8" />
              <h3 className="text-xl font-bold">達成率</h3>
            </div>
            <p className="text-4xl font-bold">
              {totalGames > 0 ? Math.round((perfectScores / totalGames) * 100) : 0}%
            </p>
            <p className="text-sm opacity-80 mt-1">完全クリア率</p>
          </motion.div>
        </div>

        {/* Level Stats */}
        <div className="space-y-6">
          {levelStats.map((stat, index) => (
            <motion.div
              key={stat.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    Level {stat.level} - {stat.name}
                  </h2>
                  <p className="text-white/90">
                    {levels.find(l => l.id === stat.level)?.description}
                  </p>
                </div>
                {stat.improvement !== null && stat.improvement > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                    <TrendingUp className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">
                      +{stat.improvement.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-white" />
                    <span className="text-white/90 text-sm">挑戦回数</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.totalAttempts}</p>
                </div>

                {stat.bestTime !== null ? (
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="text-white/90 text-sm">ベストタイム</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatTime(stat.bestTime)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="text-white/90 text-sm">ベストタイム</span>
                    </div>
                    <p className="text-lg text-white/70">まだ記録なし</p>
                  </div>
                )}

                <div className="bg-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-white" />
                    <span className="text-white/90 text-sm">最高スコア</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stat.bestScore} / 50
                  </p>
                </div>
              </div>

              {stat.recentResults.length > 0 && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-bold mb-3">最近の挑戦</h3>
                  <div className="space-y-2">
                    {stat.recentResults.slice(0, 5).map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-white/80 text-sm">
                            {new Date(result.created_at).toLocaleDateString('ja-JP')}
                          </span>
                          <span
                            className={`font-bold ${
                              result.score === 50 ? 'text-yellow-300' : 'text-white'
                            }`}
                          >
                            {result.score} / 50
                          </span>
                          {result.score === 50 && (
                            <span className="text-white/80 text-sm">
                              {formatTime(result.time_seconds)}
                            </span>
                          )}
                        </div>
                        {result.mistakes > 0 && (
                          <span className="text-red-200 text-sm">
                            間違い: {result.mistakes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stat.totalAttempts === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/80 text-lg mb-4">
                    まだ挑戦していません
                  </p>
                  <Link
                    href={`/play/${stat.level}`}
                    className="inline-block bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-lg transition-all"
                  >
                    挑戦する →
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
