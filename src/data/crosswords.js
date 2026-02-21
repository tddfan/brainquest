// ─── MINI CROSSWORD PUZZLES (7×7) ────────────────────────────────────────────
// Each puzzle: words array drives everything — the solution grid is derived from it.
// word: { word, clueNum, dir:'across'|'down', row, col, clue }
// Intersections are valid when letter at crossing cell matches in both words.

export const PUZZLES = [

  // ── #1  COSMOS ────────────────────────────────────────────────────────────
  // Grid:
  //  C O M E T . .   row0: COMET(across,c0), col2=M → MAGMA(down)
  //  . . A . . . .
  //  R O G U E . .   row2: ROGUE(across,c0), col2=G→MAGMA, col3=U→ULTRA(down)
  //  . . M . L . .
  //  . . A . T . .
  //  . . . . R . .
  //  . . . . A . .
  {
    id: 'cwm1',
    title: '🌌 Cosmos',
    rows: 7, cols: 7,
    words: [
      { word:'COMET', clueNum:1, dir:'across', row:0, col:0, clue:'Icy body with a glowing tail that orbits the sun' },
      { word:'MAGMA', clueNum:2, dir:'down',   row:0, col:2, clue:'Molten rock found beneath the Earth\'s surface' },
      { word:'ROGUE', clueNum:3, dir:'across', row:2, col:0, clue:'A lone wanderer; one who operates outside the rules' },
      { word:'ULTRA', clueNum:4, dir:'down',   row:2, col:3, clue:'Prefix meaning extreme or beyond normal limits' },
    ],
  },

  // ── #2  NATURE ────────────────────────────────────────────────────────────
  // Grid:
  //  F R O S T . .   row0: FROST(across,c0), col1=R → RIVER(down)
  //  . I . . . . .                            col4=T → SMOKE(down)
  //  . V . . . . .
  //  S E E D S . .   row3: SEEDS(across,c0), col1=E→RIVER, col3=D→DUNE(down)
  //  . R . . U . .
  //  . . . . N . .
  //  . . . . E . .
  {
    id: 'cwm2',
    title: '🌿 Nature',
    rows: 7, cols: 7,
    words: [
      { word:'FROST', clueNum:1, dir:'across', row:0, col:0, clue:'Ice crystals that form on cold surfaces overnight' },
      { word:'RIVER', clueNum:2, dir:'down',   row:0, col:1, clue:'A large natural stream of water flowing to the sea' },
      { word:'SEEDS', clueNum:3, dir:'across', row:3, col:0, clue:'Tiny embryos from which new plants grow' },
      { word:'DUNE',  clueNum:4, dir:'down',   row:3, col:3, clue:'A mound or ridge of sand shaped by the wind' },
    ],
  },

  // ── #3  CINEMA ────────────────────────────────────────────────────────────
  // Grid:
  //  S E Q U E L .   row0: SEQUEL(across,c0), col1=E → EDIT(down)
  //  . D . . . . .
  //  F I E L D . .   row2: FIELD(across,c0), col1=I→EDIT, col4=D→DRAMA(down)
  //  . T . . R . .
  //  . . . . A . .
  //  . . . . M . .
  //  . . . . A . .
  {
    id: 'cwm3',
    title: '🎬 Cinema',
    rows: 7, cols: 7,
    words: [
      { word:'SEQUEL', clueNum:1, dir:'across', row:0, col:0, clue:'A follow-up film that continues an original story' },
      { word:'EDIT',   clueNum:2, dir:'down',   row:0, col:1, clue:'To cut and rearrange footage in post-production' },
      { word:'FIELD',  clueNum:3, dir:'across', row:2, col:0, clue:'An open area; also a profession or discipline' },
      { word:'DRAMA',  clueNum:4, dir:'down',   row:2, col:4, clue:'A serious narrative with conflict and emotion' },
    ],
  },

  // ── #4  SCIENCE ───────────────────────────────────────────────────────────
  // Grid:
  //  P L A S M A .   row0: PLASMA(across,c0), col1=L → LUNAR(down)
  //  . U . . . . .
  //  I N N E R . .   row2: INNER(across,c0), col1=N→LUNAR, col4=R→RADON(down)
  //  . A . . A . .
  //  . R . . D . .
  //  . . . . O . .
  //  . . . . N . .
  {
    id: 'cwm4',
    title: '🔬 Science',
    rows: 7, cols: 7,
    words: [
      { word:'PLASMA', clueNum:1, dir:'across', row:0, col:0, clue:'The fourth state of matter; also fluid in blood' },
      { word:'LUNAR',  clueNum:2, dir:'down',   row:0, col:1, clue:'Relating to the Moon' },
      { word:'INNER',  clueNum:3, dir:'across', row:2, col:0, clue:'Located inside; the ___ ear or ___ core' },
      { word:'RADON',  clueNum:4, dir:'down',   row:2, col:4, clue:'Radioactive noble gas (atomic number 86) found in soil' },
    ],
  },

  // ── #5  KITCHEN ───────────────────────────────────────────────────────────
  // Grid:
  //  F L A V O R .   row0: FLAVOR(across,c0), col1=L → LIVER(down)
  //  . I . . . . .
  //  O V E N S . .   row2: OVENS(across,c0), col1=V→LIVER, col4=S→SPICE(down)
  //  . E . . P . .
  //  . R . . I . .
  //  . . . . C . .
  //  . . . . E . .
  {
    id: 'cwm5',
    title: '🍳 Kitchen',
    rows: 7, cols: 7,
    words: [
      { word:'FLAVOR', clueNum:1, dir:'across', row:0, col:0, clue:'The distinctive taste quality of food or drink' },
      { word:'LIVER',  clueNum:2, dir:'down',   row:0, col:1, clue:'Rich organ meat; also, to ___ (exist)' },
      { word:'OVENS',  clueNum:3, dir:'across', row:2, col:0, clue:'Kitchen appliances used for baking and roasting' },
      { word:'SPICE',  clueNum:4, dir:'down',   row:2, col:4, clue:'A pungent seasoning — pepper, cumin, or chilli' },
    ],
  },

  // ── #6  GLOBAL ────────────────────────────────────────────────────────────
  // Grid:
  //  T R E A T Y .   row0: TREATY(across,c0), col1=R → REBEL(down)
  //  . E . . . . .
  //  A B O D E . .   row2: ABODE(across,c0), col1=B→REBEL, col4=E→ELITE(down)
  //  . E . . L . .
  //  . L . . I . .
  //  . . . . T . .
  //  . . . . E . .
  {
    id: 'cwm6',
    title: '🌍 Global',
    rows: 7, cols: 7,
    words: [
      { word:'TREATY', clueNum:1, dir:'across', row:0, col:0, clue:'A formal agreement signed between nations' },
      { word:'REBEL',  clueNum:2, dir:'down',   row:0, col:1, clue:'Someone who rises up against authority or rules' },
      { word:'ABODE',  clueNum:3, dir:'across', row:2, col:0, clue:'A place where someone lives; a dwelling' },
      { word:'ELITE',  clueNum:4, dir:'down',   row:2, col:4, clue:'The most powerful or skilled group in society' },
    ],
  },

  // ── #7  PHILOSOPHY ────────────────────────────────────────────────────────
  // Grid:
  //  T H E O R Y .   row0: THEORY(across,c0), col1=H → HABIT(down)
  //  . A . . . . .
  //  A B O V E . .   row2: ABOVE(across,c0), col1=B→HABIT, col4=E→EXIST(down)
  //  . I . . X . .
  //  . T . . I . .
  //  . . . . S . .
  //  . . . . T . .
  {
    id: 'cwm7',
    title: '💡 Ideas',
    rows: 7, cols: 7,
    words: [
      { word:'THEORY', clueNum:1, dir:'across', row:0, col:0, clue:'A tested explanation of how or why something works' },
      { word:'HABIT',  clueNum:2, dir:'down',   row:0, col:1, clue:'A regular behaviour performed almost automatically' },
      { word:'ABOVE',  clueNum:3, dir:'across', row:2, col:0, clue:'Higher than; superior to; over' },
      { word:'EXIST',  clueNum:4, dir:'down',   row:2, col:4, clue:'To live or have real being' },
    ],
  },

  // ── #8  HISTORY ───────────────────────────────────────────────────────────
  // Grid:
  //  E M P I R E .   row0: EMPIRE(across,c0), col1=M → MYTHS(down)
  //  . Y . . . . .
  //  A T O N E . .   row2: ATONE(across,c0), col1=T→MYTHS, col4=E→EXALT(down)
  //  . H . . X . .
  //  . S . . A . .
  //  . . . . L . .
  //  . . . . T . .
  {
    id: 'cwm8',
    title: '⚔️ History',
    rows: 7, cols: 7,
    words: [
      { word:'EMPIRE', clueNum:1, dir:'across', row:0, col:0, clue:'A vast territory ruled by a single powerful leader' },
      { word:'MYTHS',  clueNum:2, dir:'down',   row:0, col:1, clue:'Ancient stories about gods, heroes and creation' },
      { word:'ATONE',  clueNum:3, dir:'across', row:2, col:0, clue:'To make amends or compensate for a wrongdoing' },
      { word:'EXALT',  clueNum:4, dir:'down',   row:2, col:4, clue:'To praise highly or raise to a higher status' },
    ],
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Build a 7×7 solution grid (null = black cell) from a puzzle's words array. */
export function buildSolutionGrid(puzzle) {
  const grid = Array.from({ length: puzzle.rows }, () =>
    Array(puzzle.cols).fill(null)
  )
  for (const w of puzzle.words) {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row : w.row + i
      const c = w.dir === 'across' ? w.col + i : w.col
      grid[r][c] = w.word[i]
    }
  }
  return grid
}

/** Build a map of cell → array of word indices that pass through it. */
export function buildCellWordMap(puzzle) {
  const map = {}
  puzzle.words.forEach((w, idx) => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.dir === 'across' ? w.row : w.row + i
      const c = w.dir === 'across' ? w.col + i : w.col
      const key = `${r},${c}`
      if (!map[key]) map[key] = []
      map[key].push(idx)
    }
  })
  return map
}

/** Return cells belonging to a specific word index as [{row,col}]. */
export function getWordCells(puzzle, wordIdx) {
  const w = puzzle.words[wordIdx]
  return Array.from({ length: w.word.length }, (_, i) => ({
    row: w.dir === 'across' ? w.row : w.row + i,
    col: w.dir === 'across' ? w.col + i : w.col,
  }))
}

/** Pick a random puzzle, optionally excluding the last played. */
export function getRandomPuzzle(excludeId = null) {
  const pool = excludeId ? PUZZLES.filter(p => p.id !== excludeId) : PUZZLES
  return pool[Math.floor(Math.random() * pool.length)]
}
