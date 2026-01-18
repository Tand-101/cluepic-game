// src/lib/supabase.js
// Amendments 3, 8, 9, 10 combined
// Supabase configuration for Cluepic

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zmnzitvftqeolrorctmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbnppdHZmdHFlb2xyb3JjdG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2Nzg5MTcsImV4cCI6MjA4NDI1NDkxN30.ciRoqqTwtQW224jBJ2nFvPJPutoX6bii8eKlaV4wjCQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Amendment 3: Fetch puzzles by difficulty
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
      .order('term', { ascending: true })

    if (error) throw error

    const puzzles = data
      .filter(item => item.images && item.images.length > 0)
      .map(item => {
        const image = item.images[0]
        return {
          id: item.id,
          word: item.term.toUpperCase(),
          image: image.image_url,
          thumbnail: image.thumbnail_url,
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

// Amendment 8: Fetch daily puzzles (3 per difficulty)
export const fetchDailyPuzzles = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch 3 puzzles for each difficulty
    const difficulties = ['Classic', 'Challenge', 'Timed']
    const dailyPuzzles = {
      Classic: [],
      Challenge: [],
      Timed: []
    }

    for (const difficulty of difficulties) {
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
        .eq('difficulty', difficulty)
        .limit(100)

      if (error) throw error

      // Use date as seed to pick 3 consistent daily puzzles
      const seed = parseInt(today.replace(/-/g, ''))
      const validPuzzles = data.filter(item => item.images && item.images.length > 0)
      
      for (let i = 0; i < 3 && i < validPuzzles.length; i++) {
        const index = (seed + i) % validPuzzles.length
        const item = validPuzzles[index]
        const image = item.images[0]
        
        dailyPuzzles[difficulty].push({
          id: item.id,
          word: item.term.toUpperCase(),
          image: image.image_url,
          thumbnail: image.thumbnail_url,
          hint: item.clue || 'Guess the word',
          category: item.category,
          difficulty: item.difficulty,
          photographer: image.photographer,
          photographerUrl: image.photographer_url,
          date: today
        })
      }
    }

    return dailyPuzzles
  } catch (error) {
    console.error('Error fetching daily puzzles:', error)
    return { Classic: [], Challenge: [], Timed: [] }
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

// Amendment 10: Fetch expansion packs from categories
export const fetchExpansionPacks = async () => {
  try {
    const { data, error } = await supabase
      .from('search_terms')
      .select('category')
      .eq('active', true)

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

// Fetch puzzles by category
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
      .order('term', { ascending: true })

    if (error) throw error

    return data
      .filter(item => item.images && item.images.length > 0)
      .map(item => {
        const image = item.images[0]
        return {
          id: item.id,
          word: item.term.toUpperCase(),
          image: image.image_url,
          thumbnail: image.thumbnail_url,
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
