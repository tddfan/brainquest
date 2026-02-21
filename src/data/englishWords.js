// ─── VOCABULARY POOL ─────────────────────────────────────────────────────────
export const WORDS = [
  // ── EASY (ages 6–10) ────────────────────────────────────────────────────────
  { word: 'Happy', level: 'easy', definition: 'Feeling pleasure or contentment', synonyms: ['Joyful', 'Cheerful', 'Pleased', 'Glad'], antonyms: ['Sad', 'Unhappy', 'Miserable', 'Gloomy'] },
  { word: 'Fast', level: 'easy', definition: 'Moving at high speed', synonyms: ['Quick', 'Rapid', 'Swift', 'Speedy'], antonyms: ['Slow', 'Sluggish', 'Leisurely', 'Gradual'] },
  { word: 'Big', level: 'easy', definition: 'Of considerable size', synonyms: ['Large', 'Huge', 'Giant', 'Enormous'], antonyms: ['Small', 'Tiny', 'Little', 'Miniature'] },
  { word: 'Hot', level: 'easy', definition: 'Having a high temperature', synonyms: ['Warm', 'Boiling', 'Burning', 'Scorching'], antonyms: ['Cold', 'Cool', 'Freezing', 'Icy'] },
  { word: 'Brave', level: 'easy', definition: 'Ready to face danger without fear', synonyms: ['Courageous', 'Bold', 'Daring', 'Fearless'], antonyms: ['Cowardly', 'Timid', 'Fearful', 'Scared'] },
  { word: 'Clean', level: 'easy', definition: 'Free from dirt or impurities', synonyms: ['Spotless', 'Pure', 'Tidy', 'Neat'], antonyms: ['Dirty', 'Filthy', 'Grimy', 'Muddy'] },
  { word: 'Bright', level: 'easy', definition: 'Giving out or filled with light', synonyms: ['Shining', 'Vivid', 'Brilliant', 'Radiant'], antonyms: ['Dark', 'Dim', 'Gloomy', 'Dull'] },
  { word: 'Kind', level: 'easy', definition: 'Friendly and generous', synonyms: ['Gentle', 'Caring', 'Warm', 'Generous'], antonyms: ['Mean', 'Cruel', 'Harsh', 'Unkind'] },
  { word: 'Noisy', level: 'easy', definition: 'Making a lot of noise', synonyms: ['Loud', 'Rowdy', 'Boisterous', 'Clamorous'], antonyms: ['Quiet', 'Silent', 'Calm', 'Peaceful'] },
  { word: 'Old', level: 'easy', definition: 'Having existed for a long time', synonyms: ['Ancient', 'Aged', 'Elderly', 'Mature'], antonyms: ['New', 'Young', 'Fresh', 'Modern'] },
  { word: 'Rich', level: 'easy', definition: 'Having a great deal of money', synonyms: ['Wealthy', 'Affluent', 'Prosperous', 'Well-off'], antonyms: ['Poor', 'Broke', 'Needy', 'Penniless'] },
  { word: 'Funny', level: 'easy', definition: 'Causing laughter or amusement', synonyms: ['Hilarious', 'Amusing', 'Comical', 'Witty'], antonyms: ['Serious', 'Solemn', 'Dull', 'Boring'] },
  { word: 'Hard', level: 'easy', definition: 'Requiring great effort or difficulty', synonyms: ['Difficult', 'Tough', 'Challenging', 'Demanding'], antonyms: ['Easy', 'Simple', 'Effortless', 'Light'] },
  { word: 'Beautiful', level: 'easy', definition: 'Very pleasing to the senses', synonyms: ['Gorgeous', 'Lovely', 'Stunning', 'Pretty'], antonyms: ['Ugly', 'Hideous', 'Unattractive', 'Plain'] },
  { word: 'Angry', level: 'easy', definition: 'Feeling or showing strong displeasure', synonyms: ['Furious', 'Mad', 'Annoyed', 'Enraged'], antonyms: ['Calm', 'Pleased', 'Happy', 'Content'] },

  // ── MEDIUM (ages 11–14) ─────────────────────────────────────────────────────
  { word: 'Abundant', level: 'medium', definition: 'Present in large quantities', synonyms: ['Plentiful', 'Ample', 'Copious', 'Lavish'], antonyms: ['Scarce', 'Rare', 'Meagre', 'Sparse'] },
  { word: 'Conceal', level: 'medium', definition: 'Keep from sight; hide', synonyms: ['Hide', 'Cover', 'Mask', 'Obscure'], antonyms: ['Reveal', 'Expose', 'Uncover', 'Display'] },
  { word: 'Vivid', level: 'medium', definition: 'Producing powerful feelings or clear images', synonyms: ['Bright', 'Striking', 'Colourful', 'Graphic'], antonyms: ['Dull', 'Faded', 'Pale', 'Vague'] },
  { word: 'Tranquil', level: 'medium', definition: 'Free from disturbance; calm', synonyms: ['Peaceful', 'Serene', 'Quiet', 'Still'], antonyms: ['Noisy', 'Turbulent', 'Chaotic', 'Restless'] },
  { word: 'Generous', level: 'medium', definition: 'Willingly giving more than is expected', synonyms: ['Charitable', 'Giving', 'Liberal', 'Bountiful'], antonyms: ['Selfish', 'Greedy', 'Stingy', 'Mean'] },
  { word: 'Peculiar', level: 'medium', definition: 'Unusual or strange', synonyms: ['Odd', 'Weird', 'Strange', 'Bizarre'], antonyms: ['Ordinary', 'Normal', 'Common', 'Typical'] },
  { word: 'Triumph', level: 'medium', definition: 'A great victory or achievement', synonyms: ['Victory', 'Success', 'Win', 'Achievement'], antonyms: ['Defeat', 'Failure', 'Loss', 'Setback'] },
  { word: 'Feeble', level: 'medium', definition: 'Lacking physical strength', synonyms: ['Weak', 'Frail', 'Fragile', 'Delicate'], antonyms: ['Strong', 'Powerful', 'Robust', 'Sturdy'] },
  { word: 'Timid', level: 'medium', definition: 'Showing a lack of courage', synonyms: ['Shy', 'Fearful', 'Nervous', 'Hesitant'], antonyms: ['Bold', 'Brave', 'Confident', 'Daring'] },
  { word: 'Bleak', level: 'medium', definition: 'Lacking warmth or hope; dreary', synonyms: ['Grim', 'Dismal', 'Gloomy', 'Barren'], antonyms: ['Bright', 'Hopeful', 'Cheerful', 'Pleasant'] },
  { word: 'Diligent', level: 'medium', definition: 'Having or showing care in one\'s work', synonyms: ['Hardworking', 'Industrious', 'Thorough', 'Dedicated'], antonyms: ['Lazy', 'Careless', 'Idle', 'Negligent'] },
  { word: 'Shriek', level: 'medium', definition: 'A loud, high-pitched cry', synonyms: ['Scream', 'Screech', 'Yell', 'Howl'], antonyms: ['Whisper', 'Murmur', 'Hush', 'Silence'] },
  { word: 'Sombre', level: 'medium', definition: 'Dark and oppressive in atmosphere', synonyms: ['Gloomy', 'Dark', 'Melancholy', 'Grave'], antonyms: ['Bright', 'Cheerful', 'Lively', 'Vivid'] },
  { word: 'Wrath', level: 'medium', definition: 'Extreme anger', synonyms: ['Rage', 'Fury', 'Anger', 'Indignation'], antonyms: ['Calm', 'Patience', 'Serenity', 'Gentleness'] },
  { word: 'Lofty', level: 'medium', definition: 'Of imposing height or noble character', synonyms: ['Tall', 'Elevated', 'Grand', 'Noble'], antonyms: ['Low', 'Humble', 'Modest', 'Short'] },

  // ── HARD (ages 14+) ─────────────────────────────────────────────────────────
  { word: 'Eloquent', level: 'hard', definition: 'Fluent and persuasive in speaking or writing', synonyms: ['Articulate', 'Expressive', 'Persuasive', 'Fluent'], antonyms: ['Inarticulate', 'Mumbling', 'Halting', 'Faltering'] },
  { word: 'Tenacious', level: 'hard', definition: 'Tending to keep a firm hold; persistent', synonyms: ['Persistent', 'Determined', 'Relentless', 'Stubborn'], antonyms: ['Yielding', 'Weak', 'Feeble', 'Irresolute'] },
  { word: 'Benevolent', level: 'hard', definition: 'Well meaning and kindly', synonyms: ['Kind', 'Charitable', 'Generous', 'Philanthropic'], antonyms: ['Malevolent', 'Cruel', 'Selfish', 'Spiteful'] },
  { word: 'Ephemeral', level: 'hard', definition: 'Lasting for a very short time', synonyms: ['Fleeting', 'Transient', 'Brief', 'Momentary'], antonyms: ['Permanent', 'Lasting', 'Eternal', 'Enduring'] },
  { word: 'Gregarious', level: 'hard', definition: 'Fond of company; sociable', synonyms: ['Sociable', 'Outgoing', 'Convivial', 'Affable'], antonyms: ['Solitary', 'Antisocial', 'Reserved', 'Withdrawn'] },
  { word: 'Ambiguous', level: 'hard', definition: 'Open to more than one interpretation', synonyms: ['Unclear', 'Vague', 'Equivocal', 'Obscure'], antonyms: ['Clear', 'Definite', 'Unambiguous', 'Explicit'] },
  { word: 'Ubiquitous', level: 'hard', definition: 'Present or found everywhere', synonyms: ['Omnipresent', 'Pervasive', 'Universal', 'Widespread'], antonyms: ['Rare', 'Scarce', 'Uncommon', 'Limited'] },
  { word: 'Candid', level: 'hard', definition: 'Truthful and straightforward', synonyms: ['Frank', 'Honest', 'Direct', 'Open'], antonyms: ['Dishonest', 'Evasive', 'Secretive', 'Deceitful'] },
  { word: 'Pragmatic', level: 'hard', definition: 'Dealing with things sensibly and realistically', synonyms: ['Practical', 'Realistic', 'Sensible', 'Rational'], antonyms: ['Idealistic', 'Impractical', 'Naive', 'Unrealistic'] },
  { word: 'Melancholy', level: 'hard', definition: 'A feeling of pensive sadness', synonyms: ['Sadness', 'Gloom', 'Sorrow', 'Dejection'], antonyms: ['Joy', 'Happiness', 'Elation', 'Cheerfulness'] },
  { word: 'Prudent', level: 'hard', definition: 'Acting with careful thought and good judgement', synonyms: ['Wise', 'Careful', 'Cautious', 'Sensible'], antonyms: ['Reckless', 'Impulsive', 'Careless', 'Foolish'] },
  { word: 'Magnanimous', level: 'hard', definition: 'Very generous or forgiving, especially towards rivals', synonyms: ['Generous', 'Noble', 'Forgiving', 'Big-hearted'], antonyms: ['Petty', 'Mean', 'Vindictive', 'Spiteful'] },
  { word: 'Laconic', level: 'hard', definition: 'Using very few words; brief', synonyms: ['Terse', 'Brief', 'Concise', 'Succinct'], antonyms: ['Verbose', 'Long-winded', 'Rambling', 'Wordy'] },
  { word: 'Insolent', level: 'hard', definition: 'Showing a rude lack of respect', synonyms: ['Impudent', 'Rude', 'Disrespectful', 'Arrogant'], antonyms: ['Respectful', 'Polite', 'Humble', 'Courteous'] },
  { word: 'Verbose', level: 'hard', definition: 'Using more words than needed', synonyms: ['Long-winded', 'Wordy', 'Rambling', 'Prolix'], antonyms: ['Concise', 'Brief', 'Terse', 'Succinct'] },
];

// ─── GRAMMAR QUESTIONS ────────────────────────────────────────────────────────
export const GRAMMAR_QUESTIONS = [
  // ── EASY ──────────────────────────────────────────────────────────────────
  { level: 'easy', q: 'Which sentence is correct?', options: ['She go to school', 'She goes to school', 'She gone to school', 'She going to school'], correct: 1, fact: '"Goes" is the correct third-person singular present tense of "go".' },
  { level: 'easy', q: 'Which word is a noun?', options: ['Running', 'Beautiful', 'Dog', 'Quickly'], correct: 2, fact: 'A noun names a person, place, or thing. "Dog" is a thing.' },
  { level: 'easy', q: 'Choose the plural of "child":', options: ['Childs', 'Childes', 'Children', 'Childrens'], correct: 2, fact: '"Children" is an irregular plural — it doesn\'t simply add -s.' },
  { level: 'easy', q: 'Which word is an adjective?', options: ['Jump', 'Slowly', 'Beautiful', 'Run'], correct: 2, fact: 'Adjectives describe nouns. "Beautiful" describes how something looks.' },
  { level: 'easy', q: '"The cat ___ on the mat." Choose the correct verb:', options: ['Sat', 'Sitting', 'Sit', 'Sitted'], correct: 0, fact: '"Sat" is the past tense of "sit", describing a completed action.' },
  { level: 'easy', q: 'Which is the correct apostrophe use?', options: ["Its raining", "It's raining", "Its' raining", "It' raining"], correct: 1, fact: '"It\'s" is a contraction of "it is". "Its" without an apostrophe shows possession.' },
  { level: 'easy', q: 'Which sentence uses "a" correctly?', options: ['A apple', 'A elephant', 'A dog', 'A orange'], correct: 2, fact: '"A" is used before consonant sounds; "an" before vowel sounds.' },
  { level: 'easy', q: 'Which word is a verb?', options: ['Table', 'Blue', 'Quickly', 'Jump'], correct: 3, fact: 'Verbs are action or state words. "Jump" is an action.' },
  { level: 'easy', q: 'Choose the correct spelling:', options: ['Beutiful', 'Beautyful', 'Beautiful', 'Beautifull'], correct: 2, fact: '"Beautiful" — remember: b-e-a-u-t-i-f-u-l.' },
  { level: 'easy', q: '"They ___ playing football." Choose the correct word:', options: ['Is', 'Was', 'Are', 'Am'], correct: 2, fact: '"They" is plural, so we use "are" (not "is" or "was").' },

  // ── MEDIUM ────────────────────────────────────────────────────────────────
  { level: 'medium', q: 'Identify the adverb: "She sings beautifully."', options: ['She', 'Sings', 'Beautifully', 'The song'], correct: 2, fact: 'Adverbs modify verbs, adjectives, or other adverbs. "Beautifully" describes how she sings.' },
  { level: 'medium', q: 'Which sentence is in the passive voice?', options: ['The dog bit the man', 'The man was bitten by the dog', 'The man bit the dog', 'The dog bites the man'], correct: 1, fact: 'In passive voice, the subject receives the action. "The man was bitten" — the man is acted upon.' },
  { level: 'medium', q: '"Neither the teacher nor the students ___ ready."', options: ['Was', 'Were', 'Is', 'Are'], correct: 1, fact: 'With "neither...nor", the verb agrees with the nearest noun. "Students" is plural → "were".' },
  { level: 'medium', q: 'Which word is a conjunction?', options: ['Quickly', 'Although', 'Running', 'Beautiful'], correct: 1, fact: 'Conjunctions join clauses or words. "Although" introduces a subordinate clause.' },
  { level: 'medium', q: 'What type of noun is "happiness"?', options: ['Proper noun', 'Concrete noun', 'Abstract noun', 'Collective noun'], correct: 2, fact: 'Abstract nouns name ideas or feelings you cannot touch. "Happiness" is a feeling.' },
  { level: 'medium', q: '"I have been waiting for an hour." This tense is:', options: ['Simple past', 'Present perfect', 'Present perfect continuous', 'Past continuous'], correct: 2, fact: 'Present perfect continuous (have been + -ing) shows an ongoing action that started in the past.' },
  { level: 'medium', q: 'Choose the sentence with correct comma use:', options: ['I like cats dogs and birds', 'I like cats, dogs and birds', 'I like, cats dogs and birds', 'I, like cats dogs and birds'], correct: 1, fact: 'In a list of three or more items, use commas to separate them.' },
  { level: 'medium', q: 'Which sentence uses "their" correctly?', options: ['Their going to the park', 'The dog wagged it\'s tail', 'They put their bags down', 'There going home'], correct: 2, fact: '"Their" is a possessive pronoun. "They put THEIR bags" — the bags belong to them.' },
  { level: 'medium', q: 'A preposition shows:', options: ['An action', 'A relationship between words', 'A feeling', 'A description'], correct: 1, fact: 'Prepositions like "on", "in", "under" show the relationship between a noun and other words.' },
  { level: 'medium', q: '"Quickly" is which type of adverb?', options: ['Adverb of time', 'Adverb of place', 'Adverb of manner', 'Adverb of frequency'], correct: 2, fact: 'Adverbs of manner describe HOW an action is done. "Quickly" describes how you do something.' },

  // ── HARD ──────────────────────────────────────────────────────────────────
  { level: 'hard', q: 'Which sentence contains a dangling modifier?', options: ['Having eaten dinner, she washed the dishes', 'Having eaten dinner, the dishes were washed', 'She washed dishes after eating dinner', 'After dinner, she washed the dishes'], correct: 1, fact: 'In option B, "the dishes" didn\'t eat dinner — the modifier incorrectly refers to them.' },
  { level: 'hard', q: 'Which is the correct use of the subjunctive mood?', options: ['I wish I was taller', 'I wish I were taller', 'I wish I am taller', 'I wish I will be taller'], correct: 1, fact: 'The subjunctive uses "were" (not "was") to express wishes or hypothetical situations.' },
  { level: 'hard', q: '"Whom did you speak to?" is correct because:', options: ['Whom is always correct', '"Whom" is the object of "to"', '"Who" is always wrong', 'Both A and B'], correct: 1, fact: '"Whom" is correct as the object of a preposition. You spoke TO him → whom.' },
  { level: 'hard', q: 'Choose the sentence with correct semicolon use:', options: ['I love coffee, I hate tea', 'I love coffee; I hate tea', 'I love coffee; but I hate tea', 'I love; coffee I hate tea'], correct: 1, fact: 'A semicolon joins two closely related independent clauses without a conjunction.' },
  { level: 'hard', q: '"She ___ to the party if she had been invited." Choose correctly:', options: ['Would go', 'Would have gone', 'Will go', 'Went'], correct: 1, fact: '"Would have gone" is the third conditional, expressing an unreal past situation.' },
  { level: 'hard', q: 'Which sentence uses an em-dash correctly?', options: ['She loved him—deeply', 'She loved—him deeply', 'She—loved him deeply', 'She loved him —deeply'], correct: 0, fact: 'An em-dash can replace a colon or add emphasis. "She loved him—deeply" adds dramatic force.' },
  { level: 'hard', q: '"The data ___ been analysed." Choose the correct form:', options: ['Has', 'Have', 'Is', 'Are'], correct: 1, fact: '"Data" is the plural of "datum". In formal writing, it takes a plural verb: "data have".' },
  { level: 'hard', q: 'A "red herring" in an argument is:', options: ['A strong point', 'A logical fallacy that distracts from the issue', 'An emotional appeal', 'A valid counterpoint'], correct: 1, fact: 'A red herring diverts attention from the real issue by introducing an irrelevant point.' },
  { level: 'hard', q: 'Which sentence has parallel structure?', options: ['She likes to swim, running, and to cycle', 'She likes swimming, running, and cycling', 'She likes to swim, run, and cycling', 'She likes swim, run, and cycle'], correct: 1, fact: 'Parallel structure requires consistent grammatical form in a list. All -ing forms are parallel.' },
  { level: 'hard', q: '"Fewer" vs "less": which is correct?', options: ['Less people attended', 'Fewer people attended', 'Less peoples attended', 'Fewer money was spent'], correct: 1, fact: '"Fewer" is for countable nouns (people). "Less" is for uncountable nouns (money, water).' },
];

// ─── QUESTION GENERATOR ───────────────────────────────────────────────────────
export function generateEnglishQuestions(topics, level) {
  const levelWords = WORDS.filter(w => w.level === level);
  const levelGrammar = GRAMMAR_QUESTIONS.filter(q => q.level === level);
  const shuffledWords = [...levelWords].sort(() => Math.random() - 0.5);
  const questions = [];

  // Build from selected topics
  for (const word of shuffledWords) {
    if (questions.length >= 10) break;

    const available = topics.filter(t => {
      if (t === 'meanings') return levelWords.length >= 4;
      if (t === 'synonyms') return word.synonyms.length >= 1 && word.antonyms.length >= 3;
      if (t === 'antonyms') return word.antonyms.length >= 1 && word.synonyms.length >= 3;
      return false;
    });

    if (available.length === 0) continue;
    const topic = available[Math.floor(Math.random() * available.length)];

    if (topic === 'meanings') {
      const wrongDefs = levelWords
        .filter(w => w.word !== word.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.definition);
      if (wrongDefs.length < 3) continue;
      const options = [word.definition, ...wrongDefs].sort(() => Math.random() - 0.5);
      questions.push({
        id: `eq${questions.length}`,
        type: 'meanings',
        question: `What does "${word.word}" mean?`,
        options,
        correct: options.indexOf(word.definition),
        fact: `"${word.word}" means: ${word.definition}`,
      });
    } else if (topic === 'synonyms') {
      const correctSyn = word.synonyms[Math.floor(Math.random() * word.synonyms.length)];
      const wrongOpts = word.antonyms.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correctSyn, ...wrongOpts].sort(() => Math.random() - 0.5);
      questions.push({
        id: `eq${questions.length}`,
        type: 'synonyms',
        question: `Which word is a SYNONYM of "${word.word}"?`,
        options,
        correct: options.indexOf(correctSyn),
        fact: `A synonym of "${word.word}" is "${correctSyn}". Both mean: ${word.definition}`,
      });
    } else if (topic === 'antonyms') {
      const correctAnt = word.antonyms[Math.floor(Math.random() * word.antonyms.length)];
      const wrongOpts = word.synonyms.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [correctAnt, ...wrongOpts].sort(() => Math.random() - 0.5);
      questions.push({
        id: `eq${questions.length}`,
        type: 'antonyms',
        question: `Which word is an ANTONYM (opposite) of "${word.word}"?`,
        options,
        correct: options.indexOf(correctAnt),
        fact: `An antonym of "${word.word}" is "${correctAnt}". "${word.word}" means: ${word.definition}`,
      });
    }
  }

  // Fill remaining with grammar if selected
  if (topics.includes('grammar') && questions.length < 10) {
    const shuffledGrammar = [...levelGrammar].sort(() => Math.random() - 0.5);
    for (const gq of shuffledGrammar) {
      if (questions.length >= 10) break;
      questions.push({ id: `gq${questions.length}`, type: 'grammar', ...gq });
    }
  }

  return questions.slice(0, 10).sort(() => Math.random() - 0.5);
}
