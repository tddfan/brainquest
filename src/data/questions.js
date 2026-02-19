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
  brands: {
    id: 'brands',
    label: 'Brand Logos',
    emoji: '🏷️',
    description: 'Recognise the world\'s most iconic brands',
    gradient: 'from-red-600 to-rose-400',
    color: 'bg-red-500',
  },
  emoji: {
    id: 'emoji',
    label: 'Emoji Pictionary',
    emoji: '🎭',
    description: 'Decode emoji clues to find the answer!',
    gradient: 'from-yellow-500 to-orange-400',
    color: 'bg-yellow-500',
  },
  landmarks: {
    id: 'landmarks',
    label: 'Landmarks',
    emoji: '🗺️',
    description: 'Spot famous monuments & travel spots',
    gradient: 'from-teal-600 to-cyan-400',
    color: 'bg-teal-500',
  },
  dishes: {
    id: 'dishes',
    label: 'World Dishes',
    emoji: '🍜',
    description: 'Taste-test your food knowledge!',
    gradient: 'from-pink-600 to-rose-400',
    color: 'bg-pink-500',
  },
  cars: {
    id: 'cars',
    label: 'Car Logos',
    emoji: '🚗',
    description: 'Rev up and name that car brand!',
    gradient: 'from-slate-600 to-gray-500',
    color: 'bg-slate-500',
  },
  retro: {
    id: 'retro',
    label: 'Before the 90s',
    emoji: '📼',
    description: 'Classic items from a pre-digital world',
    gradient: 'from-indigo-600 to-violet-400',
    color: 'bg-indigo-500',
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

// ─── BRAND LOGOS ─────────────────────────────────────────────────────────────
export const brandsQuestions = [
  {
    id: 'b1',
    question: 'Which brand\'s logo is a silver apple with a bite taken out of it?',
    options: ['Apple', 'Samsung', 'Dell', 'Huawei'],
    correct: 0,
    fact: 'Apple\'s logo was designed in 1977. The bite is there so it doesn\'t look like a cherry!',
  },
  {
    id: 'b2',
    question: 'Which fast food brand has a golden "M" arch as its logo?',
    options: ['Burger King', 'McDonald\'s', 'KFC', 'Wendy\'s'],
    correct: 1,
    fact: 'McDonald\'s golden arches are one of the most recognised symbols in the world — more than the Christian cross, by some surveys.',
  },
  {
    id: 'b3',
    question: 'Which brand\'s logo is a simple black swoosh (checkmark) with the slogan "Just Do It"?',
    options: ['Puma', 'Adidas', 'Nike', 'Reebok'],
    correct: 2,
    fact: 'The Nike swoosh was designed by a student for just $35 in 1971. It now represents a brand worth over $30 billion.',
  },
  {
    id: 'b4',
    question: 'Which streaming service has a bold red "N" as its logo?',
    options: ['Hulu', 'Disney+', 'Netflix', 'Prime Video'],
    correct: 2,
    fact: 'Netflix started in 1997 as a DVD-by-mail service. It launched online streaming a full decade later in 2007.',
  },
  {
    id: 'b5',
    question: 'Which coffee chain uses a two-tailed mermaid (siren) inside a green circle?',
    options: ['Costa Coffee', 'Starbucks', 'Tim Hortons', 'Dunkin\''],
    correct: 1,
    fact: 'The Starbucks siren is based on a 16th-century Norse woodcut. The chain was named after a character in Moby Dick.',
  },
  {
    id: 'b6',
    question: 'Which sportswear brand is famous for three parallel stripes on its clothing?',
    options: ['Under Armour', 'Fila', 'Adidas', 'New Balance'],
    correct: 2,
    fact: 'Adidas founder Adi Dassler bought three stripes as a design element in 1952 for 1,600 DM and two bottles of whisky.',
  },
  {
    id: 'b7',
    question: 'Which tech company\'s logo spells its name in red, blue, yellow, green and red letters?',
    options: ['Microsoft', 'Yahoo', 'Google', 'Meta'],
    correct: 2,
    fact: 'Google\'s multicoloured logo shows that it doesn\'t follow the rules — one colour breaks the pattern on purpose!',
  },
  {
    id: 'b8',
    question: 'Which electric car brand has a logo shaped like a stylised letter "T" (a motor cross-section)?',
    options: ['Rivian', 'Tesla', 'Lucid', 'NIO'],
    correct: 1,
    fact: 'Tesla\'s "T" logo is actually a cross-section of the electric motor\'s stator — a nod to its engineering roots.',
  },
  {
    id: 'b9',
    question: 'Which soda brand is recognised by its red can with white swirling script lettering?',
    options: ['Pepsi', 'Fanta', 'Sprite', 'Coca-Cola'],
    correct: 3,
    fact: 'Coca-Cola\'s signature red and white branding dates back to 1886. Its secret recipe is kept in a vault in Atlanta.',
  },
  {
    id: 'b10',
    question: 'Which social media platform is known for a blue bird logo (now replaced by "X")?',
    options: ['Snapchat', 'Twitter / X', 'Telegram', 'Bluesky'],
    correct: 1,
    fact: 'Twitter\'s blue bird, called "Larry the Bird," was named after basketball star Larry Bird. It was retired in 2023 when Elon Musk rebranded the platform to X.',
  },
]

// ─── EMOJI PICTIONARY ────────────────────────────────────────────────────────
export const emojiQuestions = [
  {
    id: 'e1',
    question: 'Which movie does this emoji combo represent? 🦁👑🌍',
    options: ['Jungle Book', 'The Lion King', 'Madagascar', 'Zootopia'],
    correct: 1,
    fact: 'The Lion King (1994) is based on Shakespeare\'s Hamlet. "Simba" means lion in Swahili, and "Mufasa" means king.',
  },
  {
    id: 'e2',
    question: 'Which superhero does this represent? 🕷️🕸️🏙️',
    options: ['Batman', 'Ant-Man', 'Spider-Man', 'Black Widow'],
    correct: 2,
    fact: 'Spider-Man first appeared in Amazing Fantasy #15 in 1962. He is the best-selling Marvel superhero of all time.',
  },
  {
    id: 'e3',
    question: 'Which animated movie is this? ❄️👸⛄',
    options: ['Frozen', 'Snow White', 'Brave', 'Moana'],
    correct: 0,
    fact: '"Frozen" (2013) became the highest-grossing animated film of all time at release. "Let It Go" won the Academy Award for Best Original Song.',
  },
  {
    id: 'e4',
    question: 'What movie franchise does 🧙‍♂️⚡🏰 represent?',
    options: ['Lord of the Rings', 'Narnia', 'Harry Potter', 'Merlin'],
    correct: 2,
    fact: 'Harry Potter\'s lightning bolt scar is the result of the killing curse rebounding off baby Harry — leaving a mark shaped like the spell itself.',
  },
  {
    id: 'e5',
    question: 'Which Pixar film does 🐠🔍🌊 hint at?',
    options: ['Shark Tale', 'Finding Nemo', 'Moana', 'The Little Mermaid'],
    correct: 1,
    fact: 'Finding Nemo (2003) caused a real-world surge in demand for clownfish as pets — ironically endangering them in the wild.',
  },
  {
    id: 'e6',
    question: 'Decode this one: 🚀🤠♾️',
    options: ['Interstellar', 'Toy Story', 'WALL-E', 'Gravity'],
    correct: 1,
    fact: 'Buzz Lightyear\'s catchphrase "To infinity and beyond!" was voted the most iconic movie quote of 1995.',
  },
  {
    id: 'e7',
    question: 'Which classic film does 🦈🏖️🎬 represent?',
    options: ['Deep Blue Sea', 'The Meg', 'Jaws', 'Piranha'],
    correct: 2,
    fact: 'Jaws (1975) is considered the first modern summer blockbuster. The mechanical shark broke so often that Spielberg filmed it from the victim\'s perspective instead.',
  },
  {
    id: 'e8',
    question: 'What movie does 🦕🌴🏃 point to?',
    options: ['Ice Age', 'The Land Before Time', 'Jurassic Park', 'Dinosaur'],
    correct: 2,
    fact: 'Jurassic Park (1993) pioneered CGI dinosaurs. The T-Rex roar was a baby elephant mixed with an alligator and a tiger.',
  },
  {
    id: 'e9',
    question: 'Decode: 🍫🏭🎫',
    options: ['Willy Wonka / Charlie and the Chocolate Factory', 'Candy Crush', 'Ratatouille', 'Sugar Rush'],
    correct: 0,
    fact: 'Roald Dahl\'s 1964 novel was inspired by Cadbury\'s practise of sending secret testers to rival chocolate factories.',
  },
  {
    id: 'e10',
    question: 'Which superhero does 🦇🌃🤛 represent?',
    options: ['Nightwing', 'Black Panther', 'Batman', 'Daredevil'],
    correct: 2,
    fact: 'Batman first appeared in Detective Comics #27 in 1939. Unlike most heroes, he has no superpowers — only intellect and gadgets.',
  },
]

// ─── LANDMARKS ────────────────────────────────────────────────────────────────
// imageUrl uses freely-licensed Wikimedia Commons images
export const landmarksQuestions = [
  {
    id: 'lm1',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/405px-Tour_Eiffel_Wikimedia_Commons.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Eiffel Tower', 'Big Ben', 'Burj Khalifa', 'CN Tower'],
    correct: 0,
    fact: 'The Eiffel Tower in Paris was built in 1889 and was originally planned to be demolished after 20 years. It is now the most visited paid monument in the world!',
  },
  {
    id: 'lm2',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/400px-Taj_Mahal_%28Edited%29.jpeg',
    question: 'Which famous landmark is shown here?',
    options: ['Angkor Wat', 'Taj Mahal', 'Hagia Sophia', 'Alhambra'],
    correct: 1,
    fact: 'The Taj Mahal in Agra, India, was built by Emperor Shah Jahan as a tomb for his wife Mumtaz Mahal. It took 22 years and 20,000 workers to complete.',
  },
  {
    id: 'lm3',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/400px-Colosseo_2020.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Parthenon', 'Pantheon', 'Colosseum', 'Forum of Trajan'],
    correct: 2,
    fact: 'The Colosseum in Rome could hold up to 80,000 spectators. It hosted gladiator fights, animal hunts, and even mock naval battles with a flooded arena!',
  },
  {
    id: 'lm4',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/400px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Hadrian\'s Wall', 'Berlin Wall', 'Great Wall of China', 'Wall of Babylon'],
    correct: 2,
    fact: 'The Great Wall of China stretches over 21,000 km. Contrary to popular myth, it cannot be seen from space with the naked eye.',
  },
  {
    id: 'lm5',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/300px-Statue_of_Liberty_7.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Cristo Redentor', 'Statue of Freedom', 'Statue of Liberty', 'Angel of the North'],
    correct: 2,
    fact: 'The Statue of Liberty was a gift from France to the USA in 1886. Lady Liberty\'s full name is "Liberty Enlightening the World."',
  },
  {
    id: 'lm6',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/400px-Sydney_Australia._%2821339175489%29.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Sydney Opera House', 'National Centre for the Performing Arts', 'Royal Opera House', 'La Scala'],
    correct: 0,
    fact: 'The Sydney Opera House was designed by Danish architect Jørn Utzon. It was listed as a UNESCO World Heritage Site in 2007.',
  },
  {
    id: 'lm7',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/400px-Machu_Picchu%2C_Peru.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Chichen Itza', 'Machu Picchu', 'Tikal', 'Tiwanaku'],
    correct: 1,
    fact: 'Machu Picchu in Peru was built by the Inca in the 15th century and then abandoned. It was unknown to the outside world until 1911.',
  },
  {
    id: 'lm8',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007_icon.png/450px-Clock_Tower_-_Palace_of_Westminster%2C_London_-_May_2007_icon.png',
    question: 'Which famous landmark is shown here?',
    options: ['Glockenspiel', 'Big Ben (Elizabeth Tower)', 'Notre-Dame Bell Tower', 'St Paul\'s Cathedral'],
    correct: 1,
    fact: '"Big Ben" is actually the nickname of the main bell inside the Elizabeth Tower in London. The tower itself was renamed in 2012 to honour Queen Elizabeth II.',
  },
  {
    id: 'lm9',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sagrada_Familia_01.jpg/300px-Sagrada_Familia_01.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Notre-Dame de Paris', 'Sagrada Família', 'Cologne Cathedral', 'Basilica of the Sacred Heart'],
    correct: 1,
    fact: 'The Sagrada Família in Barcelona has been under construction since 1882 — over 140 years! Architect Antoni Gaudí knew he wouldn\'t live to see it finished.',
  },
  {
    id: 'lm10',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Petra_Jordan.jpg/400px-Petra_Jordan.jpg',
    question: 'Which famous landmark is shown here?',
    options: ['Petra', 'Persepolis', 'Palmyra', 'Leptis Magna'],
    correct: 0,
    fact: 'Petra in Jordan is known as the "Rose City" because of its pink sandstone. It was carved by the Nabataean people over 2,000 years ago.',
  },
]

// ─── WORLD DISHES ─────────────────────────────────────────────────────────────
export const dishesQuestions = [
  {
    id: 'd1',
    question: '🍕 A round flatbread topped with tomato sauce and cheese, baked in a hot oven. Which country invented this dish?',
    options: ['USA', 'Greece', 'Italy', 'Spain'],
    correct: 2,
    fact: 'Pizza originated in Naples, Italy in the 18th century. The classic Margherita was named after Queen Margherita of Savoy in 1889.',
  },
  {
    id: 'd2',
    question: '🍣 Raw fish sliced thinly and served over seasoned rice. Which country is this dish from?',
    options: ['China', 'Japan', 'South Korea', 'Thailand'],
    correct: 1,
    fact: 'Sushi originated in Southeast Asia as a way of preserving fish in fermented rice. The Japanese evolved it into the fresh dish we know today.',
  },
  {
    id: 'd3',
    question: '🥘 A saffron-flavoured rice dish cooked with seafood or meat in a wide, shallow pan. Where is it from?',
    options: ['Portugal', 'Morocco', 'Spain', 'Italy'],
    correct: 2,
    fact: 'Paella (pronounced "pa-EH-ya") comes from Valencia, Spain. The name comes from the Latin "patella" — the pan it is cooked in.',
  },
  {
    id: 'd4',
    question: '🍜 A fragrant noodle soup with herbs, lime, and beef or chicken, served in a street-food bowl. Which country?',
    options: ['Thailand', 'Vietnam', 'Cambodia', 'Laos'],
    correct: 1,
    fact: 'Pho (pronounced "fuh") is Vietnam\'s national dish. The broth is simmered for up to 24 hours to develop its deep flavour.',
  },
  {
    id: 'd5',
    question: '🌮 A small folded corn tortilla filled with meat, salsa, and lime juice. Which country?',
    options: ['Spain', 'Colombia', 'Brazil', 'Mexico'],
    correct: 3,
    fact: 'Tacos date back to the Aztec civilisation before Spanish colonisation. The word "taco" originally referred to gunpowder used by silver miners.',
  },
  {
    id: 'd6',
    question: '🍛 A fragrant layered dish of rice, spices, and marinated meat, slow-cooked in a sealed pot. Which country?',
    options: ['Pakistan / India', 'Egypt', 'Turkey', 'Iran'],
    correct: 0,
    fact: 'Biryani is believed to have arrived in India via Persia. There are over 50 regional varieties across the Indian subcontinent.',
  },
  {
    id: 'd7',
    question: '🥩 A thin veal or pork cutlet, pounded flat and pan-fried in breadcrumbs. Which country is famous for it?',
    options: ['Switzerland', 'France', 'Austria', 'Germany'],
    correct: 2,
    fact: 'Wiener Schnitzel literally means "Viennese cutlet." By Austrian law, only a veal version may officially be called Wiener Schnitzel.',
  },
  {
    id: 'd8',
    question: '🥐 A flaky, buttery, crescent-shaped pastry eaten for breakfast. Which country is it from?',
    options: ['Germany', 'France', 'Belgium', 'Switzerland'],
    correct: 1,
    fact: 'The croissant was actually invented in Austria — brought to France by Marie Antoinette. French bakers perfected the laminated dough technique.',
  },
  {
    id: 'd9',
    question: '🫕 A slow-cooked stew of black beans, pork, and rice, considered the national dish. Which country?',
    options: ['Cuba', 'Argentina', 'Brazil', 'Colombia'],
    correct: 2,
    fact: 'Feijoada is Brazil\'s beloved national dish. Originally a slave food made from leftover cuts, it is now eaten by all Brazilians on Wednesdays and Saturdays.',
  },
  {
    id: 'd10',
    question: '🥗 A salad of cucumber, olives, tomato, red onion, and feta cheese dressed in olive oil. Which country?',
    options: ['Turkey', 'Lebanon', 'Cyprus', 'Greece'],
    correct: 3,
    fact: 'The Greek salad (Horiatiki) has no lettuce — the original village recipe uses only chunky-cut raw vegetables and a slab of feta.',
  },
]

// ─── CAR LOGOS ────────────────────────────────────────────────────────────────
export const carsQuestions = [
  {
    id: 'c1',
    question: 'Which car brand\'s logo features a prancing black horse on a yellow shield?',
    options: ['Lamborghini', 'Ferrari', 'Porsche', 'Maserati'],
    correct: 1,
    fact: 'Ferrari\'s prancing horse (Cavallino Rampante) was originally on the plane of WWI ace Francesco Baracca. His mother gave permission to Enzo Ferrari to use it for luck.',
  },
  {
    id: 'c2',
    question: 'Which car brand has four interlocked silver rings in a horizontal row as its badge?',
    options: ['BMW', 'Volkswagen', 'Audi', 'Mercedes'],
    correct: 2,
    fact: 'Audi\'s four rings represent the four companies that merged in 1932: Audi, DKW, Horch, and Wanderer.',
  },
  {
    id: 'c3',
    question: 'Which luxury car brand has a three-pointed silver star inside a circle as its logo?',
    options: ['Aston Martin', 'Bentley', 'Rolls-Royce', 'Mercedes-Benz'],
    correct: 3,
    fact: 'Mercedes-Benz\'s three-pointed star represents the brand\'s ambition to dominate land, sea, and air transportation.',
  },
  {
    id: 'c4',
    question: 'Which car brand\'s logo is a blue-and-white circle divided into four quarters like a spinning propeller?',
    options: ['Subaru', 'BMW', 'Saab', 'Alfa Romeo'],
    correct: 1,
    fact: 'The BMW roundel\'s blue and white colours represent the Free State of Bavaria\'s flag. The "propeller" story is a myth — it came after the logo.',
  },
  {
    id: 'c5',
    question: 'Which supercar brand features a charging golden bull on a black background?',
    options: ['Ferrari', 'Porsche', 'Lamborghini', 'Bugatti'],
    correct: 2,
    fact: 'Lamborghini\'s founder, Ferruccio Lamborghini, was born under the sign of Taurus (the bull). He started his company after an argument with Enzo Ferrari.',
  },
  {
    id: 'c6',
    question: 'Which car brand has a logo of two overlapping letters that spell both the brand\'s initials inside a circle?',
    options: ['Vauxhall', 'Volkswagen', 'Volvo', 'Vespa'],
    correct: 1,
    fact: 'Volkswagen means "people\'s car" in German. It was founded in 1937 with the mission to build an affordable car for every German family.',
  },
  {
    id: 'c7',
    question: 'Which American car brand writes its name in blue cursive script inside a blue oval?',
    options: ['Chevrolet', 'Jeep', 'Ford', 'Dodge'],
    correct: 2,
    fact: 'Ford\'s oval logo has been used since 1927. Henry Ford introduced the first moving assembly line in 1913, revolutionising manufacturing worldwide.',
  },
  {
    id: 'c8',
    question: 'Which British car brand has a silver big cat leaping above the brand name on its bonnet?',
    options: ['Lotus', 'Jaguar', 'Land Rover', 'McLaren'],
    correct: 1,
    fact: 'Jaguar\'s famous leaping cat mascot dates to the 1930s. The company started as the Swallow Sidecar Company before making cars.',
  },
  {
    id: 'c9',
    question: 'Which German car brand\'s badge is a crest with a horse, antlers, and red-and-black stripes?',
    options: ['Audi', 'BMW', 'Porsche', 'Opel'],
    correct: 2,
    fact: 'Porsche\'s crest combines the coat of arms of Stuttgart (a horse) and the Kingdom of Württemberg (antlers and stripes). Porsche is headquartered in Stuttgart.',
  },
  {
    id: 'c10',
    question: 'Which Japanese car brand\'s logo shows three overlapping ovals forming a stylised "T" inside an ellipse?',
    options: ['Honda', 'Nissan', 'Mazda', 'Toyota'],
    correct: 3,
    fact: 'Toyota\'s three ovals represent the heart of the customer, the heart of the product, and the heart of technological progress.',
  },
]

// ─── BEFORE THE 90s ────────────────────────────────────────────────────────────
export const retroQuestions = [
  {
    id: 'r1',
    question: '📼 A large black plastic cassette that stored movies and could be recorded on a home VCR. What was it called?',
    options: ['Blu-ray disc', 'VHS tape', 'LaserDisc', '8-track tape'],
    correct: 1,
    fact: 'VHS (Video Home System) won the format war against Betamax in the 1980s. By 1999, 95% of video rentals in the USA were on VHS.',
  },
  {
    id: 'r2',
    question: '💾 A thin, flat plastic square used to save and transfer computer files, storing about 1.44 MB. What was it?',
    options: ['ZIP disk', 'CD-ROM', 'Floppy disk', 'Memory card'],
    correct: 2,
    fact: 'The floppy disk\'s "save" icon is still used everywhere today — a funny case of younger generations using a symbol they\'ve never seen in real life!',
  },
  {
    id: 'r3',
    question: '📼 A palm-sized plastic cassette with magnetic tape inside, used to record and play music. What was it?',
    options: ['8-track', 'Cassette tape', 'Reel-to-reel tape', 'Minidisc'],
    correct: 1,
    fact: 'Sony\'s Walkman (1979) made cassette tapes a cultural icon. It was the first truly portable personal music player in history.',
  },
  {
    id: 'r4',
    question: '📞 A telephone with a circular dial that you rotated with your finger to dial each number. What was it called?',
    options: ['Cordless phone', 'Rotary telephone', 'Car phone', 'Operator phone'],
    correct: 1,
    fact: 'Rotary phones were standard in homes from the 1920s to the 1980s. Dialling a "9" took the longest because the dial had to rotate almost fully around.',
  },
  {
    id: 'r5',
    question: '📟 A small pocket device that beeped and displayed a phone number, telling you to call someone back. What was it?',
    options: ['Walkman', 'Pager / Beeper', 'Dictaphone', 'PalmPilot'],
    correct: 1,
    fact: 'Pagers peaked in popularity in the 1990s with over 61 million users. Doctors still use them in hospitals today due to their reliable signal indoors.',
  },
  {
    id: 'r6',
    question: '🖨️ A machine that used individual ink keys or a typewheel to print text directly onto paper as you typed. What was it?',
    options: ['Dot matrix printer', 'Mimeograph', 'Typewriter', 'Linotype machine'],
    correct: 2,
    fact: 'The first commercial typewriter was sold in 1874. The QWERTY keyboard layout was designed to slow typists down and prevent mechanical jams!',
  },
  {
    id: 'r7',
    question: '📺 A heavy television set with a deep body, large curved glass screen, and an electron gun firing at phosphor dots. What type was it?',
    options: ['Plasma TV', 'OLED display', 'CRT television', 'LCD panel'],
    correct: 2,
    fact: 'CRT (Cathode Ray Tube) TVs dominated homes for 50+ years. A 32-inch CRT could weigh 50 kg — more than some people!',
  },
  {
    id: 'r8',
    question: '📷 A camera that used rolls of light-sensitive film. You had to take the roll to a shop to be chemically developed. What was it?',
    options: ['Polaroid camera', 'Film camera', 'Digicam', 'Disposable camera'],
    correct: 1,
    fact: 'Film cameras used rolls of 24 or 36 exposures. You couldn\'t see your photos until after development — so every shot had to count!',
  },
  {
    id: 'r9',
    question: '📸 A camera that ejected a small photo card immediately after taking a picture, which developed in front of your eyes. What was it?',
    options: ['Instant camera / Polaroid', 'Daguerreotype', 'Kodak Brownie', 'Pinhole camera'],
    correct: 0,
    fact: 'Edwin Land invented the Polaroid instant camera in 1948 after his daughter asked why she couldn\'t see a photo right away. Her question changed photography forever.',
  },
  {
    id: 'r10',
    question: '☎️ A metal or glass booth on the street with a coin-operated telephone inside, used for public calls. What was it?',
    options: ['Telegraph office', 'Pay phone / Phone box', 'Operator exchange', 'Radio telephone'],
    correct: 1,
    fact: 'Red phone boxes are iconic British symbols designed in 1924. Superman\'s changing-room trope only works because phone boxes existed — and most had no doors!',
  },
]

// ─── QUESTIONS MAP ────────────────────────────────────────────────────────────
export const STATIC_QUESTIONS = {
  science: scienceQuestions,
  tech: techQuestions,
  history: historyQuestions,
  brands: brandsQuestions,
  emoji: emojiQuestions,
  landmarks: landmarksQuestions,
  dishes: dishesQuestions,
  cars: carsQuestions,
  retro: retroQuestions,
}
