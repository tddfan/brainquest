import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORIES, AVATARS, calcLevel, xpToNextLevel } from '../data/questions'
import { Trophy, LogOut, Star, Info, X, Zap, Gift, Target, Award, ShoppingBag, Lock, Check, RotateCcw, Download, Share, Users, Swords, Flame, Bell, Timer } from 'lucide-react'
import confetti from 'canvas-confetti'
import { doc, updateDoc, increment, onSnapshot, setDoc, getDoc, query, collection, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useSound } from '../hooks/useSound'
import { PREMIUM_AVATARS, MYSTERY_PETS, SHOP_THEMES } from '../data/shop'

const SECTIONS = [
  { id: 'fun',     label: 'Daily Fun', emoji: '✨' },
  { id: 'quizzes', label: 'Quizzes',  emoji: '🎯' },
  { id: 'puzzles', label: 'Puzzles',  emoji: '🧩' },
  { id: 'learn',   label: 'Learn',    emoji: '📚' },
]

const PUZZLE_TILES = [
  { id: 'obby', label: 'Parkour Obby', emoji: '🏃‍♂️', description: '50 checkpoints of parkour & quizzes', gradient: 'from-blue-600 to-cyan-500', xpNote: 'Coming Soon', path: '/puzzle/obby', isComingSoon: true },
  { id: 'millionaire', label: 'XP Millionaire', emoji: '💰', description: '15 questions to reach 1 Million XP', gradient: 'from-blue-700 to-indigo-600', xpNote: 'Up to 10,000 XP', path: '/puzzle/millionaire', isNew: true },
  { id: 'chess', label: 'Chess', emoji: '♟️', description: 'Beat the computer at chess', gradient: 'from-neutral-700 to-gray-600', xpNote: 'Up to 800 XP', path: '/puzzle/chess' },
  { id: 'sudoku', label: 'Sudoku', emoji: '🔢', description: 'Fill every row, column & box with 1–9', gradient: 'from-emerald-600 to-teal-500', xpNote: 'Up to 950 XP', path: '/puzzle/sudoku' },
  { id: 'crossword', label: 'Mini Crossword', emoji: '📝', description: 'Solve a 7×7 crossword puzzle', gradient: 'from-rose-600 to-pink-500', xpNote: 'Up to 350 XP', path: '/puzzle/crossword' },
  { id: 'wordle', label: 'Wordle', emoji: '🟩', description: 'Guess the 5-letter word in 6 tries', gradient: 'from-green-600 to-lime-500', xpNote: 'Up to 300 XP', path: '/puzzle/wordle' },
  { id: 'hangman', label: 'Hangman', emoji: '🪢', description: 'Guess letters before the man falls', gradient: 'from-orange-600 to-amber-500', xpNote: 'Up to 200 XP', path: '/puzzle/hangman' },
  { id: 'memory', label: 'Memory Game', emoji: '🃏', description: 'Flip cards and match the pairs', gradient: 'from-purple-600 to-pink-500', xpNote: 'Up to 400 XP', path: '/puzzle/memory', isNew: true },
]

const LEARN_TILES = [
  { id: 'maths', label: 'Maths Quest', emoji: '🔢', description: '60-second maths sprint — Age based', gradient: 'from-yellow-500 to-orange-500', xpNote: 'Up to 50 XP/question', path: '/maths-quest', isNew: true },
  { id: 'english', label: 'English Quest', emoji: '📖', description: 'Vocabulary & grammar for all ages', gradient: 'from-blue-500 to-cyan-500', xpNote: '50 XP per correct', path: '/english-quest', isNew: true },
]

const DAILY_TILES = [
  { id: 'jokes', label: 'Daily Jokes', emoji: '😂', description: 'A fresh laugh every day', gradient: 'from-pink-600 to-rose-500', path: '/daily-fun' },
  { id: 'riddles', label: 'Riddles', emoji: '🧩', description: 'Test your lateral thinking', gradient: 'from-violet-600 to-indigo-500', path: '/daily-fun' },
  { id: 'paradoxes', label: 'Paradoxes', emoji: '🌀', description: 'Mind-bending logic puzzles', gradient: 'from-cyan-600 to-blue-500', path: '/daily-fun' },
  { id: 'news', label: 'Daily News', emoji: '📰', description: 'Kid-friendly news & Sports', gradient: 'from-slate-600 to-gray-500', path: '/daily-fun', isNew: true },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, type: 'spring', bounce: 0.3 } }),
}

export default function Dashboard() {
  const { currentUser, userProfile, setUserProfile, logout } = useAuth()
  const navigate = useNavigate()
  const { playSound } = useSound()
  const [showAbout, setShowAbout] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [section, setSection] = useState('fun')
  const [showDailyBonus, setShowDailyBonus] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [boss, setBoss] = useState(null)
  const [invites, setInvites] = useState([])

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); }
    window.addEventListener('beforeinstallprompt', handler)
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (ios && !isStandalone) setIsIOS(true);
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Listen to Global Boss HP and Auto-Initialize
  useEffect(() => {
    const bossRef = doc(db, 'global', 'boss')
    const unsub = onSnapshot(bossRef, (snap) => {
      if (snap.exists()) {
        setBoss(snap.data())
      } else {
        // Initialize boss if missing
        setDoc(bossRef, {
          name: 'The Knowledge Monster',
          hp: 10000,
          maxHp: 10000,
          level: 1,
          active: true
        })
      }
    })
    return () => unsub()
  }, [])

  // Listen to Pending Duel Invites
  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, 'invites'), 
      where('toUid', '==', currentUser.uid), 
      where('status', '==', 'pending')
    )
    const unsub = onSnapshot(q, (snap) => {
      setInvites(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [currentUser])

  const acceptInvite = async (inv) => {
    try {
      await updateDoc(doc(db, 'invites', inv.id), { status: 'accepted' })
      navigate(`/duel/${inv.duelId}`)
    } catch (e) { console.error(e) }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  const getDateString = (val) => {
    if (!val) return "";
    if (val.toDate) return val.toDate().toDateString();
    if (val instanceof Date) return val.toDateString();
    return "";
  };

  useEffect(() => {
    if (!userProfile) return
    const today = new Date().toDateString()
    const lastUpdateStr = getDateString(userProfile.lastDailyUpdate)
    if (lastUpdateStr !== today) {
      if (userProfile.isGuest) {
        setUserProfile(prev => ({ ...prev, dailyQuizzesCount: 0, dailyXP: 0, lastDailyUpdate: new Date(), dailyQuestClaimed: false }))
        return
      }
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid)
        updateDoc(userRef, { dailyQuizzesCount: 0, dailyXP: 0, lastDailyUpdate: new Date(), dailyQuestClaimed: false }).then(() => {
          setUserProfile(prev => ({ ...prev, dailyQuizzesCount: 0, dailyXP: 0, lastDailyUpdate: new Date(), dailyQuestClaimed: false }))
        })
      }
    }
  }, [currentUser, userProfile, setUserProfile])

  useEffect(() => {
    if (!currentUser && !userProfile?.isGuest) return
    const id = currentUser?.uid || 'guest'
    const lastBonus = localStorage.getItem(`daily_bonus_${id}`)
    const today = new Date().toDateString()
    if (lastBonus !== today) setShowDailyBonus(true)
  }, [currentUser, userProfile])

  const claimQuestReward = async () => {
    if ((userProfile?.dailyQuizzesCount ?? 0) >= 3 && !userProfile?.dailyQuestClaimed) {
      const bonus = 500
      try {
        if (!userProfile.isGuest && currentUser) {
          const userRef = doc(db, 'users', currentUser.uid)
          await updateDoc(userRef, { totalXP: increment(bonus), dailyXP: increment(bonus), dailyQuestClaimed: true })
        }
        setUserProfile(prev => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + bonus, dailyXP: (prev?.dailyXP ?? 0) + bonus, dailyQuestClaimed: true }))
        playSound('achievement'); confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#ffffff'] })
      } catch (e) { console.error(e) }
    }
  }

  const claimDailyBonus = async () => {
    if (!showDailyBonus) return
    const bonusXP = 250
    try {
      if (!userProfile?.isGuest && currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), { totalXP: increment(bonusXP), dailyXP: increment(bonusXP) })
      }
      setUserProfile((prev) => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + bonusXP, dailyXP: (prev?.dailyXP ?? 0) + bonusXP }))
      localStorage.setItem(`daily_bonus_${currentUser?.uid || 'guest'}`, new Date().toDateString())
      setShowDailyBonus(false); playSound('claim'); confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#3b82f6'] })
    } catch (e) { console.error(e) }
  }

  async function handleLogout() {
    await logout(); navigate('/login');
  }

  if (!userProfile) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>

  const xp = userProfile.totalXP ?? 0
  const level = calcLevel(xp)
  const progress = xpToNextLevel(xp)
  
  const avatar = typeof userProfile?.avatarIndex === 'number' 
    ? AVATARS[userProfile.avatarIndex] 
    : (PREMIUM_AVATARS.find(a => a.id === userProfile?.avatarIndex)?.emoji || 
       MYSTERY_PETS.find(p => p.id === userProfile?.avatarIndex)?.emoji ||
       AVATARS[0])

  const currentTheme = SHOP_THEMES.find(t => t.id === userProfile?.themeId) || { color: 'from-gray-950 via-violet-950 to-gray-950', text: 'text-white' }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.color} ${currentTheme.text || 'text-white'} px-4 py-6 relative overflow-x-hidden`}>
      <AnimatePresence>
        {showDailyBonus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}} className="glass card max-w-sm w-full p-10 text-center relative z-10 border-2 border-yellow-400/50">
              <div className="text-7xl mb-6">🎁</div>
              <h3 className="text-3xl font-black mb-2 text-yellow-400 uppercase tracking-tighter">Daily Gift!</h3>
              <p className="text-gray-300 mb-8">Welcome back! Here is a little something to start your day.</p>
              <div className="text-5xl font-black text-white mb-10">+250 <span className="text-xl text-violet-400">XP</span></div>
              <button onClick={claimDailyBonus} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-950 font-black py-4 rounded-2xl text-lg hover:scale-105 transition-transform uppercase tracking-widest">Claim Reward</button>
            </motion.div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowLogoutConfirm(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="glass card max-w-sm w-full p-8 text-center relative z-[210] border-2 border-red-500/20">
              <div className="text-6xl mb-4">🚪</div>
              <h3 className="text-2xl font-black mb-2 uppercase">Leaving already?</h3>
              <p className="text-gray-400 mb-8">Are you sure you want to sign out of your quest?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-white/5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-colors">Wait, No!</button>
                <button onClick={handleLogout} className="flex-1 py-4 bg-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-500 transition-colors shadow-lg shadow-red-600/20">Sign Out</button>
              </div>
            </motion.div>
          </div>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowIOSGuide(false)} className="fixed inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="glass card max-w-sm w-full p-8 text-center relative z-[210] border-2 border-blue-500/20">
              <div className="text-6xl mb-4 text-blue-400"><Share size={60} className="mx-auto" /></div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Install on iOS</h3>
              <p className="text-gray-400 text-sm mb-6">To use BrainQuest as an app on your iPhone or iPad:</p>
              <ol className="text-left text-xs space-y-4 mb-8 font-medium">
                <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-black flex-shrink-0 text-[10px]">1</span> <span>Tap the <span className="font-black text-blue-400">Share</span> button at the bottom of Safari.</span></li>
                <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-black flex-shrink-0 text-[10px]">2</span> <span>Scroll down and select <span className="font-black text-white">Add to Home Screen</span>.</span></li>
                <li className="flex gap-3 items-center"><span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-black flex-shrink-0 text-[10px]">3</span> <span>Tap <span className="font-black text-white">Add</span> in the top right corner.</span></li>
              </ol>
              <button onClick={() => setShowIOSGuide(false)} className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all">Got it!</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        {/* Duel Inbox */}
        <AnimatePresence>
          {invites.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 space-y-2">
              {invites.map(inv => (
                <div key={inv.id} className="glass card p-4 flex items-center justify-between border-blue-500/40 bg-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 animate-bounce"><Bell size={18} /></div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-300">New Duel Challenge!</p>
                      <p className="text-sm font-bold text-white">{inv.fromName} in {inv.categoryEmoji} {inv.categoryLabel}</p>
                    </div>
                  </div>
                  <button onClick={() => acceptInvite(inv)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl font-black text-xs uppercase transition-all shadow-lg shadow-blue-600/20">Accept</button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6 bg-white/5 p-3 rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`text-4xl sm:text-5xl cursor-pointer hover:scale-110 transition-transform ${userProfile.isGuest ? 'cursor-default hover:scale-100' : ''}`} onClick={() => { if (!userProfile.isGuest) navigate('/profile'); }}>{avatar}</div>
            <div>
              <h2 className="text-lg font-black leading-tight truncate max-w-[120px] sm:max-w-none">{userProfile.username ?? 'Explorer'}</h2>
              <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-black uppercase tracking-tighter"><Star size={10} fill="currentColor" /><span>Lv. {level}</span><span className="text-gray-500 opacity-50 mx-1">|</span><span className="text-violet-300">{xp.toLocaleString()} XP</span></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/social')} className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20 transition-all active:scale-90" title="Social Club"><Users size={18} /></button>
            <button onClick={() => navigate('/leaderboard')} className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/20 transition-all active:scale-90" title="Leaderboard"><Trophy size={18} /></button>
            {(deferredPrompt || isIOS) && (
              <button onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall} className="p-2.5 bg-yellow-500 text-black rounded-full shadow-lg shadow-yellow-500/20 active:scale-90 transition-all"><Download size={18} strokeWidth={3} /></button>
            )}
            <button onClick={() => navigate('/shop')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all active:scale-90"><ShoppingBag size={18} /></button>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full border border-red-500/20 transition-all active:scale-90"><LogOut size={18} /></button>
          </div>
        </div>

        {/* Global Boss Bar */}
        {boss && boss.hp > 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-4 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur opacity-10 group-hover:opacity-30 transition duration-1000 animate-pulse" />
            <div className="relative glass card p-2 px-3 border-red-500/30 bg-red-950/30 overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-red-500 animate-pulse" fill="currentColor" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-red-400">World Boss: {boss.name || 'The Knowledge Monster'}</span>
                  <div className="group/info relative cursor-help">
                    <Info size={10} className="text-gray-500 hover:text-white transition-colors" />
                    <div className="absolute left-0 top-5 w-48 p-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl text-[8px] text-gray-300 font-bold leading-relaxed opacity-0 group-hover/info:opacity-100 transition-opacity z-[60] pointer-events-none shadow-2xl">
                      🔥 Answer questions correctly in <span className="text-yellow-400">Quests</span> or solve <span className="text-blue-400">Puzzles</span> to deal damage and defeat the boss together!
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-white tabular-nums">{boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP</span>
              </div>
              <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_100%] shadow-[0_0_10px_rgba(239,68,68,0.4)]" 
                  animate={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} 
                  transition={{ duration: 1.5, type: 'spring' }} 
                />
              </div>
            </div>
          </motion.div>
        )}

        {boss && boss.hp <= 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 glass card p-4 border-green-500/30 bg-green-500/10 text-center">
            <p className="text-xs font-black text-green-400 uppercase tracking-[0.2em]">🎉 Victory! The Boss has been defeated! 🎉</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">New monster spawning soon...</p>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <button onClick={claimQuestReward} disabled={userProfile.dailyQuizzesCount < 3 || userProfile.dailyQuestClaimed} className={`glass card p-3 flex flex-col items-center justify-center border-l-4 transition-all active:scale-95 ${userProfile.dailyQuestClaimed ? 'border-green-500 bg-green-500/5' : (userProfile.dailyQuizzesCount >= 3 ? 'border-yellow-500 bg-yellow-500/10 animate-pulse' : 'border-orange-500 bg-white/5')}`}>
            <div className={`p-1.5 rounded-lg mb-1 ${userProfile.dailyQuestClaimed ? 'text-green-400' : (userProfile.dailyQuizzesCount >= 3 ? 'text-yellow-400' : 'text-orange-400')}`}>{userProfile.dailyQuestClaimed ? <Check size={18} /> : <Target size={18} />}</div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">{userProfile.dailyQuestClaimed ? 'Quest Done' : (userProfile.dailyQuizzesCount >= 3 ? 'Claim 500!' : `${userProfile.dailyQuizzesCount}/3 Quest`)}</p>
          </button>
          <button onClick={() => navigate('/mistakes')} className="glass card p-3 flex flex-col items-center justify-center border-l-4 border-red-500 hover:bg-white/5 transition-all active:scale-95">
            <div className="p-1.5 text-red-400 mb-1"><RotateCcw size={18} /></div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">My Mistakes</p>
          </button>
          <button onClick={() => { if (userProfile.isGuest) { playSound('wrong'); return; }; navigate('/profile'); }} className="glass card p-3 flex flex-col items-center justify-center border-l-4 border-violet-500 hover:bg-white/5 transition-all active:scale-95">
            <div className="p-1.5 text-violet-400 mb-1"><Award size={18} /></div>
            <p className="text-[9px] font-black uppercase tracking-tighter text-center leading-none">My Badges</p>
          </button>
        </div>

        <div className="px-1 mb-10">
          <div className="flex justify-between text-[10px] font-black mb-1.5 text-gray-500 uppercase tracking-widest"><span>Progress to Lv. {level + 1}</span><span>{Math.round(progress.percent)}%</span></div>
          <div className="w-full bg-white/5 rounded-full h-1.5 border border-white/5 overflow-hidden"><motion.div className="bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 h-full" initial={{ width: 0 }} animate={{ width: `${progress.percent}%` }} transition={{ duration: 1.5, ease: 'easeOut' }} /></div>
        </div>

        <div className="flex gap-1 mb-8 p-1 bg-white/5 rounded-2xl border border-white/10 sticky top-4 z-40 backdrop-blur-md">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => { playSound('click'); setSection(s.id); }} className="relative flex-1 py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors">
              {section === s.id && <motion.div layoutId="section-pill" className="absolute inset-0 bg-violet-600 shadow-lg shadow-violet-600/30 rounded-xl" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
              <span className={`relative z-10 flex items-center justify-center gap-1.5 ${section === s.id ? 'text-white' : 'text-gray-500'}`}><span className="text-lg">{s.emoji}</span><span className="text-[9px] sm:text-xs font-black">{s.label}</span></span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            {section === 'learn' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{LEARN_TILES.map((tile, i) => <DashboardTile key={tile.id} tile={tile} i={i} userProfile={userProfile} navigate={navigate} playSound={playSound} />)}</div>}
            {section === 'quizzes' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Object.values(CATEGORIES).map((cat, i) => <DashboardTile key={cat.id} tile={cat} i={i} userProfile={userProfile} navigate={navigate} playSound={playSound} category={true} />)}</div>}
            {section === 'puzzles' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{PUZZLE_TILES.map((tile, i) => <DashboardTile key={tile.id} tile={tile} i={i} userProfile={userProfile} navigate={navigate} playSound={playSound} />)}</div>}
            {section === 'fun' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{DAILY_TILES.map((tile, i) => <DashboardTile key={tile.id} tile={tile} i={i} userProfile={userProfile} navigate={navigate} playSound={playSound} fun={true} />)}</div>}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col items-center justify-center mt-12 mb-6 gap-4">
          <AnimatePresence>
            {(deferredPrompt || isIOS) && (
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} onClick={isIOS ? () => setShowIOSGuide(true) : handleInstall} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-950 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-orange-500/20 hover:scale-105 transition-transform"><Download size={16} strokeWidth={3} />{isIOS ? 'Install on iPhone / iPad' : 'Install BrainQuest App'}</motion.button>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/progress')} className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"><Star size={14} /> Parent Corner</button>
            <button onClick={() => setShowAbout(true)} className="flex items-center gap-2 text-gray-600 hover:text-gray-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em]"><Info size={14} /> About BrainQuest</button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAbout && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbout(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 flex items-center justify-center z-[60] px-4 pointer-events-none">
              <div className="glass card max-w-sm w-full text-center py-10 relative pointer-events-auto border-2 border-white/10">
                <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                <div className="text-6xl mb-4">🧠</div>
                <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">BrainQuest</h2>
                <p className="text-gray-400 text-sm mb-8 px-6 font-medium">A playful universe for curious minds. Master math, language, and the world around you.</p>
                <div className="bg-white/5 rounded-3xl p-6 mx-6">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Created by</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-3 bg-white/5 py-2 rounded-xl border border-white/5"><span className="text-xl">👨‍💻</span> <span className="font-bold text-white">Aarav Sharma</span></div>
                    <div className="flex items-center justify-center gap-3 bg-white/5 py-2 rounded-xl border border-white/5"><span className="text-xl">👨‍💼</span> <span className="font-bold text-white">Sanjay Sharma</span></div>
                  </div>
                </div>
                <p className="text-gray-600 text-[10px] font-bold mt-8 uppercase tracking-widest">© 2026 BrainQuest</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function DashboardTile({ tile, i, userProfile, navigate, playSound, category = false, fun = false }) {
  const locked = userProfile.isGuest && (category ? tile.id !== 'flags' : (fun ? tile.id !== 'jokes' : tile.id !== 'chess'))
  const isComingSoon = tile.isComingSoon
  const path = category ? `/quiz/${tile.id}` : (fun ? `${tile.path}?tab=${tile.id}` : tile.path)
  
  return (
    <motion.button 
      custom={i} 
      variants={cardVariants} 
      initial="hidden" 
      animate="visible" 
      whileHover={(locked || isComingSoon) ? {} : { scale: 1.02, y: -4 }} 
      whileTap={(locked || isComingSoon) ? {} : { scale: 0.98 }} 
      onClick={() => { 
        if (locked || isComingSoon) { playSound('wrong'); return }; 
        playSound('click'); 
        navigate(path); 
      }} 
      className={`relative overflow-hidden text-left rounded-[2rem] p-6 shadow-2xl bg-gradient-to-br ${tile.gradient || 'from-gray-800 to-gray-900'} group ${(locked || isComingSoon) ? 'grayscale opacity-60 cursor-not-allowed' : ''}`}
    >
      {locked && <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30"><div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 flex items-center gap-2 scale-75"><Lock size={16} className="text-white" /><span className="text-white font-black text-xs uppercase">Locked</span></div></div>}
      {isComingSoon && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 backdrop-blur-[2px]"><div className="bg-yellow-500 text-black px-4 py-2 rounded-2xl border-2 border-black/20 flex items-center gap-2 rotate-[-5deg] shadow-2xl"><Timer size={16} className="animate-pulse" /><span className="font-black text-xs uppercase tracking-widest">Coming Soon</span></div></div>}
      {tile.isNew && !locked && !isComingSoon && <div className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full z-20 animate-bounce shadow-xl">NEW</div>}
      <div className="text-5xl mb-4 transition-transform group-hover:scale-110 duration-500">{tile.emoji}</div>
      <h3 className="text-xl font-black mb-1 leading-tight">{tile.label}</h3>
      <p className="text-white/60 text-xs font-medium leading-relaxed">{tile.description}</p>
      {tile.xpNote && <div className="mt-4 inline-flex items-center gap-2 bg-black/20 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter border border-white/5"><Zap size={10} fill="white" />{tile.xpNote}</div>}
    </motion.button>
  )
}
