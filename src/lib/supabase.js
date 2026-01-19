// src/lib/supabase.js
// Amendment 3: Daily puzzles from "Daily" category with archive system

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zmnzitvftqeolrorctmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbnppdHZmdHFlb2xyb3JjdG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2Nzg5MTcsImV4cCI6MjA4NDI1NDkxN30.ciRoqqTwtQW224jBJ2nFvPJPutoX6bii8eKlaV4wjCQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Amendment 1: Add image sizing parameters to Unsplash URLs
const formatImageUrl = (url) => {
  if (!url) return url;
  
  // If it's an Unsplash URL, add size parameters
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=800&h=600&fit=crop`;
  }
  
  return url;
};

// Fetch puzzles by difficulty (for regular gameplay)
export const fetchPuzzlesByDifficulty = async (difficulty) => {
  try {
    const difficultyMap = {
      'easy': 'Classic',
      'hard': 'Challenge', 
      'timed': 'Timed'
    }
    
    const targetDifficulty = difficultyMap[difficulty] || 'Classic'
    
    const { data, error } = await supabase
      .from('search_terms')
      .select(`
        id,
        term,
        category,
        clue,
        difficulty,
        active,
        images (
          image_url,
          thumbnail_url,
          photographer,
          photographer_url
        )
      `)
      .eq('active', true)
      .eq('difficulty', targetDifficulty)
      .neq('category', 'Daily') // Exclude daily category from regular play
      .order('term', { ascending: true })

    if (error) throw error

    const puzzles = data
      .filter(item => item.images && item.images.length > 0)
      .map(item => {
        const image = item.images[0]
        return {
          id: item.id,
          word: item.term.toUpperCase(),
          image: formatImageUrl(image.image_url),
          thumbnail: formatImageUrl(image.thumbnail_url),
          hint: item.clue || 'Guess the word',
          category: item.category,
          difficulty: item.difficulty,
          photographer: image.photographer,
          photographerUrl: image.photographer_url
        }
      })

    return puzzles.length > 0 ? puzzles : []
  } catch (error) {
    console.error('Error fetching puzzles by difficulty:', error)
    return []
  }
}

// Amendment 3: Fetch today's daily puzzles (3x Classic, 3x Challenge, 3x Timed from "Daily" category)
export const fetchDailyPuzzles = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch ALL puzzles from the "Daily" category
    const { data, error } = await supabase
      .from('search_terms')
      .select(`
        id,
        term,
        category,
        clue,
        difficulty,
        active,
        images (
          image_url,
          thumbnail_url,
          photographer,
          photographer_url
        )
      `)
      .eq('active', true)
      .eq('category', 'Daily')
      .order('id', { ascending: true })

    if (error) throw error

    // Separate by difficulty
    const byDifficulty = {
      Classic: [],
      Challenge: [],
      Timed: []
    }

    data.forEach(item => {
      if (item.images && item.images.length > 0 && byDifficulty[item.difficulty]) {
        const image = item.images[0]
        byDifficulty[item.difficulty].push({
          id: item.id,
          word: item.term.toUpperCase(),
          image: formatImageUrl(image.image_url),
          thumbnail: formatImageUrl(image.thumbnail_url),
          hint: item.clue || 'Guess the word',
          category: item.category,
          difficulty: item.difficulty,
          photographer: image.photographer,
          photographerUrl: image.photographer_url,
          date: today
        })
      }
    })

    // Use date as seed to select 3 puzzles per difficulty
    const seed = parseInt(today.replace(/-/g, ''))
    const dailyPuzzles = {
      Classic: [],
      Challenge: [],
      Timed: []
    }

    // Select 3 puzzles for each difficulty using deterministic rotation
    Object.keys(byDifficulty).forEach(difficulty => {
      const available = byDifficulty[difficulty]
      if (available.length > 0) {
        for (let i = 0; i < 3; i++) {
          const index = (seed + i) % available.length
          dailyPuzzles[difficulty].push(available[index])
        }
      }
    })

    return dailyPuzzles
  } catch (error) {
    console.error('Error fetching daily puzzles:', error)
    return { Classic: [], Challenge: [], Timed: [] }
  }
}

// Amendment 3: Fetch archive puzzles (previous days' dailies)
export const fetchArchivePuzzles = async (hasArchiveAccess) => {
  if (!hasArchiveAccess) {
    return { available: false, puzzles: [] }
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Get all Daily category puzzles
    const { data, error } = await supabase
      .from('search_terms')
      .select(`
        id,
        term,
        category,
        clue,
        difficulty,
        active,
        images (
          image_url,
          thumbnail_url,
          photographer,
          photographer_url
        )
      `)
      .eq('active', true)
      .eq('category', 'Daily')
      .order('difficulty', { ascending: true })

    if (error) throw error

    // Get current day's puzzle IDs to exclude them
    const todaysPuzzles = await fetchDailyPuzzles()
    const todaysPuzzleIds = new Set([
      ...todaysPuzzles.Classic.map(p => p.id),
      ...todaysPuzzles.Challenge.map(p => p.id),
      ...todaysPuzzles.Timed.map(p => p.id)
    ])

    // Map all puzzles except today's
    const archivePuzzles = data
      .filter(item => item.images && item.images.length > 0 && !todaysPuzzleIds.has(item.id))
      .map(item => {
        const image = item.images[0]
        return {
          id: item.id,
          word: item.term.toUpperCase(),
          image: formatImageUrl(image.image_url),
          thumbnail: formatImageUrl(image.thumbnail_url),
          hint: item.clue || 'Guess the word',
          category: 'Daily Archive',
          difficulty: item.difficulty,
          photographer: image.photographer,
          photographerUrl: image.photographer_url
        }
      })

    return {
      available: true,
      puzzles: archivePuzzles,
      count: archivePuzzles.length
    }
  } catch (error) {
    console.error('Error fetching archive puzzles:', error)
    return { available: false, puzzles: [] }
  }
}

// Check if user completed today's dailies
export const checkDailyCompletion = (completedPuzzles) => {
  const today = new Date().toISOString().split('T')[0]
  const todayCompleted = completedPuzzles.filter(p => p.date === today)
  
  return {
    classicComplete: todayCompleted.filter(p => p.difficulty === 'Classic').length >= 3,
    challengeComplete: todayCompleted.filter(p => p.difficulty === 'Challenge').length >= 3,
    timedComplete: todayCompleted.filter(p => p.difficulty === 'Timed').length >= 3,
    allComplete: todayCompleted.length >= 9
  }
}

// Fetch expansion packs from categories (exclude Daily category)
export const fetchExpansionPacks = async () => {
  try {
    const { data, error } = await supabase
      .from('search_terms')
      .select('category')
      .eq('active', true)
      .neq('category', 'Daily') // Exclude Daily from expansion packs

    if (error) throw error

    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))]
    
    // Map categories to expansion packs with emojis
    const categoryEmojis = {
      'Animals': '🦁',
      'Nature': '🌲',
      'Food': '🍕',
      'Architecture': '🏛️',
      'Objects': '🎨',
      'Sports': '⚽',
      'Music': '🎵',
      'Travel': '✈️',
      'Professions': '👨‍⚕️',
      'Halloween': '🎃',
      'Free App Review': '📚'
    }

    return categories.map(category => ({
      name: category,
      price: category === 'Free App Review' ? 'Free with Review' : '£2.99',
      emoji: categoryEmojis[category] || '📦',
      locked: category !== 'Free App Review' && category !== 'Food',
      requiresReview: category === 'Free App Review',
      category: category
    }))
  } catch (error) {
    console.error('Error fetching expansion packs:', error)
    return []
  }
}

// Fetch puzzles by category (Amendment 2: Ensure proper distribution)
export const fetchPuzzlesByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('search_terms')
      .select(`
        id,
        term,
        category,
        clue,
        difficulty,
        active,
        images (
          image_url,
          thumbnail_url,
          photographer,
          photographer_url
        )
      `)
      .eq('active', true)
      .eq('category', category)
      .order('difficulty', { ascending: true })
      .order('term', { ascending: true })

    if (error) throw error

    return data
      .filter(item => item.images && item.images.length > 0)
      .map(item => {
        const image = item.images[0]
        return {
          id: item.id,
          word: item.term.toUpperCase(),
          image: formatImageUrl(image.image_url),
          thumbnail: formatImageUrl(image.thumbnail_url),
          hint: item.clue || 'Guess the word',
          category: item.category,
          difficulty: item.difficulty,
          photographer: image.photographer,
          photographerUrl: image.photographer_url
        }
      })
  } catch (error) {
    console.error('Error fetching puzzles by category:', error)
    return []
  }
}

// Track puzzle attempts for analytics
export const trackPuzzleAttempt = async (termId, success, attempts) => {
  try {
    const { error } = await supabase
      .from('puzzle_attempts')
      .insert({
        term_id: termId,
        success: success,
        attempts: attempts,
        timestamp: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error tracking puzzle attempt:', error)
  }
}
