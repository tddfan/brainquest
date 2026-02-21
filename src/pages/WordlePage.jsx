import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { getRandomWord, VALID_GUESSES } from '../data/words'
import { ArrowLeft, Zap } from 'lucide-react'

const MAX_GUESSES = 6
const WORD_LENGTH = 5

// XP by number of guesses used (index = guesses used, 1-based)
const XP_TABLE = [0, 300, 250, 200, 150, 125, 100]

const QWERTY_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

// Check a guess against the target — handles duplicate letters correctly
function checkGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill('absent')
  const targetArr = target.split('')
  const guessArr  = guess.split('')
  const targetCount = {}

  // First pass: mark greens
  guessArr.forEach((l, i) => {
    if (l === targetArr[i]) {
      result[i] = 'correct'
      targetCount[targetArr[i]] = (targetCount[targetArr[i]] ?? 0) - 1
    } else {
      targetCount[targetArr[i]] = (targetCount[targetArr[i]] ?? 0) + 1
    }
  })

  // Second pass: mark yellows
  guessArr.forEach((l, i) => {
    if (result[i] === 'correct') return
    if (targetCount[l] && targetCount[l] > 0) {
      result[i] = 'present'
      targetCount[l]--
    }
  })

  return result
}

const TILE_COLORS = {
  correct: 'bg-green-500 border-green-500 text-white',
  present: 'bg-yellow-500 border-yellow-500 text-white',
  absent:  'bg-gray-700 border-gray-700 text-white',
  tbd:     'bg-transparent border-gray-500 text-white',
  empty:   'bg-transparent border-gray-700 text-gray-700',
}

const KEY_COLORS = {
  correct: 'bg-green-500 text-white',
  present: 'bg-yellow-500 text-white',
  absent:  'bg-gray-700 text-gray-400',
  unused:  'bg-white/10 text-white hover:bg-white/20',
}

export default function WordlePage() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()

  const [word, setWord]             = useState(() => getRandomWord())
  const [guesses, setGuesses]       = useState([])   // array of { guess, result[] }
  const [current, setCurrent]       = useState('')   // current input
  const [phase, setPhase]           = useState('playing') // 'playing'|'won'|'lost'
  const [shake, setShake]           = useState(false)
  const [sessionXP, setSessionXP]   = useState(0)
  const [xpSaved, setXpSaved]       = useState(false)
  const [message, setMessage]       = useState('')

  // Derived: best status per key
  const keyStatuses = {}
  const ORDER = ['correct', 'present', 'absent']
  guesses.forEach(({ guess, result }) => {
    guess.split('').forEach((letter, i) => {
      const prev = keyStatuses[letter]
      const next = result[i]
      if (!prev || ORDER.indexOf(next) < ORDER.indexOf(prev)) {
        keyStatuses[letter] = next
      }
    })
  })

  const showMessage = (msg, duration = 1500) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  const submitGuess = useCallback(async () => {
    if (current.length !== WORD_LENGTH) { setShake(true); setTimeout(() => setShake(false), 500); return }
    if (!VALID_GUESSES.has(current)) { showMessage('Not in word list'); setShake(true); setTimeout(() => setShake(false), 500); return }

    const result = checkGuess(current, word)
    const newGuesses = [...guesses, { guess: current, result }]
    setGuesses(newGuesses)
    setCurrent('')

    const won  = result.every((r) => r === 'correct')
    const lost = !won && newGuesses.length >= MAX_GUESSES

    if (won || lost) {
      const xp = won ? (XP_TABLE[newGuesses.length] ?? 100) : 0
      setSessionXP(xp)
      setPhase(won ? 'won' : 'lost')

      if (!xpSaved) {
        setXpSaved(true)
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            totalXP: increment(xp),
            puzzlesCompleted: increment(1),
          })
          await addDoc(collection(db, 'puzzleHistory'), {
            uid: currentUser.uid,
            username: userProfile?.username,
            type: 'wordle',
            word,
            guessesUsed: newGuesses.length,
            won,
            xpEarned: xp,
            timestamp: serverTimestamp(),
          })
          setUserProfile((prev) => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + xp, puzzlesCompleted: (prev?.puzzlesCompleted ?? 0) + 1 }))
        } catch (e) {
          console.error('Error saving Wordle XP:', e)
        }
      }
    }
  }, [current, guesses, word, xpSaved, currentUser, userProfile, setUserProfile])

  const handleKey = useCallback((key) => {
    if (phase !== 'playing') return
    if (key === 'ENTER') { submitGuess(); return }
    if (key === '⌫' || key === 'BACKSPACE') { setCurrent((c) => c.slice(0, -1)); return }
    if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) { setCurrent((c) => c + key) }
  }, [phase, current, submitGuess])

  useEffect(() => {
    const onKey = (e) => handleKey(e.key.toUpperCase())
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKey])

  function playAgain() {
    setWord(getRandomWord())
    setGuesses([])
    setCurrent('')
    setPhase('playing')
    setSessionXP(0)
    setXpSaved(false)
  }

  // Build the 6-row grid
  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) return { type: 'submitted', ...guesses[i] }
    if (i === guesses.length && phase === 'playing') return { type: 'active', guess: current }
    return { type: 'empty' }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-6 flex flex-col">
      {/* Header */}
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600 to-lime-500 text-sm font-bold">
            🟩 Wordle
          </div>
          <div className="flex items-center gap-1.5 text-violet-300 text-sm font-bold">
            <Zap size={14} />
            {sessionXP} XP
          </div>
        </div>

        {/* Toast message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-3 bg-white text-gray-900 font-black py-2 px-6 rounded-2xl mx-auto w-fit text-sm"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="flex flex-col gap-1.5 items-center mb-6">
          {rows.map((row, ri) => (
            <motion.div
              key={ri}
              animate={shake && ri === guesses.length ? { x: [-6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex gap-1.5"
            >
              {Array.from({ length: WORD_LENGTH }, (_, ci) => {
                let letter = ''
                let colorClass = TILE_COLORS.empty

                if (row.type === 'submitted') {
                  letter = row.guess[ci] ?? ''
                  colorClass = TILE_COLORS[row.result[ci]] ?? TILE_COLORS.absent
                } else if (row.type === 'active') {
                  letter = row.guess[ci] ?? ''
                  colorClass = letter ? TILE_COLORS.tbd : TILE_COLORS.empty
                }

                return (
                  <motion.div
                    key={ci}
                    animate={row.type === 'submitted' ? { rotateX: [0, -90, 0] } : {}}
                    transition={{ delay: ci * 0.1, duration: 0.4 }}
                    className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-black rounded-lg select-none ${colorClass}`}
                  >
                    {letter}
                  </motion.div>
                )
              })}
            </motion.div>
          ))}
        </div>

        {/* Win / Lose banner */}
        <AnimatePresence>
          {phase !== 'playing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass card text-center py-6 mb-4 border-l-4 ${phase === 'won' ? 'border-green-400' : 'border-red-400'}`}
            >
              <div className="text-4xl mb-2">{phase === 'won' ? '🎉' : '😞'}</div>
              <p className={`font-black text-xl mb-1 ${phase === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {phase === 'won' ? `Solved in ${guesses.length} guess${guesses.length === 1 ? '' : 'es'}!` : 'Better luck next time!'}
              </p>
              {phase === 'lost' && (
                <p className="text-gray-300 text-sm mb-2">The word was <span className="font-black text-white">{word}</span></p>
              )}
              {sessionXP > 0 && (
                <div className="flex justify-center mt-2">
                  <span className="bg-violet-500/20 text-violet-300 text-sm font-bold px-4 py-1 rounded-full">
                    +{sessionXP} XP
                  </span>
                </div>
              )}
              <div className="flex gap-3 mt-5 flex-col sm:flex-row">
                <button onClick={playAgain} className="btn-primary flex-1">Play Again</button>
                <button onClick={() => navigate('/')} className="btn-secondary flex-1">Dashboard</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard — fixed at bottom */}
      <div className="mt-auto pt-4 max-w-md mx-auto w-full">
        {QWERTY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 mb-1">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === '⌫'
              const status = keyStatuses[key] ?? 'unused'
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`${isSpecial ? 'px-3 text-xs' : 'w-9'} h-14 rounded-lg font-bold text-sm transition-all ${KEY_COLORS[status]}`}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
