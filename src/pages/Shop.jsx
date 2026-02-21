import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PREMIUM_AVATARS, SHOP_CATEGORIES, SHOP_THEMES, MYSTERY_PETS, RARITIES } from '../data/shop'
import { ArrowLeft, Zap, ShoppingBag, Check, Lock, Star, Palette, Sparkles, Wand2 } from 'lucide-react'
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useSound } from '../hooks/useSound'
import confetti from 'canvas-confetti'

const EGG_PRICE = 1000

export default function Shop() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const { playSound } = useSound()
  const [activeCat, setActiveCat] = useState('mystery')
  const [hatching, setHatching] = useState(false)
  const [reward, setReward] = useState(null)

  const xp = userProfile?.totalXP ?? 0
  const unlockedAvatars = userProfile?.unlockedAvatars ?? []

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
      playSound('claim'); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    } catch (e) { console.error(e) }
  }

  const hatchEgg = async () => {
    if (xp < EGG_PRICE) { playSound('wrong'); return }
    setHatching(true)
    playSound('click')

    // Rarity Logic (Rare to Common)
    const rand = Math.random()
    let pool = []
    
    if (rand < 0.0000001) pool = MYSTERY_PETS.filter(p => p.rarity === 'ULTRA') // 0.00001% (Note: Math.random is 0 to 1)
    else if (rand < 0.01) pool = MYSTERY_PETS.filter(p => p.rarity === 'MYTHIC') // 1%
    else if (rand < 0.06) pool = MYSTERY_PETS.filter(p => p.rarity === 'EXOTIC') // 5% (approx)
    else if (rand < 0.21) pool = MYSTERY_PETS.filter(p => p.rarity === 'RARE')   // 15%
    else pool = MYSTERY_PETS.filter(p => p.rarity === 'COMMON')                 // ~79%

    if (pool.length === 0) pool = MYSTERY_PETS.filter(p => p.rarity === 'COMMON')
    const selectedPet = pool[Math.floor(Math.random() * pool.length)]

    // Wait for "shaking" animation
    setTimeout(async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid)
        await updateDoc(userRef, {
          totalXP: increment(-EGG_PRICE),
          unlockedAvatars: arrayUnion(selectedPet.id)
        })
        setUserProfile(prev => ({
          ...prev,
          totalXP: prev.totalXP - EGG_PRICE,
          unlockedAvatars: [...prev.unlockedAvatars, selectedPet.id]
        }))
        
        setReward(selectedPet)
        setHatching(false)
        playSound('achievement')
        confetti({ 
          particleCount: 200, 
          spread: 90, 
          origin: { y: 0.6 },
          colors: selectedPet.rarity === 'MYTHIC' ? ['#FFD700', '#FFFFFF', '#FF0080'] : ['#8b5cf6', '#3b82f6']
        })
      } catch (e) { 
        console.error(e)
        setHatching(false)
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={24} /></button>
          <div className="flex items-center gap-3 bg-violet-600/20 px-6 py-2.5 rounded-2xl border border-violet-500/30">
            <Zap size={20} className="text-yellow-400" fill="currentColor" />
            <span className="font-black text-xl">{xp.toLocaleString()}</span>
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">XP</span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">Quest Shop</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Collect rare pets and legendary avatars</p>
        </div>

        <div className="flex gap-2 mb-10 bg-white/5 p-1.5 rounded-3xl border border-white/10">
          {SHOP_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCat === cat.id ? 'bg-white text-gray-950 shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>
              <span>{cat.emoji}</span> <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeCat === 'mystery' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} key="mystery" className="text-center">
              <div className="glass card p-12 border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent relative overflow-hidden mb-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-30" />
                
                <div className="relative z-10">
                  <motion.div 
                    animate={hatching ? { 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1, 1.1, 1] 
                    } : { y: [0, -10, 0] }}
                    transition={hatching ? { repeat: Infinity, duration: 0.2 } : { repeat: Infinity, duration: 3 }}
                    className="text-9xl mb-8 inline-block drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                  >
                    🥚
                  </motion.div>
                  
                  <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Mystery Pet Egg</h2>
                  <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm font-medium">Hatch this magical egg to discover a Common, Rare, or legendary <span className="text-yellow-400 font-bold">Mythic</span> pet!</p>
                  
                  <button 
                    onClick={hatchEgg}
                    disabled={hatching || xp < EGG_PRICE}
                    className={`px-12 py-5 rounded-[2rem] font-black text-xl uppercase tracking-tighter transition-all flex items-center gap-3 mx-auto shadow-2xl ${xp >= EGG_PRICE && !hatching ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-gray-600 grayscale cursor-not-allowed'}`}
                  >
                    {hatching ? 'Hatching...' : <><Wand2 size={24}/> Hatch for 1,000 XP</>}
                  </button>
                </div>
              </div>

              {/* Rarity Table */}
              <div className="flex justify-center gap-6">
                {Object.entries(RARITIES).map(([key, r]) => (
                  <div key={key} className="text-center">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${r.color}`}>{r.label}</div>
                    <div className="text-xs font-bold text-gray-600">
                      {r.chance < 0.001 ? `${(r.chance * 100).toFixed(5)}%` : `${Math.round(r.chance * 100)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeCat === 'avatars' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="avatars" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PREMIUM_AVATARS.map(item => {
                const isOwned = unlockedAvatars.includes(item.id)
                return (
                  <div key={item.id} className={`glass card p-6 text-center border-2 transition-all ${isOwned ? 'border-green-500/30' : 'border-white/5'}`}>
                    <div className="text-6xl mb-4">{item.emoji}</div>
                    <h4 className="font-black text-sm mb-1">{item.name}</h4>
                    {isOwned ? (
                      <div className="mt-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-black text-xs flex items-center justify-center gap-1"><Check size={14} /> OWNED</div>
                    ) : (
                      <button onClick={() => buyAvatar(item)} disabled={xp < item.price} className={`mt-4 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${xp >= item.price ? 'bg-white text-gray-950 hover:scale-105' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}><Zap size={12} fill="currentColor" /> {item.price}</button>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}

          {activeCat === 'themes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="themes" className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/5">
              <Palette size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="font-black text-gray-500 uppercase tracking-widest">Personalized Themes Coming Soon!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reward Modal */}
        <AnimatePresence>
          {reward && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="glass card max-w-sm w-full p-12 text-center relative z-[210] border-4 border-yellow-500/30">
                <p className={`text-sm font-black uppercase tracking-[0.3em] mb-4 ${RARITIES[reward.rarity].color}`}>{reward.rarity} REWARD!</p>
                <div className={`text-9xl mb-8 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] ${reward.rarity === 'MYTHIC' ? 'animate-bounce' : ''}`}>{reward.emoji}</div>
                <h3 className="text-4xl font-black mb-2 uppercase tracking-tighter">{reward.name}</h3>
                <p className="text-gray-400 mb-10 font-medium">This pet has been added to your collection!</p>
                <button onClick={() => setReward(null)} className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:scale-105 transition-transform uppercase">Awesome!</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
