import React, { useState, useEffect, useRef } from 'react';
import { Home, Share2, ChevronRight } from 'lucide-react';
import { fetchPuzzlesByDifficulty, fetchDailyPuzzles } from './lib/supabase';
import { getUserId, getUserProfile, updateStreak, recordPuzzleCompletion, 
         getUserStatistics, updateHintsClues } from './lib/storage';
import { getEffectType, applyImageEffect } from './utils/imageEffects';
import DifficultySelect from './components/DifficultySelect';
import Settings from './components/Settings';
import HintShop from './components/HintShop';
import ClueShop from './components/ClueShop';
import Stats from './components/Stats';
import { supabase } from './lib/supabase'  // your Supabase client

const CluepicGame = () => {
  // User & Profile State
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  // Puzzle State - Amendment 3: Different puzzles per difficulty
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
  
  // Amendment 5: Image effects
  const [effectType, setEffectType] = useState('blur');
  
  // Hints & Clues - Amendment 7
  const [hintsRemaining, setHintsRemaining] = useState(5);
  const [cluesRemaining, setCluesRemaining] = useState(5);
  const [clueRevealed, setClueRevealed] = useState(false);
  
  // Timer State
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  
  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHintShop, setShowHintShop] = useState(false);
  const [showClueShop, setShowClueShop] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [noirMode, setNoirMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [celebrateEffect, setCelebrateEffect] = useState(false);
  
  // Stats - Amendment 11, 16
  const [userStats, setUserStats] = useState({
    total: { played: 0, won: 0, score: 0, winRate: 0 },
    classic: { played: 0, won: 0, score: 0, winRate: 0 },
    challenge: { played: 0, won: 0, score: 0, winRate: 0 },
    timed: { played: 0, won: 0, score: 0, winRate: 0 }
  });
  
  const inputRefs = useRef([]);
  const maxAttempts = 5;
  
  const puzzle = puzzles[currentPuzzle];

  // Initialize user on mount
  useEffect(() => {
  const initUser = async () => {
    // Step 10: Get logged-in Supabase user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return;

    setUserId(user.id);

    // Step 10: Fetch profile from Supabase
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
      setTotalScore(profile.total_score);
      setCurrentStreak(profile.current_streak);
      setLongestStreak(profile.longest_streak);
      setHintsRemaining(profile.hints_remaining);
      setCluesRemaining(profile.clues_remaining);
      setIsPremium(profile.is_premium);
    }
      
      // Update streak
      const newStreak = await updateStreak(id, profile.last_login_date);
      setCurrentStreak(newStreak);
      
      // Load stats
      const stats = await getUserStatistics(id);
      setUserStats(stats);
      
      // Load daily puzzles - Amendment 8
      const dailies = await fetchDailyPuzzles();
      setDailyPuzzles(dailies);
    };
    
    initUser();
  }, []);

  // Load puzzles when difficulty changes - Amendment 3
  useEffect(() => {
    const loadPuzzles = async () => {
      if (difficulty) {
        const fetchedPuzzles = await fetchPuzzlesByDifficulty(difficulty);
        setPuzzles(fetchedPuzzles);
        
        if (fetchedPuzzles.length > 0) {
          setUserInput(Array(fetchedPuzzles[0].word.length).fill(''));
          // Amendment 5: Set effect type based on puzzle ID
          setEffectType(getEffectType(fetchedPuzzles[0].id));
        }
      }
    };
    
    if (!showDifficultySelect) {
      loadPuzzles();
    }
  }, [difficulty, showDifficultySelect]);

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

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setShowDifficultySelect(false);
    if (selectedDifficulty === 'timed') {
      setTimerActive(true);
    }
  };

  // Amendment 7: Use clue
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
 // Step 10: Save puzzle completion to Supabase
const recordPuzzleCompletion = async ({ puzzleId, difficulty, success, attempts, scoreEarned }) => {
  if (!userId) return;

  await supabase.from('puzzle_completions').insert([
    {
      user_id: userId,
      puzzle_id: puzzleId,
      difficulty,
      success,
      attempts,
      score_earned: scoreEarned,
    },
  ]);
};     
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

  // Amendment 13: Red boxes for failed puzzles
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

  const checkGuess = () => {
    if (!puzzle) return;
    const guessedWord = userInput.join('');
    
    if (guessedWord === puzzle.word) {
      setGameState('won');
      const pointsEarned = (maxAttempts - attempts) * 100;
      setTotalScore(totalScore + pointsEarned);
      setTimerActive(false);
      setCelebrateEffect(true);
      setTimeout(() => setCelebrateEffect(false), 2000);
      
      // Record completion
      if (userId) {
        recordPuzzleCompletion(userId, {
          puzzleId: puzzle.id,
          difficulty: puzzle.difficulty,
          success: true,
          attempts: attempts + 1,
          scoreEarned: pointsEarned
        });
      }
    } else {
      setShakeEffect(true);
      setTimeout(() => setShakeEffect(false), 500);

      const newCorrectLetters = new Set(correctLetters);
      
      // Amendment 6: Hints populate from attempt 1 if correct
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
        
        // Record failed attempt
        if (userId) {
          recordPuzzleCompletion(userId, {
            puzzleId: puzzle.id,
            difficulty: puzzle.difficulty,
            success: false,
            attempts: newAttempts,
            scoreEarned: 0
          });
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

  // Amendment 3: Independent puzzles - reset all state
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
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Amendment 18: Purchase premium
  const handlePurchasePremium = (type) => {
    // TODO: Implement actual in-app purchase
    alert(`Premium ${type} purchase coming soon!`);
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
        noirMode={noirMode}
        onClose={() => setShowHintShop(false)}
      />
    );
  }

  // Amendment 7: Clue shop
  if (showClueShop) {
    return (
      <ClueShop
        cluesRemaining={cluesRemaining}
        noirMode={noirMode}
        onClose={() => setShowClueShop(false)}
      />
    );
  }

  if (showStats) {
    return (
      <Stats
        totalScore={totalScore}
        currentStreak={currentStreak}
        winRate={userStats.total.winRate}
        classicStats={userStats.classic}
        challengeStats={userStats.challenge}
        timedStats={userStats.timed}
        noirMode={noirMode}
        onClose={() => setShowStats(false)}
      />
    );
  }

  if (showDifficultySelect) {
    return (
      <DifficultySelect
        currentStreak={currentStreak}
        expansionPacks={[]}
        startGame={startGame}
        setShowStats={setShowStats}
        setShowSettings={setShowSettings}
      />
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
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {difficulty === 'timed' && timerActive && (
              <div className="text-lg font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {formatTime(timeRemaining)}
              </div>
            )}
            {/* Amendment 7: Clue button */}
            <button 
              onClick={() => setShowClueShop(true)}
              className="bg-white border border-stone-200 px-3 py-1 text-xs text-stone-800 hover:bg-stone-50 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {cluesRemaining} Clues
            </button>
            <button 
              onClick={() => setShowHintShop(true)}
              className="bg-white border border-stone-200 px-3 py-1 text-xs text-stone-800 hover:bg-stone-50 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {hintsRemaining} Hints
            </button>
            <div className="text-right">
              <div className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{totalScore}</div>
              <div className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>Points</div>
            </div>
          </div>
        </div>

        {/* Amendment 5: Image with effects */}
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
            {gameState === 'playing' && (
              <div className="absolute top-2 right-2 bg-stone-900 bg-opacity-80 text-stone-50 px-3 py-1 text-xs rounded">
                {attempts + 1}/{maxAttempts}
              </div>
            )}
          </div>
        </div>

        {/* Amendment 7: Show hint if clue revealed or after attempt 3 */}
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
            {/* Amendment 7: Clue button in game */}
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
              {/* Amendment 2: "Next Puzzle" button */}
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

        {/* Amendment 1: Skip & Home buttons */}
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
