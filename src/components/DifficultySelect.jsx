// src/components/DifficultySelect.jsx
// Amendment 3: Added Archive tile for previous daily puzzles

import React from 'react';
import { BarChart3, Settings, Archive } from 'lucide-react';

const DifficultySelect = ({ 
  currentStreak,
  expansionPacks, 
  startGame,
  onExpansionClick,  // NEW - handles clicking expansion tiles
  setShowStats, 
  setShowSettings 
}) => {
  
  const defaultExpansionPacks = [
    { name: 'Free App Review', price: 'Free with Review', emoji: '📚', locked: false, requiresReview: true },
    { name: 'Food', price: '£2.99', emoji: '🍕', locked: false, requiresReview: false },
    { name: 'Halloween', price: '£2.99', emoji: '🎃', locked: true, requiresReview: false },
    { name: 'Animals', price: '£2.99', emoji: '🦁', locked: true, requiresReview: false },
    { name: 'Professions', price: '£2.99', emoji: '👨‍⚕️', locked: true, requiresReview: false },
    { name: 'Travel', price: '£2.99', emoji: '✈️', locked: true, requiresReview: false },
    { name: 'Sports', price: '£2.99', emoji: '⚽', locked: true, requiresReview: false },
    { name: 'Nature', price: '£2.99', emoji: '🌲', locked: true, requiresReview: false },
    { name: 'Music', price: '£2.99', emoji: '🎵', locked: true, requiresReview: false }
  ];

  const packs = expansionPacks && expansionPacks.length > 0 ? expansionPacks : defaultExpansionPacks;

  const handleArchiveClick = () => {
    if (hasArchiveAccess) {
      onArchiveClick?.();
    } else {
      // Show purchase prompt
      alert('Unlock the Archive to access all previous daily puzzles! £9.99 one-time purchase.');
      // TODO: Implement actual purchase flow
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLUEPIC</h1>
            <div className="w-12 h-px bg-stone-400 mx-auto" />
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setShowStats(true)} className="text-stone-600 hover:text-stone-900 transition-colors">
              <BarChart3 size={18} />
            </button>
            <button onClick={() => setShowSettings(true)} className="text-stone-600 hover:text-stone-900 transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-9 h-9 text-amber-700" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <div className="text-center">
            <div className="text-4xl font-light mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", minWidth: '70px' }}>
              {currentStreak}
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
              className="bg-stone-900 hover:bg-black text-stone-50 py-3 px-2 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <rect x="7" y="7" width="10" height="10" />
              </svg>
              <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CLASSIC</div>
            </button>
            
            <button
              onClick={() => startGame('hard')}
              className="bg-stone-400 hover:bg-stone-500 text-stone-50 py-3 px-2 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <circle cx="12" cy="18" r="0.5" fill="currentColor" />
              </svg>
              <div className="text-xs tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CHALLENGE</div>
            </button>

            <button
              onClick={() => startGame('timed')}
              className="bg-white hover:bg-stone-50 text-stone-800 py-3 px-2 border border-stone-300 flex flex-col items-center justify-center gap-1 transition-colors"
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

        {/* Your Collection - Amendment 3: Added Archive tile */}
        <div className="mb-4 bg-stone-100 border border-stone-200 p-3 rounded">
          <h3 className="text-xs text-stone-600 mb-2 tracking-wider text-center" style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', letterSpacing: '0.1em' }}>
            YOUR COLLECTION
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Archive tile */}
            <button
              onClick={handleArchiveClick}
              className={`${
                hasArchiveAccess 
                  ? 'bg-white hover:bg-stone-50 border-stone-200' 
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200'
              } text-stone-800 font-light py-2 px-3 transition-all duration-300 border relative`}
              style={{ minWidth: '100px' }}
            >
              {hasArchiveAccess ? (
                <div className="absolute top-1 right-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-4 h-4 text-emerald-700" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div className="absolute top-1 right-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 text-amber-600">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M7 11 V7 A5 5 0 0 1 17 7 V11" />
                  </svg>
                </div>
              )}
              <div className="text-lg mb-1">📦</div>
              <div className="text-xs tracking-wider mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Archive
              </div>
              <div className="text-xs text-stone-500 mb-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px' }}>
                All Previous Dailies
              </div>
              {!hasArchiveAccess && (
                <div className="text-xs font-medium text-amber-700 tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                  £9.99
                </div>
              )}
            </button>

            {/* Owned packs */}
       {packs.filter(pack => pack.locked).map((pack, index) => (
  <button
    key={index}
    onClick={() => onExpansionClick(pack)}  // NEW - opens purchase page
    className="bg-white hover:bg-stone-50 text-stone-800 font-light py-2 px-3 transition-all duration-300 border border-stone-200 relative flex-shrink-0"
    style={{ width: 'calc((100vw - 4rem) / 3.5)', minWidth: '100px', maxWidth: '110px' }}
  >
                <div className="absolute top-1 right-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-4 h-4 text-emerald-700" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="text-lg mb-1">{pack.emoji}</div>
                <div className="text-xs tracking-wider mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {pack.name}
                </div>
                <div className="w-full bg-stone-200 h-1 rounded-full mb-1">
                  <div className="bg-emerald-700 h-1 rounded-full transition-all" style={{ width: '33%' }} />
                </div>
                <div className="text-xs text-stone-500" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px' }}>
                  50 / 150
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Expansion Content */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-px bg-stone-300 flex-1" />
            <p className="text-stone-500 text-xs tracking-widest uppercase" style={{ fontFamily: "'Inter', sans-serif", fontSize: '8px', letterSpacing: '0.15em' }}>
              Expansion Content
            </p>
            <div className="h-px bg-stone-300 flex-1" />
          </div>
          
          <div 
            className="overflow-x-scroll -mx-4 px-4" 
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#a8a29e #f5f5f4',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style>{`
              .overflow-x-scroll::-webkit-scrollbar {
                height: 8px;
                display: block;
              }
              .overflow-x-scroll::-webkit-scrollbar-track {
                background: #f5f5f4;
                border-radius: 4px;
              }
              .overflow-x-scroll::-webkit-scrollbar-thumb {
                background: #a8a29e;
                border-radius: 4px;
              }
              .overflow-x-scroll::-webkit-scrollbar-thumb:hover {
                background: #78716c;
              }
            `}</style>
            <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
              {packs.filter(pack => pack.locked).map((pack, index) => (
                <button
                  key={index}
                  className="bg-white hover:bg-stone-50 text-stone-800 font-light py-2 px-3 transition-all duration-300 border border-stone-200 relative flex-shrink-0"
                  style={{ width: 'calc((100vw - 4rem) / 3.5)', minWidth: '100px', maxWidth: '110px' }}
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
                    150× puzzles
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
};

export default DifficultySelect;
