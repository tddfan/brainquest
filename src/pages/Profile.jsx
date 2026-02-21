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
  doc,
  updateDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { AVATARS, CATEGORIES, calcLevel, xpToNextLevel } from '../data/questions'
import { PREMIUM_AVATARS } from '../data/shop'
import { ArrowLeft, Star, Zap, BookOpen, Trophy, Award, Check, X, ShoppingBag } from 'lucide-react'
import BadgeGrid from '../components/profile/BadgeGrid'
import { useSound } from '../hooks/useSound'

export default function Profile() {
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const navigate = useNavigate()
  const { playSound } = useSound()
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  const changeAvatar = async (idOrIdx) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        avatarIndex: idOrIdx
      })
      setUserProfile(prev => ({ ...prev, avatarIndex: idOrIdx }))
      setShowAvatarPicker(false)
      playSound('click')
    } catch (e) {
      console.error(e)
    }
  }

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
  
  // Resolve avatar: could be index (0-11) or string ID ('av_12'...)
  const avatar = typeof userProfile?.avatarIndex === 'number' 
    ? AVATARS[userProfile.avatarIndex] 
    : (PREMIUM_AVATARS.find(a => a.id === userProfile?.avatarIndex)?.emoji || AVATARS[0])

  const unlockedIds = userProfile?.unlockedAvatars ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 px-4 py-8 relative">
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
          className="glass card mb-6 text-center py-8 relative overflow-hidden"
        >
          <div 
            className="text-7xl mb-3 cursor-pointer hover:scale-110 transition-transform relative inline-block group"
            onClick={() => setShowAvatarPicker(true)}
          >
            {avatar}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
              <span className="text-xs font-black">CHANGE</span>
            </div>
          </div>
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

        {/* Achievements */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Award size={20} className="text-pink-400" />
            <h3 className="text-lg font-extrabold">Achievement Badges</h3>
          </div>
          <BadgeGrid userStats={userProfile ?? {}} />
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

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowAvatarPicker(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
              className="glass card max-w-lg w-full p-8 relative z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black">Choose Avatar</h3>
                <button onClick={() => setShowAvatarPicker(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Standard</p>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATARS.map((av, i) => (
                      <button
                        key={i}
                        onClick={() => changeAvatar(i)}
                        className={`text-4xl p-3 rounded-2xl border-2 transition-all ${userProfile.avatarIndex === i ? 'border-violet-500 bg-violet-500/20' : 'border-white/5 hover:bg-white/5'}`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                {unlockedIds.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">Premium Unlocked</p>
                    <div className="grid grid-cols-4 gap-3">
                      {PREMIUM_AVATARS.filter(a => unlockedIds.includes(a.id)).map((av) => (
                        <button
                          key={av.id}
                          onClick={() => changeAvatar(av.id)}
                          className={`text-4xl p-3 rounded-2xl border-2 transition-all ${userProfile.avatarIndex === av.id ? 'border-yellow-500 bg-yellow-500/20' : 'border-white/5 hover:bg-white/5'}`}
                        >
                          {av.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => navigate('/shop')}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 font-bold hover:border-violet-500/50 hover:text-violet-400 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Get more in the Shop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
