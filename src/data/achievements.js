export const ACHIEVEMENTS = [
  // General Progress
  {
    id: 'first_quiz',
    title: 'First Step',
    emoji: '👣',
    description: 'Complete your first quiz',
    requirement: (stats) => (stats.quizzesCompleted ?? 0) >= 1
  },
  {
    id: 'quiz_novice',
    title: 'Quiz Novice',
    emoji: '📚',
    description: 'Complete 10 quizzes',
    requirement: (stats) => (stats.quizzesCompleted ?? 0) >= 10
  },
  {
    id: 'quiz_expert',
    title: 'Quiz Expert',
    emoji: '🎓',
    description: 'Complete 50 quizzes',
    requirement: (stats) => (stats.quizzesCompleted ?? 0) >= 50
  },
  {
    id: 'xp_collector',
    title: 'XP Collector',
    emoji: '💎',
    description: 'Earn 5,000 Total XP',
    requirement: (stats) => (stats.totalXP ?? 0) >= 5000
  },
  {
    id: 'xp_legend',
    title: 'XP Legend',
    emoji: '👑',
    description: 'Earn 50,000 Total XP',
    requirement: (stats) => (stats.totalXP ?? 0) >= 50000
  },

  // Maths Quest
  {
    id: 'maths_starter',
    title: 'Maths Pupil',
    emoji: '🧮',
    description: 'Complete 5 Maths Quests',
    requirement: (stats) => (stats.mathsCompleted ?? 0) >= 5
  },
  {
    id: 'maths_genius',
    title: 'Maths Genius',
    emoji: '⚡',
    description: 'Complete 25 Maths Quests',
    requirement: (stats) => (stats.mathsCompleted ?? 0) >= 25
  },

  // English Quest
  {
    id: 'english_learner',
    title: 'Word Smith',
    emoji: '📖',
    description: 'Complete 5 English Quests',
    requirement: (stats) => (stats.englishCompleted ?? 0) >= 5
  },
  {
    id: 'english_master',
    title: 'Linguist',
    emoji: '🖋️',
    description: 'Complete 25 English Quests',
    requirement: (stats) => (stats.englishCompleted ?? 0) >= 25
  },

  // Puzzles
  {
    id: 'chess_winner',
    title: 'Grandmaster',
    emoji: '♟️',
    description: 'Win a game of chess against the AI',
    requirement: (stats) => (stats.chessWins ?? 0) >= 1
  },
  {
    id: 'sudoku_solver',
    title: 'Logic Lord',
    emoji: '🔢',
    description: 'Solve 5 Sudoku puzzles',
    requirement: (stats) => (stats.sudokuCompleted ?? 0) >= 5
  },
  {
    id: 'memory_pro',
    title: 'Mind Reader',
    emoji: '🃏',
    description: 'Complete 10 Memory Games',
    requirement: (stats) => (stats.memoryCompleted ?? 0) >= 10
  },
  {
    id: 'millionaire_winner',
    title: 'Millionaire',
    emoji: '💰',
    description: 'Win the XP Millionaire game',
    requirement: (stats) => (stats.millionaireWins ?? 0) >= 1
  },

  // Daily Fun
  {
    id: 'news_reader',
    title: 'Well Informed',
    emoji: '📰',
    description: 'Read the Daily News 5 times',
    requirement: (stats) => (stats.newsReadCount ?? 0) >= 5
  },
  {
    id: 'joke_teller',
    title: 'Joker',
    emoji: '😂',
    description: 'Reveal 20 Jokes or Riddles',
    requirement: (stats) => (stats.jokesRevealed ?? 0) >= 20
  },

  // Categories
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
  }
];
