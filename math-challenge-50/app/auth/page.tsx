'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    grade: '1',
    className: 'A',
    email: '',
    password: '',
  })
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  // 管理者メールアドレスかどうかをチェック
  const isAdminEmail = (email: string) => {
    const adminEmails = ['mitamuraka@haguroko.ed.jp', 'katoyu@haguroko.ed.jp']
    return adminEmails.includes(email.toLowerCase().trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        if (data.user) {
          router.push('/dashboard')
        }
      } else {
        // Sign up - 管理者メールアドレスは登録不可（管理者専用ページを使用）
        if (isAdminEmail(formData.email)) {
          throw new Error('管理者の方は管理者専用ページから登録してください。')
        }

        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (authError) throw authError

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              full_name: formData.name,
              grade: parseInt(formData.grade),
              class_name: formData.className,
              role: 'student', // デフォルトでstudent
            })

          if (profileError) throw profileError

          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      // エラーメッセージを日本語で分かりやすく表示
      let errorMessage = 'エラーが発生しました'
      
      if (err.message) {
        if (err.message.includes('already registered') || err.message.includes('already exists')) {
          errorMessage = 'このメールアドレスは既に登録されています。ログインしてください。'
        } else if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが正しくありません。'
        } else if (err.message.includes('Password')) {
          errorMessage = 'パスワードは6文字以上である必要があります。'
        } else if (err.message.includes('Email')) {
          errorMessage = '有効なメールアドレスを入力してください。'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full"
      >
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </Link>

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {isLogin ? 'ログイン' : '新規登録'}
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="山田 太郎"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    学年
                  </label>
                  <select
                    required
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    {[1, 2, 3].map((g) => (
                      <option key={g} value={g.toString()}>
                        {g}学年
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    クラス
                  </label>
                  <select
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    {['LIA', 'LIB', 'L', 'I', 'CA', 'CB', 'CC', 'CD', 'E', 'M', 'A'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : isLogin ? 'ログイン' : '登録する'}
          </motion.button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {isLogin && (
            <p className="text-sm text-gray-600 mb-2">
              新規登録は管理者にご連絡ください。
            </p>
          )}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isLogin ? '登録について' : 'ログインはこちら'}
          </button>
          {!isLogin && (
            <p className="text-sm text-gray-600 mt-2">
              生徒の新規登録は管理者がCSVファイルで一括登録します。
              <br />
              登録が必要な場合は、先生にご連絡ください。
            </p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <Link href="/admin/auth" className="text-sm text-gray-600 hover:text-gray-900">
            管理者・教員の方はこちら →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
