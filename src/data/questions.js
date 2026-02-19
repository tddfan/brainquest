// ─── XP CONSTANTS ────────────────────────────────────────────────────────────
export const XP_CORRECT = 100
export const XP_SPEED_BONUS = 50   // awarded if answered within 10 seconds
export const XP_STREAK_BONUS = 25  // per streak level (3+)
export const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7500, 12000, 20000]

export function calcLevel(xp) {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i + 1; break }
  }
  return level
}

export function xpToNextLevel(xp) {
  const level = calcLevel(xp)
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0
  return { current: xp - current, needed: next - current, percent: Math.round(((xp - current) / (next - current)) * 100) }
}

// ─── AVATARS ─────────────────────────────────────────────────────────────────
export const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🐸', '🐧', '🦋', '🐉', '🦄', '🤖', '👽', '🐙']

// ─── CATEGORY META ────────────────────────────────────────────────────────────
export const CATEGORIES = {
  flags: {
    id: 'flags',
    label: 'World Flags',
    emoji: '🌍',
    description: 'Guess the country from its flag!',
    gradient: 'from-blue-600 to-cyan-500',
    color: 'bg-blue-500',
  },
  science: {
    id: 'science',
    label: 'Science',
    emoji: '🔬',
    description: 'Space, biology & amazing discoveries',
    gradient: 'from-green-600 to-emerald-400',
    color: 'bg-green-500',
  },
  tech: {
    id: 'tech',
    label: 'Tech & AI',
    emoji: '🤖',
    description: 'Robots, coding & the digital world',
    gradient: 'from-violet-600 to-purple-400',
    color: 'bg-violet-500',
  },
  history: {
    id: 'history',
    label: 'History',
    emoji: '🏛️',
    description: 'Ancient civilisations & famous explorers',
    gradient: 'from-orange-600 to-amber-400',
    color: 'bg-orange-500',
  },
}

// ─── SCIENCE QUESTIONS ───────────────────────────────────────────────────────
export const scienceQuestions = [
  {
    id: 's1',
    question: 'Which planet is known as the "Red Planet"?',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    correct: 0,
    fact: 'Mars has the largest volcano in the solar system — Olympus Mons, three times taller than Everest!',
  },
  {
    id: 's2',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'],
    correct: 2,
    fact: 'Mitochondria convert food energy into ATP, the "fuel" all cells run on.',
  },
  {
    id: 's3',
    question: 'How many bones does a human adult have?',
    options: ['206', '300', '187', '256'],
    correct: 0,
    fact: 'Babies are born with ~270 bones; many fuse together as we grow!',
  },
  {
    id: 's4',
    question: 'What is the speed of light (approx.)?',
    options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '3,000 km/s'],
    correct: 0,
    fact: 'Light from the Sun takes about 8 minutes to reach Earth.',
  },
  {
    id: 's5',
    question: 'Which gas do plants absorb during photosynthesis?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
    correct: 1,
    fact: 'Plants turn CO₂ and sunlight into glucose and release oxygen — that is the air we breathe!',
  },
  {
    id: 's6',
    question: 'What is the closest star to Earth (other than the Sun)?',
    options: ['Proxima Centauri', 'Sirius', 'Betelgeuse', 'Vega'],
    correct: 0,
    fact: 'Proxima Centauri is 4.24 light-years away — a trip there at current rocket speed would take 6,300 years!',
  },
  {
    id: 's7',
    question: 'DNA stands for…?',
    options: [
      'Deoxyribonucleic Acid',
      'Dynamic Nucleus Array',
      'Dual Nitrogen Atom',
      'Dense Nucleotide Agent',
    ],
    correct: 0,
    fact: 'If all the DNA in your body was uncoiled, it would stretch from Earth to the Sun — and back — 600 times!',
  },
  {
    id: 's8',
    question: 'Which planet has the most moons?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    correct: 1,
    fact: 'Saturn has 146 confirmed moons as of 2024 — beating Jupiter!',
  },
  {
    id: 's9',
    question: 'What type of animal is a dolphin?',
    options: ['Fish', 'Amphibian', 'Mammal', 'Reptile'],
    correct: 2,
    fact: 'Dolphins are mammals — they breathe air, give birth to live young, and nurse them with milk.',
  },
  {
    id: 's10',
    question: 'What is the hardest natural substance on Earth?',
    options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
    correct: 2,
    fact: 'Diamond scores 10 on the Mohs hardness scale — it can only be scratched by another diamond.',
  },
]

// ─── TECH QUESTIONS ───────────────────────────────────────────────────────────
export const techQuestions = [
  {
    id: 't1',
    question: 'What does "WWW" stand for?',
    options: ['World Wide Web', 'World Web Wire', 'Wide World Web', 'Web Wide World'],
    correct: 0,
    fact: 'Tim Berners-Lee invented the World Wide Web in 1989. The first website is still online!',
  },
  {
    id: 't2',
    question: 'How many bits are in one byte?',
    options: ['4', '8', '16', '2'],
    correct: 1,
    fact: 'Computers store everything — photos, music, videos — as sequences of 0s and 1s called bits.',
  },
  {
    id: 't3',
    question: 'Which country launched the first artificial satellite?',
    options: ['USA', 'China', 'USSR (Russia)', 'UK'],
    correct: 2,
    fact: 'Sputnik 1 was launched on October 4, 1957 — it beeped radio signals back to Earth.',
  },
  {
    id: 't4',
    question: 'What programming language is commonly used for web pages?',
    options: ['Python', 'JavaScript', 'Java', 'C++'],
    correct: 1,
    fact: 'JavaScript was created in just 10 days in 1995 — it now powers almost every website!',
  },
  {
    id: 't5',
    question: 'What does "AI" stand for?',
    options: ['Automated Internet', 'Artificial Intelligence', 'Advanced Interface', 'Analog Input'],
    correct: 1,
    fact: 'AI programs can learn from data — some AI models can write poems, draw pictures, and win at chess!',
  },
  {
    id: 't6',
    question: 'What is the name of the world\'s first programmable computer?',
    options: ['ENIAC', 'Apple I', 'Colossus', 'IBM 700'],
    correct: 0,
    fact: 'ENIAC (1945) filled an entire room, weighed 30 tons, and could do 5,000 additions per second.',
  },
  {
    id: 't7',
    question: 'Which company makes the iPhone?',
    options: ['Samsung', 'Google', 'Apple', 'Sony'],
    correct: 2,
    fact: 'Steve Jobs unveiled the first iPhone in 2007, calling it "a revolutionary and magical product."',
  },
  {
    id: 't8',
    question: 'What does "URL" stand for?',
    options: ['Uniform Resource Locator', 'Universal Read Link', 'Unique Route Label', 'User Remote Link'],
    correct: 0,
    fact: 'Every web address (like https://google.com) is a URL — a unique address for a resource on the internet.',
  },
  {
    id: 't9',
    question: 'Robots that can learn on their own are called…?',
    options: ['Autonomous robots', 'Mechanical bots', 'Machine learning robots', 'Smart bots'],
    correct: 2,
    fact: 'Machine learning robots improve their skills by analysing data — like a student who learns from examples.',
  },
  {
    id: 't10',
    question: 'Which is NOT a programming language?',
    options: ['Python', 'HTML', 'Rubik', 'Swift'],
    correct: 2,
    fact: 'HTML is technically a markup language, not a programming language — but it is the skeleton of every webpage.',
  },
]

// ─── HISTORY QUESTIONS ────────────────────────────────────────────────────────
export const historyQuestions = [
  {
    id: 'h1',
    question: 'Who built the Great Pyramids of Giza?',
    options: ['Ancient Romans', 'Ancient Egyptians', 'Mesopotamians', 'Ancient Greeks'],
    correct: 1,
    fact: 'The Great Pyramid was the tallest man-made structure in the world for over 3,800 years!',
  },
  {
    id: 'h2',
    question: 'Which explorer is credited with first reaching the Americas in 1492?',
    options: ['Vasco da Gama', 'Ferdinand Magellan', 'Christopher Columbus', 'Amerigo Vespucci'],
    correct: 2,
    fact: 'Columbus actually landed in the Caribbean — he never set foot on the North American mainland.',
  },
  {
    id: 'h3',
    question: 'In which city did the ancient Olympic Games begin?',
    options: ['Athens', 'Sparta', 'Olympia', 'Corinth'],
    correct: 2,
    fact: 'The first recorded ancient Olympic Games were held in 776 BC in Olympia, Greece.',
  },
  {
    id: 'h4',
    question: 'Who was the first female pharaoh of ancient Egypt?',
    options: ['Nefertiti', 'Cleopatra', 'Hatshepsut', 'Isis'],
    correct: 2,
    fact: 'Hatshepsut ruled for about 20 years and oversaw many great building projects — including her famous temple.',
  },
  {
    id: 'h5',
    question: 'The Great Wall of China was primarily built to protect against…?',
    options: ['Flooding', 'Nomadic invasions', 'Tsunamis', 'Desert expansion'],
    correct: 1,
    fact: 'The Wall stretches over 21,000 km — but it was never one continuous wall; it had many gaps.',
  },
  {
    id: 'h6',
    question: 'Which ancient wonder of the world still stands today?',
    options: [
      'The Colossus of Rhodes',
      'The Hanging Gardens of Babylon',
      'The Great Pyramid of Giza',
      'The Lighthouse of Alexandria',
    ],
    correct: 2,
    fact: 'The Great Pyramid is the only one of the Seven Wonders of the Ancient World still largely intact.',
  },
  {
    id: 'h7',
    question: 'Who was the first person to walk on the Moon?',
    options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'John Glenn'],
    correct: 2,
    fact: 'Neil Armstrong stepped onto the Moon on July 20, 1969, and said: "One small step for man, one giant leap for mankind."',
  },
  {
    id: 'h8',
    question: 'The ancient city of Rome is in which modern country?',
    options: ['Greece', 'Spain', 'France', 'Italy'],
    correct: 3,
    fact: 'At its height, the Roman Empire covered about 5 million km² — roughly the size of the entire EU today.',
  },
  {
    id: 'h9',
    question: 'Which civilisation invented the wheel?',
    options: ['Egyptians', 'Sumerians', 'Chinese', 'Greeks'],
    correct: 1,
    fact: 'The Sumerians of Mesopotamia invented the wheel around 3500 BC — first used for pottery, then for transport.',
  },
  {
    id: 'h10',
    question: 'What language did ancient Romans primarily speak?',
    options: ['Greek', 'Italian', 'Latin', 'Celtic'],
    correct: 2,
    fact: 'Latin evolved into the Romance languages: Italian, Spanish, Portuguese, French, and Romanian!',
  },
]

// ─── FLAGS: Fetcher + Question Generator ─────────────────────────────────────
// Flags are loaded dynamically from the REST Countries API.
// We pick 10 random countries and ask "Which country does this flag belong to?"

export async function fetchFlagQuestions() {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,region')
  const data = await res.json()

  // filter to well-known countries (population proxied by having a common name)
  const countries = data.filter((c) => c.name?.common && c.flags?.svg)

  // shuffle and take 50 as pool, then build 10 questions each with 4 options
  const shuffled = [...countries].sort(() => Math.random() - 0.5).slice(0, 50)
  const questions = []

  for (let i = 0; i < 10; i++) {
    const correct = shuffled[i]
    const distractors = shuffled
      .filter((c) => c.name.common !== correct.name.common)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [correct, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((c) => c.name.common)

    const correctIndex = options.indexOf(correct.name.common)

    questions.push({
      id: `f${i}`,
      flagUrl: correct.flags.svg,
      question: 'Which country does this flag belong to?',
      options,
      correct: correctIndex,
      fact: `${correct.name.common} is located in ${correct.region}.`,
    })
  }

  return questions
}

// ─── QUESTIONS MAP ────────────────────────────────────────────────────────────
export const STATIC_QUESTIONS = {
  science: scienceQuestions,
  tech: techQuestions,
  history: historyQuestions,
}
