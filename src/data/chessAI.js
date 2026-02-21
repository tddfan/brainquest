// ─── CHESS AI — Minimax with Alpha-Beta Pruning ───────────────────────────────

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }

// Piece-square tables for positional bonuses (from white's perspective)
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
}

function squareToIndex(square) {
  const col = square.charCodeAt(0) - 97 // a=0 … h=7
  const row = 8 - parseInt(square[1])   // 8=0 … 1=7
  return row * 8 + col
}

function evaluateBoard(chess, depth) {
  if (chess.isCheckmate()) {
    // Reward faster checkmates by adding/subtracting depth
    return chess.turn() === 'w' ? -50000 - depth : 50000 + depth
  }
  if (chess.isDraw() || chess.isStalemate()) return 0

  let score = 0
  const board = chess.board()
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = board[r][c]
      if (!sq) continue
      const idx = r * 8 + c
      const pst = PST[sq.type] ?? []
      const tableIdx = sq.color === 'w' ? idx : 63 - idx
      const posBonus = pst[tableIdx] ?? 0
      const value = PIECE_VALUES[sq.type] + posBonus
      score += sq.color === 'w' ? value : -value
    }
  }
  return score
}

function minimax(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess, depth)

  const moves = chess.moves()
  let best = isMaximizing ? -Infinity : Infinity

  for (const move of moves) {
    chess.move(move)
    const val = minimax(chess, depth - 1, alpha, beta, !isMaximizing)
    chess.undo()

    if (isMaximizing) {
      best = Math.max(best, val)
      alpha = Math.max(alpha, val)
    } else {
      best = Math.min(best, val)
      beta = Math.min(beta, val)
    }
    if (beta <= alpha) break // Alpha-beta pruning
  }
  return best
}

/**
 * Returns the best move for the current position.
 * @param {Chess} chess - chess.js instance
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {string} move in SAN or verbose object
 */
export function getBestMove(chess, difficulty) {
  let moves = chess.moves()
  if (!moves.length) return null

  // Shuffle moves to avoid deterministic loops in equal positions
  moves = moves.sort(() => Math.random() - 0.5)

  if (difficulty === 'easy') {
    // 40% chance to make a completely random move (to keep it 'easy')
    if (Math.random() < 0.4) {
      return moves[Math.floor(Math.random() * moves.length)]
    }
    // Otherwise, do a simple depth-1 search (prefer captures/good positions)
    const isMaximizing = chess.turn() === 'w'
    let bestMove = moves[0]
    let bestVal = isMaximizing ? -Infinity : Infinity
    for (const move of moves) {
      chess.move(move)
      const val = evaluateBoard(chess, 0)
      chess.undo()
      if (isMaximizing ? val > bestVal : val < bestVal) {
        bestVal = val
        bestMove = move
      }
    }
    return bestMove
  }

  const depth = difficulty === 'hard' ? 3 : 2
  const isMaximizing = chess.turn() === 'w'
  let bestMove = moves[0]
  let bestVal = isMaximizing ? -Infinity : Infinity

  for (const move of moves) {
    chess.move(move)
    const val = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing)
    chess.undo()

    if (isMaximizing ? val > bestVal : val < bestVal) {
      bestVal = val
      bestMove = move
    }
  }
  return bestMove
}
