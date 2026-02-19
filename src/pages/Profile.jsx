import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { AVATARS, CATEGORIES, calcLevel, xpToNextLevel } from '../data/questions'
import { ArrowLeft, Star, Zap, BookOpen, Trophy } from 'lucide-react'

export default function Profile() {
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    async function load() {
      if (!currentUser) return
      try {
        const q = query(
          collection(db, 'quizHistory'),
          where('uid', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
        const snap = await getDocs(q)
        setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.error(e)
      }
      setLoadingHistory(false)
    }
    load()
  }, [currentUser])

  const xp = userProfile?.totalXP ?? 0
  const level = calcLevel(xp)
  const progress = xpToNextLevel(xp)
  const avatar = AVATARS[userProfile?.avatarIndex ?? 0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Dashboard</span>
        </button>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass card mb-6 text-center py-8"
        >
          <div className="text-7xl mb-3">{avatar}</div>
          <h2 className="text-3xl font-black">{userProfile?.username}</h2>
          <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold mt-1">
            <Star size={16} fill="currentColor" />
            Level {level} Explorer
          </div>
          <p className="text-gray-400 text-sm mt-1">{xp.toLocaleString()} Total XP</p>

          {/* Level progress */}
          <div className="mt-5 px-4">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
              <span>Level {level}</span>
              <span>{progress.current} / {progress.needed} XP</span>
              <span>Level {level + 1}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <motion.div
                className="bg-gradient-to-r from-violet-500 to-pink-500 h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <Zap size={20} className="text-violet-400" />, label: 'Total XP', value: xp.toLocaleString() },
            { icon: <Trophy size={20} className="text-yellow-400" />, label: 'Level', value: level },
            { icon: <BookOpen size={20} className="text-green-400" />, label: 'Quizzes', value: userProfile?.quizzesCompleted ?? 0 },
          ].map((s) => (
            <div key={s.label} className="glass card text-center py-4">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent quiz history */}
        <h3 className="text-lg font-extrabold mb-3">Recent Quizzes</h3>
        <div className="space-y-2">
          {loadingHistory
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse h-14" />
              ))
            : history.length === 0
            ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>No quizzes completed yet. Start one from the dashboard!</p>
              </div>
            )
            : history.map((h) => {
              const cat = CATEGORIES[h.category]
              return (
                <div
                  key={h.id}
                  className="flex items-center gap-4 glass rounded-2xl px-4 py-3"
                >
                  <span className="text-2xl">{cat?.emoji ?? '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{cat?.label ?? h.category}</p>
                    <p className="text-xs text-gray-400">
                      {h.score}/{h.total} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-violet-300 text-sm">+{h.xpEarned} XP</p>
                    <p className="text-xs text-gray-500">
                      {h.timestamp?.toDate
                        ? h.timestamp.toDate().toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
