'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, Shield, Mail, Lock } from 'lucide-react'
import { isAdminEmail } from '@/lib/adminUtils'

export default function AdminAuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        if (data.user) {
          // 管理者かどうか確認
          if (isAdminEmail(data.user.email)) {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      } else {
        // Sign up - 管理者メールアドレスのみ許可
        if (!isAdminEmail(formData.email)) {
          throw new Error('管理者メールアドレスでのみ登録できます。')
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('パスワードが一致しません。')
        }

        if (formData.password.length < 6) {
          throw new Error('パスワードは6文字以上である必要があります。')
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })

        if (authError) throw authError

        if (authData.user) {
          // Create profile with teacher role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              full_name: formData.name,
              grade: 0, // 管理者は学年なし
              class_name: 'ADMIN', // 管理者はクラスなし
              role: 'teacher',
            })

          if (profileError) {
            // プロファイルが既に存在する場合（メールアドレスが既に登録されている場合）
            if (profileError.code === '23505') {
              setSuccess('このメールアドレスは既に登録されています。ログインしてください。')
              setIsLogin(true)
            } else {
              throw profileError
            }
          } else {
            setSuccess('登録が完了しました！ログインしてください。')
            setIsLogin(true)
            setFormData({ ...formData, password: '', confirmPassword: '' })
          }
        }
      }
    } catch (err: any) {
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

  const handlePasswordReset = async () => {
    if (!formData.email || !isAdminEmail(formData.email)) {
      setError('管理者メールアドレスを入力してください。')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/admin/auth?reset=true`,
      })

      if (error) throw error

      setSuccess('パスワードリセット用のメールを送信しました。メールボックスを確認してください。')
    } catch (err: any) {
      setError(err.message || 'パスワードリセットに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full"
      >
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-800">
            {isLogin ? '管理者ログイン' : '管理者登録'}
          </h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          {isLogin 
            ? '管理者・教員専用のログインページです。'
            : '管理者メールアドレスでのみ登録できます。'}
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                placeholder="三田村 和真"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              placeholder="mitamuraka@haguroko.ed.jp"
            />
            {!isAdminEmail(formData.email) && formData.email && (
              <p className="text-xs text-red-600 mt-1">
                管理者メールアドレスを入力してください。
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              パスワード
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認）
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading || (!isLogin && !isAdminEmail(formData.email))}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : isLogin ? 'ログイン' : '登録する'}
          </motion.button>
        </form>

        {isLogin && (
          <div className="mt-4">
            <button
              onClick={handlePasswordReset}
              disabled={loading || !isAdminEmail(formData.email)}
              className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              パスワードを忘れた場合
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
              setSuccess(null)
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900">
            生徒用ログインページへ →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
