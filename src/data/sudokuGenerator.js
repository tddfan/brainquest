// ─── SUDOKU GENERATOR ────────────────────────────────────────────────────────

const DIFFICULTY_CLUES = {
  easy:   45,   // 36 cells removed
  medium: 32,   // 49 cells removed
  hard:   26,   // 55 cells removed
}

export const DIFFICULTY_XP = {
  easy:   300,
  medium: 500,
  hard:   800,
}

export const TIME_BONUS_XP = 150   // if solved in < 5 minutes
export const HINT_PENALTY_XP = 50  // deducted per hint used

function emptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(0))
}

function isValid(grid, row, col, num) {
  // Check row
  if (grid[row].includes(num)) return false
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false
  }
  // Check 3×3 box
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false
    }
  }
  return true
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fillGrid(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num
            if (fillGrid(grid)) return true
            grid[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

function copyGrid(grid) {
  return grid.map(row => [...row])
}

function removeClues(solution, cluesCount) {
  const puzzle = copyGrid(solution)
  const cells = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  )
  let removed = 0
  const target = 81 - cluesCount

  for (const [r, c] of cells) {
    if (removed >= target) break
    puzzle[r][c] = 0
    removed++
  }
  return puzzle
}

/**
 * Generate a sudoku puzzle.
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {{ puzzle: number[][], solution: number[][] }}
 */
export function generateSudoku(difficulty = 'medium') {
  const solution = emptyGrid()
  fillGrid(solution)
  const clues = DIFFICULTY_CLUES[difficulty] ?? DIFFICULTY_CLUES.medium
  const puzzle = removeClues(solution, clues)
  return { puzzle, solution }
}

/**
 * Check if a cell value conflicts with any peer.
 * @returns {boolean} true = no conflict
 */
export function isCellValid(grid, row, col) {
  const val = grid[row][col]
  if (val === 0) return true
  // Temporarily clear the cell to check peers
  const tmp = copyGrid(grid)
  tmp[row][col] = 0
  return isValid(tmp, row, col, val)
}

/**
 * Compare filled grid against solution.
 */
export function isSolved(userGrid, solution) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userGrid[r][c] !== solution[r][c]) return false
    }
  }
  return true
}
