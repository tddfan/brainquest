export const SHOP_CATEGORIES = [
  { id: 'mystery', label: 'Mystery Eggs', emoji: '🥚' },
  { id: 'avatars', label: 'Premium Shop', emoji: '🎭' },
  { id: 'themes', label: 'Themes', emoji: '🎨' },
];

export const RARITIES = {
  COMMON: { label: 'Common', color: 'text-gray-400', chance: 0.78999, sellXP: 100 },
  RARE: { label: 'Rare', color: 'text-blue-400', chance: 0.15, sellXP: 200 },
  EXOTIC: { label: 'Exotic', color: 'text-purple-500', chance: 0.05, glow: 'shadow-purple-500/50', sellXP: 500 },
  MYTHIC: { label: 'Mythic', color: 'text-pink-500', chance: 0.01, glow: 'shadow-pink-500/80 animate-pulse', sellXP: 1000 },
  ULTRA: { label: 'Ultra Mythic', color: 'text-yellow-400', chance: 0.00001, glow: 'shadow-yellow-500/100 animate-bounce', sellXP: 2000 },
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
  { id: 'pet_dolphin', emoji: '🐬', name: 'Ultra Dolphin', rarity: 'ULTRA' },
];

export const PREMIUM_AVATARS = [
  { id: 'av_hacker', emoji: '👨‍💻', name: 'Elite Hacker', price: 100000, currency: 'diamonds', category: 'avatars' },
  { id: 'av_runner', emoji: '🏃‍♂️', name: 'Parkour Legend', price: 0, category: 'quest_reward', hidden: true },
  { id: 'av_17', emoji: '🥷', name: 'Shadow Ninja', price: 3000, category: 'avatars' },
  { id: 'av_18', emoji: '🦸', name: 'Super Hero', price: 2800, category: 'avatars' },
  { id: 'av_19', emoji: '🧙‍♂️', name: 'Arcane Wizard', price: 3500, category: 'avatars' },
  { id: 'av_20', emoji: '👨‍🚀', name: 'Space Explorer', price: 2200, category: 'avatars' },
  { id: 'av_23', emoji: '👑', name: 'Royal Crown', price: 5000, category: 'avatars' },
];

export const SHOP_THEMES = [
  { id: 'theme_white', name: 'Cloud White', price: 500, color: 'from-slate-100 via-white to-slate-200', text: 'text-slate-900' },
  { id: 'theme_orange', name: 'Sunset Orange', price: 18000, color: 'from-orange-600 via-orange-500 to-amber-500' },
  { id: 'theme_blue', name: 'Deep Sea Blue', price: 800, color: 'from-blue-800 via-blue-600 to-cyan-500' },
  { id: 'theme_purple', name: 'Royal Purple', price: 800, color: 'from-purple-800 via-violet-600 to-fuchsia-500' },
  { id: 'theme_pink', name: 'Cyber Pink', price: 800, color: 'from-pink-600 via-rose-500 to-orange-400' },
  { id: 'theme_green', name: 'Emerald Forest', price: 800, color: 'from-emerald-800 via-green-600 to-lime-500' },
  { id: 'theme_brown', name: 'Earth Earth', price: 800, color: 'from-amber-900 via-orange-900 to-stone-800' },
  { id: 'theme_yellow', name: 'Golden Sun', price: 800, color: 'from-yellow-500 via-amber-400 to-orange-300' },
  { id: 'theme_red', name: 'Crimson Fury', price: 800, color: 'from-red-800 via-red-600 to-orange-600' },
  
  // Premium Themes
  { id: 'theme_jungle', name: 'Deep Jungle', price: 12000, color: 'from-green-950 via-emerald-900 to-teal-950' },
  { id: 'theme_ocean', name: 'Surface Ocean', price: 10000, color: 'from-cyan-900 via-blue-800 to-blue-950' },
];

export const BOOSTS = [
  { id: 'boost_xp', name: '2x XP Boost', price: 50, currency: 'diamonds', duration: 10 * 60 * 1000, emoji: '⚡', description: 'Double all XP earned for 10 minutes' },
  { id: 'boost_diamonds', name: '2x Diamond Boost', price: 5000, currency: 'xp', duration: 10 * 60 * 1000, emoji: '💎', description: 'Double all Diamonds earned for 10 minutes' },
];
