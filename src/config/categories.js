// src/config/categories.js
// Category configuration with emojis and pricing

export const DEV_MODE = true; // Set to false for production!

export const CATEGORY_CONFIG = {
  Daily: {
    emoji: '📅',
    name: 'Daily',
    price: 'Free',
    locked: false,
    puzzlesPerDay: 5, // 5 per difficulty
    description: 'New puzzles every day'
  },
  Freereview: {
    emoji: '📚',
    name: 'Free App Review',
    price: 'Free with Review',
    locked: !DEV_MODE, // Unlocked in dev mode
    requiresReview: true,
    description: 'Unlock by reviewing our app'
  },
  Animals: {
    emoji: '🦁',
    name: 'Animals',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '151 animal puzzles'
  },
  Countries: {
    emoji: '🌍',
    name: 'Countries',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '154 country puzzles'
  },
  Food: {
    emoji: '🍕',
    name: 'Food',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '150 food puzzles'
  },
  Halloween: {
    emoji: '🎃',
    name: 'Halloween',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '151 spooky puzzles'
  },
  Home: {
    emoji: '🏠',
    name: 'Home',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '152 household puzzles'
  },
  Jobs: {
    emoji: '👷',
    name: 'Jobs',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '151 profession puzzles'
  },
  School: {
    emoji: '🎓',
    name: 'School',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '151 education puzzles'
  },
  Sports: {
    emoji: '⚽',
    name: 'Sports',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '167 sports puzzles'
  },
  Weather: {
    emoji: '☀️',
    name: 'Weather',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '151 weather puzzles'
  },
  Wild: {
    emoji: '🌲',
    name: 'Wild',
    price: '£2.99',
    locked: !DEV_MODE,
    description: '152 wilderness puzzles'
  }
};

// Get category display name
export const getCategoryName = (category) => {
  return CATEGORY_CONFIG[category]?.name || category;
};

// Check if category is locked
export const isCategoryLocked = (category, userProfile) => {
  if (DEV_MODE) return false; // Everything unlocked in dev mode
  
  const config = CATEGORY_CONFIG[category];
  if (!config) return true;
  
  // Daily is always free
  if (category === 'Daily') return false;
  
  // Check if user owns this pack
  if (userProfile?.purchased_packs?.includes(category)) return false;
  
  // Check if user has premium (unlocks everything)
  if (userProfile?.is_premium) return false;
  
  return config.locked;
};

// Get expansion packs for display
export const getExpansionPacks = (userProfile) => {
  return Object.keys(CATEGORY_CONFIG)
    .filter(cat => cat !== 'Daily') // Exclude Daily from expansion packs
    .map(category => ({
      ...CATEGORY_CONFIG[category],
      category,
      locked: isCategoryLocked(category, userProfile)
    }));
};
