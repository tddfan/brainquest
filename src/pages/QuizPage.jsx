import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import confetti from 'canvas-confetti'
import { useSound } from '../hooks/useSound'
import {
  STATIC_QUESTIONS,
  fetchFlagQuestions,
  fetchAPIQuestions,
  shuffleAndPick,
  CATEGORIES,
  XP_CORRECT,
  XP_SPEED_BONUS,
  XP_STREAK_BONUS,
  calcLevel,
} from '../data/questions'
import { ArrowLeft, Zap, Flame, Clock } from 'lucide-react'

const QUESTION_TIME = 20 // seconds per question

export default function QuizPage() {
  const { category } = useParams()
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()
  const { playSound } = useSound()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)      // index of chosen option
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)
  const [sessionXP, setSessionXP] = useState(0)
  const [results, setResults] = useState([])           // per-question result log
  const [phase, setPhase] = useState('question')       // 'question' | 'feedback' | 'done'
  const [answerTime, setAnswerTime] = useState(null)   // seconds taken to answer
  const [refreshKey, setRefreshKey] = useState(0)      // increment to reload questions

  const cat = CATEGORIES[category]

  // Load questions — API-backed for science/tech/history/superheroes, shuffled static for rest
  const API_CATEGORIES = ['science', 'tech', 'history', 'superheroes']

  useEffect(() => {
    setLoading(true)
    async function load() {
      let qs
      if (category === 'flags') {
        qs = await fetchFlagQuestions()
      } else if (API_CATEGORIES.includes(category)) {
        try {
          const apiQs = await fetchAPIQuestions(category)
          qs = apiQs.slice(0, 10)
        } catch {
          qs = shuffleAndPick(STATIC_QUESTIONS[category] ?? [], 10)
        }
      } else {
        qs = shuffleAndPick(STATIC_QUESTIONS[category] ?? [], 10)
      }
      setQuestions(qs)
      setLoading(false)
    }
    load()
  }, [category, refreshKey])

  // Countdown timer
  useEffect(() => {
    if (loading || phase !== 'question') return
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id)
          handleAnswer(null) // time expired — wrong
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [current, phase, loading])

  function handleAnswer(optionIndex) {
    if (phase !== 'question') return
    const elapsed = QUESTION_TIME - timeLeft
    setAnswerTime(elapsed)

    const q = questions[current]
    const isCorrect = optionIndex === q.correct
    setSelected(optionIndex)

    if (isCorrect) playSound('correct')
    else playSound('wrong')

    let xpGained = 0
    if (isCorrect) {
      xpGained += XP_CORRECT
      if (elapsed <= 10) xpGained += XP_SPEED_BONUS
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak >= 3) xpGained += XP_STREAK_BONUS
    } else {
      setStreak(0)
    }

    setSessionXP((prev) => prev + xpGained)
    setResults((prev) => [...prev, { correct: isCorrect, xp: xpGained }])
    setPhase('feedback')
  }

  async function nextQuestion() {
    const isLast = current === questions.length - 1
    if (isLast) {
      // Persist XP to Firestore
      const totalCorrect = results.filter((r) => r.correct).length + (selected === questions[current].correct ? 1 : 0)
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          totalXP: increment(sessionXP),
          quizzesCompleted: increment(1),
          dailyQuizzesCount: increment(1),
        })
        // Log quiz history
        await addDoc(collection(db, 'quizHistory'), {
          uid: currentUser.uid,
          username: userProfile?.username,
          category,
          score: totalCorrect,
          total: questions.length,
          xpEarned: sessionXP,
          timestamp: serverTimestamp(),
        })
        // Update local profile state
        setUserProfile((prev) => ({
          ...prev,
          totalXP: (prev?.totalXP ?? 0) + sessionXP,
          quizzesCompleted: (prev?.quizzesCompleted ?? 0) + 1,
          dailyQuizzesCount: (prev?.dailyQuizzesCount ?? 0) + 1,
        }))
      } catch (e) {
        console.error('Error saving results:', e)
      }
      setPhase('done')
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
      setTimeLeft(QUESTION_TIME)
      setAnswerTime(null)
      setPhase('question')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          {cat?.emoji ?? '⏳'}
        </motion.div>
      </div>
    )
  }

  function handlePlayAgain() {
    setCurrent(0)
    setSelected(null)
    setStreak(0)
    setTimeLeft(QUESTION_TIME)
    setSessionXP(0)
    setResults([])
    setPhase('question')
    setAnswerTime(null)
    setRefreshKey((k) => k + 1)
  }

  if (phase === 'done') {
    return <ResultsScreen results={results} sessionXP={sessionXP} category={cat} navigate={navigate} userProfile={userProfile} onPlayAgain={handlePlayAgain} />
  }

  const q = questions[current]
  const progress = ((current) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${cat.gradient} text-sm font-bold`}>
            {cat.emoji} {cat.label}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 bg-white/10 rounded-full h-2.5">
            <motion.div
              className={`h-2.5 rounded-full bg-gradient-to-r ${cat.gradient}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-sm font-bold text-gray-400 shrink-0">
            {current + 1}/{questions.length}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 mb-6">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${timeLeft <= 5 ? 'bg-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 text-gray-300'}`}>
            <Clock size={14} />
            {timeLeft}s
          </div>
          {/* Streak */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${streak >= 3 ? 'bg-orange-500/30 text-orange-400' : 'bg-white/10 text-gray-300'}`}>
            <Flame size={14} />
            {streak} streak
          </div>
          {/* Session XP */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold bg-violet-500/20 text-violet-300 ml-auto">
            <Zap size={14} />
            +{sessionXP} XP
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass card mb-5">
              {q.emoji && (
                <p className="text-center text-5xl tracking-widest mb-3 leading-snug">{q.emoji}</p>
              )}
              {q.flagUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={q.flagUrl}
                    alt="Flag"
                    className="h-28 w-auto rounded-xl shadow-lg object-cover border border-white/10"
                    onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
                  />
                </div>
              )}
              {q.imageUrl && (
                <div className="flex justify-center mb-4 relative min-h-[160px] bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <img
                    src={q.imageUrl}
                    alt="Question image"
                    className="w-full max-h-64 object-cover transition-opacity duration-300"
                    onLoad={(e) => { e.currentTarget.style.opacity = '1' }}
                    style={{ opacity: 0 }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedFinal) {
                        target.dataset.triedFinal = 'true';
                        target.src = `https://placehold.co/600x400/1e1b4b/white?text=Image+unavailable`;
                      }
                    }}
                  />
                  {/* Skeleton loader overlay */}
                  <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none -z-10 flex items-center justify-center">
                    <span className="text-white/10">📸</span>
                  </div>
                </div>
              )}
              {q.logoUrl && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white rounded-2xl p-5 shadow-lg flex items-center justify-center" style={{ minWidth: 160, minHeight: 120 }}>
                    <img
                      src={q.logoUrl}
                      alt="Logo"
                      className="max-h-24 max-w-[200px] object-contain"
                      onError={(e) => { e.currentTarget.parentElement.parentElement.style.display = 'none' }}
                    />
                  </div>
                </div>
              )}
              <p className="text-lg md:text-xl font-extrabold text-center leading-snug">
                {q.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {q.options.map((opt, i) => {
                let style = 'bg-white/5 border border-white/10 hover:bg-white/10'
                if (phase === 'feedback') {
                  if (i === q.correct) style = 'bg-green-500/30 border-2 border-green-400'
                  else if (i === selected && i !== q.correct) style = 'bg-red-500/20 border-2 border-red-400'
                  else style = 'bg-white/5 border border-white/5 opacity-50'
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={phase === 'question' ? { scale: 1.02 } : {}}
                    whileTap={phase === 'question' ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={phase === 'feedback'}
                    className={`w-full text-left rounded-2xl px-5 py-4 font-bold transition-all duration-200 ${style}`}
                  >
                    <span className="mr-3 opacity-60 text-sm">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </motion.button>
                )
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {phase === 'feedback' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 mb-28"
                >
                  <div className={`glass card py-4 border-l-4 ${selected === q.correct ? 'border-green-400' : 'border-red-400'}`}>
                    <p className={`font-black text-lg mb-1 ${selected === q.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {selected === q.correct ? '🎉 Correct!' : '❌ Not quite!'}
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">💡 {q.fact}</p>
                    {selected === q.correct && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                          +{XP_CORRECT} XP
                        </span>
                        {answerTime <= 10 && (
                          <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                            ⚡ Speed Bonus +{XP_SPEED_BONUS} XP
                          </span>
                        )}
                        {streak >= 3 && (
                          <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full">
                            🔥 Streak Bonus +{XP_STREAK_BONUS} XP
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Next button — stays at bottom of screen during feedback, no layout shift on mobile */}
      <AnimatePresence>
        {phase === 'feedback' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent z-40"
          >
            <div className="max-w-2xl mx-auto">
              <button onClick={nextQuestion} className="btn-primary w-full text-center text-lg">
                {current === questions.length - 1 ? 'See Results 🏆' : 'Next Question →'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ results, sessionXP, navigate, userProfile, onPlayAgain }) {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  const pct = Math.round((correct / total) * 100)
  const prevXP = (userProfile?.totalXP ?? 0) - sessionXP
  const newXP = userProfile?.totalXP ?? 0
  const prevLevel = calcLevel(prevXP)
  const newLevel = calcLevel(newXP)
  const leveledUp = newLevel > prevLevel

  useEffect(() => {
    if (pct >= 80) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else if (pct >= 50) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [pct]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="glass card max-w-md w-full text-center py-10"
      >
        {/* Level up banner */}
        <AnimatePresence>
          {leveledUp && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-lg"
            >
              🚀 LEVEL UP! → Level {newLevel}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-7xl mb-4">
          {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚'}
        </div>
        <h2 className="text-3xl font-black mb-1">
          {pct >= 80 ? 'Brilliant!' : pct >= 50 ? 'Good Work!' : 'Keep Practising!'}
        </h2>
        <p className="text-gray-400 mb-6">
          {correct} / {total} correct &nbsp;·&nbsp; {pct}%
        </p>

        {/* XP earned */}
        <div className="glass rounded-2xl py-4 px-6 mb-6 flex items-center justify-center gap-3">
          <Zap size={24} className="text-violet-400" fill="currentColor" />
          <span className="text-3xl font-black text-violet-300">+{sessionXP} XP</span>
        </div>

        {/* Score bar */}
        <div className="w-full bg-white/10 rounded-full h-3 mb-8">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={onPlayAgain}
            className="btn-primary flex-1"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="btn-secondary flex-1"
          >
            Leaderboard
          </button>
        </div>
      </motion.div>
    </div>
  )
}
