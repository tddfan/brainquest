import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PREMIUM_AVATARS, SHOP_CATEGORIES, SHOP_THEMES, MYSTERY_PETS, RARITIES, BOOSTS } from '../data/shop'
import { ArrowLeft, Zap, ShoppingBag, Check, Lock, Star, Palette, Sparkles, Wand2, Timer, Coins } from 'lucide-react'
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
  const diamonds = userProfile?.diamonds ?? 0
  const unlockedAvatars = userProfile?.unlockedAvatars ?? []

  const buyAvatar = async (item) => {
    const currency = item.currency || 'xp'
    const balance = currency === 'diamonds' ? diamonds : xp
    
    if (balance < item.price) { playSound('wrong'); return }
    if (unlockedAvatars.includes(item.id)) return
    
    try {
      const userRef = doc(db, 'users', currentUser.uid)
      const updateData = {
        unlockedAvatars: arrayUnion(item.id)
      }
      
      if (currency === 'diamonds') {
        updateData.diamonds = increment(-item.price)
      } else {
        updateData.totalXP = increment(-item.price)
      }

      await updateDoc(userRef, updateData)
      setUserProfile(prev => ({
        ...prev,
        totalXP: currency === 'xp' ? prev.totalXP - item.price : prev.totalXP,
        diamonds: currency === 'diamonds' ? prev.diamonds - item.price : prev.diamonds,
        unlockedAvatars: [...(prev.unlockedAvatars || []), item.id]
      }))
      playSound('claim'); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    } catch (e) { console.error(e) }
  }

  const buyTheme = async (item) => {
    if (xp < item.price) { playSound('wrong'); return }
    if (userProfile.unlockedThemes?.includes(item.id)) return
    
    try {
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, {
        totalXP: increment(-item.price),
        unlockedThemes: arrayUnion(item.id)
      })
      setUserProfile(prev => ({
        ...prev,
        totalXP: prev.totalXP - item.price,
        unlockedThemes: [...(prev.unlockedThemes || []), item.id]
      }))
      playSound('claim'); confetti({ particleCount: 100, spread: 50 })
    } catch (e) { console.error(e) }
  }

  const buyBoost = async (boost) => {
    const balance = boost.currency === 'diamonds' ? diamonds : xp
    if (balance < boost.price) { playSound('wrong'); return }
    
    try {
      const userRef = doc(db, 'users', currentUser.uid)
      const type = boost.id === 'boost_xp' ? 'xp' : 'diamonds'
      const newExpiry = Date.now() + boost.duration
      
      const updateData = {
        [`activeBoosts.${type}`]: newExpiry
      }
      if (boost.currency === 'diamonds') updateData.diamonds = increment(-boost.price)
      else updateData.totalXP = increment(-boost.price)

      await updateDoc(userRef, updateData)
      setUserProfile(prev => ({
        ...prev,
        totalXP: boost.currency === 'xp' ? prev.totalXP - boost.price : prev.totalXP,
        diamonds: boost.currency === 'diamonds' ? prev.diamonds - boost.price : prev.diamonds,
        activeBoosts: { ...(prev.activeBoosts || {}), [type]: newExpiry }
      }))
      playSound('powerup'); confetti({ particleCount: 150, spread: 70, colors: ['#fbbf24', '#3b82f6'] })
    } catch (e) { console.error(e) }
  }

  const sellPet = async (petId) => {
    const pet = MYSTERY_PETS.find(p => p.id === petId)
    if (!pet) return
    const sellXP = RARITIES[pet.rarity].sellXP

    try {
      const userRef = doc(db, 'users', currentUser.uid)
      // Remove one instance of the pet
      const index = unlockedAvatars.indexOf(petId)
      if (index === -1) return
      
      const newAvatars = [...unlockedAvatars]
      newAvatars.splice(index, 1)

      await updateDoc(userRef, {
        totalXP: increment(sellXP),
        unlockedAvatars: newAvatars
      })
      setUserProfile(prev => ({
        ...prev,
        totalXP: prev.totalXP + sellXP,
        unlockedAvatars: newAvatars
      }))
      playSound('claim')
    } catch (e) { console.error(e) }
  }

  const hatchEgg = async () => {
    if (xp < EGG_PRICE) { playSound('wrong'); return }
    setHatching(true)
    playSound('click')

    // Rarity Logic (Rare to Common)
    const rand = Math.random()
    let pool = []
    
    if (rand < 0.00001) pool = MYSTERY_PETS.filter(p => p.rarity === 'ULTRA') 
    else if (rand < 0.01) pool = MYSTERY_PETS.filter(p => p.rarity === 'MYTHIC') 
    else if (rand < 0.06) pool = MYSTERY_PETS.filter(p => p.rarity === 'EXOTIC') 
    else if (rand < 0.21) pool = MYSTERY_PETS.filter(p => p.rarity === 'RARE')   
    else pool = MYSTERY_PETS.filter(p => p.rarity === 'COMMON')                 

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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-violet-600/20 px-4 py-2 rounded-2xl border border-violet-500/30">
              <Zap size={16} className="text-yellow-400" fill="currentColor" />
              <span className="font-black text-sm">{xp.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-2xl border border-blue-500/30">
              <div className="w-4 h-4 bg-blue-400 rotate-45 border border-white/20" />
              <span className="font-black text-sm text-blue-400">{diamonds.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-pink-500 bg-clip-text text-transparent uppercase tracking-tighter">Quest Shop</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Collect rare pets and legendary avatars</p>
        </div>

        <div className="flex gap-2 mb-10 bg-white/5 p-1.5 rounded-3xl border border-white/10 overflow-x-auto no-scrollbar">
          {SHOP_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`flex-1 min-w-[100px] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCat === cat.id ? 'bg-white text-gray-950 shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>
              <span>{cat.emoji}</span> <span>{cat.label}</span>
            </button>
          ))}
          <button onClick={() => setActiveCat('inventory')} className={`flex-1 min-w-[100px] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCat === 'inventory' ? 'bg-white text-gray-950 shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>
            <span>🎒</span> <span>My Pets</span>
          </button>
          <button onClick={() => setActiveCat('boosts')} className={`flex-1 min-w-[100px] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeCat === 'boosts' ? 'bg-white text-gray-950 shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>
            <span>⚡</span> <span>Boosts</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeCat === 'inventory' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="inventory" className="space-y-4">
              {unlockedAvatars.filter(id => typeof id === 'string' && id.startsWith('pet_')).length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/5">
                  <p className="font-black text-gray-500 uppercase tracking-widest">No pets yet. Hatch some eggs!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from(new Set(unlockedAvatars.filter(id => typeof id === 'string' && id.startsWith('pet_')))).map(petId => {
                    const pet = MYSTERY_PETS.find(p => p.id === petId)
                    const count = unlockedAvatars.filter(id => id === petId).length
                    if (!pet) return null
                    return (
                      <div key={petId} className="glass card p-4 border border-white/10 flex flex-col items-center">
                        <div className="text-5xl mb-2 relative">
                          {pet.emoji}
                          {count > 1 && <span className="absolute -top-2 -right-2 bg-violet-600 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-gray-950">x{count}</span>}
                        </div>
                        <h4 className="font-black text-[10px] uppercase mb-1">{pet.name}</h4>
                        <div className={`text-[8px] font-black uppercase mb-4 ${RARITIES[pet.rarity].color}`}>{pet.rarity}</div>
                        <button onClick={() => sellPet(petId)} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors border border-red-500/20">Sell for {RARITIES[pet.rarity].sellXP} XP</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

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
                const isDiamond = item.currency === 'diamonds'
                const balance = isDiamond ? diamonds : xp
                const canAfford = balance >= item.price

                if (item.hidden && !isOwned) return null

                return (
                  <div key={item.id} className={`glass card p-6 text-center border-2 transition-all ${isOwned ? 'border-green-500/30' : 'border-white/5'}`}>
                    <div className="text-6xl mb-4">{item.emoji}</div>
                    <h4 className="font-black text-sm mb-1">{item.name}</h4>
                    {isOwned ? (
                      <div className="mt-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-black text-xs flex items-center justify-center gap-1"><Check size={14} /> OWNED</div>
                    ) : (
                      <button onClick={() => buyAvatar(item)} disabled={!canAfford} className={`mt-4 w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-white text-gray-950 hover:scale-105' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}>
                        {isDiamond ? (
                          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rotate-45 border border-white/20" /> {item.price.toLocaleString()}</div>
                        ) : (
                          <><Zap size={12} fill="currentColor" /> {item.price.toLocaleString()}</>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}

          {activeCat === 'themes' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="themes" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SHOP_THEMES.map(theme => {
                const isOwned = userProfile.unlockedThemes?.includes(theme.id)
                const isCurrent = userProfile.themeId === theme.id
                return (
                  <div key={theme.id} className={`glass card p-6 border-2 transition-all overflow-hidden relative ${isOwned ? 'border-green-500/30' : 'border-white/5'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-20 -z-10`} />
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.color} border border-white/20`} />
                      {isOwned ? (
                        <div className="text-green-400 flex items-center gap-1 font-black text-[10px] uppercase tracking-widest"><Check size={12}/> Owned</div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-yellow-400 font-black text-sm"><Zap size={14} fill="currentColor"/> {theme.price.toLocaleString()}</div>
                      )}
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-4">{theme.name}</h3>
                    {!isOwned ? (
                      <button onClick={() => buyTheme(theme)} disabled={xp < theme.price} className={`w-full py-3 rounded-xl font-black text-xs uppercase transition-all ${xp >= theme.price ? 'bg-white text-gray-950' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}>Unlock Theme</button>
                    ) : (
                      <button onClick={async () => {
                        const userRef = doc(db, 'users', currentUser.uid)
                        await updateDoc(userRef, { themeId: theme.id })
                        setUserProfile(prev => ({ ...prev, themeId: theme.id }))
                        playSound('click')
                      }} className={`w-full py-3 rounded-xl font-black text-xs uppercase transition-all ${isCurrent ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>{isCurrent ? 'Current Theme' : 'Apply Theme'}</button>
                    )}
                  </div>
                )
              })}
            </motion.div>
          )}

          {activeCat === 'boosts' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="boosts" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BOOSTS.map(boost => {
                const type = boost.id === 'boost_xp' ? 'xp' : 'diamonds'
                const expiry = userProfile.activeBoosts?.[type] || 0
                const isActive = expiry > Date.now()
                const balance = boost.currency === 'diamonds' ? diamonds : xp
                const canAfford = balance >= boost.price
                
                return (
                  <div key={boost.id} className="glass card p-8 border-2 border-white/5 text-center flex flex-col items-center">
                    <div className="text-6xl mb-4 animate-bounce">{boost.emoji}</div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">{boost.name}</h3>
                    <p className="text-gray-400 text-xs font-bold mb-6">{boost.description}</p>
                    
                    {isActive ? (
                      <div className="w-full py-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em]"><Timer size={14} /> Active!</div>
                        <div className="text-[10px] font-bold opacity-70">Ending soon...</div>
                      </div>
                    ) : (
                      <button onClick={() => buyBoost(boost)} disabled={!canAfford} className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${canAfford ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-950 hover:scale-105' : 'bg-white/5 text-gray-600 grayscale'}`}>
                        {boost.currency === 'diamonds' ? (
                           <div className="flex items-center gap-1"><div className="w-4 h-4 bg-blue-400 rotate-45 border border-white/20" /> {boost.price}</div>
                        ) : (
                          <><Zap size={18} fill="currentColor" /> {boost.price.toLocaleString()}</>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
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
