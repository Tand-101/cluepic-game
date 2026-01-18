// src/lib/supabase.js
// Supabase configuration for Cluepic

import { createClient } from '@supabase/supabase-js'

// Supabase credentials
const supabaseUrl = 'https://zmnzitvftqeolrorctmx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbnppdHZmdHFlb2xyb3JjdG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2Nzg5MTcsImV4cCI6MjA4NDI1NDkxN30.ciRoqqTwtQW224jBJ2nFvPJPutoX6bii8eKlaV4wjCQ'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fetch all active puzzles with images from Supabase
export const fetchPuzzles = async () => {
  try {
    // Join search_terms with images table
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
      .order('term', { ascending: true })

    if (error) throw error

    // Transform Supabase data to match game format
    const puzzles = data
      .filter(item => item.images && item.images.length > 0) // Only include terms with images
      .map(item => {
        // Use first image from the array
        const image = item.images[0]
        
        return {
          word: item.term.toUpperCase(),
          image: image.image_url,
          thumbnail: image.thumbnail_url,
          hint: item.clue || 'Guess the word',
          category: item.category,
          difficulty: item.difficulty || 'Classic',
          photographer: image.photographer,
          photographerUrl: image.photographer_url
        }
      })

    console.log(`Loaded ${puzzles.length} puzzles from Supabase`)
    return puzzles.length > 0 ? puzzles : getFallbackPuzzles()
    
  } catch (error) {
    console.error('Error fetching puzzles:', error)
    // Return fallback puzzles if Supabase fails
    return getFallbackPuzzles()
  }
}

// Fetch a random daily puzzle
export const fetchDailyPuzzle = async () => {
  try {
    // Get today's date as seed for consistent daily puzzle
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('search_terms')
      .select(`
        id,
        term,
        category,
        clue,
        difficulty,
        images (
          image_url,
          thumbnail_url,
          photographer,
          photographer_url
        )
      `)
      .eq('active', true)
      .limit(100)

    if (error) throw error

    // Use date as seed to pick consistent daily puzzle
    const puzzleIndex = parseInt(today.replace(/-/g, '')) % data.length
    const item = data[puzzleIndex]
    
    if (item.images && item.images.length > 0) {
      const image = item.images[0]
      return {
        word: item.term.toUpperCase(),
        image: image.image_url,
        thumbnail: image.thumbnail_url,
        hint: item.clue || 'Guess the word',
        category: item.category,
        difficulty: item.difficulty || 'Classic',
        photographer: image.photographer,
        photographerUrl: image.photographer_url
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching daily puzzle:', error)
    return null
  }
}

// Fallback puzzles if Supabase is unavailable
const getFallbackPuzzles = () => {
  console.log('Using fallback puzzles')
  return [
    { 
      word: 'ELEPHANT', 
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop', 
      hint: 'Large mammal', 
      category: 'Animals', 
      difficulty: 'Classic' 
    },
    { 
      word: 'SUNSET', 
      image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&h=600&fit=crop', 
      hint: 'End of day', 
      category: 'Nature', 
      difficulty: 'Classic' 
    },
    { 
      word: 'GUITAR', 
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop', 
      hint: 'String instrument', 
      category: 'Objects', 
      difficulty: 'Classic' 
    },
    { 
      word: 'COFFEE', 
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop', 
      hint: 'Morning drink', 
      category: 'Food', 
      difficulty: 'Classic' 
    },
    { 
      word: 'CASTLE', 
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=600&fit=crop', 
      hint: 'Medieval fortress', 
      category: 'Architecture', 
      difficulty: 'Classic' 
    }
  ]
}

// Optional: Track puzzle attempts for analytics
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
    // Silent fail - analytics not critical
    console.error('Error tracking puzzle attempt:', error)
  }
}
