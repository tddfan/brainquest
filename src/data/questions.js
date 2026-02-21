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
  brands: { id: 'brands', label: 'Brand Logos', emoji: '🏷️', description: 'Recognise the world\'s most iconic brands', gradient: 'from-red-600 to-rose-400', color: 'bg-red-500' },
  emoji: { id: 'emoji', label: 'Emoji Pictionary', emoji: '🎭', description: 'Decode emoji clues to find the answer!', gradient: 'from-yellow-500 to-orange-400', color: 'bg-yellow-500' },
  landmarks: { id: 'landmarks', label: 'Landmarks', emoji: '🗺️', description: 'Spot famous monuments & travel spots', gradient: 'from-teal-600 to-cyan-400', color: 'bg-teal-500' },
  dishes: { id: 'dishes', label: 'World Dishes', emoji: '🍜', description: 'Taste-test your food knowledge!', gradient: 'from-pink-600 to-rose-400', color: 'bg-pink-500' },
  cars: { id: 'cars', label: 'Car Logos', emoji: '🚗', description: 'Rev up and name that car brand!', gradient: 'from-slate-600 to-gray-500', color: 'bg-slate-500' },
  retro: { id: 'retro', label: 'Before the 90s', emoji: '📼', description: 'Retro tech and 80s nostalgia', gradient: 'from-fuchsia-600 to-pink-500', color: 'bg-fuchsia-500' },
  animals: { id: 'animals', label: 'Animals', emoji: '🐘', description: 'Amazing facts about our wild friends', gradient: 'from-emerald-500 to-green-400', color: 'bg-emerald-500' },
  superheroes: { id: 'superheroes', label: 'Superheroes', emoji: '🦸', description: 'Test your comic book knowledge', gradient: 'from-blue-700 to-red-500', color: 'bg-blue-600' },
}

const getImg = (id) => id.startsWith('http') ? id : `https://images.unsplash.com/photo-${id}?w=600&q=80`;

const LANDMARK_DATA = [
  ['Eiffel Tower', '1511739001486-6bfe10ce785f', 'Located in Paris, France.'],
  ['Taj Mahal', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg', 'A marble mausoleum in Agra, India.'],
  ['Colosseum', '1552832230-c0197dd311b5', 'Ancient arena in Rome, Italy.'],
  ['Great Wall of China', '1508804185872-d7badad00f7d', 'Vast stone barrier in China.'],
  ['Statue of Liberty', '1605130284535-11dd9eedc58a', 'Gift from France to the USA.'],
  ['Machu Picchu', '1587547131116-a0655a526190', 'Incan city in the clouds, Peru.'],
  ['Big Ben', '1529655683826-aba9b3e77383', 'The Great Bell of London, UK.'],
  ['Sydney Opera House', '1523413363574-c30aa1c2a516', 'Famous Australia architecture.'],
  ['Pyramids of Giza', '1503177119275-0aa32b3a9368', 'Ancient wonders in Egypt.'],
  ['Christ the Redeemer', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/800px-Christ_the_Redeemer_-_Cristo_Redentor.jpg', 'Statue overlooking Rio, Brazil.'],
  ['Golden Gate Bridge', '1449034446853-66c86144b0ad', 'Iconic bridge in San Francisco.'],
  ['Mount Fuji', '1493976040374-85c8e12f0c0e', 'Japan\'s tallest and sacred peak.'],
  ['Buckingham Palace', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Buckingham_Palace_London_Morning_2020_01_%28cropped%29.jpg/800px-Buckingham_Palace_London_Morning_2020_01_%28cropped%29.jpg', 'Official London residence of the King.'],
  ['Stonehenge', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/800px-Stonehenge2007_07_30.jpg', 'Prehistoric stone circle in UK.'],
  ['Leaning Tower of Pisa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Italy_-_Pisa_-_Leaning_Tower.jpg/800px-Italy_-_Pisa_-_Leaning_Tower.jpg', 'Italy\'s famous tilted bell tower.'],
  ['Burj Khalifa', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/800px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg', 'World\'s tallest building in Dubai.'],
  ['Notre-Dame', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Notre-Dame_de_Paris%2C_4_October_2017.jpg/800px-Notre-Dame_de_Paris%2C_4_October_2017.jpg', 'Medieval cathedral in Paris.'],
  ['Grand Canyon', '1509316785289-025f5b846b35', 'Massive natural wonder in Arizona.'],
  ['Niagara Falls', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/800px-3Falls_Niagara.jpg', 'Powerful water border, Canada/USA.'],
  ['Petra', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Al_Deir_Petra.JPG/800px-Al_Deir_Petra.JPG', 'Rose City carved in Jordan.'],
  ['Sagrada Familia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg/800px-%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg', 'Gaudi\'s masterpiece in Barcelona, Spain.'],
  ['Hagia Sophia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hagia_Sophia_%28228968325%29.jpeg/800px-Hagia_Sophia_%28228968325%29.jpeg', 'Ancient cathedral-turned-mosque in Istanbul.'],
  ['Angkor Wat', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg/800px-Buddhist_monks_in_front_of_the_Angkor_Wat.jpg', 'Khmer temple complex in Cambodia.'],
  ['Alhambra', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/800px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg', 'Moorish palace in Granada, Spain.'],
  ['Parthenon', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/800px-The_Parthenon_in_Athens.jpg', 'Ancient Greek temple in Athens.'],
  ['Chichen Itza', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/800px-Chichen_Itza_3.jpg', 'Maya pyramid in Mexico.'],
  ['Trevi Fountain', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Trevi_Fountain_-_Roma.jpg/800px-Trevi_Fountain_-_Roma.jpg', 'World\'s largest Baroque fountain in Rome.'],
  ['St. Basil\'s Cathedral', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Saint_Basil%27s_Cathedral_in_Moscow.jpg/800px-Saint_Basil%27s_Cathedral_in_Moscow.jpg', 'Colourful onion-domed cathedral in Moscow.'],
  ['Tower Bridge', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/800px-Tower_Bridge_at_Dawn.jpg', 'Victorian bascule bridge in London.'],
  ['CN Tower', 'https://upload.wikimedia.org/wikipedia/commons/9/95/Toronto_-_ON_-_CN_Tower.jpg', 'Canada\'s iconic communications tower in Toronto.'],
  ['The Louvre', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/800px-Louvre_Museum_Wikimedia_Commons.jpg', 'World\'s largest art museum in Paris.'],
  ['Marina Bay Sands', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/800px-Marina_Bay_Sands_%28I%29.jpg', 'Iconic hotel and casino complex in Singapore.'],
  ['Petronas Towers', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Petronas_Towers_at_Night_-_from_the_base_upwards.jpg', 'Twin skyscrapers in Kuala Lumpur, Malaysia.'],
  ['Arc de Triomphe', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Arc_de_Triomphe%2C_Paris_21_October_2010.jpg/800px-Arc_de_Triomphe%2C_Paris_21_October_2010.jpg', 'Napoleon\'s victory arch at the heart of Paris.'],
];

const DISH_DATA = [
  ['Pizza', '1513104890138-7c749659a591', 'Naples, Italy'],
  ['Sushi', '1579871494447-9811cf80d66c', 'Tokyo, Japan'],
  ['Ramen', '1546069901-ba9599a7e63c', 'Osaka, Japan'],
  ['Tacos', '1565299624946-b28f40a0ae38', 'Mexico City, Mexico'],
  ['Burger', '1568901346375-23c9450c58cd', 'Hamburg, Germany'],
  ['Croissants', '1555507036-ab1f4038808a', 'Paris, France'],
  ['Curry', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Taj_Mahal_-_Lamb_Curry_Madras.jpg/800px-Taj_Mahal_-_Lamb_Curry_Madras.jpg', 'Delhi, India'],
  ['Pasta', '1551183053-bf91a1d81141', 'Rome, Italy'],
  ['Dim Sum', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Dim_Sum_Trang.jpg/800px-Dim_Sum_Trang.jpg', 'Guangzhou, China'],
  ['Pad Thai', '1559339352-11d035aa65de', 'Bangkok, Thailand'],
  ['Paella', 'https://commons.wikimedia.org/wiki/Special:FilePath/01_Paella_Valenciana_original.jpg?width=800', 'Valencia, Spain'],
  ['Pho', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ph%E1%BB%9F_b%C3%B2_%2839425047901%29.jpg?width=800', 'Hanoi, Vietnam'],
  ['Fish and Chips', 'https://commons.wikimedia.org/wiki/Special:FilePath/Fish_and_chips_blackpool.jpg?width=800', 'London, UK'],
  ['Falafel', 'https://commons.wikimedia.org/wiki/Special:FilePath/Falafels_2.jpg?width=800', 'Middle East'],
  ['Kimchi', 'https://commons.wikimedia.org/wiki/Special:FilePath/Various_kimchi.jpg?width=800', 'Seoul, South Korea'],
  ['Biryani', 'https://commons.wikimedia.org/wiki/Special:FilePath/%22Hyderabadi_Dum_Biryani%22.jpg?width=800', 'Hyderabad, India'],
  ['Baklava', 'https://commons.wikimedia.org/wiki/Special:FilePath/Baklava%281%29.png?width=800', 'Istanbul, Turkey'],
  ['Crepes', 'https://commons.wikimedia.org/wiki/Special:FilePath/Crepes_dsc07085.jpg?width=800', 'Brittany, France'],
  ['Peking Duck', 'https://commons.wikimedia.org/wiki/Special:FilePath/Peking_Duck%2C_2014_%2802%29.jpg?width=800', 'Beijing, China'],
  ['Beef Rendang', 'https://commons.wikimedia.org/wiki/Special:FilePath/Rendang_daging_sapi_asli_Padang.JPG?width=800', 'Padang, Indonesia'],
  ['Jerk Chicken', 'https://commons.wikimedia.org/wiki/Special:FilePath/BBQJerk_Chicken.jpg?width=800', 'Jamaica'],
  ['Moussaka', 'https://commons.wikimedia.org/wiki/Special:FilePath/MussakasMeMelitsanesKePatates01.JPG?width=800', 'Athens, Greece'],
  ['Churros', 'https://commons.wikimedia.org/wiki/Special:FilePath/Chocolate_con_churros_%2827343655726%29.jpg?width=800', 'Madrid, Spain'],
  ['Sashimi', 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Sashimi_-_Auckland%2C_New_Zealand.jpg', 'Japan'],
];

const RETRO_DATA = [
  ['Game Boy', '1531525645387-7f14be1bdbbd', 'Nintendo\'s 1989 handheld.'],
  ['Cassette Tape', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Compactcassette.jpg/800px-Compactcassette.jpg', 'Music before CDs dominated.'],
  ['Polaroid', '1584622650111-993a426fbf0a', 'Instant photo gratification.'],
  ['Commodore 64', '1550745165-9bc0b252726f', '1982 home computer classic.'],
  ['Walkman', 'https://upload.wikimedia.org/wikipedia/commons/9/94/Walkman_TPS-L2.jpg', 'Portable music by Sony.'],
  ['Arcade Machine', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Daikeien_amusement_arcade_2018-05-10.jpg/800px-Daikeien_amusement_arcade_2018-05-10.jpg', 'PAC-MAN\'s original home.'],
  ['Floppy Disk', '1515879218367-8466d910aaa4', 'Storing 1.44MB was huge.'],
  ['Vinyl Record', '1603048588665-791ca8aea617', 'Warm analog sound era.'],
  ['Typewriter', '1550009158-9ebf69173e03', 'Word processing before PCs.'],
  ['Rotary Phone', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Rotarydial.JPG/800px-Rotarydial.JPG', 'Finger-dialling era.'],
  ['NES Console', 'https://commons.wikimedia.org/wiki/Special:FilePath/NES-Console-Set.png?width=800', 'Nintendo\'s 8-bit home console from 1983.'],
  ['VHS Tape', 'https://upload.wikimedia.org/wikipedia/commons/5/5e/VHS-Kassette.jpg', 'Home video recording before DVDs.'],
  ['Answering Machine', 'https://commons.wikimedia.org/wiki/Special:FilePath/Panasonic-Anrufbeantworter.jpg?width=800', 'Voicemail before smartphones.'],
  ['8-Track Player', 'https://upload.wikimedia.org/wikipedia/commons/e/e3/8track_inside.JPG', 'Car audio standard of the 1970s.'],
  ['ZX Spectrum', 'https://commons.wikimedia.org/wiki/Special:FilePath/ZXSpectrum48k.jpg?width=800', 'Sinclair\'s iconic 1982 home computer.'],
  ['Commodore Amiga', 'https://commons.wikimedia.org/wiki/Special:FilePath/Amiga500_system.jpg?width=800', 'Multimedia powerhouse of the late 80s.'],
  ['Atari 2600', 'https://commons.wikimedia.org/wiki/Special:FilePath/Atari-2600-Wood-4Sw-Set.png?width=800', 'The console that launched home gaming.'],
  ['Tamagotchi', 'https://commons.wikimedia.org/wiki/Special:FilePath/Tamagotchi_0124_ubt.jpeg?width=800', 'Japan\'s virtual pet craze of 1996.'],
  ['Pocket Calculator', 'https://commons.wikimedia.org/wiki/Special:FilePath/Casio_calculator_JS-20WK_in_201901_002.jpg?width=800', 'Before smartphones did the maths.'],
  ['Pager', 'https://commons.wikimedia.org/wiki/Special:FilePath/Swissphone_RES.Q_Hybrid_with_GSM_and_GPS_module.jpg?width=800', 'One-way wireless messaging device.'],
];

const generatePool = (data, prefix, questionText, factPrefix) => {
  const allNames = data.map(d => d[0]);
  return data.map((item, i) => {
    const distractors = allNames.filter(n => n !== item[0]).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [item[0], ...distractors].sort(() => 0.5 - Math.random());
    return {
      id: `${prefix}${i+1}`,
      imageUrl: getImg(item[1]),
      question: questionText,
      options,
      correct: options.indexOf(item[0]),
      fact: `${factPrefix} ${item[2]}.`
    };
  });
};

const generateEmojiPool = () => {
  const data = [
    ['🦇👨', 'Batman', 'Protector of Gotham City.'],
    ['🕷️🕸️', 'Spider-Man', 'Peter Parker\'s alter ego.'],
    ['🧙‍♂️💍', 'Lord of the Rings', 'Epic quest for the One Ring.'],
    ['🏠🎈', 'Up', 'A flying house reaches Paradise Falls.'],
    ['🚢🧊', 'Titanic', 'Unsinkable ship met an iceberg.'],
    ['🦁👑', 'The Lion King', 'Simba\'s rise to become king.'],
    ['🦖🌋', 'Jurassic Park', 'Dinosaurs brought back to life.'],
    ['⚡👓', 'Harry Potter', 'The Boy Who Lived.'],
    ['❄️👸', 'Frozen', 'Let it go!'],
    ['👻🚫', 'Ghostbusters', 'Don\'t cross the streams.'],
    ['🌊🐠', 'Finding Nemo', 'A clownfish searches the ocean for his son.'],
    ['🚀⭐', 'Star Wars', 'A long time ago in a galaxy far, far away...'],
    ['🤖💻', 'The Matrix', 'Red pill or blue pill?'],
    ['🍎💀', 'Snow White', 'Bitten by a poisoned apple.'],
    ['🌹👹', 'Beauty and the Beast', 'A rose and an enchanted castle.'],
    ['🧞🪔', 'Aladdin', 'Three wishes from a magical lamp.'],
    ['🐢🥋', 'Ninja Turtles', 'Pizza-loving heroes in a half shell.'],
    ['🐝🍯', 'Bee Movie', 'A bee takes humans to court.'],
    ['🏄🦈', 'Jaws', 'You\'re gonna need a bigger boat.'],
    ['🎩🐰', 'Alice in Wonderland', 'Follow the white rabbit down the hole.'],
    ['⚔️🐲', 'Game of Thrones', 'Winter is coming.'],
    ['🐸🎸', 'The Muppets', 'It\'s not easy being green.'],
    ['🧟💀', 'The Walking Dead', 'Surviving the zombie apocalypse.'],
    ['🥊🏆', 'Rocky', 'Going the distance in Philadelphia.'],
    ['🧸🚀', 'Toy Story', 'To infinity and beyond!'],
    ['🐠🧠', 'Finding Dory', 'Just keep swimming.'],
    ['🌊🏝️', 'Moana', 'Chosen by the ocean to restore the heart.'],
    ['🐉🧒', 'How to Train Your Dragon', 'A Viking boy befriends a dragon.'],
    ['🤠🐍', 'Indiana Jones', 'Snakes... why did it have to be snakes?'],
    ['🎭🎪', 'The Greatest Showman', 'P.T. Barnum builds the greatest circus.'],
    ['🎵🌊', 'The Little Mermaid', 'Part of your world.'],
    ['🐻🎓', 'Paddington', 'A bear from Peru arrives in London.'],
    ['🕶️🌍', 'Men in Black', 'Protecting Earth from alien scum.'],
    ['🐧❄️', 'Happy Feet', 'A tap-dancing penguin in Antarctica.'],
    ['🤖❤️', 'WALL-E', 'A lonely robot cleaning up Earth.'],
    ['🌪️👠', 'The Wizard of Oz', 'There\'s no place like home.'],
    ['🎃👻', 'Halloween', 'Michael Myers stalks the suburbs.'],
    ['🐛🍃', 'The Very Hungry Caterpillar', 'A caterpillar eats through everything.'],
    ['🐘✈️', 'Dumbo', 'An elephant who can fly with his ears.'],
    ['🌺🌊', 'Lilo & Stitch', 'Ohana means family.'],
    ['👾🎮', 'Space Invaders', 'Classic arcade alien shooter.'],
    ['🧅🐉', 'Shrek', 'Ogres are like onions.'],
    ['🦁✨', 'The Chronicles of Narnia', 'Through the wardrobe to another world.'],
    ['🎸💀', 'Coco', 'A boy visits the Land of the Dead.'],
    ['🌙🧛', 'Twilight', 'A vampire falls for a human.'],
    ['🦸🌍', 'Superman', 'Faster than a speeding bullet.'],
    ['🔫🍸', 'James Bond', 'Shaken, not stirred.'],
    ['🎵🐯', 'The Jungle Book', 'Mowgli raised by wolves and hunted by a tiger.'],
    ['🧬💀', 'Frankenstein', 'A scientist creates a monster from body parts.'],
    ['🏢🔫', 'Die Hard', 'Yippee-ki-yay at the Nakatomi Plaza.'],
  ];
  const allAnswers = data.map(d => d[1]);
  return data.map((item, i) => {
    const distractors = allAnswers.filter(a => a !== item[1]).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [item[1], ...distractors].sort(() => 0.5 - Math.random());
    return {
      id: `e${i+1}`,
      emoji: item[0],
      question: 'What does this emoji represent?',
      options,
      correct: options.indexOf(item[1]),
      fact: item[2]
    };
  });
};

const generateAnimalPool = () => {
  const data = [
    ['Blue Whale', 'Largest animal on Earth?', 'Blue whales weigh as much as 33 elephants.'],
    ['Giraffe', 'Tallest land animal with the longest neck?', 'A giraffe\'s heart is two feet long to pump blood up its neck.'],
    ['Octopus', 'Sea creature with three hearts?', 'Octopuses also have blue blood and nine brains.'],
    ['Cheetah', 'Fastest land animal?', 'Cheetahs accelerate from 0 to 70 mph in just 3 seconds.'],
    ['Platypus', 'Mammal that lays eggs?', 'The platypus has a bill like a duck and a tail like a beaver.'],
    ['Elephant', 'Largest land animal?', 'Elephants are the only animals that cannot jump.'],
    ['Hummingbird', 'Smallest bird in the world?', 'Hummingbirds are the only birds that can fly backwards.'],
    ['Great White Shark', 'Most powerful ocean predator?', 'Great white sharks can detect one drop of blood per million litres of water.'],
    ['Monarch Butterfly', 'Insect that migrates up to 4,000 km?', 'Monarch butterflies use the sun as a compass during their annual migration.'],
    ['Emperor Penguin', 'Tallest and heaviest penguin species?', 'Emperor penguins can dive 500 metres deep and hold their breath for 20 minutes.'],
    ['Dolphin', 'Marine mammal that uses echolocation?', 'Dolphins sleep with one eye open to watch for predators.'],
    ['Kangaroo', 'Marsupial that carries young in a pouch?', 'A kangaroo can jump over 9 metres in a single bound.'],
    ['Chameleon', 'Lizard that changes colour?', 'Chameleons change colour to express emotions, not just for camouflage.'],
    ['Bat', 'Only mammal capable of true sustained flight?', 'Some bat species can live for over 30 years — remarkable for their size.'],
    ['Sea Horse', 'Animal where the male gives birth?', 'Male sea horses carry fertilised eggs in a special brood pouch.'],
    ['Polar Bear', 'Largest land carnivore?', 'Polar bear fur is transparent and hollow, not actually white.'],
    ['Bald Eagle', 'National bird of the USA?', 'Bald eagles can spot prey from over 3 km away.'],
    ['Jellyfish', 'Sea creature with no brain or heart?', 'Some jellyfish species are considered biologically immortal.'],
    ['Gorilla', 'Largest living primate?', 'Gorillas share 98.3% of their DNA with humans.'],
    ['Flamingo', 'Pink bird that stands on one leg?', 'Flamingos are born grey; their diet of algae and shrimp makes them pink.'],
    ['Peacock', 'Bird with the most colourful tail feathers?', 'Only male peacocks display tail feathers; females are called peahens.'],
    ['Crocodile', 'Reptile virtually unchanged for 200 million years?', 'Crocodiles cannot stick out their tongue.'],
    ['Axolotl', 'Salamander that can regenerate limbs?', 'Axolotls can regrow their heart, eyes, and parts of their brain.'],
    ['Sloth', 'Slowest mammal?', 'Sloths move so slowly that algae grows in their fur.'],
    ['Narwhal', 'Whale with a spiral tusk?', 'The narwhal\'s "horn" is actually a tooth that grows through its upper lip.'],
    ['Electric Eel', 'Fish that generates electricity?', 'Electric eels can produce up to 860 volts of electricity.'],
    ['Komodo Dragon', 'World\'s largest living lizard?', 'Komodo dragons can detect prey from 9 km away using their forked tongue.'],
    ['Pangolin', 'Only scaled mammal?', 'Pangolin scales are made of keratin, the same material as human fingernails.'],
    ['Wandering Albatross', 'Seabird with the longest wingspan?', 'Wandering albatrosses have wingspans of up to 3.5 metres.'],
    ['Koala', 'Marsupial with human-like fingerprints?', 'Koala fingerprints are nearly identical to human fingerprints.'],
    ['Camel', 'Desert mammal that stores fat in its humps?', 'Camel humps store fat as an energy reserve, not water.'],
    ['Puffer Fish', 'Fish that inflates as a defence mechanism?', 'Puffer fish contain enough toxin to kill 30 adult humans.'],
    ['Arctic Fox', 'Fox that changes coat colour seasonally?', 'Arctic foxes are white in winter and brown or grey in summer.'],
    ['Dragonfly', 'Fastest flying insect?', 'Dragonflies catch 95% of the prey they pursue, the highest success rate of any predator.'],
    ['Mantis Shrimp', 'Animal with the most complex eyes?', 'Mantis shrimp have 16 types of colour receptor; humans have only 3.'],
    ['Tardigrade', 'Microscopic animal that survives in outer space?', 'Tardigrades withstand extreme radiation, pressure, and the vacuum of space.'],
    ['Giant Squid', 'Animal with the largest eyes in the world?', 'Giant squid eyes can be as large as a basketball — 30 cm across.'],
    ['Honeybee', 'Insect that pollinates 80% of flowering plants?', 'A honeybee visits around 2,000 flowers to produce just one tablespoon of honey.'],
    ['Snow Leopard', 'Big cat native to the Himalayas?', 'Snow leopards cannot roar; they make a soft sound called a prusten.'],
    ['Tiger', 'Largest wild cat?', 'Tigers are the only big cats with striped fur; no two have the same pattern.'],
  ];
  return data.map((item, i) => {
    const distractors = data.filter(d => d[0] !== item[0]).map(d => d[0]).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [item[0], ...distractors].sort(() => 0.5 - Math.random());
    return {
      id: `an${i+1}`,
      question: item[1],
      options,
      correct: options.indexOf(item[0]),
      fact: item[2]
    };
  });
};

const generateBrandPool = () => {
  const brands = [
    ['apple', 'Apple'], ['google', 'Google'], ['amazon', 'Amazon'], ['microsoft', 'Microsoft'],
    ['meta', 'Meta'], ['netflix', 'Netflix'], ['spotify', 'Spotify'], ['tesla', 'Tesla'],
    ['adidas', 'Adidas'], ['nike', 'Nike'], ['youtube', 'YouTube'], ['instagram', 'Instagram'],
    ['twitter', 'Twitter'], ['facebook', 'Facebook'], ['linkedin', 'LinkedIn'],
    ['whatsapp', 'WhatsApp'], ['snapchat', 'Snapchat'], ['tiktok', 'TikTok'],
    ['reddit', 'Reddit'], ['discord', 'Discord'], ['twitch', 'Twitch'],
    ['pinterest', 'Pinterest'], ['telegram', 'Telegram'], ['uber', 'Uber'],
    ['airbnb', 'Airbnb'], ['paypal', 'PayPal'], ['shopify', 'Shopify'],
    ['stripe', 'Stripe'], ['dropbox', 'Dropbox'], ['zoom', 'Zoom'],
    ['slack', 'Slack'], ['adobe', 'Adobe'], ['samsung', 'Samsung'],
    ['dell', 'Dell'], ['hp', 'HP'], ['intel', 'Intel'], ['nvidia', 'NVIDIA'],
    ['amd', 'AMD'], ['cocacola', 'Coca-Cola'], ['pepsi', 'Pepsi'],
    ['mcdonalds', "McDonald's"], ['starbucks', 'Starbucks'], ['ikea', 'IKEA'],
    ['oracle', 'Oracle'], ['ibm', 'IBM'], ['visa', 'Visa'],
    ['mastercard', 'Mastercard'], ['github', 'GitHub'], ['linux', 'Linux'],
    ['wordpress', 'WordPress'],
  ];
  const allNames = brands.map(b => b[1]);
  return brands.map(([slug, name], i) => {
    const distractors = allNames.filter(n => n !== name).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [name, ...distractors].sort(() => 0.5 - Math.random());
    return {
      id: `b${i+1}`,
      logoUrl: `https://cdn.jsdelivr.net/npm/simple-icons/icons/${slug}.svg`,
      question: 'Which company logo is this?',
      options,
      correct: options.indexOf(name),
      fact: 'A major global brand.'
    };
  });
};

const generateCarPool = () => {
  const cars = [
    ['toyota', 'Toyota'], ['bmw', 'BMW'], ['mercedes', 'Mercedes-Benz'],
    ['honda', 'Honda'], ['ford', 'Ford'], ['volkswagen', 'Volkswagen'],
    ['ferrari', 'Ferrari'], ['porsche', 'Porsche'], ['audi', 'Audi'],
    ['hyundai', 'Hyundai'], ['kia', 'Kia'], ['nissan', 'Nissan'],
    ['subaru', 'Subaru'], ['volvo', 'Volvo'], ['renault', 'Renault'],
    ['lamborghini', 'Lamborghini'], ['jeep', 'Jeep'], ['mitsubishi', 'Mitsubishi'],
    ['chevrolet', 'Chevrolet'], ['fiat', 'Fiat'],
  ];
  const allNames = cars.map(c => c[1]);
  return cars.map(([slug, name], i) => {
    const distractors = allNames.filter(n => n !== name).sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [name, ...distractors].sort(() => 0.5 - Math.random());
    return {
      id: `car${i+1}`,
      logoUrl: `https://cdn.jsdelivr.net/npm/simple-icons/icons/${slug}.svg`,
      question: 'Which car brand logo is this?',
      options,
      correct: options.indexOf(name),
      fact: 'A world-famous automobile manufacturer.'
    };
  });
};

const SUPERHERO_QUESTIONS = [
  // ── Marvel ──────────────────────────────────────────────────────────────────
  { q: 'What is Spider-Man\'s real name?', o: ['Peter Parker', 'Miles Morales', 'Bruce Banner', 'Tony Stark'], c: 0, f: 'Peter Parker was bitten by a radioactive spider in high school.' },
  { q: 'What is Batman\'s real name?', o: ['Bruce Wayne', 'Clark Kent', 'Barry Allen', 'Hal Jordan'], c: 0, f: 'Bruce Wayne witnessed his parents\' murder as a child, motivating him to fight crime.' },
  { q: 'What planet is Superman from?', o: ['Mars', 'Krypton', 'Vulcan', 'Oa'], c: 1, f: 'Krypton exploded, and baby Kal-El was sent to Earth in a rocket.' },
  { q: 'Which superhero wields the hammer Mjolnir?', o: ['Hercules', 'Thor', 'Captain America', 'Vision'], c: 1, f: 'Thor, the Asgardian God of Thunder, is the primary wielder of Mjolnir.' },
  { q: 'What is the name of Black Panther\'s kingdom?', o: ['Sokovia', 'Genosha', 'Wakanda', 'Kahndaq'], c: 2, f: 'Wakanda is the world\'s only source of vibranium, the strongest metal on Earth.' },
  { q: 'Which hero is known as the Fastest Man Alive?', o: ['Quicksilver', 'The Flash', 'Shazam', 'Nightcrawler'], c: 1, f: 'Barry Allen, The Flash, can travel faster than the speed of light.' },
  { q: 'What organisation does Nick Fury lead?', o: ['HYDRA', 'A.I.M.', 'S.H.I.E.L.D.', 'The Hand'], c: 2, f: 'S.H.I.E.L.D. stands for Strategic Homeland Intervention, Enforcement and Logistics Division.' },
  { q: 'Wolverine\'s skeleton is coated in which fictional metal?', o: ['Vibranium', 'Adamantium', 'Promethium', 'Nth Metal'], c: 1, f: 'Adamantium was forcibly bonded to Wolverine\'s skeleton by the Weapon X programme.' },
  { q: 'What colour is the Hulk?', o: ['Red', 'Blue', 'Green', 'Grey'], c: 2, f: 'The Hulk is green — the result of gamma radiation transforming Bruce Banner.' },
  { q: 'Which villain is Spider-Man\'s most iconic enemy?', o: ['Venom', 'Doctor Octopus', 'Green Goblin', 'Thanos'], c: 2, f: 'Norman Osborn, the Green Goblin, is widely considered Spider-Man\'s greatest foe.' },
  { q: 'Captain America\'s shield is made of which rare material?', o: ['Titanium', 'Adamantium', 'Vibranium', 'Steel'], c: 2, f: 'Cap\'s shield is made of vibranium, mined exclusively in Wakanda.' },
  { q: 'What is Deadpool\'s real name?', o: ['Wade Wilson', 'Ryan Reynolds', 'Jack Murdock', 'Victor Creed'], c: 0, f: 'Wade Wilson gained a healing factor after an experimental cancer treatment went wrong.' },
  { q: 'Which Infinity Stone controls time?', o: ['Space Stone', 'Mind Stone', 'Reality Stone', 'Time Stone'], c: 3, f: 'The Time Stone, housed in the Eye of Agamotto, was wielded by Doctor Strange.' },
  { q: 'Black Widow\'s real first name is?', o: ['Yelena', 'Natasha', 'Sonja', 'Olga'], c: 1, f: 'Natasha Romanoff was trained in the Red Room, the Soviet spy programme.' },
  { q: 'Which hero protects Hell\'s Kitchen as a blind lawyer by day?', o: ['Punisher', 'Moon Knight', 'Daredevil', 'Hawkeye'], c: 2, f: 'Matt Murdock lost his sight in a chemical accident but gained heightened senses.' },
  { q: 'Aquaman rules which underwater kingdom?', o: ['Lemuria', 'Atlantis', 'Hy-Brasil', 'Latveria'], c: 1, f: 'Arthur Curry is the King of Atlantis and can communicate with sea life.' },
  { q: 'What is Wonder Woman\'s homeland called?', o: ['Atlantis', 'Asgard', 'Themyscira', 'Wakanda'], c: 2, f: 'Themyscira is the hidden island home of the Amazons.' },
  { q: 'Doctor Strange is the Sorcerer Supreme of which Marvel universe?', o: ['Earth-616', 'Earth-199999', 'Earth-1610', 'Earth-838'], c: 0, f: 'Earth-616 is the primary Marvel comics universe where Strange holds his title.' },
  { q: 'Which Avenger can shrink to insect size?', o: ['Wasp only', 'Ant-Man only', 'Both Ant-Man and Wasp', 'Black Widow'], c: 2, f: 'Both Scott Lang (Ant-Man) and Hope Van Dyne (Wasp) use Pym Particles to shrink.' },
  { q: 'Wolverine\'s real first name is?', o: ['Logan', 'James', 'Victor', 'Scott'], c: 1, f: 'James Howlett, known as Logan, was born in 19th-century Canada.' },
  { q: 'What is Iron Man\'s real name?', o: ['Steve Rogers', 'Tony Stark', 'James Rhodes', 'Pepper Potts'], c: 1, f: 'Tony Stark, genius billionaire inventor, built the first Iron Man suit in a cave.' },
  { q: 'Who leads the X-Men at Xavier\'s School?', o: ['Cyclops', 'Professor Charles Xavier', 'Storm', 'Wolverine'], c: 1, f: 'Professor X is a powerful telepath who founded the X-Men to promote human-mutant harmony.' },
  { q: 'What is the name of Thor\'s home realm?', o: ['Valhalla', 'Midgard', 'Asgard', 'Jotunheim'], c: 2, f: 'Asgard is one of the Nine Realms in Norse mythology and Marvel comics.' },
  { q: 'Which villain collects the Infinity Stones to wipe out half of all life?', o: ['Ultron', 'Loki', 'Thanos', 'Darkseid'], c: 2, f: 'Thanos, the Mad Titan, believed halving all life would solve the universe\'s resource problem.' },
  { q: 'Loki is the god of what?', o: ['Thunder', 'War', 'Mischief', 'Fire'], c: 2, f: 'Loki, Thor\'s adoptive brother, is the Asgardian God of Mischief.' },
  { q: 'What does the S in S.H.I.E.L.D. stand for?', o: ['Special', 'Strategic', 'Super', 'Secret'], c: 1, f: 'S.H.I.E.L.D. stands for Strategic Homeland Intervention, Enforcement and Logistics Division.' },
  { q: 'Who is the alter ego of the Scarlet Witch?', o: ['Janet Van Dyne', 'Wanda Maximoff', 'Jean Grey', 'Carol Danvers'], c: 1, f: 'Wanda Maximoff can manipulate reality using chaos magic.' },
  { q: 'Which mutant can control the weather?', o: ['Rogue', 'Jean Grey', 'Storm', 'Mystique'], c: 2, f: 'Ororo Munroe, known as Storm, can control all forms of weather.' },
  { q: 'Star-Lord is the leader of which Marvel team?', o: ['The Avengers', 'The Defenders', 'Guardians of the Galaxy', 'Alpha Flight'], c: 2, f: 'Peter Quill / Star-Lord formed the Guardians of the Galaxy to protect the cosmos.' },
  { q: 'What is Groot\'s only spoken line?', o: ['"I am Groot"', '"We are Groot"', '"Groot!"', 'All of the above'], c: 0, f: 'Groot only ever says "I am Groot," but the meaning changes each time.' },
  { q: 'Vision\'s forehead gem is which Infinity Stone?', o: ['Power Stone', 'Soul Stone', 'Mind Stone', 'Space Stone'], c: 2, f: 'The Mind Stone, originally in Loki\'s sceptre, was embedded in Vision\'s forehead.' },
  { q: 'Which hero is the last son of Krypton?', o: ['Superboy', 'Superman', 'Martian Manhunter', 'Captain Marvel'], c: 1, f: 'Clark Kent / Kal-El is the last survivor of the destroyed planet Krypton.' },
  { q: 'Green Lantern\'s ring is powered by what?', o: ['Solar energy', 'Willpower', 'Fear', 'Emotion'], c: 1, f: 'The Green Lantern ring channels the user\'s willpower to create hard-light constructs.' },
  { q: 'Which X-Man can read and control minds?', o: ['Cyclops', 'Beast', 'Professor X', 'Colossus'], c: 2, f: 'Professor Xavier is an Omega-level telepath and one of the most powerful mutants alive.' },
  { q: 'What is the Batmobile\'s home city?', o: ['Metropolis', 'Star City', 'Gotham City', 'Central City'], c: 2, f: 'Gotham City is Batman\'s dark, crime-ridden home, inspired by New York City at night.' },
  { q: 'Hawkeye\'s real name is?', o: ['Clint Barton', 'Scott Summers', 'Sam Wilson', 'Bucky Barnes'], c: 0, f: 'Clint Barton is a master archer and the only Avenger with no superhuman powers.' },
  { q: 'Which villain is Magneto\'s main power?', o: ['Telepathy', 'Magnetism', 'Time travel', 'Super strength'], c: 1, f: 'Magneto can generate and manipulate magnetic fields, controlling all forms of metal.' },
  { q: 'The Fantastic Four gained powers after exposure to what?', o: ['Gamma rays', 'Cosmic rays', 'Solar radiation', 'Mutant X gene'], c: 1, f: 'Reed Richards and his crew were hit by cosmic rays during an unauthorised space flight.' },
  { q: 'Mr. Fantastic\'s real name is?', o: ['Ben Grimm', 'Johnny Storm', 'Reed Richards', 'Victor Von Doom'], c: 2, f: 'Reed Richards is a genius scientist who can stretch his body into any shape.' },
  { q: 'The Thing\'s catchphrase is?', o: ['"Flame on!"', '"It\'s clobberin\' time!"', '"Excelsior!"', '"With great power..."'], c: 1, f: 'Ben Grimm\'s "It\'s clobberin\' time!" is one of Marvel\'s most iconic battle cries.' },
  { q: 'Which DC hero is also known as the Emerald Archer?', o: ['Green Lantern', 'Hawkeye', 'Green Arrow', 'Robin Hood'], c: 2, f: 'Oliver Queen, the Green Arrow, is a billionaire archer who fights crime in Star City.' },
  { q: 'Cyclops fires beams from his eyes. What type of energy?', o: ['Laser', 'Optic blast', 'Solar energy', 'Gamma radiation'], c: 1, f: 'Cyclops fires optic blasts — concussive force beams, not heat lasers — from his eyes.' },
  { q: 'What is the name of Batman\'s loyal butler?', o: ['James Gordon', 'Alfred Pennyworth', 'Lucius Fox', 'Dick Grayson'], c: 1, f: 'Alfred Pennyworth has served the Wayne family for decades and is Bruce\'s closest confidant.' },
  { q: 'Which hero is half-human, half-Celestial?', o: ['Thor', 'Star-Lord', 'Gamora', 'Nebula'], c: 1, f: 'Peter Quill\'s father Ego is a Celestial, a god-like cosmic being.' },
  { q: 'Gamora is the adopted daughter of which villain?', o: ['Ronan', 'Thanos', 'Korath', 'The Collector'], c: 1, f: 'Thanos adopted Gamora as a child and trained her to be the most dangerous woman in the galaxy.' },
  { q: 'What is the name of Tony Stark\'s AI assistant?', o: ['HAL 9000', 'Friday', 'Jarvis', 'Vision'], c: 2, f: 'J.A.R.V.I.S. (Just A Rather Very Intelligent System) later evolved into the android Vision.' },
  { q: 'The Punisher\'s real name is?', o: ['Matt Murdock', 'Frank Castle', 'Luke Cage', 'Danny Rand'], c: 1, f: 'Frank Castle became the Punisher after his family was killed by organised crime.' },
  { q: 'Which Infinity Stone is orange and represents souls?', o: ['Power Stone', 'Reality Stone', 'Soul Stone', 'Mind Stone'], c: 2, f: 'The Soul Stone, hidden on Vormir, requires the sacrifice of a loved one to obtain.' },
  { q: 'Venom is a symbiote bonded to which journalist?', o: ['J. Jonah Jameson', 'Eddie Brock', 'Robbie Robertson', 'Ben Urich'], c: 1, f: 'Eddie Brock and the alien symbiote merged to create Venom, one of Spider-Man\'s deadliest foes.' },
  { q: 'Who is the Black Panther\'s sister and tech genius?', o: ['Nakia', 'Okoye', 'Shuri', 'Ayo'], c: 2, f: 'Shuri runs Wakanda\'s advanced technology division and has even taken on the Black Panther mantle.' },
  { q: 'Which hero goes by "the Man Without Fear"?', o: ['Iron Fist', 'Moon Knight', 'Daredevil', 'Punisher'], c: 2, f: 'Daredevil\'s fearlessness in the face of danger earned him the title "the Man Without Fear".' },
  { q: 'What is the name of Superman\'s home city?', o: ['Gotham', 'Star City', 'Central City', 'Metropolis'], c: 3, f: 'Superman protects Metropolis, a shining city inspired by New York and Toronto.' },
  { q: 'Doctor Doom is the ruler of which fictional country?', o: ['Symkaria', 'Latveria', 'Madripoor', 'Sokovia'], c: 1, f: 'Victor Von Doom rules Latveria with an iron fist while also being one of Marvel\'s greatest villains.' },
  { q: 'Which hero was the first Avenger?', o: ['Iron Man', 'Thor', 'Captain America', 'Nick Fury'], c: 2, f: 'Steve Rogers, Captain America, was dubbed "the First Avenger" due to his WWII service.' },
  { q: 'Moon Knight\'s alter ego is?', o: ['Marc Spector', 'Jake Lockley', 'Steven Grant', 'All three'], c: 3, f: 'Moon Knight has multiple personalities: Marc Spector, Steven Grant, and Jake Lockley.' },
  { q: 'Which DC villain is Batman\'s most popular enemy?', o: ['Two-Face', 'The Penguin', 'The Joker', 'Bane'], c: 2, f: 'The Joker, the Clown Prince of Crime, is Batman\'s most enduring and iconic nemesis.' },
  { q: 'She-Hulk\'s real name is?', o: ['Betty Ross', 'Jennifer Walters', 'Lyra', 'Monica Rambeau'], c: 1, f: 'Jennifer Walters, Bruce Banner\'s cousin, became She-Hulk after an emergency blood transfusion.' },
  { q: 'What city does Green Arrow protect?', o: ['Gotham City', 'Metropolis', 'Star City', 'Central City'], c: 2, f: 'Oliver Queen fights crime in Star City (also called Seattle in some continuities).' },
  { q: 'Which hero is the result of the Super-Soldier Serum?', o: ['War Machine', 'Falcon', 'Captain America', 'Nick Fury'], c: 2, f: 'The Super-Soldier Serum transformed Steve Rogers from a frail young man into Captain America.' },
  { q: 'Shazam transforms by shouting what word?', o: ['Excelsior', 'Shazam', 'Kazam', 'Marvel'], c: 1, f: 'Shouting "Shazam!" transforms Billy Batson into an adult superhero with the powers of six gods.' },
  { q: 'Which hero carries a mystical green power ring?', o: ['The Flash', 'Green Arrow', 'Green Lantern', 'Martian Manhunter'], c: 2, f: 'Hal Jordan was the first human to be selected by the Green Lantern Corps.' },
  { q: 'War Machine is the armoured alias of which character?', o: ['Nick Fury', 'James Rhodes', 'Sam Wilson', 'T\'Challa'], c: 1, f: 'James "Rhodey" Rhodes, Tony Stark\'s best friend, pilots the War Machine armour.' },
  { q: 'Which X-Man can pass through solid walls?', o: ['Rogue', 'Shadowcat', 'Jubilee', 'Gambit'], c: 1, f: 'Kitty Pryde / Shadowcat can phase her atoms through solid matter.' },
  { q: 'Rogue\'s mutant power is?', o: ['Flight', 'Absorbing others\' powers by touch', 'Telepathy', 'Super strength'], c: 1, f: 'Rogue absorbs the memories, powers, and life force of anyone she touches skin-to-skin.' },
  { q: 'Hawkeye\'s main weapon is?', o: ['A sword', 'A bow and arrows', 'A gun', 'Throwing knives'], c: 1, f: 'Clint Barton is a world-class archer who rarely misses his target.' },
  { q: 'The Silver Surfer\'s board is made of?', o: ['Vibranium', 'Adamantium', 'Cosmic energy', 'The same material as his body'], c: 3, f: 'Both the Silver Surfer and his board are composed of the same unknown cosmic metal.' },
  { q: 'Which Avenger is a master of the mystic arts?', o: ['Thor', 'Scarlet Witch', 'Doctor Strange', 'Vision'], c: 2, f: 'Stephen Strange became the Sorcerer Supreme after a car accident ended his surgical career.' },
  { q: 'What is the Flash\'s power source called?', o: ['The Quantum Field', 'The Speed Force', 'Cosmic energy', 'Dark matter'], c: 1, f: 'The Speed Force is a mysterious extra-dimensional energy that grants speed to speedsters.' },
  { q: 'Nightwing is the adult alias of which former Robin?', o: ['Jason Todd', 'Tim Drake', 'Dick Grayson', 'Damian Wayne'], c: 2, f: 'Dick Grayson, the original Robin, became Nightwing to step out of Batman\'s shadow.' },
  { q: 'Which hero\'s alter ego is billionaire Oliver Queen?', o: ['Batman', 'Green Lantern', 'Green Arrow', 'Booster Gold'], c: 2, f: 'Oliver Queen uses his wealth to fund his vigilante career as the Green Arrow.' },
  { q: 'Galactus is known as the Devourer of?', o: ['Souls', 'Worlds', 'Heroes', 'Stars'], c: 1, f: 'Galactus is a cosmic entity who sustains himself by consuming the energy of entire planets.' },
  { q: 'Which villain broke Batman\'s back?', o: ['The Joker', 'Ra\'s al Ghul', 'Bane', 'Scarecrow'], c: 2, f: 'In the "Knightfall" arc, Bane broke Bruce Wayne\'s back to prove his superiority.' },
  { q: 'Which Guardian of the Galaxy is a talking raccoon?', o: ['Drax', 'Rocket', 'Yondu', 'Mantis'], c: 1, f: 'Rocket Raccoon is a genetically engineered weapons expert and master tactician.' },
  { q: 'The Iron Fist hero is Danny Rand, trained in which mystical city?', o: ['Kun-Lun', 'Kamar-Taj', 'Nanda Parbat', 'Attilan'], c: 0, f: 'K\'un-Lun is a mystical city that appears on Earth intermittently, where Danny Rand trained.' },
  { q: 'Luke Cage\'s superpower is?', o: ['Super speed', 'Flight', 'Steel-hard skin and super strength', 'Telepathy'], c: 2, f: 'A prison experiment gave Luke Cage unbreakable skin and incredible strength.' },
  { q: 'Which DC hero is also called the Dark Knight?', o: ['Superman', 'Green Lantern', 'Batman', 'Nightwing'], c: 2, f: 'Batman earned the nickname "the Dark Knight" for his brooding, shadowy vigilante style.' },
  { q: 'What is Lex Luthor\'s main power in defeating Superman?', o: ['Magic', 'Kryptonite', 'A red sun lamp', 'His intellect'], c: 3, f: 'Lex Luthor relies on his genius-level intellect, resources, and Kryptonite to fight Superman.' },
  { q: 'Harley Quinn was originally a psychiatrist at which asylum?', o: ['Blackgate Prison', 'Arkham Asylum', 'Belle Reve', 'Iron Heights'], c: 1, f: 'Dr. Harleen Quinzel fell in love with the Joker while treating him at Arkham Asylum.' },
  { q: 'Which Avenger is a god?', o: ['Captain America', 'Thor', 'Iron Man', 'Hulk'], c: 1, f: 'Thor Odinson is the Asgardian God of Thunder and a founding Avenger.' },
  { q: 'Gambit\'s mutant power is to charge objects with?', o: ['Electricity', 'Ice', 'Kinetic energy', 'Fire'], c: 2, f: 'Remy LeBeau / Gambit charges objects with kinetic energy, causing them to explode.' },
  { q: 'Which hero carries an enchanted lasso of truth?', o: ['Black Canary', 'Supergirl', 'Zatanna', 'Wonder Woman'], c: 3, f: 'Wonder Woman\'s Lasso of Hestia compels anyone bound by it to tell the truth.' },
  { q: 'Miles Morales is which hero in the Spider-Verse?', o: ['Spider-Man 2099', 'Spider-Man (Earth-1610)', 'Spider-Gwen', 'Scarlet Spider'], c: 1, f: 'Miles Morales became Spider-Man on Earth-1610 after being bitten by a radioactive spider.' },
  { q: 'Which Infinity Stone is purple and represents raw power?', o: ['Soul Stone', 'Reality Stone', 'Power Stone', 'Space Stone'], c: 2, f: 'The Power Stone, found on Xandar, holds the destructive power to destroy entire planets.' },
  { q: 'Cyborg\'s real name is?', o: ['Victor Stone', 'John Henry Irons', 'Ray Palmer', 'Ted Kord'], c: 0, f: 'Victor Stone was rebuilt with advanced technology after a near-fatal accident, becoming Cyborg.' },
  { q: 'Which mutant can control magnetism AND leads the Brotherhood?', o: ['Juggernaut', 'Mystique', 'Magneto', 'Apocalypse'], c: 2, f: 'Magneto leads the Brotherhood of Mutants in opposition to Xavier\'s dream of coexistence.' },
  { q: 'Falcon\'s real name is?', o: ['James Rhodes', 'Sam Wilson', 'Scott Lang', 'Clint Barton'], c: 1, f: 'Sam Wilson, a veteran and former pararescueman, eventually takes up the Captain America shield.' },
  { q: 'Ant-Man\'s mentor who created the Pym Particles is?', o: ['Tony Stark', 'Bruce Banner', 'Hank Pym', 'Reed Richards'], c: 2, f: 'Dr. Hank Pym discovered the subatomic particles that allow size manipulation.' },
  { q: 'Black Adam is the rival of which hero?', o: ['Green Lantern', 'The Flash', 'Shazam', 'Aquaman'], c: 2, f: 'Teth-Adam (Black Adam) wields the same Shazam powers but uses them as an anti-hero/villain.' },
  { q: 'Which DC villain uses fear-inducing toxins as Scarecrow?', o: ['Hugo Strange', 'Jonathan Crane', 'Edward Nygma', 'Oswald Cobblepot'], c: 1, f: 'Jonathan Crane, a psychologist obsessed with fear, became the Scarecrow.' },
  { q: 'Rocket Raccoon\'s closest friend among the Guardians is?', o: ['Star-Lord', 'Nebula', 'Groot', 'Drax'], c: 2, f: 'Rocket and Groot are inseparable partners — Groot\'s simple nature balances Rocket\'s sarcasm.' },
  { q: 'Which Avenger uses a bow but has no superpowers?', o: ['Black Widow', 'Hawkeye', 'Falcon', 'Ant-Man'], c: 1, f: 'Clint Barton / Hawkeye is a regular human whose extraordinary skill makes him an Avenger.' },
  { q: 'Which hero is the alter ego of Carol Danvers?', o: ['She-Hulk', 'Ms. Marvel', 'Captain Marvel', 'Wasp'], c: 2, f: 'Carol Danvers absorbed Kree energy to become Captain Marvel, one of Marvel\'s most powerful heroes.' },
  { q: 'The Joker\'s real origin is famously?', o: ['Tragic chemical accident', 'Government experiment', 'Unknown — left ambiguous', 'Childhood trauma'], c: 2, f: 'The Joker\'s true origin has deliberately been left ambiguous in most DC stories.' },
  { q: 'Which hero\'s superpower is the ability to shrink to subatomic size?', o: ['Ant-Man', 'The Atom', 'Both Ant-Man and The Atom', 'Pixie'], c: 2, f: 'Both Marvel\'s Ant-Man and DC\'s The Atom can shrink to subatomic size.' },
  { q: 'Drax the Destroyer\'s main goal is to kill which villain?', o: ['Thanos', 'Ronan', 'Ego', 'Korath'], c: 0, f: 'Drax\' entire life\'s purpose was revenge against Thanos, who killed his wife and daughter.' },
  { q: 'Which hero is Diana, princess of the Amazons?', o: ['Supergirl', 'Zatanna', 'Wonder Woman', 'Hawkgirl'], c: 2, f: 'Diana of Themyscira came to the world of men as an ambassador of peace — and a warrior.' },
  { q: 'What does Magneto\'s helmet protect him from?', o: ['Bullets', 'Professor X\'s telepathy', 'Radiation', 'Energy blasts'], c: 1, f: 'Magneto\'s distinctive helmet blocks Professor Xavier\'s powerful telepathic abilities.' },
  { q: 'Which superhero team includes Cyclops, Storm, Wolverine, and Jean Grey?', o: ['The Avengers', 'The Fantastic Four', 'X-Men', 'Alpha Flight'], c: 2, f: 'The X-Men are a team of mutants trained by Professor X to protect a world that hates them.' },
  { q: 'The Infinity Gauntlet holds how many Infinity Stones?', o: ['4', '5', '6', '7'], c: 2, f: 'The Infinity Gauntlet holds all six Infinity Stones: Mind, Soul, Space, Time, Reality, and Power.' },
  { q: 'Which hero can project hard-light constructs with a ring?', o: ['Iron Fist', 'Green Lantern', 'Doctor Strange', 'Captain Marvel'], c: 1, f: 'A Green Lantern\'s ring is limited only by the user\'s imagination and willpower.' },
  { q: 'Bucky Barnes, Captain America\'s old partner, becomes which hero?', o: ['U.S. Agent', 'The Punisher', 'Winter Soldier / Captain America', 'Nomad'], c: 2, f: 'Brainwashed by HYDRA, Bucky became the Winter Soldier before reclaiming his identity.' },
  { q: 'Which hero can regenerate from almost any injury?', o: ['The Hulk', 'Wolverine', 'Deadpool', 'All of the above'], c: 3, f: 'The Hulk, Wolverine, and Deadpool all have powerful healing factors, though Deadpool\'s is strongest.' },
];

const generateSuperheroPool = () =>
  SUPERHERO_QUESTIONS.map((item, i) => ({
    id: `sh${i+1}`,
    question: item.q,
    options: item.o,
    correct: item.c,
    fact: item.f,
  }));

export const STATIC_QUESTIONS = {
  science: [],
  tech: [],
  history: [],
  brands: generateBrandPool(),
  emoji: generateEmojiPool(),
  landmarks: generatePool(LANDMARK_DATA, 'lm', 'Which famous landmark is this?', 'Located in'),
  dishes: generatePool(DISH_DATA, 'd', 'Which world-famous dish is this?', 'Famous in'),
  cars: generateCarPool(),
  retro: generatePool(RETRO_DATA, 'r', 'Identify this iconic item from before the 90s:', 'Era:'),
  animals: generateAnimalPool(),
  superheroes: generateSuperheroPool(),
}

export function shuffleAndPick(arr, n = 10) {
  if (!arr || arr.length === 0) return [];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  const seen = new Set();
  const picked = [];
  for (const q of shuffled) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      picked.push(q);
    }
    if (picked.length === n) break;
  }
  return picked;
}

const OPENTDB_MAP = { science: 17, tech: 18, history: 23, superheroes: 29 }

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
      return { 
        id: `f${i}`, 
        flagUrl: correct.flags.svg, 
        question: 'Which country does this flag belong to?', 
        options, 
        correct: options.indexOf(correct.name.common), 
        fact: `${correct.name.common} is located in ${correct.region}.` 
      }
    })
  } catch {
    return []
  }
}
