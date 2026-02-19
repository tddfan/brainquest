import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { AVATARS, calcLevel } from '../data/questions'
import { ArrowLeft, Trophy, Crown, Star } from 'lucide-react'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'users'), orderBy('totalXP', 'desc'), limit(50))
        const snap = await getDocs(q)
        const data = snap.docs.map((d, i) => ({ ...d.data(), rank: i + 1 }))
        setEntries(data)
      } catch (e) {
        console.error('Leaderboard fetch error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Find current user's position
  const myEntry = entries.find((e) => e.uid === currentUser?.uid)
  const myRank = myEntry?.rank ?? null

  // Percentile: "smarter than X% of explorers"
  const percentile = myRank && entries.length > 1
    ? Math.round(((entries.length - myRank) / (entries.length - 1)) * 100)
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Trophy className="text-yellow-400" size={28} />
              Top Scholars
            </h1>
            <p className="text-gray-400 text-sm">Global XP Leaderboard</p>
          </div>
        </div>

        {/* My ranking banner */}
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass card mb-6 bg-gradient-to-r from-violet-600/30 to-pink-600/20 border border-violet-500/30 py-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{AVATARS[myEntry.avatarIndex ?? 0]}</span>
                <div>
                  <p className="font-black text-lg">{myEntry.username} <span className="text-violet-400 text-sm">(you)</span></p>
                  <p className="text-sm text-gray-400">Level {calcLevel(myEntry.totalXP)} · {myEntry.totalXP?.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-yellow-400">#{myRank}</div>
                {percentile !== null && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Top {100 - percentile}%
                  </p>
                )}
              </div>
            </div>
            {percentile !== null && (
              <p className="text-center mt-3 text-sm font-bold text-violet-300">
                🧠 You are smarter than <span className="text-white">{percentile}%</span> of explorers!
              </p>
            )}
          </motion.div>
        )}

        {/* Top 3 podium */}
        {!loading && entries.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {[entries[1], entries[0], entries[2]].map((e, i) => {
              const heights = ['h-24', 'h-32', 'h-20']
              const labels = ['2nd', '1st', '3rd']
              const gradients = [
                'from-gray-400 to-gray-500',
                'from-yellow-400 to-orange-400',
                'from-orange-400 to-amber-500',
              ]
              if (!e) return null
              return (
                <motion.div
                  key={e.uid}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className="text-3xl">{AVATARS[e.avatarIndex ?? 0]}</div>
                  <p className="text-xs font-black text-center truncate w-full text-center">{e.username}</p>
                  <p className="text-xs text-gray-400">{e.totalXP?.toLocaleString()} XP</p>
                  <div className={`w-full ${heights[i]} rounded-t-2xl bg-gradient-to-t ${gradients[i]} flex items-center justify-center text-2xl`}>
                    {MEDALS[i === 0 ? 1 : i === 1 ? 0 : 2]}
                  </div>
                  <p className="text-xs font-bold text-gray-400">{labels[i]}</p>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Full leaderboard list */}
        <div className="space-y-2">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse h-16" />
              ))
            : entries.map((e, i) => {
                const isMe = e.uid === currentUser?.uid
                return (
                  <motion.div
                    key={e.uid ?? i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                      isMe
                        ? 'bg-violet-600/30 border border-violet-500/40'
                        : 'bg-white/5 border border-white/5'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {i < 3 ? (
                        <span className="text-xl">{MEDALS[i]}</span>
                      ) : (
                        <span className="font-black text-gray-400">#{e.rank}</span>
                      )}
                    </div>

                    {/* Avatar + name */}
                    <span className="text-2xl">{AVATARS[e.avatarIndex ?? 0]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black truncate">
                        {e.username}
                        {isMe && <span className="text-violet-400 text-sm font-normal ml-1">(you)</span>}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Star size={10} fill="currentColor" className="text-yellow-400" />
                        Level {calcLevel(e.totalXP)}
                        <span>·</span>
                        {e.quizzesCompleted ?? 0} quizzes
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <p className="font-black text-violet-300">{e.totalXP?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">XP</p>
                    </div>
                  </motion.div>
                )
              })}
        </div>

        {!loading && entries.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🏜️</p>
            <p className="font-bold">No explorers yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
