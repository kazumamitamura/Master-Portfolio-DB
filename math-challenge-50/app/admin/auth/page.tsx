'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, Shield, Mail, Lock } from 'lucide-react'
import { isAdminEmail } from '@/lib/adminUtils'

function AdminAuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  // URLパラメータでパスワードリセットモードをチェック
  useEffect(() => {
    const reset = searchParams.get('reset')
    const type = searchParams.get('type')
    if (reset === 'true' || type === 'recovery') {
      setIsLogin(true)
      setSuccess('パスワードをリセットしてください。新しいパスワードを入力してください。')
    }
  }, [searchParams])

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
        if (err.message.includes('already registered') || err.message.includes('already exists') || err.message.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています。パスワードが設定されていない場合は「パスワードを設定する」ボタンを使用してください。'
          setError(errorMessage)
          setShowPasswordReset(true)
          return
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

  // メールリンク不要：管理者パスワードを直接設定
  const handleSetPasswordDirect = async () => {
    if (!formData.email || !isAdminEmail(formData.email)) {
      setError('管理者メールアドレスを入力してください。')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります。')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません。')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setShowPasswordReset(false)

    try {
      const res = await fetch('/api/admin/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'パスワードの設定に失敗しました。')

      setSuccess('パスワードが設定されました。ログインしてください。')
      setFormData({ ...formData, password: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message || 'パスワードの設定に失敗しました。')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.password || formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります。')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません。')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) throw error

      setSuccess('パスワードが設定されました！ログインしてください。')
      setFormData({ ...formData, password: '', confirmPassword: '' })
      // 3秒後にログインモードに切り替え
      setTimeout(() => {
        setIsLogin(true)
        router.push('/admin/auth')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'パスワードの設定に失敗しました。')
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
            {showPasswordReset && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold">パスワードをここで設定（メール不要）</p>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="新しいパスワード（6文字以上）"
                  minLength={6}
                />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  placeholder="パスワード（確認）"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={handleSetPasswordDirect}
                  disabled={loading || formData.password.length < 6 || formData.password !== formData.confirmPassword}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? '設定中...' : 'パスワードを設定する'}
                </button>
              </div>
            )}
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

        {(searchParams.get('reset') === 'true' || searchParams.get('type') === 'recovery') ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
              <p className="font-semibold mb-1">パスワードを設定してください</p>
              <p className="text-sm">新しいパスワードを入力してください。</p>
            </div>
            
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                新しいパスワード
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

            <motion.button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '設定中...' : 'パスワードを設定'}
            </motion.button>
          </form>
        ) : (
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
        )}

        {isLogin && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              パスワードが未設定の場合は、下の「パスワードを設定」でメール不要で設定できます。
            </p>
            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              disabled={loading || !isAdminEmail(formData.email)}
              className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              パスワードを設定する（メール不要）
            </button>
          </div>
        )}
        
        {!isLogin && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              既にメールアドレスが登録されている場合は、ログイン画面で「パスワードを設定する」からメール不要で設定できます。
            </p>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              ログインはこちら
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

export default function AdminAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">読み込み中...</div>
      </div>
    }>
      <AdminAuthContent />
    </Suspense>
  )
}
