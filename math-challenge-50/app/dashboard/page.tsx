'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { Lock, Trophy, Clock, LogOut, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'
import { isAdminEmail } from '@/lib/adminUtils'

interface UserProgress {
  level_1_unlocked: boolean
  level_2_unlocked: boolean
  level_3_unlocked: boolean
  level_4_unlocked: boolean
  best_time_level_1: number | null
  best_time_level_2: number | null
  best_time_level_3: number | null
  best_time_level_4: number | null
}

interface Profile {
  name: string
  grade: number
  class_name: string
}

const levels = [
  { id: 1, name: 'Novice', description: '足し算のみ (1桁 + 1桁)', color: 'bg-green-500' },
  { id: 2, name: 'Normal', description: '引き算あり', color: 'bg-blue-500' },
  { id: 3, name: 'Hard', description: '掛け算 (九九)', color: 'bg-yellow-500' },
  { id: 4, name: 'Master', description: 'ランダムミックス + タイムアタック', color: 'bg-red-500' },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Check if user is admin
      setIsAdmin(isAdminEmail(user.email))

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, grade, class_name')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({
          name: profileData.full_name,
          grade: profileData.grade,
          class_name: profileData.class_name,
        })
      }

      // Load progress from game_results
      // Check which levels are unlocked (score = 50 means completed)
      const { data: completedLevels } = await supabase
        .from('game_results')
        .select('level')
        .eq('user_id', user.id)
        .eq('score', 50)

      const completedLevelSet = new Set(completedLevels?.map(r => r.level) || [])
      
      // Get best times for each level
      const { data: bestTimes } = await supabase
        .from('game_results')
        .select('level, time_seconds')
        .eq('user_id', user.id)
        .eq('score', 50)
        .order('time_seconds', { ascending: true })

      const bestTimeMap = new Map<number, number>()
      bestTimes?.forEach(result => {
        if (!bestTimeMap.has(result.level) || bestTimeMap.get(result.level)! > result.time_seconds) {
          bestTimeMap.set(result.level, result.time_seconds)
        }
      })

      // Set progress based on completed levels
      setProgress({
        level_1_unlocked: true, // Level 1 is always unlocked
        level_2_unlocked: completedLevelSet.has(1),
        level_3_unlocked: completedLevelSet.has(2),
        level_4_unlocked: completedLevelSet.has(3),
        best_time_level_1: bestTimeMap.get(1) || null,
        best_time_level_2: bestTimeMap.get(2) || null,
        best_time_level_3: bestTimeMap.get(3) || null,
        best_time_level_4: bestTimeMap.get(4) || null,
      })

      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getBestTime = (level: number): number | null => {
    if (!progress) return null
    switch (level) {
      case 1: return progress.best_time_level_1
      case 2: return progress.best_time_level_2
      case 3: return progress.best_time_level_3
      case 4: return progress.best_time_level_4
      default: return null
    }
  }

  const isUnlocked = (level: number): boolean => {
    if (!progress) return level === 1
    switch (level) {
      case 1: return progress.level_1_unlocked
      case 2: return progress.level_2_unlocked
      case 3: return progress.level_3_unlocked
      case 4: return progress.level_4_unlocked
      default: return false
    }
  }

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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              こんにちは、{profile?.name}さん！
            </h1>
            <p className="text-white/90 text-lg">
              {profile?.grade}年生 {profile?.class_name}組
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/results"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              成績を見る
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-all font-semibold"
              >
                <Settings className="w-5 h-5" />
                管理画面
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              ログアウト
            </button>
          </div>
        </motion.div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {levels.map((level, index) => {
            const unlocked = isUnlocked(level.id)
            const bestTime = getBestTime(level.id)

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${level.color} rounded-2xl p-6 shadow-2xl ${
                  unlocked ? 'cursor-pointer hover:scale-105' : 'opacity-60 cursor-not-allowed'
                } transition-all`}
              >
                {unlocked ? (
                  <Link href={`/play/${level.id}`}>
                    <div className="text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-3xl font-bold">Level {level.id}</h2>
                        <Trophy className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
                      <p className="mb-4 opacity-90">{level.description}</p>
                      {bestTime !== null && (
                        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-3">
                          <Clock className="w-5 h-5" />
                          <span className="font-bold">ベストタイム: {formatTime(bestTime)}</span>
                        </div>
                      )}
                      <div className="mt-4 text-center bg-white/20 rounded-lg py-2 font-bold">
                        プレイする →
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-bold">Level {level.id}</h2>
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
                    <p className="mb-4 opacity-90">{level.description}</p>
                    <div className="text-center bg-white/20 rounded-lg py-2 font-bold">
                      前のレベルをクリアして解除
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
