// src/lib/storage.js
// Supabase user data management for amendments 8, 11, 15

import { supabase } from './supabase'

// Get or create user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create new profile
      return await createUserProfile(userId)
    }

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting user profile:', error)
    return getDefaultProfile(userId)
  }
}

// Create new user profile
const createUserProfile = async (userId) => {
  const profile = {
    user_id: userId,
    total_score: 0,
    current_streak: 0,
    longest_streak: 0,
    last_login_date: new Date().toISOString().split('T')[0],
    hints_remaining: 5,
    clues_remaining: 5,
    is_premium: false,
    purchased_packs: ['Free App Review'],
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating user profile:', error)
    return getDefaultProfile(userId)
  }
}

// Default profile if Supabase fails
const getDefaultProfile = (userId) => ({
  user_id: userId,
  total_score: 0,
  current_streak: 0,
  longest_streak: 0,
  last_login_date: new Date().toISOString().split('T')[0],
  hints_remaining: 5,
  clues_remaining: 5,
  is_premium: false,
  purchased_packs: ['Free App Review']
})

// Update user streak (Amendment 11, 15)
export const updateStreak = async (userId, lastLoginDate) => {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  try {
    const profile = await getUserProfile(userId)
    
    let newStreak = profile.current_streak
    
    if (lastLoginDate === yesterday) {
      // Consecutive day
      newStreak = profile.current_streak + 1
    } else if (lastLoginDate === today) {
      // Same day, no change
      newStreak = profile.current_streak
    } else {
      // Streak broken
      newStreak = 1
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, profile.longest_streak),
        last_login_date: today
      })
      .eq('user_id', userId)

    if (error) throw error
    return newStreak
  } catch (error) {
    console.error('Error updating streak:', error)
    return 0
  }
}

// Record puzzle completion (Amendment 11)
export const recordPuzzleCompletion = async (userId, puzzleData) => {
  try {
    const { error } = await supabase
      .from('puzzle_completions')
      .insert({
        user_id: userId,
        puzzle_id: puzzleData.puzzleId,
        difficulty: puzzleData.difficulty,
        success: puzzleData.success,
        attempts: puzzleData.attempts,
        score_earned: puzzleData.scoreEarned,
        completed_at: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      })

    if (error) throw error

    // Update total score
    if (puzzleData.success) {
      await updateTotalScore(userId, puzzleData.scoreEarned)
    }
  } catch (error) {
    console.error('Error recording puzzle completion:', error)
  }
}

// Update total score
export const updateTotalScore = async (userId, scoreToAdd) => {
  try {
    const profile = await getUserProfile(userId)
    const newScore = profile.total_score + scoreToAdd

    const { error } = await supabase
      .from('user_profiles')
      .update({ total_score: newScore })
      .eq('user_id', userId)

    if (error) throw error
    return newScore
  } catch (error) {
    console.error('Error updating total score:', error)
    return 0
  }
}

// Get user statistics (Amendment 11, 16)
export const getUserStatistics = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('puzzle_completions')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    const stats = {
      total: { played: 0, won: 0, score: 0, winRate: 0 },
      classic: { played: 0, won: 0, score: 0, winRate: 0 },
      challenge: { played: 0, won: 0, score: 0, winRate: 0 },
      timed: { played: 0, won: 0, score: 0, winRate: 0 }
    }

    data.forEach(completion => {
      const difficulty = completion.difficulty.toLowerCase()
      
      // Total stats
      stats.total.played++
      if (completion.success) {
        stats.total.won++
        stats.total.score += completion.score_earned
      }

      // Difficulty stats
      if (stats[difficulty]) {
        stats[difficulty].played++
        if (completion.success) {
          stats[difficulty].won++
          stats[difficulty].score += completion.score_earned
        }
      }
    })

    // Calculate win rates
    stats.total.winRate = stats.total.played > 0 
      ? Math.round((stats.total.won / stats.total.played) * 100) 
      : 0

    Object.keys(stats).forEach(key => {
      if (key !== 'total' && stats[key].played > 0) {
        stats[key].winRate = Math.round((stats[key].won / stats[key].played) * 100)
      }
    })

    return stats
  } catch (error) {
    console.error('Error getting user statistics:', error)
    return {
      total: { played: 0, won: 0, score: 0, winRate: 0 },
      classic: { played: 0, won: 0, score: 0, winRate: 0 },
      challenge: { played: 0, won: 0, score: 0, winRate: 0 },
      timed: { played: 0, won: 0, score: 0, winRate: 0 }
    }
  }
}

// Check if daily puzzles completed (Amendment 8)
export const getDailyCompletionStatus = async (userId) => {
  const today = new Date().toISOString().split('T')[0]

  try {
    const { data, error } = await supabase
      .from('puzzle_completions')
      .select('difficulty')
      .eq('user_id', userId)
      .eq('date', today)

    if (error) throw error

    const classicCount = data.filter(d => d.difficulty === 'Classic').length
    const challengeCount = data.filter(d => d.difficulty === 'Challenge').length
    const timedCount = data.filter(d => d.difficulty === 'Timed').length

    return {
      classicComplete: classicCount >= 3,
      challengeComplete: challengeCount >= 3,
      timedComplete: timedCount >= 3,
      allComplete: classicCount >= 3 && challengeCount >= 3 && timedCount >= 3
    }
  } catch (error) {
    console.error('Error checking daily completion:', error)
    return {
      classicComplete: false,
      challengeComplete: false,
      timedComplete: false,
      allComplete: false
    }
  }
}

// Update hints/clues
export const updateHintsClues = async (userId, hints, clues) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        hints_remaining: hints,
        clues_remaining: clues
      })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating hints/clues:', error)
  }
}

// Purchase pack
export const purchasePack = async (userId, packName) => {
  try {
    const profile = await getUserProfile(userId)
    const updatedPacks = [...profile.purchased_packs, packName]

    const { error } = await supabase
      .from('user_profiles')
      .update({ purchased_packs: updatedPacks })
      .eq('user_id', userId)

    if (error) throw error
    return updatedPacks
  } catch (error) {
    console.error('Error purchasing pack:', error)
    return []
  }
}

// Generate or get user ID (simple approach using localStorage + Supabase)
export const getUserId = () => {
  let userId = localStorage.getItem('cluepic_user_id')
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('cluepic_user_id', userId)
  }
  
  return userId
}
