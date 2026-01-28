'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calculator, Trophy, Zap, Star } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full text-center"
      >
        {/* Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
            Math Challenge
            <span className="block text-7xl md:text-9xl">50</span>
          </h1>
          <p className="text-2xl md:text-3xl text-white font-semibold drop-shadow-lg">
            50ます計算で算数マスターになろう！
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Calculator, text: "レベル別", color: "bg-blue-500" },
            { icon: Trophy, text: "記録更新", color: "bg-yellow-500" },
            { icon: Zap, text: "タイムアタック", color: "bg-red-500" },
            { icon: Star, text: "ゲーム感覚", color: "bg-green-500" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`${feature.color} rounded-2xl p-6 text-white shadow-xl`}
            >
              <feature.icon className="w-12 h-12 mx-auto mb-2" />
              <p className="font-bold text-lg">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 text-3xl font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse-glow"
            >
              冒険を始める 🚀
            </motion.button>
          </Link>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="mt-16 text-white/80 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>楽しく学んで、算数が得意になろう！</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
