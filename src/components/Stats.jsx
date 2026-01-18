// src/components/Stats.jsx
// Amendments 11, 12, 16 combined

import React from 'react';
import { X, Trophy, Share2 } from 'lucide-react';

const Stats = ({ 
  totalScore,
  currentStreak, 
  winRate,
  classicStats,
  challengeStats,
  timedStats,
  noirMode, 
  onClose 
}) => {
  const bgColor = noirMode ? 'bg-zinc-900' : 'bg-stone-50';
  const cardBg = noirMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200';
  const textColor = noirMode ? 'text-zinc-100' : 'text-stone-900';
  const mutedText = noirMode ? 'text-zinc-400' : 'text-stone-600';

  // Amendment 12: Share success rate
  const shareStats = () => {
    const shareText = `My Cluepic Stats 📊
    
Score: ${totalScore.toLocaleString()}
Win Rate: ${winRate}%
Streak: ${currentStreak} days 🔥

Classic: ${classicStats.winRate}%
Challenge: ${challengeStats.winRate}%
Timed: ${timedStats.winRate}%

Play now at cluepic.co.uk`;

    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Stats copied to clipboard!');
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-light ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Statistics
          </h2>
          <div className="flex gap-2">
            <button onClick={shareStats} className={mutedText} title="Share Stats">
              <Share2 size={20} />
            </button>
            <button onClick={onClose} className={mutedText}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Amendment 11: Overall Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`${cardBg} border p-4 text-center rounded-lg`}>
            <div className={`text-3xl font-light mb-1 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {totalScore.toLocaleString()}
            </div>
            <div className={`text-xs ${mutedText}`}>Total Score</div>
          </div>
          <div className={`${cardBg} border p-4 text-center rounded-lg`}>
            <div className={`text-3xl font-light mb-1 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {currentStreak}
            </div>
            <div className={`text-xs ${mutedText}`}>Day Streak</div>
          </div>
          <div className={`${cardBg} border p-4 text-center rounded-lg`}>
            <div className={`text-3xl font-light mb-1 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {winRate}%
            </div>
            <div className={`text-xs ${mutedText}`}>Win Rate</div>
          </div>
        </div>

        {/* Amendment 16: Difficulty Breakdown */}
        <div className={`${cardBg} border p-4 rounded-lg mb-4`}>
          <h3 className={`text-sm font-semibold mb-3 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Performance by Difficulty
          </h3>
          
          {/* Classic Stats */}
          <div className="mb-3 pb-3 border-b border-stone-200">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${textColor}`}>Classic</span>
              <span className={`text-sm font-semibold ${textColor}`}>{classicStats.winRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={mutedText}>{classicStats.played} played</span>
              <span className={mutedText}>{classicStats.score.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Challenge Stats */}
          <div className="mb-3 pb-3 border-b border-stone-200">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${textColor}`}>Challenge</span>
              <span className={`text-sm font-semibold ${textColor}`}>{challengeStats.winRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={mutedText}>{challengeStats.played} played</span>
              <span className={mutedText}>{challengeStats.score.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Timed Stats */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${textColor}`}>Timed</span>
              <span className={`text-sm font-semibold ${textColor}`}>{timedStats.winRate}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={mutedText}>{timedStats.played} played</span>
              <span className={mutedText}>{timedStats.score.toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Amendment 11: Global Leaderboard - Coming Soon */}
        <div className={`${cardBg} border p-4 rounded-lg mb-4`}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-600" />
            <h3 className={`text-sm font-semibold ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Global Leaderboard
            </h3>
          </div>
          <div className="text-center py-8">
            <div className={`text-sm ${mutedText} mb-2`}>🚀</div>
            <div className={`text-sm ${textColor} font-semibold mb-1`}>Coming Soon</div>
            <div className={`text-xs ${mutedText}`}>
              Compete with players worldwide
            </div>
          </div>
        </div>

        {/* Amendment 11: Mini League - Coming Soon */}
        <div className={`${cardBg} border p-4 rounded-lg`}>
          <h3 className={`text-sm font-semibold mb-3 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your Mini League
          </h3>
          <div className="text-center py-8">
            <div className={`text-sm ${mutedText} mb-2`}>👥</div>
            <div className={`text-sm ${textColor} font-semibold mb-1`}>Coming Soon</div>
            <div className={`text-xs ${mutedText}`}>
              Challenge your friends
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
