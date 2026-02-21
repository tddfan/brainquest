export const SHOP_CATEGORIES = [
  { id: 'mystery', label: 'Mystery Eggs', emoji: '🥚' },
  { id: 'avatars', label: 'Premium Shop', emoji: '🎭' },
  { id: 'themes', label: 'Themes', emoji: '🎨' },
];

export const RARITIES = {
  COMMON: { label: 'Common', color: 'text-gray-400', chance: 0.78999 },
  RARE: { label: 'Rare', color: 'text-blue-400', chance: 0.15 },
  EXOTIC: { label: 'Exotic', color: 'text-purple-500', chance: 0.05, glow: 'shadow-purple-500/50' },
  MYTHIC: { label: 'Mythic', color: 'text-pink-500', chance: 0.01, glow: 'shadow-pink-500/80 animate-pulse' },
  ULTRA: { label: 'Ultra Mythic', color: 'text-yellow-400', chance: 0.00001, glow: 'shadow-yellow-500/100 animate-bounce' },
};

export const MYSTERY_PETS = [
  // Common (79%)
  { id: 'pet_1', emoji: '🐱', name: 'Kitten', rarity: 'COMMON' },
  { id: 'pet_2', emoji: '🐶', name: 'Puppy', rarity: 'COMMON' },
  { id: 'pet_3', emoji: '🐰', name: 'Bunny', rarity: 'COMMON' },
  { id: 'pet_4', emoji: '🐹', name: 'Hamster', rarity: 'COMMON' },
  { id: 'pet_5', emoji: '🐦', name: 'Birdy', rarity: 'COMMON' },
  
  // Rare (15%)
  { id: 'pet_6', emoji: '🦊', name: 'Arctic Fox', rarity: 'RARE' },
  { id: 'pet_7', emoji: '🐼', name: 'Red Panda', rarity: 'RARE' },
  { id: 'pet_8', emoji: '🐨', name: 'Koala', rarity: 'RARE' },
  { id: 'pet_9', emoji: '🐯', name: 'White Tiger', rarity: 'RARE' },

  // Exotic (5%)
  { id: 'pet_15', emoji: '🐆', name: 'Snow Leopard', rarity: 'EXOTIC' },
  { id: 'pet_16', emoji: '🦓', name: 'Cosmic Zebra', rarity: 'EXOTIC' },
  { id: 'pet_17', emoji: '🦍', name: 'Silverback', rarity: 'EXOTIC' },
  
  // Mythic (1%)
  { id: 'pet_10', emoji: '🐲', name: 'Diamond Dragon', rarity: 'MYTHIC' },
  { id: 'pet_11', emoji: '🦄', name: 'Cosmic Unicorn', rarity: 'MYTHIC' },
  { id: 'pet_12', emoji: '🧜‍♀️', name: 'Sea Queen', rarity: 'MYTHIC' },
  { id: 'pet_13', emoji: '🔥', name: 'Phoenix', rarity: 'MYTHIC' },
  { id: 'pet_14', emoji: '🌈', name: 'Rainbow Spirit', rarity: 'MYTHIC' },

  // Ultra Mythic (0.00001%)
  { id: 'pet_99', emoji: '🌌', name: 'Galaxy Whale', rarity: 'ULTRA' },
];

export const PREMIUM_AVATARS = [
  { id: 'av_17', emoji: '🥷', name: 'Shadow Ninja', price: 3000, category: 'avatars' },
  { id: 'av_18', emoji: '🦸', name: 'Super Hero', price: 2800, category: 'avatars' },
  { id: 'av_19', emoji: '🧙‍♂️', name: 'Arcane Wizard', price: 3500, category: 'avatars' },
  { id: 'av_20', emoji: '👨‍🚀', name: 'Space Explorer', price: 2200, category: 'avatars' },
  { id: 'av_23', emoji: '👑', name: 'Royal Crown', price: 5000, category: 'avatars' },
];

export const SHOP_THEMES = [
  { id: 'theme_dark', name: 'Midnight Violet', price: 1000, color: 'from-gray-950 via-violet-950 to-gray-950' },
  { id: 'theme_gold', name: 'Golden Quest', price: 5000, color: 'from-amber-900 via-yellow-950 to-black' },
];
