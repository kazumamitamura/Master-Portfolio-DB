'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { Download, LogOut, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'
import { formatTime } from '@/lib/utils'

interface GameResult {
  id: string
  user_id: string
  level: number
  score: number
  time_seconds: number
  mistakes: number
  created_at: string
  profile: {
    full_name: string
    grade: number
    class_name: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<GameResult[]>([])
  const [filteredResults, setFilteredResults] = useState<GameResult[]>([])
  const [filters, setFilters] = useState({
    grade: '',
    className: '',
    level: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Check if user is admin (you can implement your own admin check logic)
      // For now, we'll check if email contains 'admin' or 'teacher'
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'teacher') {
        setIsAdmin(true)
        loadResults()
      } else {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router, supabase])

  const loadResults = async () => {
    try {
      const response = await fetch('/api/admin/results')
      if (!response.ok) throw new Error('Failed to load results')
      
      const { results: data } = await response.json()
      setResults(data)
      setFilteredResults(data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading results:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = [...results]

    if (filters.grade) {
      filtered = filtered.filter(r => r.profile.grade === parseInt(filters.grade))
    }

    if (filters.className) {
      filtered = filtered.filter(r => r.profile.class_name === filters.className)
    }

    if (filters.level) {
      filtered = filtered.filter(r => r.level === parseInt(filters.level))
    }

    setFilteredResults(filtered)
  }, [filters, results])

  const handleExportExcel = () => {
    const exportData = filteredResults.map(result => ({
      日時: new Date(result.created_at).toLocaleString('ja-JP'),
      名前: result.profile.full_name,
      学年: result.profile.grade,
      クラス: result.profile.class_name,
      レベル: result.level,
      スコア: result.score,
      間違い: result.mistakes,
      タイム: formatTime(result.time_seconds),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'ゲーム結果')

    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // 日時
      { wch: 15 }, // 名前
      { wch: 8 },  // 学年
      { wch: 8 },  // クラス
      { wch: 8 },  // レベル
      { wch: 8 },  // スコア
      { wch: 10 }, // 正解数
      { wch: 10 }, // 不正解数
      { wch: 12 }, // タイム
    ]
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `math-challenge-50-results-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">読み込み中...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            管理画面
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            ログアウト
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">フィルター</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">学年</label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">全て</option>
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g.toString()}>
                    {g}年生
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">クラス</label>
              <select
                value={filters.className}
                onChange={(e) => setFilters({ ...filters, className: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">全て</option>
                {['A', 'B', 'C', 'D', 'E'].map((c) => (
                  <option key={c} value={c}>
                    {c}組
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">レベル</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">全て</option>
                {[1, 2, 3, 4].map((l) => (
                  <option key={l} value={l.toString()}>
                    Level {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExportExcel}
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Excelダウンロード
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">日時</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">名前</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">学年</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">クラス</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">レベル</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">スコア</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">正解数</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">不正解数</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">タイム</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      結果がありません
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(result.created_at).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {result.profile.full_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {result.profile.grade}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {result.profile.class_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Level {result.level}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {result.score} / 50
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">
                        {result.correct_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 font-medium">
                        {result.incorrect_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatTime(result.time_seconds)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-700">
            表示件数: {filteredResults.length} / {results.length}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
