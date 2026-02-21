import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Timer, RotateCcw, Trophy } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../hooks/useSound'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebase/config'

const EMOJI_POOL = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐸','🐵','🐔','🦋','🌺','🌈','⭐','🎮','🚀',
  '💎','🎪','🎭','🎨','🌙','☀️','❄️','🌊','🎵','🏆',
]

const DIFFICULTIES = {
  easy:   { label: 'Easy',   emoji: '🟢', cols: 4, pairs: 6,  xp: 150, desc: '4×3 grid · 6 pairs' },
  medium: { label: 'Medium', emoji: '🟡', cols: 4, pairs: 8,  xp: 250, desc: '4×4 grid · 8 pairs' },
  hard:   { label: 'Hard',   emoji: '🔴', cols: 5, pairs: 10, xp: 400, desc: '5×4 grid · 10 pairs' },
}

function buildCards(pairs) {
  const emojis = [...EMOJI_POOL].sort(() => Math.random() - 0.5).slice(0, pairs)
  return [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }))
}

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function MemoryGame() {
  const navigate = useNavigate()
  const { currentUser, setUserProfile, isGuest } = useAuth()
  const { playSound } = useSound()

  const [phase, setPhase] = useState('setup') // 'setup' | 'playing' | 'ended'
  const [difficulty, setDifficulty] = useState('easy')
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState([])   // indices of face-up un-matched cards
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [time, setTime] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const timerRef = useRef(null)

  const config = DIFFICULTIES[difficulty]

  function startGame() {
    clearInterval(timerRef.current)
    setCards(buildCards(config.pairs))
    setSelected([])
    setMoves(0)
    setMatched(0)
    setTime(0)
    setDisabled(false)
    setPhase('playing')
  }

  // Timer
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // Check for win
  useEffect(() => {
    if (phase !== 'playing' || matched === 0 || matched < config.pairs) return
    clearInterval(timerRef.current)
    const xpEarned = config.xp
    if (!isGuest && currentUser) {
      updateDoc(doc(db, 'users', currentUser.uid), {
        totalXP: increment(xpEarned),
        dailyXP: increment(xpEarned),
        puzzlesCompleted: increment(1),
      }).catch(() => {})
    }
    setUserProfile(prev => ({
      ...prev,
      totalXP: (prev?.totalXP ?? 0) + xpEarned,
      puzzlesCompleted: (prev?.puzzlesCompleted ?? 0) + 1,
    }))
    setTimeout(() => setPhase('ended'), 600)
  }, [matched]) // eslint-disable-line

  function handleCardClick(idx) {
    if (disabled || cards[idx].flipped || cards[idx].matched) return

    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c)
    setCards(newCards)

    const newSelected = [...selected, idx]

    if (newSelected.length === 2) {
      setMoves(m => m + 1)
      setSelected([])
      const [a, b] = newSelected

      if (newCards[a].emoji === newCards[b].emoji) {
        // Match!
        playSound('correct')
        setCards(prev => prev.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c))
        setMatched(m => m + 1)
      } else {
        // No match — flip back after delay
        setDisabled(true)
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            (i === a || i === b) && !c.matched ? { ...c, flipped: false } : c
          ))
          setDisabled(false)
        }, 900)
      }
    } else {
      setSelected(newSelected)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-bold text-sm">Dashboard</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Memory Game</h1>
          <p className="text-gray-400">Flip cards and find all the matching pairs!</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── SETUP ───────────────────────────────────────────────────────── */}
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Choose Difficulty</p>
              <div className="grid gap-3 mb-8">
                {Object.entries(DIFFICULTIES).map(([key, d]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`glass card p-5 text-left flex items-center gap-4 border-2 transition-all ${difficulty === key ? 'border-purple-500 bg-purple-500/25 shadow-lg shadow-purple-500/20 scale-[1.01]' : 'border-transparent hover:border-white/20'}`}
                  >
                    <span className="text-3xl">{d.emoji}</span>
                    <div className="flex-1">
                      <div className="font-black text-lg">{d.label}</div>
                      <div className="text-gray-400 text-sm">{d.desc}</div>
                    </div>
                    <div className="text-purple-400 font-bold text-sm">+{d.xp} XP</div>
                  </button>
                ))}
              </div>
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-5 rounded-3xl text-xl hover:scale-105 transition-transform shadow-2xl"
              >
                Start Game! 🧠
              </button>
            </motion.div>
          )}

          {/* ── PLAYING ─────────────────────────────────────────────────────── */}
          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* HUD */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 glass card px-4 py-2">
                  <span className="text-gray-400 text-sm font-bold">Moves</span>
                  <span className="font-black text-xl">{moves}</span>
                </div>
                <div className="glass card px-4 py-2 text-center">
                  <div className="text-sm font-black text-purple-300">{matched}/{config.pairs} pairs</div>
                  <div className="text-xs text-gray-500 font-bold capitalize">{difficulty}</div>
                </div>
                <div className="flex items-center gap-2 glass card px-4 py-2">
                  <Timer size={16} className="text-purple-400" />
                  <span className="font-black text-xl">{formatTime(time)}</span>
                </div>
              </div>

              {/* Card grid */}
              <div
                className="grid gap-3 md:gap-5"
                style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}
              >
                {cards.map((card, i) => (
                  <div
                    key={card.id}
                    className={`aspect-square cursor-pointer ${disabled && !card.matched ? 'pointer-events-none' : ''}`}
                    style={{ perspective: '1000px' }}
                    onClick={() => handleCardClick(i)}
                  >
                    <motion.div
                      animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: 'backOut' }}
                      style={{
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      {/* Back face */}
                      <div
                        style={{ backfaceVisibility: 'hidden' }}
                        className="absolute inset-0 rounded-[2rem] flex items-center justify-center text-5xl font-black bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 shadow-2xl border-4 border-white/10 select-none hover:border-white/30 transition-colors"
                      >
                        ?
                      </div>
                      {/* Front face */}
                      <div
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        className={`absolute inset-0 rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl select-none ${
                          card.matched
                            ? 'bg-green-600/30 border-4 border-green-500'
                            : 'bg-gradient-to-br from-violet-600 to-pink-600 border-4 border-white/20'
                        }`}
                      >
                        {card.emoji}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              <button
                onClick={startGame}
                className="mt-6 w-full glass card py-3 flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw size={16} /> Restart
              </button>
            </motion.div>
          )}

          {/* ── ENDED ───────────────────────────────────────────────────────── */}
          {phase === 'ended' && (
            <motion.div key="ended" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="glass card p-10 mb-6">
                <div className="text-7xl mb-4">🎉</div>
                <h2 className="text-4xl font-black mb-2">You Win!</h2>
                <p className="text-gray-400 mb-1">{moves} moves &nbsp;·&nbsp; {formatTime(time)}</p>
                <p className="text-gray-500 text-sm mb-6">Difficulty: {config.label}</p>
                <div className="text-5xl font-black text-yellow-400">+{config.xp} XP</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button onClick={startGame} className="glass card py-4 flex items-center justify-center gap-2 font-bold hover:bg-white/10 transition-colors">
                  <RotateCcw size={18} /> Play Again
                </button>
                <button onClick={() => setPhase('setup')} className="glass card py-4 flex items-center justify-center gap-2 font-bold hover:bg-white/10 transition-colors">
                  <Trophy size={18} /> Change Level
                </button>
              </div>
              <button onClick={() => navigate('/')} className="w-full glass card py-4 text-gray-400 hover:text-white font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
