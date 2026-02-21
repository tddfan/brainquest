import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { calcLevel } from '../data/questions'
import {
  generateSudoku,
  isCellValid,
  isSolved,
  DIFFICULTY_XP,
  TIME_BONUS_XP,
  HINT_PENALTY_XP,
} from '../data/sudokuGenerator'
import { ArrowLeft, Lightbulb, PencilLine, RotateCcw, Zap } from 'lucide-react'

const STORAGE_KEY = 'bq_sudoku'
const MAX_MISTAKES = 3
const MAX_HINTS = 3
const TIME_BONUS_SECS = 300 // 5 minutes

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    // Expire if > 24h old
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }))
}

// ─── Difficulty Selector ──────────────────────────────────────────────────────
function DifficultySelector({ onStart, hasSaved, onResume }) {
  const difficulties = [
    { key: 'easy',   label: 'Easy',   emoji: '🟢', clues: '45 cells given', xp: DIFFICULTY_XP.easy },
    { key: 'medium', label: 'Medium', emoji: '🟡', clues: '32 cells given', xp: DIFFICULTY_XP.medium },
    { key: 'hard',   label: 'Hard',   emoji: '🔴', clues: '26 cells given', xp: DIFFICULTY_XP.hard },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-8 flex flex-col items-center">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🔢</div>
          <h1 className="text-4xl font-black mb-2">Sudoku</h1>
          <p className="text-gray-400">Fill every row, column and 3×3 box with digits 1–9.</p>
        </div>

        <div className="space-y-4 mb-8">
          {difficulties.map((d) => (
            <motion.button
              key={d.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onStart(d.key)}
              className="w-full glass card flex items-center gap-4 hover:bg-white/15 transition-colors text-left"
            >
              <span className="text-3xl">{d.emoji}</span>
              <div className="flex-1">
                <div className="font-extrabold text-lg">{d.label}</div>
                <div className="text-gray-400 text-sm">{d.clues}</div>
              </div>
              <div className="flex items-center gap-1 bg-violet-500/20 text-violet-300 font-bold text-sm px-3 py-1.5 rounded-full">
                <Zap size={13} />
                {d.xp} XP
              </div>
            </motion.button>
          ))}
        </div>

        {hasSaved && (
          <button
            onClick={onResume}
            className="w-full btn-secondary text-center"
          >
            ↩ Resume saved puzzle
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ difficulty, elapsedSecs, hintsUsed, xpEarned, navigate }) {
  const baseXP = DIFFICULTY_XP[difficulty]
  const timeBonus = elapsedSecs < TIME_BONUS_SECS ? TIME_BONUS_XP : 0
  const hintPenalty = hintsUsed * HINT_PENALTY_XP
  const mins = Math.floor(elapsedSecs / 60)
  const secs = elapsedSecs % 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="glass card max-w-sm w-full text-center py-10"
      >
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-3xl font-black mb-1">Puzzle Solved!</h2>
        <p className="text-gray-400 mb-6">
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} · {mins}m {secs}s
        </p>

        <div className="glass rounded-2xl py-4 px-6 mb-4 space-y-2 text-sm font-bold">
          <div className="flex justify-between">
            <span className="text-gray-400">Base XP ({difficulty})</span>
            <span className="text-violet-300">+{baseXP}</span>
          </div>
          {timeBonus > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">⚡ Speed bonus (&lt;5 min)</span>
              <span className="text-blue-300">+{timeBonus}</span>
            </div>
          )}
          {hintPenalty > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">💡 Hints used ({hintsUsed})</span>
              <span className="text-red-400">−{hintPenalty}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 flex justify-between text-base">
            <span>Total XP earned</span>
            <span className="text-violet-300 font-black">+{xpEarned}</span>
          </div>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row mt-4">
          <button onClick={() => navigate('/puzzle/sudoku')} className="btn-primary flex-1">
            Play Again
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary flex-1">
            Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Sudoku Game ─────────────────────────────────────────────────────────
export default function SudokuPage() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()

  const [phase, setPhase] = useState('select') // 'select' | 'play' | 'done' | 'failed'
  const [difficulty, setDifficulty] = useState('medium')
  const [puzzle, setPuzzle]   = useState(null)   // original clues grid
  const [solution, setSolution] = useState(null)
  const [userGrid, setUserGrid] = useState(null) // player-filled grid
  const [notes, setNotes]     = useState(null)   // 9x9 of Set<number>
  const [selected, setSelected] = useState(null) // {row,col}
  const [notesMode, setNotesMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [elapsed, setElapsed]  = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const hasSaved = !!loadSaved()

  // Timer
  useEffect(() => {
    if (phase !== 'play') return
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [phase])

  // Save progress whenever relevant state changes
  useEffect(() => {
    if (phase === 'play' && puzzle) {
      saveProgress({ puzzle, solution, userGrid, notes: notes.map(r => r.map(s => [...s])), difficulty, elapsed, mistakes, hintsLeft, hintsUsed })
    }
  }, [userGrid, notes, elapsed, mistakes, hintsLeft])

  function startGame(diff, savedData = null) {
    if (savedData) {
      setPuzzle(savedData.puzzle)
      setSolution(savedData.solution)
      setUserGrid(savedData.userGrid)
      setNotes(savedData.notes.map(r => r.map(arr => new Set(arr))))
      setDifficulty(savedData.difficulty)
      setElapsed(savedData.elapsed)
      setMistakes(savedData.mistakes)
      setHintsLeft(savedData.hintsLeft)
      setHintsUsed(savedData.hintsUsed)
    } else {
      const { puzzle: p, solution: s } = generateSudoku(diff)
      setPuzzle(p.map(r => [...r]))
      setSolution(s)
      setUserGrid(p.map(r => [...r]))
      setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set())))
      setDifficulty(diff)
      setElapsed(0)
      setMistakes(0)
      setHintsLeft(MAX_HINTS)
      setHintsUsed(0)
      localStorage.removeItem(STORAGE_KEY)
    }
    setPhase('play')
    setSelected(null)
    setNotesMode(false)
  }

  function handleResume() {
    const saved = loadSaved()
    if (saved) startGame(null, saved)
  }

  function handleCellClick(row, col) {
    if (puzzle[row][col] !== 0) return // clue cell, not editable
    setSelected({ row, col })
  }

  function handleNumber(num) {
    if (!selected) return
    const { row, col } = selected
    if (puzzle[row][col] !== 0) return

    if (notesMode) {
      const newNotes = notes.map(r => r.map(s => new Set(s)))
      const cell = newNotes[row][col]
      if (cell.has(num)) cell.delete(num)
      else cell.add(num)
      setNotes(newNotes)
      return
    }

    const newGrid = userGrid.map(r => [...r])
    newGrid[row][col] = num

    // Check validity
    if (!isCellValid(newGrid, row, col)) {
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)
      if (newMistakes >= MAX_MISTAKES) {
        localStorage.removeItem(STORAGE_KEY)
        setPhase('failed')
        return
      }
    }

    // Clear notes for this cell
    const newNotes = notes.map(r => r.map(s => new Set(s)))
    newNotes[row][col] = new Set()
    setNotes(newNotes)
    setUserGrid(newGrid)

    if (isSolved(newGrid, solution)) {
      finishGame(newGrid)
    }
  }

  function handleErase() {
    if (!selected) return
    const { row, col } = selected
    if (puzzle[row][col] !== 0) return
    const newGrid = userGrid.map(r => [...r])
    newGrid[row][col] = 0
    const newNotes = notes.map(r => r.map(s => new Set(s)))
    newNotes[row][col] = new Set()
    setNotes(newNotes)
    setUserGrid(newGrid)
  }

  function handleHint() {
    if (hintsLeft <= 0 || !selected) return
    const { row, col } = selected
    if (puzzle[row][col] !== 0 || userGrid[row][col] === solution[row][col]) return
    const newGrid = userGrid.map(r => [...r])
    newGrid[row][col] = solution[row][col]
    const newNotes = notes.map(r => r.map(s => new Set(s)))
    newNotes[row][col] = new Set()
    setNotes(newNotes)
    setUserGrid(newGrid)
    setHintsLeft(h => h - 1)
    setHintsUsed(h => h + 1)
    if (isSolved(newGrid, solution)) finishGame(newGrid)
  }

  async function finishGame(finalGrid) {
    localStorage.removeItem(STORAGE_KEY)
    const baseXP = DIFFICULTY_XP[difficulty]
    const timeBonus = elapsed < TIME_BONUS_SECS ? TIME_BONUS_XP : 0
    const hintPenalty = hintsUsed * HINT_PENALTY_XP
    const earned = Math.max(0, baseXP + timeBonus - hintPenalty)
    setXpEarned(earned)
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        totalXP: increment(earned),
        puzzlesCompleted: increment(1),
      })
      await addDoc(collection(db, 'puzzleHistory'), {
        uid: currentUser.uid,
        username: userProfile?.username,
        type: 'sudoku',
        difficulty,
        xpEarned: earned,
        elapsedSecs: elapsed,
        timestamp: serverTimestamp(),
      })
      setUserProfile(prev => ({
        ...prev,
        totalXP: (prev?.totalXP ?? 0) + earned,
        puzzlesCompleted: (prev?.puzzlesCompleted ?? 0) + 1,
      }))
    } catch (e) {
      console.error('Error saving puzzle result:', e)
    }
    setPhase('done')
  }

  // ── Keyboard support ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'play') return
    function onKey(e) {
      const n = parseInt(e.key)
      if (n >= 1 && n <= 9) handleNumber(n)
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') handleErase()
      if (!selected) return
      const { row, col } = selected
      if (e.key === 'ArrowRight') setSelected({ row, col: Math.min(8, col + 1) })
      if (e.key === 'ArrowLeft')  setSelected({ row, col: Math.max(0, col - 1) })
      if (e.key === 'ArrowDown')  setSelected({ row: Math.min(8, row + 1), col })
      if (e.key === 'ArrowUp')    setSelected({ row: Math.max(0, row - 1), col })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, selected, userGrid, notes, notesMode, hintsLeft, hintsUsed])

  // ── Phase renders ───────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <DifficultySelector
        onStart={(d) => startGame(d)}
        hasSaved={hasSaved}
        onResume={handleResume}
      />
    )
  }

  if (phase === 'done') {
    return (
      <ResultsScreen
        difficulty={difficulty}
        elapsedSecs={elapsed}
        hintsUsed={hintsUsed}
        xpEarned={xpEarned}
        navigate={navigate}
      />
    )
  }

  if (phase === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass card max-w-sm w-full text-center py-10"
        >
          <div className="text-7xl mb-4">💔</div>
          <h2 className="text-3xl font-black mb-2">Too Many Mistakes</h2>
          <p className="text-gray-400 mb-8">You made {MAX_MISTAKES} mistakes. Better luck next time!</p>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button onClick={() => startGame(difficulty)} className="btn-primary flex-1">Try Again</button>
            <button onClick={() => navigate('/')} className="btn-secondary flex-1">Dashboard</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Play phase ──────────────────────────────────────────────────────────────
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-2 py-4">
      <div className="max-w-sm mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <div className="text-sm font-bold text-gray-300 capitalize">{difficulty}</div>
          <div className="text-sm font-bold text-gray-300">
            {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="flex gap-1">
            {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
              <span key={i} className="text-lg">{i < mistakes ? '💔' : '❤️'}</span>
            ))}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: MAX_HINTS }).map((_, i) => (
              <span key={i} className="text-lg">{i < hintsLeft ? '💡' : '🔮'}</span>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mb-4 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
          {userGrid.map((row, r) => (
            <div key={r} className={`flex ${r > 0 && r % 3 === 0 ? 'border-t-2 border-white/30' : 'border-t border-white/10'}`}>
              {row.map((val, c) => {
                const isClue = puzzle[r][c] !== 0
                const isSelected = selected?.row === r && selected?.col === c
                const isSameBox = selected
                  ? Math.floor(r / 3) === Math.floor(selected.row / 3) && Math.floor(c / 3) === Math.floor(selected.col / 3)
                  : false
                const isSameRowCol = selected ? (r === selected.row || c === selected.col) : false
                const isSameNum = selected && val !== 0 && val === userGrid[selected.row][selected.col]
                const isInvalid = !isClue && val !== 0 && !isCellValid(userGrid, r, c)
                const cellNotes = notes[r][c]

                let bg = 'bg-gray-900'
                if (isSameRowCol || isSameBox) bg = 'bg-gray-800'
                if (isSameNum) bg = 'bg-violet-900/60'
                if (isSelected) bg = 'bg-violet-600/80'

                return (
                  <div
                    key={c}
                    onClick={() => handleCellClick(r, c)}
                    className={`
                      relative flex items-center justify-center aspect-square cursor-pointer select-none
                      ${c > 0 && c % 3 === 0 ? 'border-l-2 border-white/30' : c > 0 ? 'border-l border-white/10' : ''}
                      ${bg} transition-colors duration-100
                    `}
                    style={{ width: '11.11%' }}
                  >
                    {val !== 0 ? (
                      <span className={`text-base md:text-lg font-black ${isClue ? 'text-white' : isInvalid ? 'text-red-400' : 'text-violet-300'}`}>
                        {val}
                      </span>
                    ) : cellNotes.size > 0 ? (
                      <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                        {[1,2,3,4,5,6,7,8,9].map(n => (
                          <span key={n} className={`text-[7px] text-center ${cellNotes.has(n) ? 'text-violet-300' : 'opacity-0'}`}>{n}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center mb-3">
          <button
            onClick={() => setNotesMode(m => !m)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${notesMode ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-300'}`}
          >
            <PencilLine size={14} />
            Notes
          </button>
          <button
            onClick={handleHint}
            disabled={hintsLeft <= 0 || !selected}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-gray-300 disabled:opacity-40 transition-all"
          >
            <Lightbulb size={14} />
            Hint (−{HINT_PENALTY_XP} XP)
          </button>
          <button
            onClick={handleErase}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-gray-300 transition-all"
          >
            <RotateCcw size={14} />
            Erase
          </button>
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-9 gap-1.5">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNumber(n)}
              className="aspect-square rounded-xl bg-white/10 hover:bg-violet-600/60 text-white font-black text-lg transition-all"
            >
              {n}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
