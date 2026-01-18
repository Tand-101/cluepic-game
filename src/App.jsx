import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Share2, BarChart3, Settings, Zap } from 'lucide-react';

const CluepicGame = () => {
  const puzzles = [
    // Animals (10)
    { word: 'ELEPHANT', image: 'https://picsum.photos/seed/elephant/600/400', hint: 'Large mammal' },
    { word: 'TIGER', image: 'https://picsum.photos/seed/tiger/600/400', hint: 'Striped cat' },
    { word: 'DOLPHIN', image: 'https://picsum.photos/seed/dolphin/600/400', hint: 'Sea mammal' },
    { word: 'EAGLE', image: 'https://picsum.photos/seed/eagle/600/400', hint: 'Bird of prey' },
    { word: 'PENGUIN', image: 'https://picsum.photos/seed/penguin/600/400', hint: 'Antarctic bird' },
    { word: 'GIRAFFE', image: 'https://picsum.photos/seed/giraffe/600/400', hint: 'Long neck' },
    { word: 'BUTTERFLY', image: 'https://picsum.photos/seed/butterfly/600/400', hint: 'Winged insect' },
    { word: 'GORILLA', image: 'https://picsum.photos/seed/gorilla/600/400', hint: 'Great ape' },
    { word: 'ZEBRA', image: 'https://picsum.photos/seed/zebra/600/400', hint: 'Black and white' },
    { word: 'OCTOPUS', image: 'https://picsum.photos/seed/octopus/600/400', hint: 'Eight arms' },
    
    // Nature (10)
    { word: 'SUNSET', image: 'https://picsum.photos/seed/sunset/600/400', hint: 'End of day' },
    { word: 'MOUNTAIN', image: 'https://picsum.photos/seed/mountain/600/400', hint: 'Peak formation' },
    { word: 'OCEAN', image: 'https://picsum.photos/seed/ocean/600/400', hint: 'Vast water' },
    { word: 'FOREST', image: 'https://picsum.photos/seed/forest/600/400', hint: 'Many trees' },
    { word: 'RAINBOW', image: 'https://picsum.photos/seed/rainbow/600/400', hint: 'Colorful arc' },
    { word: 'WATERFALL', image: 'https://picsum.photos/seed/waterfall/600/400', hint: 'Falling water' },
    { word: 'DESERT', image: 'https://picsum.photos/seed/desert/600/400', hint: 'Dry landscape' },
    { word: 'VOLCANO', image: 'https://picsum.photos/seed/volcano/600/400', hint: 'Erupting peak' },
    { word: 'GLACIER', image: 'https://picsum.photos/seed/glacier/600/400', hint: 'Ice mass' },
    { word: 'CANYON', image: 'https://picsum.photos/seed/canyon/600/400', hint: 'Deep valley' },
    
    // Objects (10)
    { word: 'GUITAR', image: 'https://picsum.photos/seed/guitar/600/400', hint: 'String instrument' },
    { word: 'CAMERA', image: 'https://picsum.photos/seed/camera/600/400', hint: 'Takes photos' },
    { word: 'BICYCLE', image: 'https://picsum.photos/seed/bicycle/600/400', hint: 'Two wheels' },
    { word: 'UMBRELLA', image: 'https://picsum.photos/seed/umbrella/600/400', hint: 'Rain protection' },
    { word: 'TELESCOPE', image: 'https://picsum.photos/seed/telescope/600/400', hint: 'View stars' },
    { word: 'COMPASS', image: 'https://picsum.photos/seed/compass/600/400', hint: 'Shows direction' },
    { word: 'LIGHTHOUSE', image: 'https://picsum.photos/seed/lighthouse/600/400', hint: 'Coastal beacon' },
    { word: 'HOURGLASS', image: 'https://picsum.photos/seed/hourglass/600/400', hint: 'Measures time' },
    { word: 'ANCHOR', image: 'https://picsum.photos/seed/anchor/600/400', hint: 'Ship stopper' },
    { word: 'TYPEWRITER', image: 'https://picsum.photos/seed/typewriter/600/400', hint: 'Old keyboard' },
    
    // Food & Drink (10)
    { word: 'COFFEE', image: 'https://picsum.photos/seed/coffee/600/400', hint: 'Morning drink' },
    { word: 'PIZZA', image: 'https://picsum.photos/seed/pizza/600/400', hint: 'Italian dish' },
    { word: 'SUSHI', image: 'https://picsum.photos/seed/sushi/600/400', hint: 'Japanese food' },
    { word: 'BURGER', image: 'https://picsum.photos/seed/burger/600/400', hint: 'Fast food' },
    { word: 'CROISSANT', image: 'https://picsum.photos/seed/croissant/600/400', hint: 'French pastry' },
    { word: 'CHAMPAGNE', image: 'https://picsum.photos/seed/champagne/600/400', hint: 'Celebration drink' },
    { word: 'CHOCOLATE', image: 'https://picsum.photos/seed/chocolate/600/400', hint: 'Sweet treat' },
    { word: 'STRAWBERRY', image: 'https://picsum.photos/seed/strawberry/600/400', hint: 'Red berry' },
    { word: 'AVOCADO', image: 'https://picsum.photos/seed/avocado/600/400', hint: 'Green fruit' },
    { word: 'PANCAKES', image: 'https://picsum.photos/seed/pancakes/600/400', hint: 'Breakfast stack' },
    
    // Architecture (10)
    { word: 'CASTLE', image: 'https://picsum.photos/seed/castle/600/400', hint: 'Medieval fortress' },
    { word: 'PYRAMID', image: 'https://picsum.photos/seed/pyramid/600/400', hint: 'Egyptian tomb' },
    { word: 'BRIDGE', image: 'https://picsum.photos/seed/bridge/600/400', hint: 'Spans gap' },
    { word: 'CATHEDRAL', image: 'https://picsum.photos/seed/cathedral/600/400', hint: 'Grand church' },
    { word: 'SKYSCRAPER', image: 'https://picsum.photos/seed/skyscraper/600/400', hint: 'Tall building' },
    { word: 'WINDMILL', image: 'https://picsum.photos/seed/windmill/600/400', hint: 'Wind powered' },
    { word: 'PAGODA', image: 'https://picsum.photos/seed/pagoda/600/400', hint: 'Asian tower' },
    { word: 'COLOSSEUM', image: 'https://picsum.photos/seed/colosseum/600/400', hint: 'Roman arena' },
    { word: 'TEMPLE', image: 'https://picsum.photos/seed/temple/600/400', hint: 'Place of worship' },
    { word: 'FOUNTAIN', image: 'https://picsum.photos/seed/fountain/600/400', hint: 'Water feature' }
  ];

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

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctLetters, setCorrectLetters] = useState(new Set());
  const [gameState, setGameState] = useState('playing');
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userInput, setUserInput] = useState(Array(puzzles[0].word.length).fill(''));
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
  const inputRefs = useRef([]);

  const puzzle = puzzles[currentPuzzle];
  const maxAttempts = 5;
  const blurAmount = Math.max(0, 30 - (attempts * 6));

  useEffect(() => {
    setImageLoaded(false);
    setUserInput(Array(puzzle.word.length).fill(''));
    if (difficulty === 'timed') {
      setTimeRemaining(120);
      setTimerActive(true);
    }
  }, [currentPuzzle, puzzle.word.length, difficulty]);

  useEffect(() => {
    if (timerActive && timeRemaining > 0 && gameState === 'playing') {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && gameState === 'playing') {
      setGameState('lost');
    }
  }, [timerActive, timeRemaining, gameState]);

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setShowDifficultySelect(false);
    if (selectedDifficulty === 'timed') {
      setTimerActive(true);
    }
  };

  const useHint = () => {
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
      alert('Results copied!');
    }
  };

  const handleLetterInput = (e, index) => {
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
    const guessedWord = userInput.join('');
    
    if (guessedWord === puzzle.word) {
      setGameState('won');
      const pointsEarned = (maxAttempts - attempts) * 100;
      setScore(score + pointsEarned);
      setTimerActive(false);
    } else {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Settings</h2>
            <button onClick={() => setShowSettings(false)}><RotateCcw size={18} /></button>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 p-4">
              <h3 className="text-sm mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Appearance</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs">Noir Mode {!isPremium && '(Premium)'}</span>
                <button
                  onClick={() => isPremium && setNoirMode(!noirMode)}
                  className={`w-10 h-6 rounded-full ${noirMode ? 'bg-stone-800' : 'bg-stone-300'}`}
                  disabled={!isPremium}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${noirMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div className="bg-white border border-stone-200 p-4">
              <h3 className="text-sm mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Notifications</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">8am Reminder</span>
                  <button className="w-10 h-6 rounded-full bg-stone-800">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">6pm Reminder</span>
                  <button className="w-10 h-6 rounded-full bg-stone-800">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showHintShop) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Hint Shop</h2>
            <button onClick={() => setShowHintShop(false)}><RotateCcw size={18} /></button>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Premium</div>
                <div className="text-xs text-stone-600">Unlimited hints • Noir mode</div>
              </div>
              <button className="bg-amber-900 text-amber-50 px-4 py-2 text-xs">£4.99/mo</button>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { hints: 10, price: '£0.49', desc: 'Casual players' },
              { hints: 30, price: '£0.99', desc: 'Best value' },
              { hints: 150, price: '£2.99', desc: 'Never run out' }
            ].map((pack, i) => (
              <button key={i} className="w-full bg-white border border-stone-200 p-4 text-left hover:bg-stone-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{pack.hints} Hints</div>
                    <div className="text-xs text-stone-600">{pack.desc}</div>
                  </div>
                  <div className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{pack.price}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center text-xs text-stone-600">
            You have {hintsRemaining} hints remaining
          </div>
        </div>
      </div>
    );
  }

  if (showDifficultySelect) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLUEPIC</h1>
              <div className="w-12 h-px bg-stone-400 mx-auto" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowStats(true)} className="text-stone-600"><BarChart3 size={18} /></button>
              <button onClick={() => setShowSettings(true)} className="text-stone-600"><Settings size={18} /></button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-3 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-9 h-9 text-amber-700" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <div className="text-center">
              <div className="text-4xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", minWidth: '70px' }}>
                {streak}
              </div>
              <div className="text-xs text-stone-600 tracking-wider" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.1em' }}>
                DAY STREAK
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px bg-stone-300 flex-1" />
              <p className="text-stone-500 text-xs tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px', letterSpacing: '0.15em' }}>
                Free · Daily New Puzzles
              </p>
              <div className="h-px bg-stone-300 flex-1" />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => startGame('easy')}
                className="bg-stone-900 hover:bg-black text-stone-50 py-3 px-2 flex flex-col items-center justify-center gap-1"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <rect x="7" y="7" width="10" height="10" />
                </svg>
                <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLASSIC</div>
              </button>
              
              <button
                onClick={() => startGame('hard')}
                className="bg-stone-400 hover:bg-stone-500 text-stone-50 py-3 px-2 flex flex-col items-center justify-center gap-1"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <circle cx="12" cy="18" r="0.5" fill="currentColor" />
                </svg>
                <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CHALLENGE</div>
              </button>

              <button
                onClick={() => startGame('timed')}
                className="bg-white hover:bg-stone-50 text-stone-800 py-3 px-2 border border-stone-300 flex flex-col items-center justify-center gap-1"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="13" r="9" />
                  <polyline points="12 7 12 13 15 15" />
                  <path d="M9 3 h6" />
                </svg>
                <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>TIMED</div>
              </button>
            </div>
          </div>

          {/* Activated Expansion Packs */}
          {expansionPacks.filter(pack => !pack.locked).length > 0 && (
            <div className="mb-4 bg-stone-100 border border-stone-200 p-3 rounded">
              <h3 className="text-xs text-stone-600 mb-2 tracking-wider text-center" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.1em' }}>
                YOUR COLLECTION
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {expansionPacks.filter(pack => !pack.locked).map((pack, index) => (
                  <button
                    key={index}
                    className="bg-white hover:bg-stone-50 text-stone-800 font-light py-2 px-3 transition-all duration-300 border border-stone-200 relative"
                    style={{ minWidth: '100px' }}
                  >
                    <div className="absolute top-1 right-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-4 h-4 text-emerald-700" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="text-lg mb-1 grayscale">{pack.emoji}</div>
                    <div className="text-xs tracking-wider mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {pack.name}
                    </div>
                    <div className="w-full bg-stone-200 h-1 rounded-full mb-1">
                      <div 
                        className="bg-emerald-700 h-1 rounded-full transition-all" 
                        style={{ width: '33%' }}
                      />
                    </div>
                    <div className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px' }}>
                      50 / 150
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-px bg-stone-300 flex-1" />
              <p className="text-stone-500 text-xs tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px', letterSpacing: '0.15em' }}>
                Expansion Content
              </p>
              <div className="h-px bg-stone-300 flex-1" />
            </div>
            
            <div className="overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d6d3d1 transparent' }}>
              <div className="flex gap-2 pb-1" style={{ width: 'fit-content' }}>
                {expansionPacks.filter(pack => pack.locked).map((pack, index) => (
                  <button
                    key={index}
                    className="bg-white hover:bg-stone-50 text-stone-800 font-light py-2 px-3 transition-all duration-300 border border-stone-200 relative"
                    style={{ minWidth: '110px', maxWidth: '110px' }}
                  >
                    <div className="absolute top-1 right-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-stone-400">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M7 11 V7 A5 5 0 0 1 17 7 V11" />
                      </svg>
                    </div>
                    <div className="text-xl mb-1 grayscale">{pack.emoji}</div>
                    <div className="text-xs mb-1 tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {pack.name}
                    </div>
                    <div className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px' }}>
                      {pack.puzzles}× puzzles
                    </div>
                    <div className="text-xs font-medium text-stone-700 tracking-wider mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {pack.price}
                    </div>
                    {pack.requiresReview && (
                      <div className="text-xs text-amber-700 mt-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '7px' }}>
                        Review to unlock
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      `}</style>
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLUEPIC</h1>
            <p className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px' }}>
              {currentPuzzle + 1}/50 · {difficulty === 'easy' ? 'Classic' : difficulty === 'timed' ? 'Timed' : 'Challenge'}
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
              className="bg-white border border-stone-200 px-3 py-1 text-xs text-stone-800 hover:bg-stone-50"
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

        <div className="mb-4">
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
              <div className="absolute top-2 right-2 bg-stone-900 bg-opacity-80 text-stone-50 px-3 py-1 text-xs">
                {attempts + 1}/{maxAttempts}
              </div>
            )}
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="mb-3 text-center">
            <p className="text-stone-600 text-xs">{puzzle.hint}</p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-center gap-1">
            {puzzle.word.split('').map((letter, index) => (
              <div key={index} className="flex flex-col items-center">
                <input
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength="1"
                  value={userInput[index]}
                  onChange={(e) => handleLetterInput(e, index)}
                  disabled={gameState !== 'playing' || correctLetters.has(index)}
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

        {gameState === 'playing' && (
          <div className="mb-4 flex gap-2 justify-center">
            <button
              onClick={checkGuess}
              className="bg-stone-800 hover:bg-stone-900 text-stone-50 px-8 py-2 text-xs tracking-widest"
            >
              SUBMIT
            </button>
            {(hintsRemaining > 0 || isPremium) && (
              <button
                onClick={useHint}
                className="bg-amber-900 hover:bg-amber-950 text-amber-50 px-6 py-2 text-xs"
              >
                HINT
              </button>
            )}
          </div>
        )}

        {gameState !== 'playing' && (
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{gameState === 'won' ? '✓' : '—'}</div>
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
                onClick={() => setCurrentPuzzle(currentPuzzle < puzzles.length - 1 ? currentPuzzle + 1 : 0)}
                className="bg-stone-800 text-stone-50 px-8 py-2 text-xs tracking-widest"
              >
                CONTINUE
              </button>
              <button
                onClick={shareResults}
                className="bg-stone-50 border border-stone-300 text-stone-800 px-6 py-2 text-xs flex items-center gap-2"
              >
                <Share2 size={14} /> SHARE
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-stone-200 flex justify-center">
          <button
            onClick={() => setShowDifficultySelect(true)}
            className="text-stone-600 hover:text-stone-800 flex items-center gap-2 text-xs"
          >
            <RotateCcw size={14} /> RESTART
          </button>
        </div>
      </div>
    </div>
  );
};

export default CluepicGame;
