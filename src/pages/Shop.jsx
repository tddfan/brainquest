import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PREMIUM_AVATARS } from '../data/shop'
import { ArrowLeft, Zap, Check, Lock, ShoppingBag } from 'lucide-react'
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'
import confetti from 'canvas-confetti'
import { useSound } from '../hooks/useSound'

export default function Shop() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const { playSound } = useSound()
  const [buying, setBuying] = useState(null)

  const xp = userProfile?.totalXP ?? 0
  const unlocked = userProfile?.unlockedAvatars ?? []

  const buyAvatar = async (avatar) => {
    if (xp < avatar.cost || buying) return
    setBuying(avatar.id)
    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        totalXP: increment(-avatar.cost),
        unlockedAvatars: arrayUnion(avatar.id)
      })
      
      setUserProfile(prev => ({
        ...prev,
        totalXP: prev.totalXP - avatar.cost,
        unlockedAvatars: [...(prev.unlockedAvatars ?? []), avatar.id]
      }))

      playSound('achievement')
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#fb7185']
      })
    } catch (e) {
      console.error("Buy error:", e)
    }
    setBuying(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2 bg-violet-500/20 px-4 py-2 rounded-2xl border border-violet-500/30">
            <Zap size={18} className="text-violet-400" fill="currentColor" />
            <span className="text-xl font-black text-violet-300">{xp.toLocaleString()}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <ShoppingBag size={32} className="text-orange-500" />
            Avatar Shop
          </h1>
          <p className="text-gray-400">Unlock legendary emojis with your hard-earned XP!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {PREMIUM_AVATARS.map((av) => {
            const isUnlocked = unlocked.includes(av.id)
            const canAfford = xp >= av.cost

            return (
              <motion.div
                key={av.id}
                whileHover={{ y: -5 }}
                className={`glass card p-6 text-center relative overflow-hidden border-2 ${isUnlocked ? 'border-green-500/30' : 'border-white/5'}`}
              >
                <div className="text-7xl mb-4 drop-shadow-2xl">{av.emoji}</div>
                <h3 className="text-xl font-black mb-1">{av.name}</h3>
                
                {isUnlocked ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400 font-bold uppercase tracking-widest text-xs bg-green-400/10 py-2 rounded-xl">
                    <Check size={14} /> Unlocked
                  </div>
                ) : (
                  <button
                    disabled={!canAfford || buying === av.id}
                    onClick={() => buyAvatar(av)}
                    className={`mt-4 w-full py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${
                      canAfford 
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20' 
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {buying === av.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {!canAfford && <Lock size={14} />}
                        <Zap size={14} fill="currentColor" />
                        {av.cost.toLocaleString()} XP
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
