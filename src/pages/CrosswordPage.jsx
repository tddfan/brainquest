import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import {
  PUZZLES,
  buildSolutionGrid,
  buildCellWordMap,
  getWordCells,
  getRandomPuzzle,
} from '../data/crosswords'
import { ArrowLeft, Zap, RefreshCw } from 'lucide-react'

const STORAGE_KEY = 'bq_crossword'
const XP_PER_WORD = 50
const XP_FULL_COMPLETION = 200

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return data
  } catch { return null }
}

export default function CrosswordPage() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile } = useAuth()

  const [puzzle, setPuzzle]           = useState(null)
  const [solution, setSolution]       = useState(null)   // 7x7 letter grid
  const [cellWordMap, setCellWordMap] = useState(null)   // key→[wordIdx]
  const [userGrid, setUserGrid]       = useState(null)   // 7x7 of '' or letter
  const [completedWords, setCompleted]= useState(new Set()) // set of wordIdx
  const [selectedWord, setSelectedWord] = useState(null) // wordIdx
  const [selectedCell, setSelectedCell] = useState(null) // {row,col}
  const [sessionXP, setSessionXP]     = useState(0)
  const [phase, setPhase]             = useState('play') // 'play'|'done'

  // ── Initialize puzzle ───────────────────────────────────────────────────────
  useEffect(() => {
    const saved = loadSaved()
    if (saved) {
      const p = PUZZLES.find(x => x.id === saved.puzzleId)
      if (p) {
        initPuzzle(p, saved.userGrid, new Set(saved.completedWords), saved.sessionXP)
        return
      }
    }
    const lastId = localStorage.getItem('bq_crossword_last')
    const p = getRandomPuzzle(lastId)
    initPuzzle(p, null, new Set(), 0)
  }, [])

  function initPuzzle(p, savedGrid, savedCompleted, savedXP) {
    const sol = buildSolutionGrid(p)
    const cwMap = buildCellWordMap(p)
    const grid = savedGrid ?? Array.from({ length: p.rows }, () => Array(p.cols).fill(''))
    setPuzzle(p)
    setSolution(sol)
    setCellWordMap(cwMap)
    setUserGrid(grid)
    setCompleted(savedCompleted)
    setSessionXP(savedXP)
    localStorage.setItem('bq_crossword_last', p.id)
  }

  function newPuzzle() {
    localStorage.removeItem(STORAGE_KEY)
    const lastId = puzzle?.id
    const p = getRandomPuzzle(lastId)
    initPuzzle(p, null, new Set(), 0)
    setSelectedWord(null)
    setSelectedCell(null)
    setPhase('play')
  }

  // Save progress on changes
  useEffect(() => {
    if (!puzzle || !userGrid) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      puzzleId: puzzle.id,
      userGrid,
      completedWords: [...completedWords],
      sessionXP,
      savedAt: Date.now(),
    }))
  }, [userGrid, completedWords, sessionXP])

  // ── Cell click handler ──────────────────────────────────────────────────────
  function handleCellClick(row, col) {
    if (!cellWordMap || !solution) return
    if (!solution[row][col]) return  // black cell

    const key = `${row},${col}`
    const wordIdxs = cellWordMap[key] ?? []
    if (!wordIdxs.length) return

    setSelectedCell({ row, col })

    if (wordIdxs.length === 1) {
      setSelectedWord(wordIdxs[0])
    } else {
      // Intersection: toggle between words
      if (wordIdxs.includes(selectedWord)) {
        const other = wordIdxs.find(i => i !== selectedWord)
        setSelectedWord(other)
      } else {
        setSelectedWord(wordIdxs[0])
      }
    }
  }

  // ── Letter input ────────────────────────────────────────────────────────────
  async function handleLetter(letter) {
    if (selectedCell === null || selectedWord === null || !puzzle) return
    const { row, col } = selectedCell

    const newGrid = userGrid.map(r => [...r])
    newGrid[row][col] = letter.toUpperCase()
    setUserGrid(newGrid)

    // Check if the selected word is now complete
    const w = puzzle.words[selectedWord]
    const cells = getWordCells(puzzle, selectedWord)
    const wordComplete = cells.every(({ row: r, col: c }) => newGrid[r][c] === solution[r][c])

    let newCompleted = completedWords
    let xpDelta = 0
    if (wordComplete && !completedWords.has(selectedWord)) {
      newCompleted = new Set([...completedWords, selectedWord])
      setCompleted(newCompleted)
      xpDelta += XP_PER_WORD
    }

    // Advance cursor along current word
    const curIdx = cells.findIndex(({ row: r, col: c }) => r === row && c === col)
    if (curIdx < cells.length - 1) {
      const next = cells[curIdx + 1]
      setSelectedCell(next)
    }

    // Check full completion
    if (newCompleted.size === puzzle.words.length) {
      xpDelta += XP_FULL_COMPLETION
      const total = sessionXP + xpDelta
      setSessionXP(total)
      await awardXP(total)
      setPhase('done')
      return
    }

    if (xpDelta > 0) setSessionXP(prev => prev + xpDelta)
  }

  function handleBackspace() {
    if (!selectedCell || selectedWord === null || !puzzle) return
    const { row, col } = selectedCell
    const newGrid = userGrid.map(r => [...r])

    if (newGrid[row][col]) {
      newGrid[row][col] = ''
      setUserGrid(newGrid)
    } else {
      // Move cursor back
      const cells = getWordCells(puzzle, selectedWord)
      const curIdx = cells.findIndex(({ row: r, col: c }) => r === row && c === col)
      if (curIdx > 0) {
        const prev = cells[curIdx - 1]
        setSelectedCell(prev)
        const g = userGrid.map(r => [...r])
        g[prev.row][prev.col] = ''
        setUserGrid(g)
      }
    }
  }

  async function awardXP(earned) {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        totalXP: increment(earned),
        puzzlesCompleted: increment(1),
      })
      await addDoc(collection(db, 'puzzleHistory'), {
        uid: currentUser.uid,
        username: userProfile?.username,
        type: 'crossword',
        puzzleId: puzzle.id,
        xpEarned: earned,
        timestamp: serverTimestamp(),
      })
      setUserProfile(prev => ({
        ...prev,
        totalXP: (prev?.totalXP ?? 0) + earned,
        puzzlesCompleted: (prev?.puzzlesCompleted ?? 0) + 1,
      }))
    } catch (e) {
      console.error('Error saving crossword result:', e)
    }
  }

  // ── Physical keyboard ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (phase !== 'play') return
      if (/^[a-zA-Z]$/.test(e.key)) handleLetter(e.key)
      if (e.key === 'Backspace') handleBackspace()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedCell, selectedWord, userGrid, puzzle, solution, phase, completedWords, sessionXP])

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!puzzle || !solution || !userGrid) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-5xl">📝</motion.div>
      </div>
    )
  }

  if (phase === 'done') {
    const wordsCount = puzzle.words.length
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="glass card max-w-sm w-full text-center py-10"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-black mb-1">Crossword Complete!</h2>
          <p className="text-gray-400 mb-6">{puzzle.title} · {wordsCount} words</p>

          <div className="glass rounded-2xl py-4 px-6 mb-4 space-y-2 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-gray-400">Words completed</span>
              <span className="text-violet-300">{wordsCount} × +{XP_PER_WORD} XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Full completion bonus</span>
              <span className="text-green-300">+{XP_FULL_COMPLETION} XP</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between text-base">
              <span>Total XP earned</span>
              <span className="text-violet-300 font-black">+{sessionXP}</span>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row mt-4">
            <button onClick={newPuzzle} className="btn-primary flex-1">New Puzzle</button>
            <button onClick={() => navigate('/')} className="btn-secondary flex-1">Dashboard</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Build cell number map
  const cellNumbers = {}
  puzzle.words.forEach(w => {
    const key = `${w.row},${w.col}`
    if (!cellNumbers[key]) cellNumbers[key] = w.clueNum
  })

  // Highlighted cells
  const highlightedCells = new Set()
  const completedCells = new Set()
  if (selectedWord !== null) {
    getWordCells(puzzle, selectedWord).forEach(({ row, col }) =>
      highlightedCells.add(`${row},${col}`)
    )
  }
  completedWords.forEach(wi => {
    getWordCells(puzzle, wi).forEach(({ row, col }) =>
      completedCells.add(`${row},${col}`)
    )
  })

  const activeClue = selectedWord !== null ? puzzle.words[selectedWord] : null
  const acrossWords = puzzle.words.filter(w => w.dir === 'across')
  const downWords   = puzzle.words.filter(w => w.dir === 'down')

  // On-screen keyboard rows
  const keyRows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['⌫','Z','X','C','V','B','N','M'],
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-3 py-4">
      <div className="max-w-lg mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <div className="font-extrabold text-lg">{puzzle.title}</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-violet-500/20 text-violet-300 font-bold text-sm px-3 py-1 rounded-full">
              <Zap size={12} />
              +{sessionXP} XP
            </div>
            <button onClick={newPuzzle} className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Active clue banner */}
        <AnimatePresence mode="wait">
          {activeClue && (
            <motion.div
              key={selectedWord}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass rounded-2xl px-4 py-3 mb-4 text-sm"
            >
              <span className="font-black text-violet-300 mr-2">
                {activeClue.clueNum} {activeClue.dir.charAt(0).toUpperCase() + activeClue.dir.slice(1)}
              </span>
              {activeClue.clue}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crossword grid */}
        <div className="flex justify-center mb-4">
          <div className="border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl inline-block">
            {Array.from({ length: puzzle.rows }).map((_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: puzzle.cols }).map((_, c) => {
                  const letter = solution[r][c]
                  const key = `${r},${c}`
                  const isBlack = !letter
                  const isHighlighted = highlightedCells.has(key)
                  const isCompleted = completedCells.has(key)
                  const isSelectedCell = selectedCell?.row === r && selectedCell?.col === c
                  const num = cellNumbers[key]
                  const userLetter = userGrid[r][c]

                  let bg = 'bg-gray-950'
                  if (isBlack) bg = 'bg-gray-800'
                  else if (isSelectedCell) bg = 'bg-violet-500'
                  else if (isHighlighted) bg = 'bg-violet-900/70'
                  else if (isCompleted) bg = 'bg-green-900/40'

                  return (
                    <div
                      key={c}
                      onClick={() => handleCellClick(r, c)}
                      className={`
                        relative w-10 h-10 sm:w-11 sm:h-11
                        flex items-center justify-center
                        border border-white/10
                        ${bg}
                        ${isBlack ? '' : 'cursor-pointer'}
                        transition-colors duration-100
                      `}
                    >
                      {!isBlack && (
                        <>
                          {num && (
                            <span className="absolute top-0.5 left-0.5 text-[9px] font-bold text-gray-400 leading-none">
                              {num}
                            </span>
                          )}
                          <span className={`text-base font-black ${isSelectedCell ? 'text-white' : isCompleted ? 'text-green-300' : 'text-violet-200'}`}>
                            {userLetter}
                          </span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* On-screen keyboard */}
        <div className="space-y-1.5 mb-5">
          {keyRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map(k => (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => k === '⌫' ? handleBackspace() : handleLetter(k)}
                  className={`
                    rounded-lg font-bold text-sm py-2.5 transition-colors
                    ${k === '⌫' ? 'px-3 bg-red-900/50 text-red-300 hover:bg-red-800/60' : 'w-8 bg-white/10 hover:bg-white/20 text-white'}
                  `}
                >
                  {k}
                </motion.button>
              ))}
            </div>
          ))}
        </div>

        {/* Clue list */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <h3 className="font-black text-gray-400 uppercase text-xs tracking-widest mb-2">Across</h3>
            <div className="space-y-1.5">
              {acrossWords.map((w, i) => {
                const wi = puzzle.words.indexOf(w)
                const done = completedWords.has(wi)
                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedWord(wi); setSelectedCell({ row: w.row, col: w.col }) }}
                    className={`text-left w-full px-2 py-1.5 rounded-xl transition-colors ${selectedWord === wi ? 'bg-violet-600/40 text-white' : 'text-gray-400 hover:bg-white/5'} ${done ? 'line-through opacity-50' : ''}`}
                  >
                    <span className="font-black text-violet-400 mr-1">{w.clueNum}.</span>
                    {w.clue}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="font-black text-gray-400 uppercase text-xs tracking-widest mb-2">Down</h3>
            <div className="space-y-1.5">
              {downWords.map((w, i) => {
                const wi = puzzle.words.indexOf(w)
                const done = completedWords.has(wi)
                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedWord(wi); setSelectedCell({ row: w.row, col: w.col }) }}
                    className={`text-left w-full px-2 py-1.5 rounded-xl transition-colors ${selectedWord === wi ? 'bg-violet-600/40 text-white' : 'text-gray-400 hover:bg-white/5'} ${done ? 'line-through opacity-50' : ''}`}
                  >
                    <span className="font-black text-violet-400 mr-1">{w.clueNum}.</span>
                    {w.clue}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
