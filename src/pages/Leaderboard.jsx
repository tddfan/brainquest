import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { AVATARS, calcLevel } from '../data/questions'
import { ArrowLeft, Trophy, Crown, Star, Calendar, Globe } from 'lucide-react'

const TIERS = [
  { name: 'Sage', minXP: 100000, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
  { name: 'Legend', minXP: 50000, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { name: 'Master', minXP: 20000, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  { name: 'Scholar', minXP: 5000, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { name: 'Novice', minXP: 0, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/30' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function getTier(xp) {
  return TIERS.find(t => xp >= t.minXP) || TIERS[TIERS.length - 1];
}

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('allTime') // 'allTime' | 'daily'
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const field = view === 'allTime' ? 'totalXP' : 'dailyXP'
        const q = query(collection(db, 'users'), orderBy(field, 'desc'), limit(50))
        const snap = await getDocs(q)
        const data = snap.docs
          .map((d, i) => ({ ...d.data(), rank: i + 1 }))
          .filter(e => (e[field] ?? 0) > 0 || view === 'allTime') // Only show active users for daily
        setEntries(data)
      } catch (e) {
        console.error('Leaderboard fetch error:', e)
      }
      setLoading(false)
    }
    load()
  }, [view])

  const myEntry = entries.find((e) => e.uid === currentUser?.uid)
  const myRank = myEntry?.rank ?? null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2">Top Scholars</h1>
              <p className="text-gray-400 text-sm uppercase font-bold tracking-widest">Global Rankings</p>
            </div>
          </div>
          <div className="text-4xl">🏆</div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10">
          <button
            onClick={() => setView('allTime')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${view === 'allTime' ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Globe size={14} /> Overall Best
          </button>
          <button
            onClick={() => setView('daily')}
            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${view === 'daily' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Calendar size={14} /> Daily Best
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse h-16 bg-white/5" />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key={view}>
              
              {/* Podium for Top 3 */}
              {entries.length >= 3 && (
                <div className="flex items-end justify-center gap-2 mb-10 mt-4 px-2">
                  {[entries[1], entries[0], entries[2]].map((e, i) => {
                    const is1st = i === 1;
                    const is2nd = i === 0;
                    return (
                      <div key={e.uid} className={`flex flex-col items-center flex-1 min-w-0 ${is1st ? 'z-10 scale-110' : 'opacity-80'}`}>
                        <div className="text-4xl mb-2">{AVATARS[e.avatarIndex ?? 0]}</div>
                        <div className={`w-full ${is1st ? 'h-32 bg-yellow-500/20 border-yellow-500/50' : is2nd ? 'h-24 bg-gray-400/10 border-gray-400/30' : 'h-20 bg-orange-800/10 border-orange-800/30'} rounded-t-3xl border-t-4 border-x-4 flex flex-col items-center justify-center p-2 text-center`}>
                          <p className="font-black text-[10px] uppercase truncate w-full mb-1">{e.username}</p>
                          <p className={`font-black ${is1st ? 'text-yellow-400 text-xl' : 'text-gray-300 text-sm'}`}>
                            {(view === 'allTime' ? e.totalXP : e.dailyXP)?.toLocaleString()}
                          </p>
                          <div className="text-[8px] font-bold opacity-50 uppercase">XP</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* List */}
              <div className="space-y-2">
                {entries.map((e, i) => {
                  const isMe = e.uid === currentUser?.uid
                  const xpVal = view === 'allTime' ? e.totalXP : e.dailyXP
                  return (
                    <motion.div
                      key={e.uid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all ${isMe ? 'bg-violet-600/30 border-2 border-violet-500/50 ring-4 ring-violet-500/10' : 'bg-white/5 border border-white/5'}`}
                    >
                      <div className="w-8 text-center font-black text-gray-500">#{e.rank}</div>
                      <span className="text-3xl">{AVATARS[e.avatarIndex ?? 0]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black truncate">{e.username}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${getTier(e.totalXP).color} border-white/10 uppercase tracking-tighter`}>
                            {getTier(e.totalXP).name}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Level {calcLevel(e.totalXP)} Explorer</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-lg ${view === 'daily' ? 'text-orange-400' : 'text-violet-300'}`}>{xpVal?.toLocaleString()}</p>
                        <p className="text-[8px] font-black text-gray-600 uppercase">XP {view === 'daily' ? 'Today' : 'Total'}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && entries.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/5">
            <p className="text-5xl mb-4 grayscale">🏜️</p>
            <p className="font-black text-gray-500 uppercase tracking-widest">No explorers active today!</p>
          </div>
        )}
      </div>
    </div>
  )
}
