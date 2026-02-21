import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES, AVATARS, calcLevel, xpToNextLevel } from '../data/questions'
import { Trophy, LogOut, Star, Info, X, Zap, Gift, Target, Award, ShoppingBag, Lock } from 'lucide-react'
import confetti from 'canvas-confetti'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useSound } from '../hooks/useSound'

const SECTIONS = [
  { id: 'learn',   label: 'Learn',    emoji: '📚' },
  { id: 'fun',     label: 'Daily Fun', emoji: '✨' },
  { id: 'quizzes', label: 'Quizzes',  emoji: '🎯' },
  { id: 'puzzles', label: 'Puzzles',  emoji: '🧩' },
]

const PUZZLE_TILES = [
  {
    id: 'millionaire',
    label: 'XP Millionaire',
    emoji: '💰',
    description: '15 questions to reach 1 Million XP',
    gradient: 'from-blue-700 to-indigo-600',
    xpNote: 'Up to 10,000 XP',
    path: '/puzzle/millionaire',
    isNew: true,
  },
  {
    id: 'chess',
    label: 'Chess',
    emoji: '♟️',
    description: 'Beat the computer at chess',
    gradient: 'from-neutral-700 to-gray-600',
    xpNote: 'Up to 800 XP',
    path: '/puzzle/chess',
  },
  {
    id: 'sudoku',
    label: 'Sudoku',
    emoji: '🔢',
    description: 'Fill every row, column & box with 1–9',
    gradient: 'from-emerald-600 to-teal-500',
    xpNote: 'Up to 950 XP',
    path: '/puzzle/sudoku',
  },
  {
    id: 'crossword',
    label: 'Mini Crossword',
    emoji: '📝',
    description: 'Solve a 7×7 crossword puzzle',
    gradient: 'from-rose-600 to-pink-500',
    xpNote: 'Up to 350 XP',
    path: '/puzzle/crossword',
  },
  {
    id: 'wordle',
    label: 'Wordle',
    emoji: '🟩',
    description: 'Guess the 5-letter word in 6 tries',
    gradient: 'from-green-600 to-lime-500',
    xpNote: 'Up to 300 XP',
    path: '/puzzle/wordle',
  },
  {
    id: 'hangman',
    label: 'Hangman',
    emoji: '🪢',
    description: 'Guess letters before the man falls',
    gradient: 'from-orange-600 to-amber-500',
    xpNote: 'Up to 200 XP',
    path: '/puzzle/hangman',
  },
  {
    id: 'memory',
    label: 'Memory Game',
    emoji: '🃏',
    description: 'Flip cards and match the pairs',
    gradient: 'from-purple-600 to-pink-500',
    xpNote: 'Up to 400 XP',
    path: '/puzzle/memory',
    isNew: true,
  },
]

const LEARN_TILES = [
  {
    id: 'maths',
    label: 'Maths Quest',
    emoji: '🔢',
    description: '60-second maths sprint — Age based',
    gradient: 'from-yellow-500 to-orange-500',
    xpNote: 'Up to 50 XP/question',
    path: '/maths-quest',
    isNew: true,
  },
  {
    id: 'english',
    label: 'English Quest',
    emoji: '📖',
    description: 'Vocabulary & grammar for all ages',
    gradient: 'from-blue-500 to-cyan-500',
    xpNote: '50 XP per correct',
    path: '/english-quest',
    isNew: true,
  },
]

const DAILY_TILES = [
  {
    id: 'jokes',
    label: 'Daily Jokes',
    emoji: '😂',
    description: 'A fresh laugh every day',
    gradient: 'from-pink-600 to-rose-500',
    path: '/daily-fun',
  },
  {
    id: 'riddles',
    label: 'Riddles',
    emoji: '🧩',
    description: 'Test your lateral thinking',
    gradient: 'from-violet-600 to-indigo-500',
    path: '/daily-fun',
  },
  {
    id: 'paradoxes',
    label: 'Paradoxes',
    emoji: '🌀',
    description: 'Mind-bending logic puzzles',
    gradient: 'from-cyan-600 to-blue-500',
    path: '/daily-fun',
  },
  {
    id: 'news',
    label: 'Daily News',
    emoji: '📰',
    description: 'Kid-friendly news & Space tech',
    gradient: 'from-slate-600 to-gray-500',
    path: '/daily-fun',
    isNew: true,
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, type: 'spring', bounce: 0.3 },
  }),
}

export default function Dashboard() {
  const { currentUser, userProfile, setUserProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { playSound } = useSound()
  const [showAbout, setShowAbout] = useState(false)
  const [section, setSection] = useState('learn')
  const [showDailyBonus, setShowDailyBonus] = useState(false)

  // Safe date helper
  const getDateString = (val) => {
    if (!val) return "";
    if (val.toDate) return val.toDate().toDateString(); // Firestore Timestamp
    if (val instanceof Date) return val.toDateString(); // JS Date
    return "";
  };

  // Daily Reward & Reset Check
  useEffect(() => {
    if (!userProfile) return
    
    const today = new Date().toDateString()
    const lastUpdateStr = getDateString(userProfile.lastDailyUpdate)

    if (lastUpdateStr !== today) {
      if (userProfile.isGuest) {
        setUserProfile(prev => ({ 
          ...prev, 
          dailyQuizzesCount: 0, 
          dailyXP: 0,
          lastDailyUpdate: new Date(),
          dailyQuestClaimed: false 
        }))
        return
      }

      if (currentUser) {
        // Reset count for a new day in Firestore
        const userRef = doc(db, 'users', currentUser.uid)
        updateDoc(userRef, {
          dailyQuizzesCount: 0,
          dailyXP: 0,
          lastDailyUpdate: new Date(),
          dailyQuestClaimed: false
        }).then(() => {
          setUserProfile(prev => ({ 
            ...prev, 
            dailyQuizzesCount: 0, 
            dailyXP: 0,
            lastDailyUpdate: new Date(),
            dailyQuestClaimed: false 
          }))
        })
      }
    }
  }, [currentUser, userProfile, setUserProfile])

  // Daily Reward Logic (Existing localStorage one)
  useEffect(() => {
    if (!currentUser && !userProfile?.isGuest) return
    const id = currentUser?.uid || 'guest'
    const lastBonus = localStorage.getItem(`daily_bonus_${id}`)
    const today = new Date().toDateString()

    if (lastBonus !== today) {
      setShowDailyBonus(true)
    }
  }, [currentUser, userProfile])

  const claimQuestReward = async () => {
    if ((userProfile?.dailyQuizzesCount ?? 0) >= 3 && !userProfile?.dailyQuestClaimed) {
      const bonus = 500
      try {
        if (!userProfile.isGuest && currentUser) {
          const userRef = doc(db, 'users', currentUser.uid)
          await updateDoc(userRef, {
            totalXP: increment(bonus),
            dailyXP: increment(bonus),
            dailyQuestClaimed: true
          })
        }
        setUserProfile(prev => ({ 
          ...prev, 
          totalXP: (prev?.totalXP ?? 0) + bonus,
          dailyXP: (prev?.dailyXP ?? 0) + bonus,
          dailyQuestClaimed: true 
        }))
        playSound('achievement')
        confetti({ 
          particleCount: 200, 
          spread: 80, 
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff']
        })
      } catch (e) {
        console.error("Error claiming quest reward:", e)
      }
    }
  }

  const claimDailyBonus = async () => {
    if (!showDailyBonus) return
    const bonusXP = 250
    try {
      if (!userProfile?.isGuest && currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          totalXP: increment(bonusXP),
          dailyXP: increment(bonusXP),
        })
      }
      setUserProfile((prev) => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + bonusXP, dailyXP: (prev?.dailyXP ?? 0) + bonusXP }))
      localStorage.setItem(`daily_bonus_${currentUser?.uid || 'guest'}`, new Date().toDateString())
      setShowDailyBonus(false)
      
      playSound('claim')
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#3b82f6']
      })
    } catch (e) {
      console.error('Error claiming daily bonus:', e)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const xp = userProfile.totalXP ?? 0
  const level = calcLevel(xp)
  const progress = xpToNextLevel(xp)
  const avatar = AVATARS[userProfile.avatarIndex ?? 0] || '🦁'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 px-4 py-8 relative">
      {/* Daily Bonus Modal */}
      <AnimatePresence>
        {showDailyBonus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}}
              className="glass card max-w-sm w-full p-10 text-center relative z-10 border-2 border-yellow-400/50"
            >
              <div className="text-7xl mb-6">🎁</div>
              <h3 className="text-3xl font-black mb-2 text-yellow-400">Daily Gift!</h3>
              <p className="text-gray-300 mb-8">Welcome back! Here is a little something to start your day.</p>
              <div className="text-5xl font-black text-white mb-10">+250 <span className="text-xl text-violet-400">XP</span></div>
              <button 
                onClick={claimDailyBonus}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-950 font-black py-4 rounded-2xl text-lg hover:scale-105 transition-transform"
              >
                CLAIM REWARD
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              className={`text-4xl cursor-pointer hover:scale-110 transition-transform ${userProfile.isGuest ? 'cursor-default hover:scale-100' : ''}`} 
              onClick={() => {
                if (userProfile.isGuest) return;
                navigate('/profile');
              }}
            >
              {avatar}
            </div>
            <div>
              <h2 className="text-xl font-extrabold leading-tight">
                {userProfile.username ?? 'Explorer'}
              </h2>
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star size={14} fill="currentColor" />
                <span>Level {level}</span>
                <span className="text-gray-400 font-normal">· {xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (userProfile.isGuest) { playSound('wrong'); return; }
                navigate('/shop');
              }}
              className={`flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-blue-950 text-sm py-2 px-4 rounded-2xl font-black shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform ${userProfile.isGuest ? 'grayscale opacity-50' : ''}`}
            >
              <ShoppingBag size={16} />
              Shop
            </button>
            <button
              onClick={() => {
                if (userProfile.isGuest) { playSound('wrong'); return; }
                navigate('/leaderboard');
              }}
              className={`flex items-center gap-2 btn-secondary text-sm py-2 px-4 shadow-lg shadow-black/20 ${userProfile.isGuest ? 'grayscale opacity-50' : ''}`}
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

        {/* Daily Quest Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`md:col-span-2 glass card p-6 border-l-4 ${userProfile.dailyQuestClaimed ? 'border-green-500' : 'border-orange-500'} flex items-center justify-between group`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${userProfile.dailyQuestClaimed ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {userProfile.dailyQuestClaimed ? <Award size={24} /> : <Target size={24} />}
              </div>
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest ${userProfile.dailyQuestClaimed ? 'text-green-500' : 'text-orange-500'}`}>
                  {userProfile.dailyQuestClaimed ? 'Quest Completed!' : "Today's Quest"}
                </p>
                <h4 className="text-lg font-black">Complete any 3 Quizzes</h4>
                <div className="flex gap-1 mt-1">
                  {[1,2,3].map(i => (
                    <div key={i} className={`h-1.5 w-8 rounded-full ${i <= (userProfile.dailyQuizzesCount ?? 0) ? (userProfile.dailyQuestClaimed ? 'bg-green-500' : 'bg-orange-500') : 'bg-white/10'}`}></div>
                  ))}
                </div>
              </div>
            </div>
            
            {userProfile.dailyQuizzesCount >= 3 && !userProfile.dailyQuestClaimed ? (
              <button 
                onClick={claimQuestReward}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-blue-950 font-black py-2 px-4 rounded-xl text-sm animate-pulse hover:scale-105 transition-transform"
              >
                CLAIM +500 XP
              </button>
            ) : userProfile.dailyQuestClaimed ? (
              <div className="text-green-400 font-bold text-sm flex items-center gap-1">
                <Award size={16} /> Collected
              </div>
            ) : (
              <div className="bg-white/5 p-2 rounded-xl text-gray-500 text-xs font-bold">
                {userProfile.dailyQuizzesCount ?? 0}/3
              </div>
            )}
          </div>

          <div className="glass card p-6 border-l-4 border-violet-500 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => {
            if (userProfile.isGuest) { playSound('wrong'); return; }
            navigate('/profile');
          }}>
            <div className="bg-violet-500/20 p-3 rounded-2xl text-violet-400">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">Collection</p>
              <h4 className="text-lg font-black">Badges</h4>
              <p className="text-xs text-gray-400">{(userProfile.achievements?.length ?? 0)} unlocked</p>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="glass card mb-10 py-4">
          <div className="flex justify-between text-sm font-bold mb-2">
            {progress.maxLevel ? (
              <span className="text-yellow-400">🏆 MAX LEVEL</span>
            ) : (
              <span className="text-violet-300">Level {level} → Level {level + 1}</span>
            )}
            <span className="text-gray-400">{xp.toLocaleString()} / {progress.needed.toLocaleString()} XP</span>
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
        <p className="text-center text-gray-400 mb-6">
          Earn XP and top the leaderboard!
        </p>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl border border-white/10">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className="relative flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors"
            >
              {section === s.id && (
                <motion.div
                  layoutId="section-pill"
                  className="absolute inset-0 bg-violet-600 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">
                {s.emoji} {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          {section === 'quizzes' ? (
            <motion.div
              key="quizzes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.values(CATEGORIES).map((cat, i) => {
                  const locked = userProfile.isGuest && cat.id !== 'flags'
                  return (
                    <motion.button
                      key={cat.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={locked ? {} : { scale: 1.03 }}
                      whileTap={locked ? {} : { scale: 0.97 }}
                      onClick={() => { 
                        if (locked) {
                          playSound('wrong')
                          return
                        }
                        playSound('click'); 
                        navigate(`/quiz/${cat.id}`); 
                      }}
                      className={`relative overflow-hidden text-left rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${cat.gradient} group ${locked ? 'grayscale opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {locked && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
                          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                            <Lock size={16} className="text-white" />
                            <span className="text-white font-black text-xs">LOCKED</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
                      <div className="text-5xl mb-4">{cat.emoji}</div>
                      <h3 className="text-2xl font-extrabold mb-1">{cat.label}</h3>
                      <p className="text-white/70 text-sm">{cat.description}</p>
                      <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold">
                        <Star size={14} fill="white" />
                        100–150 XP per question
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ) : section === 'puzzles' ? (
            <motion.div
              key="puzzles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {PUZZLE_TILES.map((tile, i) => {
                  const locked = userProfile.isGuest && tile.id !== 'chess'
                  return (
                    <motion.button
                      key={tile.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={locked ? {} : { scale: 1.03 }}
                      whileTap={locked ? {} : { scale: 0.97 }}
                      onClick={() => { 
                        if (locked) {
                          playSound('wrong')
                          return
                        }
                        playSound('click'); 
                        navigate(tile.path); 
                      }}
                      className={`relative overflow-hidden text-left rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${tile.gradient} group ${locked ? 'grayscale opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {locked && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
                          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                            <Lock size={16} className="text-white" />
                            <span className="text-white font-black text-xs">LOCKED</span>
                          </div>
                        </div>
                      )}
                      {tile.isNew && !locked && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full z-20 animate-bounce">
                          NEW
                        </div>
                      )}
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
                      <div className="text-5xl mb-4">{tile.emoji}</div>
                      <h3 className="text-2xl font-extrabold mb-1">{tile.label}</h3>
                      <p className="text-white/70 text-sm">{tile.description}</p>
                      <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold">
                        <Zap size={14} fill="white" />
                        {tile.xpNote}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ) : section === 'learn' ? (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {LEARN_TILES.map((tile, i) => {
                  const locked = userProfile.isGuest
                  return (
                    <motion.button
                      key={tile.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={locked ? {} : { scale: 1.03 }}
                      whileTap={locked ? {} : { scale: 0.97 }}
                      onClick={() => {
                        if (locked) { playSound('wrong'); return }
                        playSound('click')
                        navigate(tile.path)
                      }}
                      className={`relative overflow-hidden text-left rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${tile.gradient} group ${locked ? 'grayscale opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {locked && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
                          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                            <Lock size={16} className="text-white" />
                            <span className="text-white font-black text-xs">LOCKED</span>
                          </div>
                        </div>
                      )}
                      {tile.isNew && !locked && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full z-20 animate-bounce">
                          NEW
                        </div>
                      )}
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
                      <div className="text-5xl mb-4">{tile.emoji}</div>
                      <h3 className="text-2xl font-extrabold mb-1">{tile.label}</h3>
                      <p className="text-white/70 text-sm">{tile.description}</p>
                      <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold">
                        <Zap size={14} fill="white" />
                        {tile.xpNote}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="fun"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {DAILY_TILES.map((tile, i) => {
                  const locked = userProfile.isGuest && tile.id !== 'jokes'
                  return (
                    <motion.button
                      key={tile.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={locked ? {} : { scale: 1.03 }}
                      whileTap={locked ? {} : { scale: 0.97 }}
                      onClick={() => {
                        if (locked) {
                          playSound('wrong')
                          return
                        }
                        playSound('click');
                        navigate(`${tile.path}?tab=${tile.id}`);
                      }}
                      className={`relative overflow-hidden text-left rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${tile.gradient} group ${locked ? 'grayscale opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {locked && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
                          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                            <Lock size={16} className="text-white" />
                            <span className="text-white font-black text-xs">LOCKED</span>
                          </div>
                        </div>
                      )}
                      {tile.isNew && !locked && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-full z-20 animate-bounce">
                          NEW
                        </div>
                      )}
                      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
                      <div className="text-5xl mb-4">{tile.emoji}</div>
                      <h3 className="text-2xl font-extrabold mb-1">{tile.label}</h3>
                      <p className="text-white/70 text-sm">{tile.description}</p>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total XP', value: xp.toLocaleString(), emoji: '⚡' },
            { label: 'Level', value: level, emoji: '🏆' },
            { label: 'Quizzes', value: userProfile.quizzesCompleted ?? 0, emoji: '📚' },
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
