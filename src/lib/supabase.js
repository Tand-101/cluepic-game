// src/lib/supabase.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zmnzitvftqeolrorctmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbnppdHZmdHFlb2xyb3JjdG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2Nzg5MTcsImV4cCI6MjA4NDI1NDkxN30.ciRoqqTwtQW224jBJ2nFvPJPutoX6bii8eKlaV4wjCQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Add image sizing parameters to Unsplash URLs
const formatImageUrl = (url) => {
  if (!url) return url;
  
  if (url.includes('unsplash.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=800&h=600&fit=crop`;
  }
  
  return url;
};

// Fetch puzzles by difficulty and optional category
export const fetchPuzzlesByDifficulty = async (difficulty, category = null) => {
  try {
    const difficultyMap = {
      'easy': 'Classic',
      'hard': 'Challenge', 
      'timed': 'Timed'
    }
    
    const targetDifficulty = difficultyMap[difficulty] || 'Classic'
    
    let query = supabase
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
          photographer_url,
          unsplash_photo_id,
          download_location
        )
      `)
      .eq('active', true)
      .eq('difficulty', targetDifficulty)
    
    // Fetch puzzles by difficulty and optional category
export const fetchPuzzlesByDifficulty = async (difficulty, category = null) => {
  try {
    const difficultyMap = {
      'easy': 'Classic',
      'hard': 'Challenge', 
      'timed': 'Timed'
    }
    
    const targetDifficulty = difficultyMap[difficulty] || 'Classic'
    
    let query = supabase
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
          photographer_url,
          unsplash_photo_id,
          download_location
        )
      `)
      .eq('active', true)
      .eq('difficulty', targetDifficulty)
    
    // If category specified, filter by it
    if (category) {
      query = query.eq('category', category)
    }
    // REMOVED: No longer excluding 'Daily' - shows ALL puzzles when no category selected
    
    query = query.order('term', { ascending: true })

    const { data, error } = await query

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
          photographerUrl: image.photographer_url,
          unsplashPhotoId: image.unsplash_photo_id,
          downloadLocation: image.download_location
        }
      })

    console.log(`✅ Fetched ${puzzles.length} ${targetDifficulty} puzzles${category ? ` for category ${category}` : ' (all categories)'}`)
    return puzzles.length > 0 ? puzzles : []
  } catch (error) {
    console.error('Error fetching puzzles by difficulty:', error)
    return []
  }
}
    
    query = query.order('term', { ascending: true })

    const { data, error } = await query

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
          photographerUrl: image.photographer_url,
          unsplashPhotoId: image.unsplash_photo_id,
          downloadLocation: image.download_location
        }
      })

    return puzzles.length > 0 ? puzzles : []
  } catch (error) {
    console.error('Error fetching puzzles by difficulty:', error)
    return []
  }
}

// Fetch today's daily puzzles (5x Classic, 5x Challenge, 5x Timed)
export const fetchDailyPuzzles = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    
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
          photographer_url,
          unsplash_photo_id,
          download_location
        )
      `)
      .eq('active', true)
      .eq('category', 'Daily')
      .order('id', { ascending: true })

    if (error) throw error

    const byDifficulty = {
      Classic: [],
      Challenge: [],
      Timed: []
    }

    data.forEach(item => {
      if (item.images && item.images.length > 0 && byDifficulty[item.difficulty]) {
        byDifficulty[item.difficulty].push(item)
      }
    })

    const seed = parseInt(today.replace(/-/g, ''))
    const dailyPuzzles = {
      Classic: [],
      Challenge: [],
      Timed: []
    }
    
    // Select 5 puzzles for each difficulty
    Object.keys(byDifficulty).forEach(difficulty => {
      const available = byDifficulty[difficulty]
      if (available.length > 0) {
        for (let i = 0; i < 5; i++) {
          const index = (seed + i) % available.length
          const item = available[index]
          const image = item.images[0]
          
          dailyPuzzles[difficulty].push({
            id: item.id,
            word: item.term.toUpperCase(),
            image: formatImageUrl(image.image_url),
            thumbnail: formatImageUrl(image.thumbnail_url),
            hint: item.clue || 'Guess the word',
            category: item.category,
            difficulty: item.difficulty,
            photographer: image.photographer,
            photographerUrl: image.photographer_url,
            unsplashPhotoId: image.unsplash_photo_id,
            downloadLocation: image.download_location,
            date: today
          })
        }
      }
    })
    
    return dailyPuzzles
  } catch (error) {
    console.error('Error fetching daily puzzles:', error)
    return { Classic: [], Challenge: [], Timed: [] }
  }
}

// Fetch archive puzzles (previous days' dailies)
export const fetchArchivePuzzles = async (hasArchiveAccess) => {
  if (!hasArchiveAccess) {
    return { available: false, puzzles: [] }
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    
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
          photographer_url,
          unsplash_photo_id,
          download_location
        )
      `)
      .eq('active', true)
      .eq('category', 'Daily')
      .order('difficulty', { ascending: true })

    if (error) throw error

    const todaysPuzzles = await fetchDailyPuzzles()
    const todaysPuzzleIds = new Set([
      ...todaysPuzzles.Classic.map(p => p.id),
      ...todaysPuzzles.Challenge.map(p => p.id),
      ...todaysPuzzles.Timed.map(p => p.id)
    ])

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
          photographerUrl: image.photographer_url,
          unsplashPhotoId: image.unsplash_photo_id,
          downloadLocation: image.download_location
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
    classicComplete: todayCompleted.filter(p => p.difficulty === 'Classic').length >= 5,
    challengeComplete: todayCompleted.filter(p => p.difficulty === 'Challenge').length >= 5,
    timedComplete: todayCompleted.filter(p => p.difficulty === 'Timed').length >= 5,
    allComplete: todayCompleted.length >= 15
  }
}

// Fetch expansion packs from categories
export const fetchExpansionPacks = async (userProfile = null) => {
  try {
    const { data, error } = await supabase
      .from('search_terms')
      .select('category')
      .eq('active', true)
      .neq('category', 'Daily')

    if (error) throw error

    const categories = [...new Set(data.map(item => item.category))]
    
    const categoryConfig = {
      'Freereview': { emoji: '📚', name: 'Free App Review', price: 'Free with Review', requiresReview: true },
      'Animals': { emoji: '🦁', name: 'Animals', price: '£2.99' },
      'Countries': { emoji: '🌍', name: 'Countries', price: '£2.99' },
      'Food': { emoji: '🍕', name: 'Food', price: '£2.99' },
      'Halloween': { emoji: '🎃', name: 'Halloween', price: '£2.99' },
      'Home': { emoji: '🏠', name: 'Home', price: '£2.99' },
      'Jobs': { emoji: '👷', name: 'Jobs', price: '£2.99' },
      'School': { emoji: '🎓', name: 'School', price: '£2.99' },
      'Sports': { emoji: '⚽', name: 'Sports', price: '£2.99' },
      'Weather': { emoji: '☀️', name: 'Weather', price: '£2.99' },
      'Wild': { emoji: '🌲', name: 'Wild', price: '£2.99' }
    }

    return categories.map(category => {
      const config = categoryConfig[category] || {
        emoji: '📦',
        name: category,
        price: '£2.99'
      }
      
      const isOwned = userProfile?.purchased_packs?.includes(category) || 
                      userProfile?.is_premium || 
                      category === 'Freereview'
      
      return {
        ...config,
        category,
        locked: !isOwned,
        requiresReview: config.requiresReview || false
      }
    })
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
          photographer_url,
          unsplash_photo_id,
          download_location
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
          photographerUrl: image.photographer_url,
          unsplashPhotoId: image.unsplash_photo_id,
          downloadLocation: image.download_location
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
