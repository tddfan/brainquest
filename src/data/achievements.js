export const ACHIEVEMENTS = [
  {
    id: 'first_quiz',
    title: 'First Step',
    emoji: '👣',
    description: 'Complete your first quiz',
    requirement: (stats) => (stats.quizzesCompleted ?? 0) >= 1
  },
  {
    id: 'quiz_master_10',
    title: 'Quiz Novice',
    emoji: '📚',
    description: 'Complete 10 quizzes',
    requirement: (stats) => (stats.quizzesCompleted ?? 0) >= 10
  },
  {
    id: 'quiz_master_50',
    title: 'Quiz Expert',
    emoji: '🎓',
    description: 'Complete 50 quizzes',
    requirement: (stats) => (stats.quizzesCompleted ?? 0) >= 50
  },
  {
    id: 'chess_winner',
    title: 'Checkmate!',
    emoji: '♟️',
    description: 'Win a game of chess against the AI',
    requirement: (stats) => (stats.chessWins ?? 0) >= 1
  },
  {
    id: 'sudoku_solver',
    title: 'Number Cruncher',
    emoji: '🔢',
    description: 'Solve a Sudoku puzzle',
    requirement: (stats) => (stats.sudokuCompleted ?? 0) >= 1
  },
  {
    id: 'millionaire_winner',
    title: 'XP Tycoon',
    emoji: '💰',
    description: 'Win the XP Millionaire game',
    requirement: (stats) => (stats.millionaireWins ?? 0) >= 1
  },
  {
    id: 'streak_3',
    title: 'On Fire',
    emoji: '🔥',
    description: 'Get a 3-quiz daily streak',
    requirement: (stats) => (stats.maxStreak ?? 0) >= 3
  },
  {
    id: 'animal_lover',
    title: 'Nature Scout',
    emoji: '🐾',
    description: 'Complete 10 Animal quizzes',
    requirement: (stats) => (stats.categoryStats?.animals ?? 0) >= 10
  },
  {
    id: 'world_traveler',
    title: 'Globetrotter',
    emoji: '🌍',
    description: 'Complete 10 Landmark quizzes',
    requirement: (stats) => (stats.categoryStats?.landmarks ?? 0) >= 10
  },
  {
    id: 'tech_wizard',
    title: 'Digital Native',
    emoji: '🤖',
    description: 'Complete 10 Tech quizzes',
    requirement: (stats) => (stats.categoryStats?.tech ?? 0) >= 10
  }
];
