import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Zap, Trophy, RotateCcw, Target, User, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../hooks/useSound'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'

import { saveMistake } from '../firebase/mistakes'

const DURATION = 60

const AGE_GROUPS = [
  { id: 'kids',   label: 'Junior (Age 5-8)', emoji: '🐣' },
  { id: 'middle', label: 'Pro (Age 9-12)',   emoji: '🧠' },
  { id: 'expert', label: 'Master (Age 13+)',  emoji: '⚡' },
]

const LEVELS = {
  kids: {
    1: { label: 'Counting & Addition', xp: 5,  desc: 'Sums up to 15', gen: () => { const a=rnd(1,10), b=rnd(1,5); return { q:`${a} + ${b} = ?`, ans: a+b }} },
    2: { label: 'Subtraction Fun',     xp: 8,  desc: 'Minus up to 15', gen: () => { const a=rnd(10,15), b=rnd(1,a-1); return { q:`${a} − ${b} = ?`, ans: a-b }} },
    3: { label: 'Number Ninja',        xp: 12, desc: 'Mixed basic +/-', gen: () => { 
      if (Math.random()>0.5) { const a=rnd(10,25), b=rnd(5,15); return { q:`${a} + ${b} = ?`, ans: a+b }}
      const a=rnd(15,30), b=rnd(1,14); return { q:`${a} − ${b} = ?`, ans: a-b }
    }},
    4: { label: 'Money Math',          xp: 15, desc: 'Coins & Change', gen: () => { 
      const t = rnd(0,1);
      if (t===0) { const a=rnd(1,10), b=rnd(1,10); return { q:`$${a} + $${b} = ?$`, ans: a+b }}
      const a=[10,20,50][rnd(0,2)], b=rnd(1,9); return { q:`$${a} − $${b} = ?$`, ans: a-b }
    }},
    5: { label: 'Double Trouble',      xp: 18, desc: 'Double & Triple', gen: () => { 
      if (Math.random()>0.5) { const a=rnd(1,20); return { q:`Double of ${a} is?`, ans: a*2 }}
      const a=rnd(1,10); return { q:`Triple of ${a} is?`, ans: a*3 }
    }},
    6: { label: 'Junior Grandmaster',  xp: 30, desc: 'Final Challenge', gen: () => { 
      const t = rnd(0,3);
      if (t===0) { const a=rnd(20,40), b=rnd(10,20); return { q:`${a} + ${b} = ?`, ans: a+b }}
      if (t===1) { const a=rnd(30,50), b=rnd(15,29); return { q:`${a} − ${b} = ?`, ans: a-b }}
      if (t===2) { const m=rnd(2,5), b=rnd(2,10); return { q:`${m} × ${b} = ?`, ans: m*b }}
      return { q:`Half of ${rnd(1,15)*2} is?`, ans: rnd(1,15) }
    }},
  },
  middle: {
    1: { label: 'Multiplication Pro',  xp: 10, desc: 'Tables up to 10', gen: () => { const a=rnd(3,10), b=rnd(3,10); return { q:`${a} × ${b} = ?`, ans: a*b }} },
    2: { label: 'Division Dash',       xp: 15, desc: 'Divide up to 100', gen: () => { const d=rnd(2,10), q=rnd(3,10); return { q:`${d*q} ÷ ${d} = ?`, ans: q }} },
    3: { label: 'The Optimizer',       xp: 20, desc: 'Mixed Speed Tables', gen: () => { 
      if (Math.random()>0.5) { const a=rnd(11,15), b=rnd(2,9); return { q:`${a} × ${b} = ?`, ans: a*b }}
      const d=rnd(3,12), q=rnd(11,15); return { q:`${d*q} ÷ ${d} = ?`, ans: q }
    }},
    4: { label: 'Fraction Action',     xp: 30, desc: 'Mixed Fractions', gen: () => { 
      const t = rnd(0,3);
      if (t===0) { const a=rnd(1,10)*2; return { q:`1/2 of ${a} = ?`, ans: a/2 }}
      if (t===1) { const a=rnd(1,10)*4; return { q:`1/4 of ${a} = ?`, ans: a/4 }}
      if (t===2) { const a=rnd(1,10)*3; return { q:`1/3 of ${a} = ?`, ans: a/3 }}
      if (t===3) { const a=rnd(1,5)*4; return { q:`3/4 of ${a} = ?`, ans: (a/4)*3 }}
      const a=rnd(1,5)*3; return { q:`2/3 of ${a} = ?`, ans: (a/3)*2 }
    }},
    5: { label: 'Time & Units',        xp: 35, desc: 'Hours, Mins, KM', gen: () => { 
      const t = rnd(0,2);
      if (t===0) { const h=rnd(1,12); return { q:`${h} hours = ? mins`, ans: h*60 }}
      if (t===1) { const m=rnd(1,10)*60; return { q:`${m} mins = ? hours`, ans: m/60 }}
      return { q:`${rnd(1,15)} km = ? meters`, ans: rnd(1,15)*1000 }
    }},
    6: { label: 'Pro Grandmaster',     xp: 50, desc: 'Advanced Speed Mix', gen: () => {
      const t = rnd(0,3);
      if (t===0) { const a=rnd(12,20), b=rnd(11,15); return { q:`${a} × ${b} = ?`, ans: a*b }}
      if (t===1) { const p=[10,20,25,50,75][rnd(0,4)], tot=rnd(1,10)*40; return { q:`${p}% of ${tot} = ?`, ans: (p*tot)/100 }}
      if (t===2) { const n=rnd(2,12); return { q:`${n}² = ?`, ans: n*n }}
      return { q:`3/4 of 40 = ?`, ans: 30 }
    }},
  },
  expert: {
    1: { label: 'Algebra Basics',      xp: 25, desc: 'Linear Equations', gen: () => { 
      const t = rnd(0,1);
      if (t===0) { const a=rnd(10,50), x=rnd(5,30); return { q:`X + ${a} = ${x+a} → X=?`, ans: x }}
      const a=rnd(5,20), x=rnd(5,20); return { q:`${a}X = ${a*x} → X=?`, ans: x }
    }},
    2: { label: 'Squares & Roots',     xp: 40, desc: 'Powers up to 25', gen: () => { 
      const n=rnd(11,25); return Math.random()>0.5 ? { q:`${n}² = ?`, ans: n*n } : { q:`√${n*n} = ?`, ans: n }
    }},
    3: { label: 'Complex Algebra',     xp: 60, desc: 'Multi-step Logic', gen: () => { 
      const t = rnd(0,2);
      if (t===0) { const a=rnd(2,6), x=rnd(3,15), b=rnd(5,30); return { q:`${a}X + ${b} = ${a*x+b} → X=?`, ans: x } }
      if (t===1) { const a=rnd(2,5), x=rnd(4,12), b=rnd(10,40); return { q:`${a}X − ${b} = ${a*x-b} → X=?`, ans: x } }
      const a=rnd(2,4), x=rnd(2,5); return { q:`${a}X² = ${a*x*x} → X=?`, ans: x }
    }},
    4: { label: 'Geometry & Angles',   xp: 65, desc: 'Triangles & Circles', gen: () => { 
      const t = rnd(0,2);
      if (t===0) { const a=rnd(20,160); return { q:`Line: ${a}° + X = 180° → X=?`, ans: 180-a }}
      if (t===1) { const a=rnd(20,80), b=rnd(20,80); return { q:`Triangle: ${a}°, ${b}°, X° → X=?`, ans: 180-a-b }}
      return { q:`Square side 9, Area = ?`, ans: 81 }
    }},
    5: { label: 'Power Play',          xp: 75, desc: 'Higher Exponents', gen: () => { 
      const t = rnd(0,1);
      if (t===0) { const a=[2,3,4,5,10][rnd(0,4)], b=[3,4,5][rnd(0,2)]; if (a===10 && b===5) return { q:`10 to power 4=?`, ans: 10000 }; return { q:`${a} to power ${b} = ?`, ans: Math.pow(a,b) }}
      const x=rnd(2,5); return { q:`X³ = ${x*x*x} → X=?`, ans: x }
    }},
    6: { label: 'Master Grandmaster',  xp: 100, desc: 'Genius Level Mix', gen: () => {
      const t = rnd(0,3);
      if (t===0) { const a=rnd(5,12), x=rnd(11,20), b=rnd(20,100); return { q:`${a}X + ${b} = ${a*x+b} → X=?`, ans: x }}
      if (t===1) { const n=rnd(15,30); return { q:`${n}² = ?`, ans: n*n }}
      if (t===2) { const n=rnd(20,40), m=rnd(12,25); return { q:`${n} × ${m} = ?`, ans: n*m }}
      return { q:`15% of 200 = ?`, ans: 30 }
    }},
  }
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function makeOptions(ans) {
  const set = new Set([ans])
  while (set.size < 4) {
    const d = rnd(1, Math.max(5, Math.ceil(Math.abs(ans)*0.3))) * (Math.random()>0.5 ? 1 : -1)
    if (ans+d !== ans) set.add(ans+d)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

export default function MathsQuest() {
  const navigate = useNavigate()
  const { currentUser, setUserProfile, isGuest } = useAuth()
  const { playSound } = useSound()

  const [phase, setPhase] = useState('setup') 
  const [ageGroup, setAgeGroup] = useState('middle')
  const [level, setLevel] = useState(1)
  
  const [question, setQuestion] = useState(null)
  const [options, setOptions] = useState([])
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState(null)
  
  const scoreRef = useRef(0)
  const timerRef = useRef(null)

  const currentConfig = LEVELS[ageGroup][level]
  const bestKey = `mq_best_${ageGroup}_${level}`
  const bestScore = parseInt(localStorage.getItem(bestKey) || '0')

  function nextQuestion() {
    // CRITICAL: Reset flash BEFORE setting new question to prevent highlight bleed
    setFlash(null)
    const q = currentConfig.gen()
    setQuestion(q)
    setOptions(makeOptions(q.ans))
  }

  function startGame() {
    scoreRef.current = 0
    setScore(0)
    setTimeLeft(DURATION)
    setFlash(null)
    const q = currentConfig.gen()
    setQuestion(q)
    setOptions(makeOptions(q.ans))
    setPhase('playing')
  }

  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPhase('ended'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  useEffect(() => {
    if (phase !== 'ended') return
    const finalScore = scoreRef.current
    const xpEarned = finalScore * currentConfig.xp
    if (finalScore > bestScore) localStorage.setItem(bestKey, finalScore.toString())
    if (xpEarned === 0) return
    if (!isGuest && currentUser) {
      updateDoc(doc(db, 'users', currentUser.uid), { 
        totalXP: increment(xpEarned),
        dailyXP: increment(xpEarned)
      }).catch(() => {})
    }
    setUserProfile(prev => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + xpEarned }))
  }, [phase])

  function handleAnswer(opt) {
    if (flash) return
    const correct = opt === question.ans
    if (correct) {
      playSound('correct'); setFlash('correct'); scoreRef.current++; setScore(s => s + 1)
    } else {
      playSound('wrong'); setFlash('wrong')
      saveMistake(currentUser?.uid || 'guest', {
        ...question,
        category: 'maths',
        type: 'Maths Challenge'
      })
    }
    // Small delay to show the feedback, then load next
    setTimeout(nextQuestion, 600)
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
                <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-tighter">Maths Quest</h1>
                <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.2em]">The 60-Second Brain Sprint</p>
              </div>

              <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-3xl border border-white/10">
                {AGE_GROUPS.map(g => (
                  <button key={g.id} onClick={() => { setAgeGroup(g.id); setLevel(1); }}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${ageGroup === g.id ? 'bg-violet-600 text-white shadow-xl shadow-violet-600/20' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <div className="text-2xl mb-1">{g.emoji}</div> {g.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 mb-10 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                {[1,2,3,4,5,6].map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`w-full glass card p-4 text-left flex items-center gap-4 border-2 transition-all ${level === l ? 'border-violet-500 bg-violet-500/25 scale-[1.02] shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${level === l ? 'bg-violet-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                      {l === 6 ? <Star size={18} fill="currentColor" /> : l}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-base truncate">{LEVELS[ageGroup][l].label}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{LEVELS[ageGroup][l].desc}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-violet-400 font-black text-[10px]">+{LEVELS[ageGroup][l].xp} XP</div>
                    </div>
                  </button>
                ))}
              </div>

              {bestScore > 0 && (
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3">
                  <Trophy className="text-yellow-400" size={24} />
                  <div>
                    <p className="text-xs font-black text-yellow-400/60 uppercase tracking-widest">Goal to beat</p>
                    <p className="text-xl font-black text-yellow-400">{bestScore} Correct <span className="text-sm opacity-60">in 60s</span></p>
                  </div>
                </div>
              )}

              <button onClick={startGame} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-950 font-black py-6 rounded-[2rem] text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-500/20 uppercase tracking-tighter">
                Start Quest ⚡
              </button>
            </motion.div>
          )}

          {phase === 'playing' && question && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 glass card px-6 py-3 border-white/10">
                  <Target size={24} className="text-yellow-400" />
                  <span className="font-black text-3xl">{score}</span>
                </div>
                <div className={`flex flex-col items-end gap-1 ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                  <div className="flex items-center gap-2">
                    <Clock size={20} className={timeLeft <= 10 ? 'text-red-500' : 'text-violet-400'} />
                    <span className={`font-black text-3xl tabular-nums ${timeLeft <= 10 ? 'text-red-500' : ''}`}>{timeLeft}s</span>
                  </div>
                  <div className="w-32 bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-violet-500" animate={{ width: `${(timeLeft/DURATION)*100}%` }} />
                  </div>
                </div>
              </div>

              <motion.div key={question.q} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`glass card p-8 text-center mb-8 border-4 transition-all duration-200 ${flash==='correct'?'border-green-500 bg-green-500/10':flash==='wrong'?'border-red-500 bg-red-500/10':'border-white/10 shadow-2xl'}`}
              >
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">{question.q}</h2>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {options.map((opt, i) => {
                  let borderCls = 'border-transparent'
                  if (flash === 'correct' && opt === question.ans) borderCls = 'border-green-500 bg-green-500/20'
                  if (flash === 'wrong') {
                    if (opt === question.ans) borderCls = 'border-green-500 bg-green-500/20 animate-pulse'
                    else borderCls = 'border-red-500 bg-red-500/20 opacity-50'
                  }

                  return (
                    <button key={i} onClick={() => handleAnswer(opt)} disabled={!!flash}
                      className={`glass card py-8 text-4xl font-black rounded-3xl hover:bg-violet-600/20 hover:border-violet-500 border-2 transition-all active:scale-95 disabled:cursor-default ${borderCls}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {phase === 'ended' && (
            <motion.div key="ended" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="glass card p-12 mb-8 border-white/10 shadow-2xl">
                <div className="text-8xl mb-6">{score >= 15 ? '👑' : score >= 8 ? '🌟' : '🔥'}</div>
                <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter">Time&apos;s Up!</h2>
                <p className="text-gray-400 font-bold mb-8 uppercase tracking-widest text-sm">You solved {score} challenges</p>
                <div className="text-6xl font-black text-yellow-400 mb-2">+{score * currentConfig.xp} XP</div>
                {score > bestScore && score > 0 && <div className="text-green-400 font-black text-sm uppercase tracking-widest animate-bounce mt-4">New Record Set! 🏆</div>}
              </div>

              <div className="grid gap-4">
                <button onClick={startGame} className="bg-white text-gray-950 py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors">
                  <RotateCcw size={24} /> Play Again
                </button>
                <button onClick={() => setPhase('setup')} className="glass card py-5 rounded-3xl font-black text-xl hover:bg-white/10 transition-colors">
                  Change Level
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
