// src/App.jsx (Part 1 of 2)
// PASTE THIS ENTIRE FILE, THEN CONTINUE WITH PART 2

import React, { useState, useEffect, useRef } from 'react';
import { Home, Share2 } from 'lucide-react';
import { fetchPuzzles } from './lib/supabase';
import DifficultySelect from './components/DifficultySelect';
import Settings from './components/Settings';
import HintShop from './components/HintShop';
import Stats from './components/Stats';

const CluepicGame = () => {
  const expansionPacks = [
    { name: 'Library', price: 'Free with Review', puzzles: '150', emoji: '📚', locked: false, requiresReview: true },
    { name: 'Halloween', price: '£2.99', puzzles: '150', emoji: '🎃', locked: true, requiresReview: false },
    { name: 'Animals', price: '£2.99', puzzles: '150', emoji: '🦁', locked: true, requiresReview: false },
    { name: 'Professions', price: '£2.99', puzzles: '150', emoji: '👨‍⚕️', locked: true, requiresReview: false },
    { name: 'Travel', price: '£2.99', puzzles: '150', emoji: '✈️', locked: true, requiresReview: false },
    { name: 'Food', price: '£2.99', puzzles: '150', emoji: '🍕', locked: false, requiresReview: false },
    { name: 'Sports', price: '£2.99', puzzles: '150', emoji: '⚽', locked: true, requiresReview: false },
    { name: 'Nature', price: '£2.99', puzzles: '150', emoji: '🌲', locked: true, requiresReview: false },
    { name: 'Music', price: '£2.99', puzzles: '150', emoji: '🎵', locked: true, requiresReview: false }
  ];

  // State management
  const [puzzles, setPuzzles] = useState([]);
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctLetters, setCorrectLetters] = useState(new Set());
  const [gameState, setGameState] = useState('playing');
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userInput, setUserInput] = useState([]);
  const [streak, setStreak] = useState(3);
  const [hintsRemaining, setHintsRemaining] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [timerActive, setTimerActive] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHintShop, setShowHintShop] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [noirMode, setNoirMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [celebrateEffect, setCelebrateEffect] = useState(false);
  const inputRefs = useRef([]);

  const maxAttempts = 5;
  
  // Load puzzles from Supabase on mount
  useEffect(() => {
    const loadPuzzles = async () => {
      const fetchedPuzzles = await fetchPuzzles();
      setPuzzles(fetchedPuzzles);
      setUserInput(Array(fetchedPuzzles[0]?.word.length || 0).fill(''));
    };
    loadPuzzles();
  }, []);

  const puzzle = puzzles[currentPuzzle];
  const blurAmount = puzzle ? Math.max(0, 30 - (attempts * 6)) : 30;

  // Reset puzzle state when changing puzzles
  useEffect(() => {
    if (puzzle) {
      setImageLoaded(false);
      setUserInput(Array(puzzle.word.length).fill(''));
      if (difficulty === 'timed') {
        setTimeRemaining(120);
        setTimerActive(true);
      }
    }
  }, [currentPuzzle, puzzle?.word.length, difficulty]);

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
          setHintsRemaining(hintsRemaining - 1);
        }
      }
    }
  };

  const shareResults = () => {
    const modeEmoji = difficulty === 'easy' ? '🟢' : difficulty === 'timed' ? '⚡' : '🔴';
    const attemptsText = gameState === 'won' ? `${attempts + 1}/${maxAttempts}` : 'X/5';
    const squares = Array(maxAttempts).fill('⬜').fill('🟩', 0, attempts + (gameState === 'won' ? 1 : 0));
    
    const shareText = `CLUEPIC ${modeEmoji}
${attemptsText}
${squares.join('')}
🔥 ${streak} day streak`;

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
      setScore(score + pointsEarned);
      setTimerActive(false);
      setCelebrateEffect(true);
      setTimeout(() => setCelebrateEffect(false), 2000);
    } else {
      setShakeEffect(true);
      setTimeout(() => setShakeEffect(false), 500);

      const newCorrectLetters = new Set(correctLetters);
      
      if (difficulty === 'easy' && attempts >= 2) {
        for (let i = 0; i < userInput.length; i++) {
          if (userInput[i] === puzzle.word[i]) {
            newCorrectLetters.add(i);
          }
        }
        setCorrectLetters(newCorrectLetters);
      }
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        setGameState('lost');
        setTimerActive(false);
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

  // CHANGE #3: Independent puzzles - reset all state
  const nextPuzzle = () => {
    const newPuzzleIndex = currentPuzzle < puzzles.length - 1 ? currentPuzzle + 1 : 0;
    setCurrentPuzzle(newPuzzleIndex);
    setAttempts(0); // Reset attempts
    setCorrectLetters(new Set()); // Reset hints
    setGameState('playing'); // Reset game state
    setUserInput(Array(puzzles[newPuzzleIndex]?.word.length || 0).fill('')); // Reset input
    setTimeRemaining(120); // Reset timer
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
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (showStats) {
    return (
      <Stats
        score={score}
        streak={streak}
        noirMode={noirMode}
        onClose={() => setShowStats(false)}
      />
    );
  }

  if (showDifficultySelect) {
    return (
      <DifficultySelect
        streak={streak}
        expansionPacks={expansionPacks}
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
            <button 
              onClick={() => setShowHintShop(true)}
              className="bg-white border border-stone-200 px-3 py-1 text-xs text-stone-800 hover:bg-stone-50 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {hintsRemaining} Hints
            </button>
            <div className="text-right">
              <div className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{score}</div>
              <div className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>Points</div>
            </div>
          </div>
        </div>

        {/* Image */}
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
                filter: gameState === 'playing' ? `blur(${blurAmount}px)` : 'blur(0px)',
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

        {/* CHANGE #5: Show hint only after attempt 3 */}
        {gameState === 'playing' && attempts >= 2 && (
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
                    clue
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
              {/* CHANGE #2: "Continue" → "Next Puzzle" */}
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

        {/* CHANGE #1: "Restart" → "Home" with house icon */}
        <div className="pt-3 border-t border-stone-200 flex justify-center">
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
