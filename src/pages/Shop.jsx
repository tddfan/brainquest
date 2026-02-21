import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PREMIUM_AVATARS, SHOP_CATEGORIES, SHOP_THEMES } from '../data/shop'
import { ArrowLeft, Zap, ShoppingBag, Check, Lock, Star, Palette } from 'lucide-react'
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useSound } from '../hooks/useSound'
import confetti from 'canvas-confetti'

export default function Shop() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const { playSound } = useSound()
  const [activeCat, setActiveCat] = useState('avatars')

  const xp = userProfile?.totalXP ?? 0
  const unlockedAvatars = userProfile?.unlockedAvatars ?? []
  const unlockedThemes = userProfile?.unlockedThemes ?? []

  const buyAvatar = async (item) => {
    if (xp < item.price) { playSound('wrong'); return }
    if (unlockedAvatars.includes(item.id)) return

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        totalXP: increment(-item.price),
        unlockedAvatars: arrayUnion(item.id)
      })
      setUserProfile(prev => ({
        ...prev,
        totalXP: prev.totalXP - item.price,
        unlockedAvatars: [...prev.unlockedAvatars, item.id]
      }))
      playSound('claim')
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3 bg-violet-600/20 px-6 py-2.5 rounded-2xl border border-violet-500/30">
            <Zap size={20} className="text-yellow-400" fill="currentColor" />
            <span className="font-black text-xl">{xp.toLocaleString()}</span>
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Available XP</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent uppercase tracking-tighter">Quest Shop</h1>
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Spend your hard-earned XP on epic rewards</p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-10 bg-white/5 p-1.5 rounded-3xl border border-white/10">
          {SHOP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCat === cat.id ? 'bg-orange-500 text-gray-950 shadow-xl shadow-orange-500/20' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <span>{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeCat === 'avatars' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="avatars" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PREMIUM_AVATARS.map(item => {
                const isOwned = unlockedAvatars.includes(item.id)
                const canAfford = xp >= item.price
                return (
                  <div key={item.id} className={`glass card p-6 text-center border-2 transition-all ${isOwned ? 'border-green-500/30' : 'border-white/5'}`}>
                    <div className="text-6xl mb-4 filter drop-shadow-lg">{item.emoji}</div>
                    <h4 className="font-black text-sm mb-1">{item.name}</h4>
                    
                    {isOwned ? (
                      <div className="mt-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-black text-xs flex items-center justify-center gap-1">
                        <Check size={14} /> OWNED
                      </div>
                    ) : (
                      <button
                        onClick={() => buyAvatar(item)}
                        disabled={!canAfford}
                        className={`mt-4 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-white text-gray-950 hover:scale-105' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                      >
                        <Zap size={12} fill="currentColor" /> {item.price}
                      </button>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}

          {activeCat === 'themes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="themes" className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/5">
              <Palette size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="font-black text-gray-500 uppercase tracking-widest">Coming in the next update!</p>
              <p className="text-xs text-gray-700 mt-2">Custom profile backgrounds and color schemes.</p>
            </motion.div>
          )}

          {activeCat === 'badges' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="badges" className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/5">
              <Star size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="font-black text-gray-500 uppercase tracking-widest">Rare Badges coming soon!</p>
              <p className="text-xs text-gray-700 mt-2">Purchase limited edition badges for your profile.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
