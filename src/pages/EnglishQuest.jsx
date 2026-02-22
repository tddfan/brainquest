import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, CheckCircle, XCircle, RotateCcw, Star, Languages, Swords, Check, Share2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../hooks/useSound'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { generateEnglishQuestions } from '../data/englishWords'
import { saveMistake } from '../firebase/mistakes'
import { AVATARS } from '../data/questions'

const TOPICS = [
  { id: 'meanings',  label: 'Meanings',  emoji: '📖', desc: 'What does the word mean?' },
  { id: 'synonyms',  label: 'Synonyms',  emoji: '🔁', desc: 'Same-meaning words' },
  { id: 'antonyms',  label: 'Antonyms',  emoji: '↔️', desc: 'Opposite-meaning words' },
  { id: 'grammar',   label: 'Grammar',   emoji: '✏️', desc: 'Grammar & sentence rules' },
]

const AGE_GROUPS = [
  { id: 'easy',   label: 'Junior (Age 6-10)', emoji: '🟢' },
  { id: 'medium', label: 'Pro (Age 11-14)',   emoji: '🟡' },
  { id: 'hard',   label: 'Master (Age 14+)',  emoji: '🔴' },
]

const XP_PER_Q = 50
const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function EnglishQuest() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const { playSound } = useSound()

  const [phase, setPhase] = useState('setup') 
  const [selectedTopics, setSelectedTopics] = useState(['meanings', 'synonyms'])
  const [level, setLevel] = useState('easy')
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [score, setScore] = useState(0)
  const [showFact, setShowFact] = useState(false)
  
  const [friends, setFriends] = useState([])
  const [sentTo, setSentTo] = useState([])
  const [duelLink, setDuelLink] = useState(null)
  const [creatingDuel, setCreatingDuel] = useState(false)

  // Load friends
  useEffect(() => {
    async function loadFriends() {
      if (!userProfile?.friends?.length) return
      const friendData = []
      for (const fuid of userProfile.friends) {
        const snap = await getDoc(doc(db, 'users', fuid))
        if (snap.exists()) friendData.push(snap.data())
      }
      setFriends(friendData)
    }
    if (phase === 'ended') loadFriends()
  }, [phase, userProfile])

  function toggleTopic(id) {
    setSelectedTopics(prev => prev.includes(id) ? (prev.length > 1 ? prev.filter(t => t !== id) : prev) : [...prev, id])
  }

  function startQuiz() {
    const qs = generateEnglishQuestions(selectedTopics, level)
    if (qs.length === 0) return
    setQuestions(qs); setIdx(0); setScore(0); setChosen(null); setShowFact(false); setSentTo([]); setDuelLink(null);
    setPhase('playing')
  }

  function handleAnswer(optIdx) {
    if (chosen !== null) return
    setChosen(optIdx)
    const correct = optIdx === questions[idx].correct
    if (correct) { 
      playSound('correct'); setScore(s => s + 1) 
      // Damage Boss
      updateDoc(doc(db, 'global', 'boss'), { hp: increment(-20) }).catch(() => {})
    }
    else { 
      playSound('wrong')
      saveMistake(currentUser?.uid || 'guest', questions[idx])
    }
    setShowFact(true)
  }

  function handleNext() {
    if (idx + 1 >= questions.length) {
      let earned = score * XP_PER_Q
      
      // XP Boost
      const isXPBoostActive = (userProfile?.activeBoosts?.xp || 0) > Date.now()
      if (isXPBoostActive) earned *= 2

      // Diamond Logic: 1 diamond for score >= 10 (perfect)
      let diamondsToEarn = score >= 10 ? 1 : 0
      const isDiamondBoostActive = (userProfile?.activeBoosts?.diamonds || 0) > Date.now()
      if (isDiamondBoostActive) diamondsToEarn *= 2

      if (earned > 0 || diamondsToEarn > 0) {
        if (currentUser) {
          const updateData = { 
            totalXP: increment(earned), 
            dailyXP: increment(earned), 
            englishCompleted: increment(1) 
          }
          if (diamondsToEarn > 0) updateData.diamonds = increment(diamondsToEarn)
          updateDoc(doc(db, 'users', currentUser.uid), updateData).catch(() => {})
        }
        setUserProfile(prev => ({ 
          ...prev, 
          totalXP: (prev?.totalXP ?? 0) + earned,
          diamonds: (prev?.diamonds ?? 0) + diamondsToEarn
        }))
      }
      setPhase('ended')
    } else {
      setIdx(i => i + 1); setChosen(null); setShowFact(false);
    }
  }

  const inviteFriend = async (friend) => {
    if (sentTo.includes(friend.uid)) return
    try {
      const duelData = {
        creatorUid: userProfile.uid, creatorName: userProfile.username,
        creatorScore: score, category: 'english', questions: questions, timestamp: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'duels'), duelData)
      await addDoc(collection(db, 'invites'), {
        fromName: userProfile.username, fromUid: userProfile.uid, toUid: friend.uid,
        duelId: docRef.id, categoryEmoji: '📖', categoryLabel: 'English Quest',
        status: 'pending', timestamp: serverTimestamp()
      })
      setSentTo(prev => [...prev, friend.uid]); playSound('claim')
    } catch (e) { console.error(e) }
  }

  const createDuelLink = async () => {
    setCreatingDuel(true)
    try {
      const duelData = {
        creatorUid: userProfile.uid, creatorName: userProfile.username,
        creatorScore: score, category: 'english', questions: questions, timestamp: serverTimestamp(),
      }
      const docRef = await addDoc(collection(db, 'duels'), duelData)
      const link = `${window.location.origin}/duel/${docRef.id}`
      if (navigator.share) {
        await navigator.share({ title: 'BrainQuest English Duel!', text: `I mastered ${score} words in English Quest! Can you beat my score?`, url: link })
      } else {
        setDuelLink(link)
      }
    } catch (e) { console.error(e) }
    setCreatingDuel(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> <span className="font-bold text-sm uppercase tracking-widest">Dashboard</span>
        </button>

        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-tighter">English Quest</h1>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">Master the Art of Language</p>
              </div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">1. Select Topics</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {TOPICS.map(t => (
                  <button key={t.id} onClick={() => toggleTopic(t.id)} className={`glass card p-5 text-left border-2 transition-all ${selectedTopics.includes(t.id) ? 'border-blue-500 bg-blue-500/25 scale-[1.02]' : 'border-transparent opacity-60'}`}>
                    <div className="text-3xl mb-2">{t.emoji}</div><div className="font-black text-base">{t.label}</div><div className="text-gray-500 text-[10px] font-bold uppercase tracking-wide">{t.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">2. Select Your Level</p>
              <div className="flex flex-col gap-3 mb-10">
                {AGE_GROUPS.map(g => (
                  <button key={g.id} onClick={() => setLevel(g.id)} className={`glass card p-5 text-left flex items-center gap-5 border-2 transition-all ${level === g.id ? 'border-blue-500 bg-blue-500/25 scale-[1.02] shadow-xl' : 'border-transparent opacity-60'}`}>
                    <div className="text-4xl">{g.emoji}</div><div className="flex-1"><h4 className="font-black text-lg">{g.label}</h4><p className="text-xs text-gray-400 font-bold uppercase tracking-widest">+{XP_PER_Q} XP per correct answer</p></div>
                    {level === g.id && <div className="bg-blue-500 rounded-full p-1"><CheckCircle size={20}/></div>}
                  </button>
                ))}
              </div>
              <button onClick={startQuiz} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-6 rounded-[2rem] text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-tighter">Start English Quest 📖</button>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 glass card px-6 py-3 border-white/10"><Star size={20} className="text-yellow-400" fill="currentColor" /><span className="font-black text-2xl">{score}</span></div>
                <div className="text-right"><p className="text-xs font-black text-gray-500 uppercase tracking-widest">Progress</p><p className="text-xl font-black text-blue-400">{idx + 1} <span className="text-sm text-gray-600">/ {questions.length}</span></p></div>
              </div>
              <div className="glass card p-10 mb-6 text-center border-white/5 relative overflow-hidden"><Languages className="absolute -top-4 -right-4 text-white/5" size={120} /><span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{questions[idx].type}</span><h2 className="text-3xl md:text-4xl font-black mt-6 leading-tight">{questions[idx].question}</h2></div>
              <div className="grid gap-3 mb-8">
                {questions[idx].options.map((opt, i) => {
                  let cls = 'glass card py-5 px-6 text-left font-black border-2 transition-all rounded-[1.5rem] w-full text-lg'
                  if (chosen !== null) {
                    if (i === questions[idx].correct) { cls += ' border-green-500 bg-green-500/20 text-green-400'; if (chosen !== i) cls += ' animate-pulse'; }
                    else if (i === chosen) cls += ' border-red-500 bg-red-500/20 text-red-400 opacity-70'
                    else cls += ' border-transparent opacity-20'
                  } else { cls += ' border-white/5 hover:border-blue-500 hover:bg-white/5 cursor-pointer active:scale-95' }
                  return <button key={i} onClick={() => handleAnswer(i)} disabled={chosen !== null} className={cls}><span className="text-gray-500 mr-4 font-mono">{OPTION_LETTERS[i]}</span>{opt}</button>
                })}
              </div>
              <AnimatePresence>{showFact && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-24"><div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6"><p className="text-gray-300 font-medium leading-relaxed italic">&ldquo;{questions[idx].fact}&rdquo;</p></div><button onClick={handleNext} className="w-full bg-white text-gray-950 font-black py-5 rounded-2xl text-xl shadow-xl hover:bg-gray-200 transition-colors">{idx + 1 >= questions.length ? 'Final Results 🏆' : 'Continue Quest →'}</button></motion.div>}</AnimatePresence>
            </motion.div>
          )}

          {phase === 'ended' && (
            <motion.div key="ended" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="glass card p-10 mb-6 border-white/10 shadow-2xl">
                <div className="text-7xl mb-4">{score >= 8 ? '🥇' : score >= 5 ? '🥈' : '📖'}</div>
                <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter">Quest Finish!</h2>
                <div className="text-6xl font-black text-yellow-400 mb-2">+{score * XP_PER_Q} XP</div>
                
                {/* Challenge Section */}
                <div className="mt-8 pt-8 border-t border-white/10">
                  {!duelLink ? (
                    <button onClick={createDuelLink} disabled={creatingDuel} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all"><Swords size={20}/> {creatingDuel ? 'Preparing Duel...' : 'CHALLENGE A FRIEND'}</button>
                  ) : (
                    <button onClick={() => { navigator.clipboard.writeText(duelLink); alert("Link copied!"); }} className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3"><Share2 size={20}/> COPY DUEL LINK</button>
                  )}

                  {friends.length > 0 && (
                    <div className="mt-6 bg-white/5 p-4 rounded-[2rem] border border-white/5">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Direct Challenge</p>
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {friends.map(f => (
                          <button key={f.uid} onClick={() => inviteFriend(f)} disabled={sentTo.includes(f.uid)} className="flex flex-col items-center gap-1 flex-shrink-0 group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${sentTo.includes(f.uid) ? 'border-green-500 bg-green-500/20' : 'border-white/10 bg-white/5 group-hover:border-blue-500'}`}>{sentTo.includes(f.uid) ? <Check size={20} className="text-green-400" /> : AVATARS[f.avatarIndex ?? 0]}</div>
                            <span className="text-[10px] font-bold text-gray-400 truncate w-12">{f.username}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={startQuiz} className="bg-white text-gray-950 py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"><RotateCcw size={24} /> Try Again</button>
                <button onClick={() => setPhase('setup')} className="glass card py-5 rounded-3xl font-black text-xl hover:bg-white/10 transition-colors">Setup</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
