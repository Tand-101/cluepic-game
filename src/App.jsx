import React, { useState, useEffect, useRef } from 'react';
import { Home, Share2, ChevronRight } from 'lucide-react';
import { fetchPuzzlesByDifficulty, fetchDailyPuzzles, fetchArchivePuzzles } from './lib/supabase';
import { getUserId, getUserProfile, updateStreak, recordPuzzleCompletion, 
         getUserStatistics, updateHintsClues } from './lib/storage';
import { getEffectType, applyImageEffect } from './utils/imageEffects';
import DifficultySelect from './components/DifficultySelect';
import Settings from './components/Settings';
import HintShop from './components/HintShop';
import ClueShop from './components/ClueShop';
import Stats from './components/Stats';
import ExpansionPackPurchase from './components/ExpansionPackPurchase';
import PremiumPurchase from './components/PremiumPurchase';
import { supabase } from './lib/supabase';
import { DEV_MODE, isCategoryLocked } from './config/categories';

const CluepicGame = () => {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [puzzles, setPuzzles] = useState([]);
  const [dailyPuzzles, setDailyPuzzles] = useState({ Classic: [], Challenge: [], Timed: [] });
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctLetters, setCorrectLetters] = useState(new Set());
  const [gameState, setGameState] = useState('playing');
  const [difficulty, setDifficulty] = useState('easy');
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userInput, setUserInput] = useState([]);
  const [effectType, setEffectType] = useState('blur');
  const [hintsRemaining, setHintsRemaining] = useState(5);
  const [cluesRemaining, setCluesRemaining] = useState(5);
  const [clueRevealed, setClueRevealed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHintShop, setShowHintShop] = useState(false);
  const [showClueShop, setShowClueShop] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [noirMode, setNoirMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [celebrateEffect, setCelebrateEffect] = useState(false);
  const [hasArchiveAccess, setHasArchiveAccess] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [archivePuzzles, setArchivePuzzles] = useState([]);
  const [isPlayingArchive, setIsPlayingArchive] = useState(false);
         const [isPlayingDaily, setIsPlayingDaily] = useState(false);
  const [showExpansionPurchase, setShowExpansionPurchase] = useState(false);
  const [selectedExpansion, setSelectedExpansion] = useState(null);
  const [showPremiumPurchase, setShowPremiumPurchase] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userStats, setUserStats] = useState({
    total: { played: 0, won: 0, score: 0, winRate: 0 },
    classic: { played: 0, won: 0, score: 0, winRate: 0 },
    challenge: { played: 0, won: 0, score: 0, winRate: 0 },
    timed: { played: 0, won: 0, score: 0, winRate: 0 }
  });
  const [showCategoryModeSelect, setShowCategoryModeSelect] = useState(false);
const [pendingCategory, setPendingCategory] = useState(null);
  const inputRefs = useRef([]);
  const maxAttempts = 5;
  const puzzle = puzzles[currentPuzzle];

         // Initialize user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
  console.log('No user logged in - showing guest mode');
  setUserId('guest_' + Date.now());
  setTotalScore(0);
  setCurrentStreak(0);
  setHintsRemaining(5);
  setCluesRemaining(5);
  setIsPremium(false);
  setHasArchiveAccess(false);
  
  const dailies = await fetchDailyPuzzles();
  setDailyPuzzles(dailies);
  return;
}

        setUserId(user.id);

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setTotalScore(profile.total_score);
          setCurrentStreak(profile.current_streak);
          setHintsRemaining(profile.hints_remaining);
          setCluesRemaining(profile.clues_remaining);
          setIsPremium(profile.is_premium);
          setHasArchiveAccess(profile.has_archive_access || false);
          
          const newStreak = await updateStreak(user.id, profile.last_login_date);
          setCurrentStreak(newStreak);
          
          const stats = await getUserStatistics(user.id);
          setUserStats(stats);
          
          const dailies = await fetchDailyPuzzles();
          setDailyPuzzles(dailies);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setDailyPuzzles({ Classic: [], Challenge: [], Timed: [] });
      }
    };
    
    initUser();
  }, []);

  // Load puzzles when difficulty changes
useEffect(() => {
  const loadPuzzles = async () => {
    if (!difficulty) return;
    
    console.log('🔍 Loading puzzles:', { difficulty, selectedCategory, isPlayingDaily });
    
    // If playing daily mode, use the pre-loaded daily puzzles
    if (isPlayingDaily) {
      const difficultyMap = {
        'easy': 'Classic',
        'hard': 'Challenge',
        'timed': 'Timed'
      };
      const dailyKey = difficultyMap[difficulty];
      
      if (dailyPuzzles[dailyKey] && dailyPuzzles[dailyKey].length > 0) {
        console.log(`✅ Using ${dailyPuzzles[dailyKey].length} daily ${dailyKey} puzzles`);
        setPuzzles(dailyPuzzles[dailyKey]);
        setUserInput(Array(dailyPuzzles[dailyKey][0].word.length).fill(''));
        setEffectType(getEffectType(dailyPuzzles[dailyKey][0].id));
      } else {
        console.warn(`⚠️ No daily puzzles available for ${dailyKey}`);
        setPuzzles([]);
      }
      return;
    }
    
    // Otherwise fetch puzzles by difficulty and category
    const fetchedPuzzles = await fetchPuzzlesByDifficulty(difficulty, selectedCategory);
    console.log(`📦 Fetched ${fetchedPuzzles.length} puzzles for ${selectedCategory || 'all categories'}`);
    
    if (fetchedPuzzles.length === 0) {
      console.warn(`⚠️ No puzzles found for difficulty=${difficulty}, category=${selectedCategory}`);
      alert(`No puzzles available for this category yet. Coming soon!`);
      goHome();
      return;
    }
    
    setPuzzles(fetchedPuzzles);
    if (fetchedPuzzles.length > 0) {
      setUserInput(Array(fetchedPuzzles[0].word.length).fill(''));
      setEffectType(getEffectType(fetchedPuzzles[0].id));
    }
  };
  
  if (!showDifficultySelect) {
    loadPuzzles();
  }
}, [difficulty, showDifficultySelect, selectedCategory, isPlayingDaily]);

  // Reset puzzle state when changing puzzles
  useEffect(() => {
    if (puzzle) {
      setImageLoaded(false);
      setUserInput(Array(puzzle.word.length).fill(''));
      setClueRevealed(false);
      setEffectType(getEffectType(puzzle.id));
      
      if (difficulty === 'timed') {
        setTimeRemaining(120);
        setTimerActive(true);
      }
    }
  }, [currentPuzzle, puzzle?.word.length, difficulty, puzzle?.id]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeRemaining > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('lost');
    }
  }, [timerActive, timeRemaining, gameState]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 'Enter') {
        const allFilled = userInput.every((letter, i) => letter || correctLetters.has(i));
        if (allFilled) {
          checkGuess();
        }
      } else if (e.key === 'Backspace') {
        const currentIndex = document.activeElement?.getAttribute('data-index');
        if (currentIndex) {
          const idx = parseInt(currentIndex);
          if (!userInput[idx] && idx > 0) {
            let prevIndex = idx - 1;
            while (prevIndex >= 0 && correctLetters.has(prevIndex)) {
              prevIndex--;
            }
            if (prevIndex >= 0) {
              inputRefs.current[prevIndex]?.focus();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, userInput, correctLetters]);

  const startGame = (selectedDifficulty, category = null, isDailyMode = false) => {
  setDifficulty(selectedDifficulty);
  setSelectedCategory(category);
  setIsPlayingDaily(isDailyMode);
  setShowDifficultySelect(false);
  if (selectedDifficulty === 'timed') {
    setTimerActive(true);
  }
};

  // Archive Functions
  const handleArchiveClick = async () => {
    if (hasArchiveAccess) {
      const archive = await fetchArchivePuzzles(true);
      if (archive.available) {
        setArchivePuzzles(archive.puzzles);
        setShowArchive(true);
      }
    } else {
      const confirmed = window.confirm(
        'Unlock the Archive to access all previous daily puzzles!\n\n' +
        'One-time purchase: £9.99\n\n' +
        'Click OK to purchase.'
      );
      
      if (confirmed) {
        await handlePurchaseArchive();
      }
    }
  };

  const handlePurchaseArchive = async () => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ has_archive_access: true })
        .eq('user_id', userId);
      
      if (!error) {
        setHasArchiveAccess(true);
        alert('Archive unlocked! You now have access to all previous daily puzzles.');
        
        const archive = await fetchArchivePuzzles(true);
        if (archive.available) {
          setArchivePuzzles(archive.puzzles);
          setShowArchive(true);
        }
      }
    } catch (error) {
      console.error('Error purchasing archive:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const startArchiveGame = (difficulty) => {
    const filtered = archivePuzzles.filter(p => 
      p.difficulty === (difficulty === 'easy' ? 'Classic' : difficulty === 'hard' ? 'Challenge' : 'Timed')
    );
    
    if (filtered.length > 0) {
      setPuzzles(filtered);
      setDifficulty(difficulty);
      setShowArchive(false);
      setIsPlayingArchive(true);
      if (difficulty === 'timed') {
        setTimerActive(true);
      }
    }
  };

  const closeArchive = () => {
    setShowArchive(false);
  };

  // Use clue
  const useClue = () => {
    if (cluesRemaining > 0 || isPremium) {
      setClueRevealed(true);
      if (!isPremium) {
        const newClues = cluesRemaining - 1;
        setCluesRemaining(newClues);
        if (userId) {
          updateHintsClues(userId, hintsRemaining, newClues);
        }
      }
    }
  };

  const useHint = () => {
    if (!puzzle) return;
    if (hintsRemaining > 0 || isPremium) {
      const emptyIndices = [];
      for (let i = 0; i < puzzle.word.length; i++) {
        if (!correctLetters.has(i) && !userInput[i]) {
          emptyIndices.push(i);
        }
      }
      
      if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const newCorrectLetters = new Set(correctLetters);
        newCorrectLetters.add(randomIndex);
        setCorrectLetters(newCorrectLetters);
        
        const newInput = [...userInput];
        newInput[randomIndex] = puzzle.word[randomIndex];
        setUserInput(newInput);
        
        if (!isPremium) {
          const newHints = hintsRemaining - 1;
          setHintsRemaining(newHints);
          if (userId) {
            updateHintsClues(userId, newHints, cluesRemaining);
          }
        }
      }
    }
  };

         // Share results
  const shareResults = () => {
    const modeEmoji = difficulty === 'easy' ? '🟢' : difficulty === 'timed' ? '⚡' : '🔴';
    const attemptsText = gameState === 'won' ? `${attempts + 1}/${maxAttempts}` : 'X/5';
    const fillColor = gameState === 'won' ? '🟩' : '🟥';
    const squares = Array(maxAttempts).fill('⬜').fill(fillColor, 0, attempts + (gameState === 'won' ? 1 : 0));
    
    const shareText = `CLUEPIC ${modeEmoji}
${attemptsText}
${squares.join('')}
🔥 ${currentStreak} day streak`;

    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  const handleLetterInput = (e, index) => {
    if (!puzzle) return;
    const letter = e.target.value.toUpperCase().slice(-1);
    if (correctLetters.has(index)) return;
    
    const newInput = [...userInput];
    newInput[index] = letter;
    setUserInput(newInput);

    if (letter && index < puzzle.word.length - 1) {
      let nextIndex = index + 1;
      while (nextIndex < puzzle.word.length && correctLetters.has(nextIndex)) {
        nextIndex++;
      }
      if (nextIndex < puzzle.word.length) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const checkGuess = async () => {
    if (!puzzle) return;
    const guessedWord = userInput.join('');
    
    if (guessedWord === puzzle.word) {
      setGameState('won');
      const pointsEarned = (maxAttempts - attempts) * 100;
      setTotalScore(totalScore + pointsEarned);
      setTimerActive(false);
      setCelebrateEffect(true);
      setTimeout(() => setCelebrateEffect(false), 2000);
      // Track Unsplash download (required for compliance)
      if (puzzle.downloadLocation) {
        trackUnsplashDownload(puzzle.downloadLocation);
      }
      if (userId) {
        await supabase.from('puzzle_completions').insert([
          {
            user_id: userId,
            puzzle_id: puzzle.id,
            difficulty: puzzle.difficulty,
            success: true,
            attempts: attempts + 1,
            score_earned: pointsEarned,
          },
        ]);
      }
    } else {
      setShakeEffect(true);
      setTimeout(() => setShakeEffect(false), 500);

      const newCorrectLetters = new Set(correctLetters);
      
      for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === puzzle.word[i]) {
          newCorrectLetters.add(i);
        }
      }
      setCorrectLetters(newCorrectLetters);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setGameState('lost');
        setTimerActive(false);
        // Track Unsplash download (required for compliance)
        if (puzzle.downloadLocation) {
          trackUnsplashDownload(puzzle.downloadLocation);
        }
               
        if (userId) {
          await supabase.from('puzzle_completions').insert([
            {
              user_id: userId,
              puzzle_id: puzzle.id,
              difficulty: puzzle.difficulty,
              success: false,
              attempts: newAttempts,
              score_earned: 0,
            },
          ]);
        }
      } else {
        const resetInput = Array(puzzle.word.length).fill('');
        for (let i = 0; i < puzzle.word.length; i++) {
          if (newCorrectLetters.has(i)) {
            resetInput[i] = puzzle.word[i];
          }
        }
        setUserInput(resetInput);
        
        let firstEmpty = 0;
        while (firstEmpty < puzzle.word.length && newCorrectLetters.has(firstEmpty)) {
          firstEmpty++;
        }
        if (firstEmpty < puzzle.word.length) {
          setTimeout(() => inputRefs.current[firstEmpty]?.focus(), 0);
        }
      }
    }
  };

  const nextPuzzle = () => {
    const newPuzzleIndex = currentPuzzle < puzzles.length - 1 ? currentPuzzle + 1 : 0;
    setCurrentPuzzle(newPuzzleIndex);
    setAttempts(0);
    setCorrectLetters(new Set());
    setGameState('playing');
    setClueRevealed(false);
    setUserInput(Array(puzzles[newPuzzleIndex]?.word.length || 0).fill(''));
    setTimeRemaining(120);
    if (difficulty === 'timed') {
      setTimerActive(true);
    }
  };

  const goHome = () => {
  setShowDifficultySelect(true);
  setAttempts(0);
  setCorrectLetters(new Set());
  setGameState('playing');
  setTimerActive(false);
  setClueRevealed(false);
  setIsPlayingArchive(false);
  setIsPlayingDaily(false);
  setSelectedCategory(null);
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePurchasePremium = (type) => {
    alert(`Premium ${type} purchase coming soon!`);
  };

  // Handle hint/clue purchases - Preserves free starting balance
  const handleShopPurchase = async (type, pkg) => {
    if (pkg.type === 'premium') {
      setShowPremiumPurchase(true);
      setShowHintShop(false);
      setShowClueShop(false);
      return;
    }

    // TODO: Implement actual IAP here (Stripe, Apple, Google)
    console.log('Purchase:', type, pkg);
    
    // Add to existing balance (preserves free 5 hints/clues)
    if (type === 'hints' && pkg.hints) {
      const newHints = hintsRemaining + pkg.hints;
      setHintsRemaining(newHints);
      if (userId) {
        await updateHintsClues(userId, newHints, cluesRemaining);
      }
      alert(`Purchase successful! You now have ${newHints} hints.`);
      setShowHintShop(false);
    } else if (type === 'clues' && pkg.clues) {
      const newClues = cluesRemaining + pkg.clues;
      setCluesRemaining(newClues);
      if (userId) {
        await updateHintsClues(userId, hintsRemaining, newClues);
      }
      alert(`Purchase successful! You now have ${newClues} clues.`);
      setShowClueShop(false);
    }
  };

  // Handle expansion pack purchase
  const handleExpansionPurchase = async (pack) => {
    if (DEV_MODE) {
      // Dev mode: Instant unlock
      alert(`DEV MODE: Unlocked ${pack.name}!`);
      // Add to purchased packs
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          purchased_packs: [...(userProfile.purchased_packs || []), pack.category]
        })
        .eq('user_id', userId);
      
      if (!error) {
        setUserProfile({
          ...userProfile,
          purchased_packs: [...(userProfile.purchased_packs || []), pack.category]
        });
      }
      
      setShowExpansionPurchase(false);
      setSelectedExpansion(null);
      return;
    }
    
    // Production: Use IAP
    const { purchaseProduct } = await import('./lib/iapManager');
    const result = await purchaseProduct(`expansion_${pack.category.toLowerCase()}`, userId);
    
    if (result.success) {
      alert(`Purchased ${pack.name}!`);
      setShowExpansionPurchase(false);
      setSelectedExpansion(null);
    }
  };

 const handleExpansionClick = (pack) => {
  // Check if locked
  if (pack.locked && !DEV_MODE) {
    setSelectedExpansion(pack);
    setShowExpansionPurchase(true);
  } else {
    // Show mode selection screen
    setPendingCategory(pack.category);
    setShowCategoryModeSelect(true);
  }
};
  // Handle premium subscription purchase  
  const handlePremiumSubscription = async (plan) => {
    if (DEV_MODE) {
      // In dev mode, just unlock immediately
      alert(`DEV MODE: Subscribed to ${plan} plan!`);
      setIsPremium(true);
      setShowPremiumPurchase(false);
      
      if (userId) {
        await supabase
          .from('user_profiles')
          .update({ is_premium: true })
          .eq('user_id', userId);
      }
      return;
    }
    
    // TODO: Implement actual IAP here
    console.log('Purchasing premium:', plan);
    
    alert(`Subscribed to ${plan} plan!`);
    setIsPremium(true);
    setShowPremiumPurchase(false);
    // Update database
    if (userId) {
      await supabase
        .from('user_profiles')
        .update({ is_premium: true })
        .eq('user_id', userId);
    }
  };

  // Unsplash API compliance - Track photo downloads
  const trackUnsplashDownload = async (downloadLocation) => {
    if (!downloadLocation) return;
    
    try {
      // Trigger Unsplash download endpoint (required by API terms)
      // This helps photographers get paid and is mandatory
      await fetch(downloadLocation);
    } catch (error) {
      // Fail silently - don't block user experience
      console.error('Unsplash download tracking failed:', error);
    }
  };

         // Show different screens
  if (showSettings) {
    return (
      <Settings
        noirMode={noirMode}
        setNoirMode={setNoirMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isPremium={isPremium}
        onPurchasePremium={handlePurchasePremium}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  if (showHintShop) {
    return (
      <HintShop
        hintsRemaining={hintsRemaining}
        onClose={() => setShowHintShop(false)}
        onPurchase={handleShopPurchase}
      />
    );
  }

  if (showClueShop) {
    return (
      <ClueShop
        cluesRemaining={cluesRemaining}
        onClose={() => setShowClueShop(false)}
        onPurchase={handleShopPurchase}
      />
    );
  }

  // Expansion Pack Purchase Screen
  if (showExpansionPurchase && selectedExpansion) {
    return (
      <ExpansionPackPurchase
        pack={selectedExpansion}
        onClose={() => {
          setShowExpansionPurchase(false);
          setSelectedExpansion(null);
        }}
        onPurchase={handleExpansionPurchase}
      />
    );
  }

  // Premium Purchase Screen
  if (showPremiumPurchase) {
    return (
      <PremiumPurchase
        onClose={() => setShowPremiumPurchase(false)}
        onPurchase={handlePremiumSubscription}
      />
    );
  }
// Category Mode Selection Screen
if (showCategoryModeSelect && pendingCategory) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {pendingCategory.toUpperCase()}
          </h1>
          <button 
            onClick={() => {
              setShowCategoryModeSelect(false);
              setPendingCategory(null);
            }}
            className="text-stone-600 hover:text-stone-800"
          >
            ✕
          </button>
        </div>
        
        <p className="text-stone-600 text-sm mb-4 text-center">Select difficulty mode</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => {
              startGame('easy', pendingCategory, false);
              setShowCategoryModeSelect(false);
            }}
            className="bg-stone-900 hover:bg-black text-stone-50 py-4 px-2 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <rect x="7" y="7" width="10" height="10" />
            </svg>
            <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLASSIC</div>
          </button>
          
          <button
            onClick={() => {
              startGame('hard', pendingCategory, false);
              setShowCategoryModeSelect(false);
            }}
            className="bg-stone-400 hover:bg-stone-500 text-stone-50 py-4 px-2 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="18" r="0.5" fill="currentColor" />
            </svg>
            <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CHALLENGE</div>
          </button>

          <button
            onClick={() => {
              startGame('timed', pendingCategory, false);
              setShowCategoryModeSelect(false);
            }}
            className="bg-white hover:bg-stone-50 text-stone-800 py-4 px-2 border border-stone-300 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="9" />
              <polyline points="12 7 12 13 15 15" />
              <path d="M9 3 h6" />
            </svg>
            <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>TIMED</div>
          </button>
        </div>

        <button
          onClick={() => {
            setShowCategoryModeSelect(false);
            setPendingCategory(null);
          }}
          className="w-full bg-stone-800 text-stone-50 py-2 text-xs tracking-widest hover:bg-stone-900 transition-colors"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
  if (showDifficultySelect) {
    return (
      <DifficultySelect
        currentStreak={currentStreak}
        expansionPacks={[]}
        startGame={startGame}
        onArchiveClick={handleArchiveClick}
        hasArchiveAccess={hasArchiveAccess}
        onExpansionClick={handleExpansionClick}
        setShowStats={setShowStats}
        setShowSettings={setShowSettings}
      />
    );
  }

  // Archive View
  if (showArchive) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              DAILY ARCHIVE
            </h1>
            <button 
              onClick={closeArchive}
              className="text-stone-600 hover:text-stone-800"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4 text-center">
            <p className="text-stone-600 text-sm mb-4">
              Play previous daily puzzles anytime
            </p>
            <div className="text-xs text-stone-500 mb-4">
              {archivePuzzles.length} puzzles available
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => startArchiveGame('easy')}
              className="bg-stone-900 hover:bg-black text-stone-50 py-4 px-2 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className="text-xs tracking-wider mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                CLASSIC
              </div>
              <div className="text-xs text-stone-400">
                {archivePuzzles.filter(p => p.difficulty === 'Classic').length} puzzles
              </div>
            </button>
            
            <button
              onClick={() => startArchiveGame('hard')}
              className="bg-stone-400 hover:bg-stone-500 text-stone-50 py-4 px-2 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className="text-xs tracking-wider mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                CHALLENGE
              </div>
              <div className="text-xs text-stone-300">
                {archivePuzzles.filter(p => p.difficulty === 'Challenge').length} puzzles
              </div>
            </button>

            <button
              onClick={() => startArchiveGame('timed')}
              className="bg-white hover:bg-stone-50 text-stone-800 py-4 px-2 border border-stone-300 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className="text-xs tracking-wider mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                TIMED
              </div>
              <div className="text-xs text-stone-500">
                {archivePuzzles.filter(p => p.difficulty === 'Timed').length} puzzles
              </div>
            </button>
          </div>

          <button
            onClick={closeArchive}
            className="w-full bg-stone-800 text-stone-50 py-2 text-xs tracking-widest hover:bg-stone-900 transition-colors"
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!puzzle) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600 text-lg">Loading puzzles...</div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLUEPIC</h1>
            <p className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>
              {currentPuzzle + 1}/{puzzles.length} · {difficulty === 'easy' ? 'Classic' : difficulty === 'timed' ? 'Timed' : 'Challenge'}
              {isPlayingArchive && ' · Archive'}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {difficulty === 'timed' && timerActive && (
              <div className="text-lg font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {formatTime(timeRemaining)}
              </div>
            )}
            <button 
              onClick={() => setShowClueShop(true)}
              className={`relative bg-white border border-stone-200 px-3 py-1 text-xs text-stone-800 hover:bg-stone-50 transition-colors ${
                cluesRemaining === 0 ? 'pr-7' : ''
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {cluesRemaining} Clues
              {cluesRemaining === 0 && (
                <div className="absolute top-0 right-0 w-5 h-5 bg-stone-400 rounded-bl flex items-center justify-center text-xs">
                  💰
                </div>
              )}
            </button>
            <button 
              onClick={() => setShowHintShop(true)}
              className={`relative bg-white border border-stone-200 px-3 py-1 text-xs text-stone-800 hover:bg-stone-50 transition-colors ${
                hintsRemaining === 0 ? 'pr-7' : ''
              }`}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {hintsRemaining} Hints
              {hintsRemaining === 0 && (
                <div className="absolute top-0 right-0 w-5 h-5 bg-stone-400 rounded-bl flex items-center justify-center text-xs">
                  💰
                </div>
              )}
            </button>
            <div className="text-right">
              <div className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{totalScore}</div>
              <div className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>Points</div>
            </div>
          </div>
        </div>

        {/* Image with effects */}
        <div className={`mb-4 ${shakeEffect ? 'shake' : ''}`}>
          <div className="relative bg-stone-200 overflow-hidden rounded" style={{ paddingBottom: '75%', filter: noirMode ? 'grayscale(100%)' : 'none' }}>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-stone-400 text-xs">Loading...</div>
              </div>
            )}
            <img
              src={puzzle.image}
              alt="Puzzle"
              onLoad={() => setImageLoaded(true)}
              crossOrigin="anonymous"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
              style={{
                filter: gameState === 'playing' ? applyImageEffect(effectType, attempts + 1) : 'none',
                opacity: imageLoaded ? 1 : 0
              }}
            />
            
            {/* Attempt counter - only during play */}
            {gameState === 'playing' && (
              <div className="absolute top-2 right-2 bg-stone-900 bg-opacity-80 text-stone-50 px-3 py-1 text-xs rounded">
                {attempts + 1}/{maxAttempts}
              </div>
            )}
            
            {/* Unsplash Attribution - shows after reveal */}
            {gameState !== 'playing' && puzzle.photographer && (
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-95 px-2 py-1.5 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span className="text-stone-700">Photo by </span>
                <a 
                  href={`${puzzle.photographerUrl}?utm_source=cluepic&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-900 underline hover:text-stone-600 transition-colors"
                >
                  {puzzle.photographer}
                </a>
                <span className="text-stone-700"> on </span>
                <a 
                  href="https://unsplash.com?utm_source=cluepic&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-900 underline hover:text-stone-600 transition-colors"
                >
                  Unsplash
                </a>
              </div>
            )}
          </div>
        </div>

       {/* Clue display - Shows from attempt 3 */}
{gameState === 'playing' && (clueRevealed || attempts >= 2) && (
  <div className="mb-3 text-center animate-fadeIn">
    <p className="text-stone-600 text-xs">{puzzle.hint}</p>
  </div>
)}

        {/* Letter input */}
        <div className="mb-4">
          <div className="flex justify-center gap-1 flex-wrap">
            {puzzle.word.split('').map((letter, index) => (
              <div key={index} className="flex flex-col items-center">
                <input
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={userInput[index] || ''}
                  onChange={(e) => handleLetterInput(e, index)}
                  disabled={gameState !== 'playing' || correctLetters.has(index)}
                  data-index={index}
                  className={`w-8 h-10 text-center border-b-2 text-lg font-light uppercase focus:outline-none transition-colors ${
                    correctLetters.has(index) ? 'border-stone-400 bg-stone-100 text-stone-500' : 'border-stone-400 bg-white text-stone-800'
                  }`}
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                />
                {correctLetters.has(index) && gameState === 'playing' && (
                  <div className="text-stone-400 mt-1 animate-fadeIn" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px' }}>
                    hint
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        {gameState === 'playing' && (
          <div className="mb-4 flex gap-2 justify-center">
            <button
              onClick={checkGuess}
              className="bg-stone-800 hover:bg-stone-900 text-stone-50 px-8 py-2 text-xs tracking-widest transition-colors"
            >
              SUBMIT
            </button>
            {(hintsRemaining > 0 || isPremium) && (
              <button
                onClick={useHint}
                className="bg-amber-900 hover:bg-amber-950 text-amber-50 px-6 py-2 text-xs transition-colors"
              >
                HINT
              </button>
            )}
            {!clueRevealed && (cluesRemaining > 0 || isPremium) && (
              <button
                onClick={useClue}
                className="bg-blue-900 hover:bg-blue-950 text-blue-50 px-6 py-2 text-xs transition-colors"
              >
                CLUE
              </button>
            )}
          </div>
        )}

        {/* End game state */}
        {gameState !== 'playing' && (
          <div className="text-center mb-4">
            <div className={`text-4xl mb-2 ${celebrateEffect ? 'animate-fadeIn' : ''}`}>
              {gameState === 'won' ? '✓' : '—'}
            </div>
            <div className="text-xl font-light mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {gameState === 'won' ? 'Impeccable' : 'Revealed'}
            </div>
            {gameState === 'won' ? (
              <div className="text-stone-600 mb-3 text-xs">{(maxAttempts - attempts) * 100} points</div>
            ) : (
              <div className="text-stone-600 mb-3 text-xs">{puzzle.word}</div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                onClick={nextPuzzle}
                className="bg-stone-800 text-stone-50 px-8 py-2 text-xs tracking-widest hover:bg-stone-900 transition-colors"
              >
                NEXT PUZZLE
              </button>
              <button
                onClick={shareResults}
                className="bg-stone-50 border border-stone-300 text-stone-800 px-6 py-2 text-xs flex items-center gap-2 hover:bg-stone-100 transition-colors"
              >
                <Share2 size={14} /> SHARE
              </button>
            </div>
          </div>
        )}

        {/* Skip & Home buttons */}
        <div className="pt-3 border-t border-stone-200 flex justify-center gap-4">
          <button
            onClick={nextPuzzle}
            className="text-stone-600 hover:text-stone-800 flex items-center gap-2 text-xs transition-colors"
          >
            <ChevronRight size={14} /> SKIP
          </button>
          <button
            onClick={goHome}
            className="text-stone-600 hover:text-stone-800 flex items-center gap-2 text-xs transition-colors"
          >
            <Home size={14} /> HOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default CluepicGame;
