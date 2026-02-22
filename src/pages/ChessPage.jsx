import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Chess } from 'chess.js'
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useSound } from '../hooks/useSound'
import { getBestMove } from '../data/chessAI'
import { ArrowLeft, Clock, Star } from 'lucide-react'

const XP_BY_DIFFICULTY = { easy: 200, medium: 500, hard: 800 }
const DRAW_XP = 100

// Unicode piece glyphs — use filled (black) variants for both sides; color via CSS
const PIECES = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
}

function GraffitiEffect({ text, onComplete }) {
  const colors = ['text-red-500', 'text-yellow-400', 'text-orange-500', 'text-pink-500']
  const color = colors[Math.floor(Math.random() * colors.length)]
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 1, rotate: -20 }}
      animate={{ scale: [0, 1.5, 1.2], opacity: [1, 1, 0], rotate: 10 }}
      transition={{ duration: 0.8, ease: "backOut" }}
      onAnimationComplete={onComplete}
      className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
    >
      <div className={`text-5xl font-black ${color} italic filter drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] select-none uppercase tracking-tighter font-serif`}>
        {text}
      </div>
    </motion.div>
  )
}

function Sparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

const PIECE_NAMES = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' }

function getCommentary(move, chess) {
  const piece = PIECE_NAMES[move.piece]
  if (chess.isCheckmate()) return `CHECKMATE! ${piece} delivers the final blow!`
  if (chess.isCheck()) return `CHECK! ${piece} puts the King under fire!`
  if (move.captured) return `CRUNCH! ${piece} captures the ${PIECE_NAMES[move.captured]}!`
  if (move.flags.includes('k')) return "CASTLE! King seeks safety on the kingside."
  if (move.flags.includes('q')) return "CASTLE! Queen-side rotation executed."
  
  const comments = [
    `${piece} advances!`,
    `${piece} takes a strategic position.`,
    `Developing the ${piece}.`,
    `A solid move with the ${piece}.`,
    `Improving the ${piece}'s placement.`,
    `Aggressive push with the ${piece}!`,
    `Hunting the King!`,
    `The tension rises on the board!`,
    `Setting up a clever trap?`,
    `Calculated maneuvering.`
  ]
  return comments[Math.floor(Math.random() * comments.length)]
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

function CaptureBar({ pieces, label, side }) {
  const sorted = [...pieces].sort((a, b) => (CAPTURE_SORT[a] ?? 9) - (CAPTURE_SORT[b] ?? 9))
  return (
    <div className={`flex items-center gap-2 min-h-[32px] px-3 py-1 rounded-xl bg-white/5 border border-white/5 ${side === 'w' ? 'mt-2' : 'mb-2'}`}>
      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-wrap text-xl leading-none">
        {sorted.map((p, i) => (
          <motion.span 
            initial={{ scale: 0, rotate: -45 }} 
            animate={{ scale: 1, rotate: 0 }} 
            key={i} 
            className={side === 'w' ? 'text-gray-200' : 'text-gray-600'}
          >
            {CAPTURE_GLYPH[p] ?? ''}
          </motion.span>
        ))}
      </div>
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
  const { playSound } = useSound()

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
  const [activeTrail, setActiveTrail] = useState(null) // { from, to }
  const [commentary, setCommentary] = useState(['Good luck! You are playing as White.'])
  const [captureEffects, setCaptureEffects] = useState([]) // [{ id, text }]
  const [isShaking, setIsShake] = useState(false)
  const [botReaction, setBotReaction] = useState('')
  const [playerReaction, setPlayerReaction] = useState('')
  const timerRef = useRef(null)
  const commEndRef = useRef(null)

  const triggerCaptureEffect = (text) => {
    const id = Date.now()
    setCaptureEffects(prev => [...prev, { id, text }])
    setIsShake(true)
    setTimeout(() => setIsShake(false), 500)
  }

  const showBotReaction = (text) => {
    setBotReaction(text)
    setTimeout(() => setBotReaction(''), 3000)
  }

  const showPlayerReaction = (text) => {
    setPlayerReaction(text)
    setTimeout(() => setPlayerReaction(''), 3000)
  }

  const sqToCoords = (sq) => {
    if (!sq) return { x: 0, y: 0 }
    const f = FILES.indexOf(sq[0])
    const r = RANKS.indexOf(parseInt(sq[1]))
    return { x: f, y: r }
  }

  // Scroll commentary to bottom
  useEffect(() => {
    commEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [commentary])

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
      setCommentary(['Game started! Good luck, Explorer.'])
      setBotReaction('')
      setPlayerReaction('')
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
        if (!isGuest && currentUser) {
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
          const move = chess.move({ from: selectedSq, to: sq, promotion: 'q' })
          if (move) {
            playSound('click')
            setLastMove({ from: selectedSq, to: sq })
            setActiveTrail({ from: selectedSq, to: sq })
            setBoard([...chess.board()])
            setSelectedSq(null)
            setLegalDests([])

            // Sequence player effects
            setTimeout(() => {
              setActiveTrail(null)
              setCommentary(prev => [...prev, `White: ${getCommentary(move, chess)}`])
              if (move.captured) {
                playSound('claim')
                const texts = ['CRUNCH!', 'TAKEN!', 'GOTCHA!', 'BOOM!', 'DESTROYED!']
                triggerCaptureEffect(texts[Math.floor(Math.random() * texts.length)])
                showPlayerReaction('Yes!')
                showBotReaction('Hey!')
              }
              if (chess.isCheck()) {
                playSound('achievement')
                setIsShake(true)
                setTimeout(() => setIsShake(false), 500)
                showPlayerReaction('Check!')
              }
            }, 400)
          }
        } catch {
          setSelectedSq(null); setLegalDests([]); return
        }

        // Check for game over immediately after player's move
        if (chess.isGameOver()) {
          setTimeout(() => checkGameOver(chess, difficulty), 1000)
          return
        }

        // AI move
        setAiThinking(true)
        setTimeout(() => {
          try {
            if (chess.isGameOver()) {
              checkGameOver(chess, difficulty)
              return
            }
            const aiMove = getBestMove(chess, difficulty)
            if (aiMove) {
              const move = chess.move(aiMove)
              if (move) {
                // Get from/to from history
                const hist = chess.history({ verbose: true })
                const lm = hist[hist.length - 1]
                const from = lm?.from ?? null
                const to = lm?.to ?? null
                setLastMove({ from, to })
                setActiveTrail({ from, to })
                setBoard([...chess.board()])
                
                setTimeout(() => {
                  setActiveTrail(null)
                  setCommentary(prev => [...prev, `Black: ${getCommentary(move, chess)}`])
                  if (move.captured) {
                    playSound('wrong')
                    const texts = ['OUCH!', 'LOST ONE!', 'NOOO!', 'CRUNCHED!']
                    triggerCaptureEffect(texts[Math.floor(Math.random() * texts.length)])
                    showBotReaction('Ha! Gotcha.')
                    showPlayerReaction('Oops...')
                  } else {
                    playSound('click')
                    if (Math.random() > 0.7) showBotReaction('Thinking...')
                  }
                  if (chess.isCheck()) {
                    playSound('wrong')
                    setIsShake(true)
                    setTimeout(() => setIsShake(false), 500)
                    showBotReaction('Check!')
                  }
                }, 400)
              }
            }
            setTimeout(() => checkGameOver(chess, difficulty), 800)
          } finally {
            setAiThinking(false)
          }
        }, 1800) // Slightly longer AI wait
        return
      }
      setSelectedSq(null)
      setLegalDests([])
    }

    // Select a piece
    const piece = chess.get(sq)
    if (piece && piece.color === 'w') {
      setSelectedSq(sq)
      const moves = chess.moves({ square: sq, verbose: true })
      setLegalDests(moves.map((m) => m.to))
      playSound('click')
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const { byWhite, byBlack } = capturesFromHistory(chess)

  // ── Setup screen ────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all mb-8">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center mb-12">
            <div className="text-8xl mb-6 animate-bounce-slow">⚔️</div>
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-tighter">Grandmaster Quest</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Play against the AI and earn massive XP</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIFFICULTY_CARDS.map((d) => (
              <motion.button
                key={d.key}
                whileHover={{ scale: 1.04, y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startGame(d.key)}
                className={`relative overflow-hidden text-left rounded-[2rem] p-8 shadow-2xl bg-gradient-to-br ${d.gradient} group border-b-8 border-black/20`}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
                <div className="text-5xl mb-4">{d.emoji}</div>
                <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">{d.label}</h3>
                <p className="text-white/80 text-xs font-bold leading-relaxed mb-6">{d.desc}</p>
                <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest border border-white/10">
                  <Star size={14} fill="white" />
                  {d.xp} XP
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
    <div className="min-h-screen bg-[#030712] text-white px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white/5 p-2 rounded-2xl border border-white/5">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
              <Clock size={16} className="text-amber-400" />
              <span className="font-black tabular-nums">{formatTime(elapsed)}</span>
            </div>
            <span className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 ${
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass card text-center p-8 mb-6 border-2 border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]"
            >
              <div className="text-7xl mb-4">
                {result === 'win' ? '👑' : result === 'draw' ? '🤝' : '⚔️'}
              </div>
              <h2 className={`text-4xl font-black mb-2 uppercase tracking-tighter ${result === 'win' ? 'text-green-400' : result === 'draw' ? 'text-yellow-400' : 'text-red-400'}`}>
                {result === 'win' ? 'Victory!' : result === 'draw' ? 'Draw!' : 'Defeated!'}
              </h2>
              {sessionXP > 0 && (
                <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 font-black px-6 py-2 rounded-full text-lg mb-8">
                  <Zap size={20} fill="currentColor" /> +{sessionXP} XP
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => startGame(difficulty)} className="bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 transition-transform">Rematch</button>
                <button onClick={() => setPhase('setup')} className="bg-white/10 text-white font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-white/20 transition-all">New Difficulty</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board Labels & AI Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 relative">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xl shadow-lg border border-gray-700">🤖</div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Opponent</p>
              <p className="text-sm font-bold">BrainQuest Bot</p>
            </div>
            <AnimatePresence>
              {botReaction && (
                <motion.div initial={{ scale: 0, opacity: 0, x: 20 }} animate={{ scale: 1, opacity: 1, x: 0 }} exit={{ scale: 0, opacity: 0 }} className="absolute left-full ml-4 top-0 bg-white text-gray-900 px-3 py-1 rounded-xl rounded-bl-none text-[10px] font-black uppercase tracking-tight whitespace-nowrap shadow-xl z-50">
                  {botReaction}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {aiThinking && (
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
              Analysing Moves...
            </motion.div>
          )}
        </div>

        {/* AI's captures (white pieces AI took) */}
        <CaptureBar pieces={byBlack} label="AI took" side="b" />

        {/* Board Container */}
        <motion.div 
          animate={isShaking ? { x: [-2, 2, -2, 2, 0], y: [-2, 2, -2, 2, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative p-1 bg-amber-950/20 rounded-2xl border-4 border-amber-900/30 shadow-2xl mb-4"
        >
          {/* SVG Trail Layer */}
          <div className="absolute inset-0 z-30 pointer-events-none p-1">
            <svg className="w-full h-full" viewBox="0 0 800 800">
              <AnimatePresence>
                {activeTrail && (
                  <motion.line
                    key={`${activeTrail.from}-${activeTrail.to}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    x1={sqToCoords(activeTrail.from).x * 100 + 50}
                    y1={sqToCoords(activeTrail.from).y * 100 + 50}
                    x2={sqToCoords(activeTrail.to).x * 100 + 50}
                    y2={sqToCoords(activeTrail.to).y * 100 + 50}
                    stroke="#fbbf24"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="1, 20"
                    className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  />
                )}
              </AnimatePresence>
            </svg>
          </div>

          {/* Graffiti Layer */}
          <AnimatePresence>
            {captureEffects.map(fx => (
              <GraffitiEffect 
                key={fx.id} 
                text={fx.text} 
                onComplete={() => setCaptureEffects(prev => prev.filter(f => f.id !== fx.id))} 
              />
            ))}
          </AnimatePresence>

          {/* Check Alert Overlay */}
          {chess?.isCheck() && phase === 'playing' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="absolute -top-4 -right-4 z-[50] bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-xl rotate-12 animate-pulse"
            >
              ⚠️ CHECK!
            </motion.div>
          )}

          <div className="grid grid-cols-8 overflow-hidden rounded-xl bg-amber-950 shadow-inner">
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
                      aspect-square flex items-center justify-center relative transition-all duration-300
                      ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                      ${isSel ? '!bg-yellow-400/80 shadow-inner' : ''}
                      ${(isLastFrom || isLastTo) && !isSel ? 'after:absolute after:inset-0 after:bg-yellow-400/20' : ''}
                    `}
                  >
                    {isDest && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        {piece ? (
                          <div className="w-[85%] h-[85%] border-[3px] border-amber-400/60 rounded-full" />
                        ) : (
                          <div className="w-1/4 h-1/3 rounded-full bg-black/10" />
                        )}
                      </div>
                    )}
                    
                    {glyph && (
                      <motion.div
                        layoutId={`piece-${piece.type}-${piece.color}-${sq}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          filter: piece.color === 'w' 
                            ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' 
                            : 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
                        }}
                        className={`relative z-10 w-[90%] h-[90%] flex items-center justify-center leading-none rounded-full
                          ${piece?.color === 'w' 
                            ? 'bg-gradient-to-br from-white via-yellow-50 to-amber-100 ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(251,191,36,0.4)]' 
                            : 'bg-gradient-to-br from-gray-700 via-gray-900 to-black ring-2 ring-gray-500/50 shadow-xl'
                          }`}
                        style={{ fontSize: 'min(3rem, 9vw)', fontWeight: 'bold' }}
                      >
                        {piece.color === 'w' && (
                          <motion.div 
                            animate={{ opacity: [0.3, 0.6, 0.3] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full" 
                          />
                        )}
                        <span 
                          className={`drop-shadow-lg ${piece?.color === 'w' ? 'text-gray-900' : 'text-gray-100'}`}
                        >
                          {glyph}
                        </span>
                      </motion.div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Player Info & Commentary */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 relative">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-xl shadow-lg border border-violet-500">
                {typeof userProfile?.avatarIndex === 'number' ? '👤' : '🐾'}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">Explorer</p>
                <p className="text-sm font-bold">{userProfile?.username || 'You'}</p>
              </div>
              <AnimatePresence>
                {playerReaction && (
                  <motion.div initial={{ scale: 0, opacity: 0, x: 20 }} animate={{ scale: 1, opacity: 1, x: 0 }} exit={{ scale: 0, opacity: 0 }} className="absolute left-full ml-4 top-0 bg-violet-600 text-white px-3 py-1 rounded-xl rounded-bl-none text-[10px] font-black uppercase tracking-tight whitespace-nowrap shadow-xl z-50">
                    {playerReaction}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <CaptureBar pieces={byWhite} label="You took" side="w" />
          </div>

          {/* Live Commentary Log */}
          <div className="glass card h-24 overflow-y-auto p-4 border border-white/5 bg-black/40 custom-scrollbar">
            <div className="flex flex-col gap-2">
              {commentary.map((text, i) => (
                <div key={i} className={`text-[10px] font-bold uppercase tracking-wider flex items-start gap-2 ${i === commentary.length - 1 ? 'text-amber-400' : 'text-gray-500'}`}>
                  <span className="opacity-50 mt-0.5">[{i + 1}]</span>
                  <span>{text}</span>
                </div>
              ))}
              <div ref={commEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
