import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES, AVATARS, calcLevel, xpToNextLevel } from '../data/questions'
import { Trophy, LogOut, Star, Info, X } from 'lucide-react'

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, type: 'spring', bounce: 0.3 },
  }),
}

export default function Dashboard() {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [showAbout, setShowAbout] = useState(false)

  const xp = userProfile?.totalXP ?? 0
  const level = calcLevel(xp)
  const progress = xpToNextLevel(xp)
  const avatar = AVATARS[userProfile?.avatarIndex ?? 0]

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{avatar}</div>
            <div>
              <h2 className="text-xl font-extrabold leading-tight">
                {userProfile?.username ?? 'Explorer'}
              </h2>
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star size={14} fill="currentColor" />
                <span>Level {level}</span>
                <span className="text-gray-400 font-normal">· {xp} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-2 btn-secondary text-sm py-2 px-4"
            >
              <Trophy size={16} />
              Leaderboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-4 py-2 text-sm font-bold transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="glass card mb-10 py-4">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-violet-300">Level {level} → {level + 1}</span>
            <span className="text-gray-400">{progress.current} / {progress.needed} XP</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Hero text */}
        <motion.h1
          className="text-4xl md:text-5xl font-black text-center mb-2 bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Choose Your Quest!
        </motion.h1>
        <p className="text-center text-gray-400 mb-10">
          Pick a category and earn XP. Top the leaderboard!
        </p>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Object.values(CATEGORIES).map((cat, i) => (
            <motion.button
              key={cat.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/quiz/${cat.id}`)}
              className={`relative overflow-hidden text-left rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${cat.gradient} group`}
            >
              {/* Decorative bubble */}
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />

              <div className="text-5xl mb-4">{cat.emoji}</div>
              <h3 className="text-2xl font-extrabold mb-1">{cat.label}</h3>
              <p className="text-white/70 text-sm">{cat.description}</p>

              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold">
                <Star size={14} fill="white" />
                100–150 XP per question
              </div>
            </motion.button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total XP', value: xp.toLocaleString(), emoji: '⚡' },
            { label: 'Level', value: level, emoji: '🏆' },
            { label: 'Quizzes', value: userProfile?.quizzesCompleted ?? 0, emoji: '📚' },
          ].map((s) => (
            <div key={s.label} className="glass card text-center py-4">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center mt-10 pb-2">
          <button
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-xs font-semibold group"
          >
            <Info size={14} className="group-hover:text-violet-400 transition-colors" />
            About BrainQuest
          </button>
        </div>
      </div>

      {/* About modal */}
      <AnimatePresence>
        {showAbout && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="glass card max-w-sm w-full text-center py-8 relative">
                <button
                  onClick={() => setShowAbout(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="text-5xl mb-4">🧠</div>
                <h2 className="text-2xl font-black mb-1">BrainQuest</h2>
                <p className="text-gray-400 text-sm mb-6">
                  A gamified learning platform for curious minds
                </p>

                <div className="glass rounded-2xl py-4 px-5 mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Created by</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">👨‍💻</span>
                      <span className="font-extrabold text-white">Aarav Sharma</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">👨‍💼</span>
                      <span className="font-extrabold text-white">Sanjay Sharma</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-500 text-xs">
                  © {new Date().getFullYear()} BrainQuest · All rights reserved
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
