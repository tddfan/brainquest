import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Chess } from 'chess.js'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { getBestMove } from '../data/chessAI'
import { ArrowLeft, Clock, Star } from 'lucide-react'

const XP_BY_DIFFICULTY = { easy: 200, medium: 500, hard: 800 }
const DRAW_XP = 100

// Unicode piece glyphs — use filled (black) variants for both sides; color via CSS
const PIECES = {
  wk: '♚', wq: '♛', wr: '♜', wb: '♝', wn: '♞', wp: '♟',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
}

function pieceGlyph(sq) {
  if (!sq) return null
  return PIECES[sq.color + sq.type] ?? ''
}

// ── Captured pieces helpers ──────────────────────────────────────────────────
const CAPTURE_SORT  = { q: 0, r: 1, b: 2, n: 3, p: 4 }
const CAPTURE_GLYPH = { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛' }

function capturesFromHistory(chessInst) {
  const byWhite = [], byBlack = []
  if (!chessInst) return { byWhite, byBlack }
  for (const m of chessInst.history({ verbose: true })) {
    if (m.captured) (m.color === 'w' ? byWhite : byBlack).push(m.captured)
  }
  return { byWhite, byBlack }
}

function CaptureBar({ pieces, label }) {
  const sorted = [...pieces].sort((a, b) => (CAPTURE_SORT[a] ?? 9) - (CAPTURE_SORT[b] ?? 9))
  return (
    <div className="flex items-center gap-2 min-h-[24px] px-1">
      <span className="text-xs text-gray-500 font-semibold shrink-0 w-24">{label}</span>
      <span className="flex gap-0.5 flex-wrap text-lg leading-none text-gray-300">
        {sorted.map((p, i) => <span key={i}>{CAPTURE_GLYPH[p] ?? ''}</span>)}
      </span>
    </div>
  )
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1]

function squareName(fileIdx, rankIdx) {
  return FILES[fileIdx] + RANKS[rankIdx]
}

const DIFFICULTY_CARDS = [
  { key: 'easy',   label: 'Easy',   emoji: '🟢', xp: 200, gradient: 'from-green-600 to-emerald-500', desc: 'AI plays randomly — great for beginners' },
  { key: 'medium', label: 'Medium', emoji: '🧠', xp: 500, gradient: 'from-blue-600 to-violet-500',   desc: 'AI uses basic strategy (depth 2)' },
  { key: 'hard',   label: 'Hard',   emoji: '🔥', xp: 800, gradient: 'from-red-600 to-rose-500',     desc: 'AI plays smart (depth 3)' },
]

export default function ChessPage() {
  const navigate = useNavigate()
  const { currentUser, userProfile, setUserProfile, isGuest } = useAuth()

  const [phase, setPhase]         = useState('setup')  // 'setup'|'playing'|'done'
  const [difficulty, setDifficulty] = useState(null)
  const [chess, setChess]         = useState(null)      // Chess instance
  const [board, setBoard]         = useState([])        // 8x8 array
  const [selectedSq, setSelectedSq] = useState(null)
  const [legalDests, setLegalDests] = useState([])
  const [result, setResult]       = useState(null)      // 'win'|'loss'|'draw'
  const [sessionXP, setSessionXP] = useState(0)
  const [xpSaved, setXpSaved]     = useState(false)
  const [elapsed, setElapsed]     = useState(0)
  const [aiThinking, setAiThinking] = useState(false)
  const [lastMove, setLastMove]   = useState(null)      // { from, to }
  const timerRef = useRef(null)

  // Start timer when game begins
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  function startGame(diff) {
    try {
      const c = new Chess()
      setChess(c)
      setBoard(c.board())
      setDifficulty(diff)
      setSelectedSq(null)
      setLegalDests([])
      setResult(null)
      setSessionXP(0)
      setXpSaved(false)
      setElapsed(0)
      setAiThinking(false)
      setLastMove(null)
      setPhase('playing')
    } catch (e) {
      console.error("Chess init failed:", e)
      alert("Chess engine failed to load. Please try refreshing.")
    }
  }

  const checkGameOver = useCallback(async (c, diff) => {
    if (!c.isGameOver()) return

    clearInterval(timerRef.current)
    let outcome = 'draw'
    if (c.isCheckmate()) {
      outcome = c.turn() === 'b' ? 'win' : 'loss'  // black to move & mated = player won
    }
    setResult(outcome)
    setPhase('done')

    const xp = outcome === 'win' ? XP_BY_DIFFICULTY[diff] : outcome === 'draw' ? DRAW_XP : 0
    setSessionXP(xp)

    if (!xpSaved) {
      setXpSaved(true)
      try {
        if (!isGuest) {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            totalXP: increment(xp),
            puzzlesCompleted: increment(1),
          })
          await addDoc(collection(db, 'puzzleHistory'), {
            uid: currentUser.uid,
            username: userProfile?.username,
            type: 'chess',
            difficulty: diff,
            result: outcome,
            xpEarned: xp,
            timestamp: serverTimestamp(),
          })
        }
        setUserProfile((prev) => ({ ...prev, totalXP: (prev?.totalXP ?? 0) + xp, puzzlesCompleted: (prev?.puzzlesCompleted ?? 0) + 1 }))
      } catch (e) {
        console.error('Error saving Chess XP:', e)
      }
    }
  }, [xpSaved, currentUser, userProfile, setUserProfile])

  function handleSquareClick(sq) {
    if (phase !== 'playing' || aiThinking || !chess) return
    if (chess.turn() !== 'w') return  // Only player (white) can click

    if (selectedSq) {
      if (legalDests.includes(sq)) {
        // Make the move
        try {
          chess.move({ from: selectedSq, to: sq, promotion: 'q' })
        } catch {
          setSelectedSq(null); setLegalDests([]); return
        }
        setLastMove({ from: selectedSq, to: sq })
        setBoard([...chess.board()])
        setSelectedSq(null)
        setLegalDests([])

        // Check for game over immediately after player's move (catches checkmate / stalemate)
        if (chess.isGameOver() || chess.isCheckmate() || chess.isStalemate() || chess.isDraw()) {
          checkGameOver(chess, difficulty)
          return
        }

        // AI move — wrap in try/finally so aiThinking is always cleared
        setAiThinking(true)
        setTimeout(() => {
          try {
            // Re-check game over in case of edge cases
            if (chess.isGameOver()) {
              checkGameOver(chess, difficulty)
              return
            }
            const aiMove = getBestMove(chess, difficulty)
            if (aiMove) {
              chess.move(aiMove)
              // Get from/to from history since aiMove is a SAN string
              const hist = chess.history({ verbose: true })
              const lm = hist[hist.length - 1]
              setLastMove({ from: lm?.from ?? null, to: lm?.to ?? null })
              setBoard([...chess.board()])
            }
            checkGameOver(chess, difficulty)
          } finally {
            setAiThinking(false)
          }
        }, 1200)
        return
      }
      // Deselect or select new piece
      setSelectedSq(null)
      setLegalDests([])
    }

    // Select a piece
    const piece = chess.get(sq)
    if (piece && piece.color === 'w') {
      setSelectedSq(sq)
      const moves = chess.moves({ square: sq, verbose: true })
      setLegalDests(moves.map((m) => m.to))
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // Derive captured pieces for display
  const { byWhite, byBlack } = capturesFromHistory(chess)

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft size={20} />
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          <div className="text-center mb-8">
            <div className="text-7xl mb-3">♟️</div>
            <h1 className="text-4xl font-black mb-2">Chess</h1>
            <p className="text-gray-400">Play as White against the computer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {DIFFICULTY_CARDS.map((d) => (
              <motion.button
                key={d.key}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(d.key)}
                className={`relative overflow-hidden text-left rounded-3xl p-6 shadow-2xl bg-gradient-to-br ${d.gradient} group`}
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" />
                <div className="text-4xl mb-3">{d.emoji}</div>
                <h3 className="text-xl font-extrabold mb-1">{d.label}</h3>
                <p className="text-white/70 text-sm mb-3">{d.desc}</p>
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold">
                  <Star size={12} fill="white" />
                  {d.xp} XP for win
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Playing / Done screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3 text-sm font-bold">
            {chess?.isCheck() && phase === 'playing' && (
              <span className="bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-sm shadow-lg shadow-red-600/50 animate-pulse tracking-wide">⚠️ CHECK!</span>
            )}
            {aiThinking && (
              <span className="text-gray-400 text-xs">AI thinking…</span>
            )}
            <span className="bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-gray-300">
              <Clock size={13} /> {formatTime(elapsed)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              difficulty === 'easy'   ? 'bg-green-500/20 text-green-400' :
              difficulty === 'medium' ? 'bg-blue-500/20 text-blue-400'   : 'bg-red-500/20 text-red-400'
            }`}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass card text-center py-5 mb-4 border-l-4 ${result === 'win' ? 'border-green-400' : result === 'draw' ? 'border-yellow-400' : 'border-red-400'}`}
            >
              <div className="text-3xl mb-1">
                {result === 'win' ? '🏆' : result === 'draw' ? '🤝' : '😞'}
              </div>
              <p className={`font-black text-lg mb-1 ${result === 'win' ? 'text-green-400' : result === 'draw' ? 'text-yellow-400' : 'text-red-400'}`}>
                {result === 'win' ? 'You win!' : result === 'draw' ? 'Draw!' : 'You lose!'}
              </p>
              {sessionXP > 0 && (
                <span className="bg-violet-500/20 text-violet-300 text-sm font-bold px-4 py-1 rounded-full">
                  +{sessionXP} XP
                </span>
              )}
              <div className="flex gap-3 mt-4 flex-col sm:flex-row">
                <button onClick={() => startGame(difficulty)} className="btn-primary flex-1 text-sm">Play Again</button>
                <button onClick={() => setPhase('setup')} className="btn-secondary flex-1 text-sm">Change Difficulty</button>
                <button onClick={() => navigate('/')} className="btn-secondary flex-1 text-sm">Dashboard</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Turn indicator */}
        {phase === 'playing' && (
          <p className="text-center text-sm font-bold text-gray-400 mb-3">
            {chess?.turn() === 'w' ? '⬜ Your turn (White)' : '⬛ AI is thinking…'}
          </p>
        )}

        {/* AI's captures (white pieces AI took) — above board */}
        <CaptureBar pieces={byBlack} label="AI captured:" />

        {/* Board */}
        <div className="relative mt-1">
          {/* Rank labels */}
          <div className="absolute -left-5 top-0 h-full flex flex-col justify-around text-xs text-gray-500 font-bold">
            {RANKS.map((r) => <span key={r}>{r}</span>)}
          </div>

          <div className="grid grid-cols-8 rounded-xl overflow-hidden border-2 border-amber-800/50 shadow-2xl">
            {RANKS.map((rank, ri) =>
              FILES.map((file, fi) => {
                const sq = file + rank
                const isLight  = (ri + fi) % 2 === 0
                const piece    = board[ri]?.[fi]
                const glyph    = pieceGlyph(piece)
                const isSel    = selectedSq === sq
                const isDest   = legalDests.includes(sq)
                const isLastFrom = lastMove?.from === sq
                const isLastTo   = lastMove?.to === sq

                return (
                  <button
                    key={sq}
                    onClick={() => handleSquareClick(sq)}
                    className={`
                      aspect-square flex items-center justify-center relative transition-colors select-none
                      ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                      ${isSel ? '!bg-yellow-400' : ''}
                      ${(isLastFrom || isLastTo) && !isSel ? '!bg-yellow-200/60' : ''}
                    `}
                  >
                    {isDest && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {piece ? (
                          <div className="absolute inset-0 border-4 border-violet-500/70 rounded-none" />
                        ) : (
                          <div className="w-1/3 h-1/3 rounded-full bg-violet-500/50" />
                        )}
                      </div>
                    )}
                    {glyph && (
                      <div
                        className={`relative z-10 w-[94%] h-[94%] rounded-full flex items-center justify-center shadow-xl leading-none
                          ${piece?.color === 'w'
                            ? 'bg-gradient-to-br from-amber-50 to-amber-200 ring-4 ring-amber-300'
                            : 'bg-gradient-to-br from-gray-800 to-black ring-4 ring-gray-700'
                          }`}
                        style={{ fontSize: 'min(3.2rem, 9vw)' }}
                      >
                        <span 
                          className="drop-shadow-lg"
                          style={{ 
                            color: piece?.color === 'w' ? '#1a1a1a' : '#f0f0f0',
                            fontWeight: 'bold'
                          }}
                        >
                          {glyph}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* File labels */}
          <div className="flex justify-around mt-1 text-xs text-gray-500 font-bold px-0">
            {FILES.map((f) => <span key={f}>{f}</span>)}
          </div>
        </div>

        {/* Player's captures (black pieces player took) — below board */}
        <div className="mt-1">
          <CaptureBar pieces={byWhite} label="You captured:" />
        </div>
      </div>
    </div>
  )
}
