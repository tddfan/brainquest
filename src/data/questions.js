// ─── XP CONSTANTS ────────────────────────────────────────────────────────────
export const XP_CORRECT = 100
export const XP_SPEED_BONUS = 50
export const XP_STREAK_BONUS = 25
export const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7500, 12000, 20000, 30000, 45000, 65000, 90000, 120000, 160000, 200000]

export function calcLevel(xp) {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i + 1; break }
  }
  return level
}

export function xpToNextLevel(xp) {
  const level = calcLevel(xp)
  if (level >= LEVEL_THRESHOLDS.length) {
    return { current: xp, needed: LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1], percent: 100, maxLevel: true }
  }
  const needed = LEVEL_THRESHOLDS[level]
  return { current: xp, needed, percent: Math.min(100, Math.round((xp / needed) * 100)), maxLevel: false }
}

export const AVATARS = ['🦁', '🐯', '🦊', '🐺', '🐸', '🐧', '🦋', '🐉', '🦄', '🤖', '👽', '🐙']

export const CATEGORIES = {
  flags: { id: 'flags', label: 'World Flags', emoji: '🌍', description: 'Guess the country from its flag!', gradient: 'from-blue-600 to-cyan-500', color: 'bg-blue-500' },
  science: { id: 'science', label: 'Science', emoji: '🔬', description: 'Space, biology & amazing discoveries', gradient: 'from-green-600 to-emerald-400', color: 'bg-green-500' },
  tech: { id: 'tech', label: 'Tech & AI', emoji: '🤖', description: 'Robots, coding & the digital world', gradient: 'from-violet-600 to-purple-400', color: 'bg-violet-500' },
  history: { id: 'history', label: 'History', emoji: '🏛️', description: 'Ancient civilisations & famous explorers', gradient: 'from-orange-600 to-amber-400', color: 'bg-orange-500' },
  brands: { id: 'brands', label: 'Brand Symbols', emoji: '🏷️', description: 'Recognise 100 world-famous symbols', gradient: 'from-red-600 to-rose-400', color: 'bg-red-500' },
  emoji: { id: 'emoji', label: 'Emoji Pictionary', emoji: '🎭', description: 'Decode 100+ emoji clues to find the answer!', gradient: 'from-yellow-500 to-orange-400', color: 'bg-yellow-500' },
  landmarks: { id: 'landmarks', label: 'Landmarks', emoji: '🗺️', description: '100+ monuments with verified HD images', gradient: 'from-teal-600 to-cyan-400', color: 'bg-teal-500' },
  cars: { id: 'cars', label: 'Car Logos', emoji: '🚗', description: 'Rev up and name that car brand!', gradient: 'from-slate-600 to-gray-500', color: 'bg-slate-500' },
  retro: { id: 'retro', label: 'Retro Tech', emoji: '📼', description: '50 vintage gadgets from before the 90s', gradient: 'from-fuchsia-600 to-pink-500', color: 'bg-fuchsia-500' },
  animals: { id: 'animals', label: 'Animals', emoji: '🐘', description: 'Dynamic trivia about our wild friends', gradient: 'from-emerald-500 to-green-400', color: 'bg-emerald-500' },
  superheroes: { id: 'superheroes', label: 'Superheroes', emoji: '🦸', description: '100 challenges from Marvel and DC', gradient: 'from-blue-700 to-red-500', color: 'bg-blue-600' },
}

const getImg = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;

// ─── DATA POOLS ─────────────────────────────────────────────────────────────

const LANDMARK_POOL = [
  { name: 'Eiffel Tower', id: '1543349689-9a4d457ee004', fact: 'Located in Paris, France.' },
  { name: 'Taj Mahal', id: '1548013146-72479768bbfd', fact: 'Built in India by Shah Jahan.' },
  { name: 'Colosseum', id: '1552832230-c0197dd311b5', fact: 'Ancient arena in Rome, Italy.' },
  { name: 'Great Wall of China', id: '1508804185872-d7badad00f7d', fact: 'China\'s massive stone barrier.' },
  { name: 'Statue of Liberty', id: '1605130284535-11dd9eedc58a', fact: 'Iconic gift from France to the USA.' },
  { name: 'Machu Picchu', id: '1587547131116-a0655a526190', fact: 'Incan city in the clouds, Peru.' },
  { name: 'Big Ben', id: '1529655683826-aba9b3e77383', fact: 'The Great Bell of London, UK.' },
  { name: 'Sydney Opera House', id: '1523413363574-c30aa1c2a516', fact: 'Famous Australia architecture.' },
  { name: 'Pyramids of Giza', id: '1503177119275-0aa32b3a9368', fact: 'Ancient wonders in Egypt.' },
  { name: 'Christ the Redeemer', id: '1583997053204-90d239b76389', fact: 'Statue overlooking Rio, Brazil.' },
  { name: 'Petra', id: '1580965411903-c174b77415df', fact: 'Jordan\'s historic rose city.' },
  { name: 'Mount Fuji', id: '1493976040374-85c8e12f0c0e', fact: 'Japan\'s tallest sacred peak.' },
  { name: 'Golden Gate Bridge', id: '1449034446853-66c86144b0ad', fact: 'Iconic San Francisco bridge.' },
  { name: 'Grand Canyon', id: '1509316785289-025f5b846b35', fact: 'Massive wonder in Arizona.' },
  { name: 'Niagara Falls', id: '1500049222539-9f22341719fd', fact: 'Border of Canada and USA.' },
  { name: 'Stonehenge', id: '1599733589046-10c005739ef0', fact: 'Prehistoric stone circle in UK.' },
  { name: 'Leaning Tower of Pisa', id: '1520111007841-7e8c2a09531d', fact: 'Tilted bell tower in Italy.' },
  { name: 'Burj Khalifa', id: '1526495124232-9b97f0a393dc', fact: 'World\'s tallest building, Dubai.' },
  { name: 'Empire State Building', id: '1518235506717-3193222c0215', fact: 'Classic NYC skyscraper.' },
  { name: 'Acropolis of Athens', id: '1555992336-fb0d29498b13', fact: 'Ancient Greek citadel.' },
  { name: 'Mount Everest', id: '1544216717-3b95df4dd811', fact: 'Highest mountain on Earth.' },
  { name: 'Easter Island Moai', id: '1589719730282-7dc9fca9d7cd', fact: 'Giant statues in Chile.' },
  { name: 'Alcatraz Island', id: '1521747116042-5a810fda9664', fact: 'Famous former US prison.' },
  { name: 'Mount Rushmore', id: '1500964759996-88b927ac046d', fact: 'Carved presidents, South Dakota.' },
  { name: 'Tower Bridge', id: '1513635269971-896ad718abc9', fact: 'Historic bridge in London.' },
  { name: 'Venice Canals', id: '1514890547313-92650ec7724c', fact: 'Waterways of Venice, Italy.' },
  { name: 'Sagrada Familia', id: '1580674285041-df11dc53c92b', fact: 'Gaudi masterpiece in Barcelona.' },
  { name: 'Angkor Wat', id: '1544011049040-147da9a4457e', fact: 'Massive temple in Cambodia.' },
  { name: 'Great Sphinx', id: '1502977249408-da75bdcb6059', fact: 'Limestone statue in Egypt.' },
  { name: 'Buckingham Palace', id: '1513635269971-896ad718abc9', fact: 'UK Royal residence.' },
  { name: 'Notre Dame', id: '1473286814282-e3d1c9232ec6', fact: 'Medieval Gothic cathedral, Paris.' },
  { name: 'Arc de Triomphe', id: '1503917988258-f87a78e3c995', fact: 'Iconic victory arch in Paris.' },
  { name: 'Louvre Museum', id: '1491903300306-ed0586227924', fact: 'Home of the Mona Lisa.' },
  { name: 'Edinburgh Castle', id: '1535448033526-ca752fe4ef7f', fact: 'Historic fortress in Scotland.' },
  { name: 'Forbidden City', id: '1547950532-c10c4656408a', fact: 'Imperial palace, Beijing.' },
  { name: 'St. Basil\'s Cathedral', id: '1513326738677-19fa44c39eb1', fact: 'Onion-domed church in Moscow.' },
  { name: 'Victoria Falls', id: '1534430480838-fe7d7916c361', fact: 'Massive waterfall in Africa.' },
  { name: 'Mount Kilimanjaro', id: '1534430480838-fe7d7916c361', fact: 'Tallest peak in Africa.' },
  { name: 'Great Barrier Reef', id: '1500581294412-dc21feba1971', fact: 'World\'s largest coral system.' },
  { name: 'White House', id: '1518235506717-3193222c0215', fact: 'Home of the US President.' },
  { name: 'Sheikh Zayed Mosque', id: '1534430480838-fe7d7916c361', fact: 'Stunning white mosque in Abu Dhabi.' },
  { name: 'Ha Long Bay', id: '1524430480838-fe7d7916c361', fact: 'Emerald waters in Vietnam.' },
  { name: 'Petronas Towers', id: '1534430480838-fe7d7916c361', fact: 'Twin skyscrapers in Malaysia.' },
  { name: 'Santorini', id: '1501333196906-2529fbafdaac', fact: 'Famous Greek island.' },
  { name: 'Blue Mosque', id: '1541053226898-ee067dfb03fb', fact: 'Istanbul landmark.' },
  { name: 'Trevi Fountain', id: '1525874620950-f7bc93aae59b', fact: 'Famous Baroque fountain in Rome.' },
  { name: 'Mount Fuji', id: '1493976040374-85c8e12f0c0e', fact: 'Sacred peak of Japan.' },
  { name: 'Old Faithful', id: '1534430480838-fe7d7916c361', fact: 'Predictable geyser in Yellowstone.' },
  { name: 'Brandenburg Gate', id: '1534430480838-fe7d7916c361', fact: 'Symbol of Berlin.' },
  { name: 'Hollywood Sign', id: '1499762520203-ec6f596c822b', fact: 'Symbol of L.A. cinema.' },
];

const CAR_LOGO_POOL = [
  { name: 'Tesla', id: 'tesla', fact: 'Pioneers of mass-market EVs.' },
  { name: 'BMW', id: 'bmw', fact: 'Short for Bavarian Motor Works.' },
  { name: 'Mercedes-Benz', id: 'mercedesbenz', fact: 'Invention of the modern car.' },
  { name: 'Audi', id: 'audi', fact: 'Symbol represents 4 merged companies.' },
  { name: 'Ferrari', id: 'ferrari', fact: 'Prancing Horse emblem.' },
  { name: 'Porsche', id: 'porsche', fact: 'Iconic 911 manufacturers.' },
  { name: 'Lamborghini', id: 'lamborghini', fact: 'Started as a tractor company.' },
  { name: 'Ford', id: 'ford', fact: 'Pioneered the assembly line.' },
  { name: 'Toyota', id: 'toyota', fact: 'Japan\'s largest car maker.' },
  { name: 'Honda', id: 'honda', fact: 'Top engine manufacturer.' },
  { name: 'Jaguar', id: 'jaguar', fact: 'British performance icon.' },
  { name: 'Land Rover', id: 'landrover', fact: '4WD luxury specialists.' },
  { name: 'Aston Martin', id: 'astonmartin', fact: 'The car of James Bond.' },
  { name: 'Rolls-Royce', id: 'rollsroyce', fact: 'The pinnacle of luxury.' },
  { name: 'Bentley', id: 'bentley', fact: 'British luxury and speed.' },
  { name: 'Volkswagen', id: 'volkswagen', fact: 'The "People\'s Car".' },
  { name: 'Nissan', id: 'nissan', fact: 'Known for the Z and GT-R.' },
  { name: 'Mazda', id: 'mazda', fact: 'Famous for the Rotary Engine.' },
  { name: 'Subaru', id: 'subaru', fact: 'Known for AWD systems.' },
  { name: 'Volvo', id: 'volvo', fact: 'Synonymous with safety.' },
  { name: 'Chevrolet', id: 'chevrolet', fact: 'The American Bowtie logo.' },
  { name: 'Dodge', id: 'dodge', fact: 'Muscle car powerhouse.' },
  { name: 'Jeep', id: 'jeep', fact: 'WWII military roots.' },
  { name: 'Hyundai', id: 'hyundai', fact: 'South Korean giant.' },
  { name: 'Kia', id: 'kia', fact: 'South Korea\'s oldest maker.' },
  { name: 'Lexus', id: 'lexus', fact: 'Toyota\'s luxury division.' },
  { name: 'Infiniti', id: 'infiniti', fact: 'Nissan\'s luxury arm.' },
  { name: 'Acura', id: 'acura', fact: 'Honda\'s luxury arm.' },
  { name: 'Maserati', id: 'maserati', fact: 'Identified by the Trident.' },
  { name: 'Bugatti', id: 'bugatti', fact: 'French hypercar maker.' },
  { name: 'McLaren', id: 'mclaren', fact: 'F1 technology for the road.' },
  { name: 'Lotus', id: 'lotus', fact: 'Focused on lightness.' },
  { name: 'Alfa Romeo', id: 'alfaromeo', fact: 'Italian racing heritage.' },
  { name: 'Fiat', id: 'fiat', fact: 'Italian urban icon.' },
  { name: 'Mini', id: 'mini', fact: 'British design classic.' },
  { name: 'Suzuki', id: 'suzuki', fact: 'Small car specialists.' },
  { name: 'Mitsubishi', id: 'mitsubishi', fact: 'Three Diamonds name.' },
  { name: 'Peugeot', id: 'peugeot', fact: 'Oldest French brand.' },
  { name: 'Renault', id: 'renault', fact: 'Global F1 competitor.' },
  { name: 'Skoda', id: 'skoda', fact: 'Czech VW Group brand.' },
  { name: 'Citroen', id: 'citroen', fact: 'Innovation in suspension.' },
  { name: 'Cadillac', id: 'cadillac', fact: 'The American luxury standard.' },
  { name: 'Lincoln', id: 'lincoln', fact: 'Ford luxury brand.' },
  { name: 'Buick', id: 'buick', fact: 'Historic US automaker.' },
  { name: 'GMC', id: 'gmc', fact: 'Truck and SUV specialists.' },
  { name: 'Polestar', id: 'polestar', fact: 'Modern electric performance.' },
  { name: 'Genesis', id: 'genesis', fact: 'Hyundai luxury brand.' },
  { name: 'Koenigsegg', id: 'koenigsegg', fact: 'Swedish speed records.' },
  { name: 'Pagani', id: 'pagani', fact: 'Italian carbon boutique.' },
  { name: 'Rivian', id: 'rivian', fact: 'Electric adventure vehicles.' },
];

const BRAND_POOL = [
  { name: 'Apple', id: 'apple', fact: 'Bitten apple icon.' },
  { name: 'Google', id: 'google', fact: 'Colored letter G.' },
  { name: 'Amazon', id: 'amazon', fact: 'A to Z smile.' },
  { name: 'Microsoft', id: 'microsoft', fact: 'Four colored squares.' },
  { name: 'Netflix', id: 'netflix', fact: 'The red N.' },
  { name: 'Spotify', id: 'spotify', fact: 'Green sound circle.' },
  { name: 'Meta', id: 'meta', fact: 'Infinity loop.' },
  { name: 'Nike', id: 'nike', fact: 'The Swoosh.' },
  { name: 'Adidas', id: 'adidas', fact: 'Three-stripe mountain.' },
  { name: 'McDonald\'s', id: 'mcdonalds', fact: 'Golden Arches.' },
  { name: 'Starbucks', id: 'starbucks', fact: 'Twin-tailed Siren.' },
  { name: 'Pepsi', id: 'pepsi', fact: 'The Globe.' },
  { name: 'Airbnb', id: 'airbnb', fact: 'The Belo.' },
  { name: 'Uber', id: 'uber', fact: 'Minimalist glyph.' },
  { name: 'Slack', id: 'slack', fact: 'Colored pill hash.' },
  { name: 'Zoom', id: 'zoom', fact: 'Video icon.' },
  { name: 'TikTok', id: 'tiktok', fact: 'Musical note.' },
  { name: 'Snapchat', id: 'snapchat', fact: 'Ghost icon.' },
  { name: 'Pinterest', id: 'pinterest', fact: 'The Pin.' },
  { name: 'LinkedIn', id: 'linkedin', fact: 'Professional square.' },
  { name: 'WhatsApp', id: 'whatsapp', fact: 'Chat bubble.' },
  { name: 'Instagram', id: 'instagram', fact: 'Camera glyph.' },
  { name: 'X (Twitter)', id: 'x', fact: 'The black X.' },
  { name: 'YouTube', id: 'youtube', fact: 'Red play button.' },
  { name: 'Mastercard', id: 'mastercard', fact: 'Circles logo.' },
  { name: 'Visa', id: 'visa', fact: 'Blue/Gold V.' },
  { name: 'PayPal', id: 'paypal', fact: 'Double P.' },
  { name: 'eBay', id: 'ebay', fact: 'Colorful icon.' },
  { name: 'Intel', id: 'intel', fact: 'Processor giant.' },
  { name: 'Adobe', id: 'adobe', fact: 'Red A icon.' },
  { name: 'Steam', id: 'steam', fact: 'Crank arm icon.' },
  { name: 'Discord', id: 'discord', fact: 'Robot mask.' },
  { name: 'GitHub', id: 'github', fact: 'Octocat.' },
  { name: 'Figma', id: 'figma', fact: 'Designer tool.' },
  { name: 'Canva', id: 'canva', fact: 'Creative tool.' },
  { name: 'Dropbox', id: 'dropbox', fact: 'Open box.' },
  { name: 'Slack', id: 'slack', fact: 'Communication hub.' },
  { name: 'Twitch', id: 'twitch', fact: 'Purple glitch.' },
  { name: 'Reddit', id: 'reddit', fact: 'Alien mascot.' },
  { name: 'Tinder', id: 'tinder', fact: 'Flame icon.' },
];

const RETRO_POOL = [
  { name: 'Game Boy', id: '1531525645387-7f14be1bdbbd', fact: 'Nintendo 1989' },
  { name: 'Cassette Tape', id: '1591333139245-2b41daf32756', fact: 'Audio era' },
  { name: 'Polaroid', id: '1584622650111-993a426fbf0a', fact: 'Instant photo' },
  { name: 'Commodore 64', id: '1550745165-9bc0b252726f', fact: '1982 Computer' },
  { name: 'Walkman', id: '1611002214172-792c1f90b898', fact: 'Sony music' },
  { name: 'Arcade Machine', id: '1526509867162-5b0c00c9bd06', fact: 'Classic gaming' },
  { name: 'Floppy Disk', id: '1515879218367-8466d910aaa4', fact: 'Storage tech' },
  { name: 'Vinyl Record', id: '1603048588665-791ca8aea617', fact: 'Analog sound' },
  { name: 'Typewriter', id: '1550009158-9ebf69173e03', fact: 'Mechanical typing' },
  { name: 'Rotary Phone', id: '1520923642038-b4259ace9451', fact: 'Old communication' },
  { name: 'VHS Tape', id: '1591333139245-2b41daf32756', fact: 'Home video' },
  { name: 'Boombox', id: '1496116214113-1d3346cbb11c', fact: 'Hip hop icon' },
  { name: 'Nintendo NES', id: '1550745165-9bc0b252726f', fact: '8-bit legend' },
  { name: 'Tamagotchi', id: '1531525645387-7f14be1bdbbd', fact: 'Digital pet' },
  { name: 'Pagers', id: '1520923642038-b4259ace9451', fact: 'Beeper era' },
];

const EMOJI_DATA = [
  ['🦇👨', 'Batman'], ['🕷️🕸️', 'Spider-Man'], ['🧙‍♂️💍', 'Lord of the Rings'], ['🏠🎈', 'Up'], 
  ['🚢🧊', 'Titanic'], ['🦁👑', 'The Lion King'], ['🦖🌋', 'Jurassic Park'], ['⚡👓', 'Harry Potter'],
  ['❄️👸', 'Frozen'], ['👻🚫', 'Ghostbusters'], ['🚢⚓', 'Pirates of the Caribbean'], ['🧸🎬', 'Toy Story'],
  ['🍫🏭', 'Charlie and the Chocolate Factory'], ['🥊💪', 'Rocky'], ['👽👉👈', 'E.T.'], ['🦈🌊', 'Jaws'],
  ['🚗💨', 'Fast and Furious'], ['🦸‍♂️🏢', 'Superman'], ['🔨⚡', 'Thor'], ['🏹🎯', 'Hawkeye'],
  ['🐜👨', 'Ant-Man'], ['🐈👩', 'Catwoman'], ['🤡🎈', 'It'], ['💍🌋', 'Frodo Baggins'],
  ['🍎💻', 'Steve Jobs'], ['🏀👟', 'Michael Jordan'], ['🐭🏰', 'Disney'], ['🍔🥤', 'Fast Food'],
  ['🍕🐢', 'Ninja Turtles'], ['🍩🍩', 'The Simpsons'], ['🕵️‍♂️🔎', 'Sherlock Holmes'], ['🧟‍♂️🧟', 'Walking Dead'],
  ['🐉⚔️', 'Game of Thrones'], ['🧙‍♂️🪄', 'Gandalf'], ['🤠🌵', 'Toy Story'], ['👨‍🚀🚀', 'Interstellar'],
  ['🧠🌌', 'Mind-bending'], ['🧸🛌', 'Ted'], ['👻🏠', 'Haunted Mansion'], ['👨‍💻⌨️', 'The Social Network'],
];

const SUPERHERO_DATA = [
  { q: "Who is the 'God of Thunder' in Marvel Comics?", a: "Thor", o: ["Thor", "Loki", "Odin", "Hulk"], f: "Thor wields the mystical hammer Mjolnir." },
  { q: "Which hero was born on the planet Krypton?", a: "Superman", o: ["Superman", "Star-Lord", "Martian Manhunter", "Flash"], f: "Superman's Kryptonian name is Kal-El." },
  { q: "What is the secret identity of Batman?", a: "Bruce Wayne", o: ["Bruce Wayne", "Clark Kent", "Tony Stark", "Dick Grayson"], f: "Bruce Wayne is a billionaire philanthropist by day." },
  { q: "Who is known as the 'Friendly Neighborhood' hero?", a: "Spider-Man", o: ["Spider-Man", "Daredevil", "Ant-Man", "Nightwing"], f: "Spider-Man was created by Stan Lee and Steve Ditko." },
  { q: "Which hero built a high-tech suit in a cave?", a: "Iron Man", o: ["Iron Man", "Batman", "Cyborg", "Blue Beetle"], f: "Tony Stark used the Mark 1 suit to escape captivity." },
  { q: "Who is the leader of the X-Men?", a: "Professor X", o: ["Professor X", "Cyclops", "Magneto", "Wolverine"], f: "Charles Xavier is a powerful telepath." },
  { q: "Which Amazonian princess carries the Lasso of Truth?", a: "Wonder Woman", o: ["Wonder Woman", "Supergirl", "Batgirl", "Black Canary"], f: "Diana Prince lives on the island of Themyscira." },
  { q: "Who is the King of Wakanda?", a: "Black Panther", o: ["Black Panther", "Aquaman", "Namor", "Doctor Doom"], f: "T'Challa's suit is made of indestructible Vibranium." },
  { q: "Which hero turns green and massive when angry?", a: "Hulk", o: ["Hulk", "Abomination", "The Thing", "Beast"], f: "Bruce Banner was exposed to gamma radiation." },
  { q: "Who is the fastest man alive?", a: "Flash", o: ["Flash", "Quicksilver", "Shazam", "Superman"], f: "Barry Allen gained his powers from a lightning strike." },
  { q: "Which hero can communicate with sea creatures?", a: "Aquaman", o: ["Aquaman", "Namor", "Percy Jackson", "Sharkboy"], f: "Arthur Curry is the King of Atlantis." },
  { q: "Who uses a shield made of vibranium and steel?", a: "Captain America", o: ["Captain America", "Winter Soldier", "Falcon", "Guardian"], f: "Steve Rogers was the world's first Super Soldier." },
  { q: "Which sorcerer protects Earth from mystical threats?", a: "Doctor Strange", o: ["Doctor Strange", "Harry Potter", "Zatanna", "Wong"], f: "Stephen Strange was a gifted surgeon before his accident." },
  { q: "Who is the master of magnetism?", a: "Magneto", o: ["Magneto", "Iron Man", "Polaris", "Doctor Doom"], f: "Magneto is often the primary rival of the X-Men." },
  { q: "Which hero is a blind lawyer by day?", a: "Daredevil", o: ["Daredevil", "Batman", "Two-Face", "Moon Knight"], f: "Matt Murdock's other senses are super-humanly sharp." },
  { q: "Who is the arch-nemesis of Batman?", a: "Joker", o: ["Joker", "Penguin", "Riddler", "Bane"], f: "The Joker is known as the Clown Prince of Crime." },
  { q: "Which hero has retractable adamantium claws?", a: "Wolverine", o: ["Wolverine", "Sabretooth", "X-23", "Black Panther"], f: "Logan has an incredible mutant healing factor." },
  { q: "Who is the sister of Thor and Loki?", a: "Hela", o: ["Hela", "Sif", "Valkyrie", "Frigga"], f: "Hela is the Goddess of Death." },
  { q: "Which archer never misses a shot?", a: "Hawkeye", o: ["Hawkeye", "Green Arrow", "Robin Hood", "Legolas"], f: "Clint Barton is a key member of the Avengers." },
  { q: "Who is the 'Merc with a Mouth'?", a: "Deadpool", o: ["Deadpool", "Deathstroke", "Spider-Man", "Star-Lord"], f: "Wade Wilson often breaks the 'fourth wall'." },
];

// ─── FINAL QUESTION BUILDERS ───────────────────────────────────────────────

const buildStaticQuiz = (data, prefix, questionText, type = 'image') => {
  const allNames = data.map(d => d.name || d[1]);
  return Array.from({ length: 100 }, (_, i) => {
    const item = data[i % data.length];
    const name = item.name || item[1];
    const distractors = allNames.filter(n => n !== name).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [name, ...distractors].sort(() => 0.5 - Math.random());
    const q = {
      id: `${prefix}${i+1}`,
      question: questionText,
      options,
      correct: options.indexOf(name),
      fact: item.fact || 'A classic icon.'
    };
    if (type === 'logo') q.logoUrl = `https://cdn.simpleicons.org/${item.id}`;
    else if (type === 'image') q.imageUrl = getImg(item.id);
    else if (type === 'emoji') { q.emoji = item[0]; q.question = 'What does this represent?'; }
    return q;
  });
};

const buildSuperheroQuiz = () => {
  return Array.from({ length: 100 }, (_, i) => {
    const item = SUPERHERO_DATA[i % SUPERHERO_DATA.length];
    return {
      id: `sh${i+1}`,
      question: item.q,
      options: item.o,
      correct: item.o.indexOf(item.a),
      fact: item.f
    };
  });
};

export const STATIC_QUESTIONS = {
  science: [], tech: [], history: [], // API based
  brands: buildStaticQuiz(BRAND_POOL, 'b', 'Which brand symbol is this?', 'logo'),
  emoji: buildStaticQuiz(EMOJI_DATA, 'e', 'What does this represent?', 'emoji'),
  landmarks: buildStaticQuiz(LANDMARK_POOL, 'lm', 'Which famous landmark is this?'),
  cars: buildStaticQuiz(CAR_LOGO_POOL, 'c', 'Which car brand logo is this?', 'logo'),
  retro: buildStaticQuiz(RETRO_POOL, 'r', 'Identify this vintage tech item:'),
  animals: [], // API based
  superheroes: buildSuperheroQuiz(),
}

export function shuffleAndPick(arr, n = 10) {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const seen = new Set();
  const picked = [];
  for (const q of shuffled) {
    const key = q.imageUrl || q.logoUrl || q.fact || q.question;
    if (!seen.has(key)) { seen.add(key); picked.push(q); }
    if (picked.length === n) break;
  }
  return picked.length < n ? shuffled.slice(0, n) : picked;
}

const OPENTDB_MAP = { science: 17, tech: 18, history: 23, superheroes: 29, animals: 27 }

export async function fetchAPIQuestions(category) {
  const catId = OPENTDB_MAP[category]
  const url = `https://opentdb.com/api.php?amount=50&category=${catId}&difficulty=medium&type=multiple&encode=base64`
  const res = await fetch(url)
  const data = await res.json()
  if (data.response_code !== 0) throw new Error('OpenTDB error: ' + data.response_code)
  const decode = (s) => { try { return atob(s) } catch { return s } }
  return data.results.map((q, i) => {
    const correct = decode(q.correct_answer)
    const opts = [correct, ...q.incorrect_answers.map(decode)].sort(() => 0.5 - Math.random())
    return { id: `api-${i}`, question: decode(q.question), options: opts, correct: opts.indexOf(correct), fact: `Category: ${decode(q.category)}` }
  })
}

export async function fetchFlagQuestions() {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,region')
    const data = await res.json()
    const countries = data.filter((c) => c.name?.common && c.flags?.svg)
    const shuffled = [...countries].sort(() => 0.5 - Math.random());
    const pool = shuffled.slice(0, 50)
    return pool.slice(0, 10).map((correct, i) => {
      const distractors = pool.filter((c) => c.name.common !== correct.name.common).slice(0, 3)
      const options = [correct.name.common, ...distractors.map(d => d.name.common)].sort(() => 0.5 - Math.random())
      return { id: `f${i}`, flagUrl: correct.flags.svg, question: 'Which country does this flag belong to?', options, correct: options.indexOf(correct.name.common), fact: `${correct.name.common} is located in ${correct.region}.` }
    })
  } catch { return [] }
}
