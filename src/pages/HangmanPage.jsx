import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { getRandomHangmanWord } from '../data/hangmanWords'
import { ArrowLeft, Zap } from 'lucide-react'

const MAX_WRONG = 7

function xpForWrong(wrong) {
  if (wrong === 0) return 200
  if (wrong <= 2) return 150
  if (wrong <= 4) return 100
  if (wrong <= 6) return 50
  return 0
}

// SVG hangman — draws cumulatively up to `stage` (0–7)
function HangmanSVG({ stage }) {
  return (
    <svg viewBox="0 0 200 220" className="w-48 h-48 mx-auto" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none">
      {/* Gallows */}
      <line x1="20" y1="210" x2="180" y2="210" />   {/* base */}
      <line x1="60" y1="210" x2="60" y2="20" />      {/* pole */}
      <line x1="60" y1="20" x2="130" y2="20" />      {/* beam */}
      <line x1="130" y1="20" x2="130" y2="45" />     {/* rope */}
      {/* Head */}
      {stage >= 1 && <circle cx="130" cy="60" r="15" />}
      {/* Body */}
      {stage >= 2 && <line x1="130" y1="75" x2="130" y2="130" />}
      {/* Left arm */}
      {stage >= 3 && <line x1="130" y1="90" x2="105" y2="115" />}
      {/* Right arm */}
      {stage >= 4 && <line x1="130" y1="90" x2="155" y2="115" />}
      {/* Left leg */}
      {stage >= 5 && <line x1="130" y1="130" x2="105" y2="165" />}
      {/* Right leg */}
      {stage >= 6 && <line x1="130" y1="130" x2="155" y2="165" />}
      {/* Face (eyes + mouth — only on loss) */}
      {stage >= 7 && (
        <>
          <line x1="124" y1="55" x2="128" y2="59" />
          <line x1="128" y1="55" x2="124" y2="59" />
          <line x1="132" y1="55" x2="136" y2="59" />
          <line x1="136" y1="55" x2="132" y2="59" />
          <path d="M124 67 Q130 63 136 67" />
        </>
      )}
    </svg>
  )
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function HangmanPage() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()

  const [wordObj, setWordObj] = useState(() => getRandomHangmanWord())
  const [guessed, setGuessed] = useState([])       // all clicked letters
  const [phase, setPhase]     = useState('playing') // 'playing'|'won'|'lost'
  const [sessionXP, setSessionXP] = useState(0)
  const [xpSaved, setXpSaved]     = useState(false)

  const word        = wordObj.word
  const wrongGuesses = guessed.filter((l) => !word.includes(l))
  const wrongCount   = wrongGuesses.length
  const allRevealed  = word.split('').every((l) => guessed.includes(l))

  useEffect(() => {
    if (phase !== 'playing') return
    if (allRevealed) finishGame(true)
    else if (wrongCount >= MAX_WRONG) finishGame(false)
  }, [guessed])

  async function finishGame(won) {
    if (xpSaved) return
    const xp = won ? xpForWrong(wrongCount) : 0
    setSessionXP(xp)
    setPhase(won ? 'won' : 'lost')
    setXpSaved(true)

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        totalXP: increment(xp),
        puzzlesCompleted: increment(1),
      })
      await addDoc(collection(db, 'puzzleHistory'), {
        uid: currentUser.uid,
        username: userProfile?.username,
        type: 'hangman',
        word,
        wrongGuesses: wrongCount,
        won,
        xpEarned: xp,
        timestamp: serverTimestamp(),
      })
      setUserProfile((prev) => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + xp, puzzlesCompleted: (prev?.puzzlesCompleted ?? 0) + 1 }))
    } catch (e) {
      console.error('Error saving Hangman XP:', e)
    }
  }

  const handleLetter = useCallback((letter) => {
    if (phase !== 'playing' || guessed.includes(letter)) return
    setGuessed((prev) => [...prev, letter])
  }, [phase, guessed])

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toUpperCase()
      if (/^[A-Z]$/.test(k)) handleLetter(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleLetter])

  function playAgain() {
    setWordObj(getRandomHangmanWord(word))
    setGuessed([])
    setPhase('playing')
    setSessionXP(0)
    setXpSaved(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-sm font-bold">
            🪢 Hangman
          </div>
          <div className="flex items-center gap-1.5 text-violet-300 text-sm font-bold">
            <Zap size={14} />
            {sessionXP} XP
          </div>
        </div>

        {/* Category & hint */}
        <div className="text-center mb-4">
          <span className="bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {wordObj.category}
          </span>
          <p className="text-gray-400 text-sm mt-2">💡 {wordObj.hint}</p>
        </div>

        {/* SVG + wrong counter */}
        <div className="glass card mb-4 py-4">
          <div className="text-orange-400">
            <HangmanSVG stage={wrongCount} />
          </div>
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: MAX_WRONG }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i < wrongCount ? 'bg-red-500' : 'bg-white/20'}`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-1">{wrongCount} / {MAX_WRONG} wrong</p>
        </div>

        {/* Word display */}
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {word.split('').map((letter, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className={`text-2xl font-black min-w-[1.5rem] text-center transition-all ${guessed.includes(letter) ? 'text-white' : 'text-transparent'}`}>
                {letter}
              </span>
              <div className="w-7 h-0.5 bg-gray-400 rounded" />
            </div>
          ))}
        </div>

        {/* Wrong letters */}
        {wrongGuesses.length > 0 && (
          <p className="text-center text-red-400 text-sm font-bold mb-4">
            Wrong: {wrongGuesses.join(' · ')}
          </p>
        )}

        {/* Win / Lose result */}
        <AnimatePresence>
          {phase !== 'playing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass card text-center py-6 mb-4 border-l-4 ${phase === 'won' ? 'border-green-400' : 'border-red-400'}`}
            >
              <div className="text-4xl mb-2">{phase === 'won' ? '🎉' : '😞'}</div>
              <p className={`font-black text-xl mb-1 ${phase === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {phase === 'won' ? `You got it with ${wrongCount} mistake${wrongCount === 1 ? '' : 's'}!` : 'The man fell!'}
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

        {/* Letter grid */}
        {phase === 'playing' && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALPHABET.map((letter) => {
              const isGuessed  = guessed.includes(letter)
              const isCorrect  = isGuessed && word.includes(letter)
              const isWrong    = isGuessed && !word.includes(letter)
              return (
                <button
                  key={letter}
                  onClick={() => handleLetter(letter)}
                  disabled={isGuessed}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    isCorrect ? 'bg-green-500/30 text-green-400 cursor-default' :
                    isWrong   ? 'bg-red-500/20 text-red-500 cursor-default opacity-40' :
                                'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
