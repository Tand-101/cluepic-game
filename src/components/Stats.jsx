// src/components/Stats.jsx
import React from 'react';
import { X, Trophy } from 'lucide-react';

const Stats = ({ score, streak, noirMode, onClose }) => {
  const bgColor = noirMode ? 'bg-zinc-900' : 'bg-stone-50';
  const cardBg = noirMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200';
  const textColor = noirMode ? 'text-zinc-100' : 'text-stone-900';
  const mutedText = noirMode ? 'text-zinc-400' : 'text-stone-600';

  const globalLeaderboard = [
    { rank: 1, name: 'Alexandra M.', score: 12450 },
    { rank: 2, name: 'James K.', score: 11890 },
    { rank: 3, name: 'Sofia L.', score: 11200 },
    { rank: 4, name: 'Marcus T.', score: 10950 },
    { rank: 5, name: 'Emma R.', score: 10800 }
  ];

  const miniLeague = [
    { rank: 1, name: 'You', score: score },
    { rank: 2, name: 'Sarah P.', score: 8200 },
    { rank: 3, name: 'David C.', score: 7850 }
  ];

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-light ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Statistics
          </h2>
          <button onClick={onClose} className={mutedText}>
            <X size={20} />
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`${cardBg} border p-4 text-center rounded-lg`}>
            <div className={`text-3xl font-light mb-1 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {score}
            </div>
            <div className={`text-xs ${mutedText}`}>Score</div>
          </div>
          <div className={`${cardBg} border p-4 text-center rounded-lg`}>
            <div className={`text-3xl font-light mb-1 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {streak}
            </div>
            <div className={`text-xs ${mutedText}`}>Streak</div>
          </div>
          <div className={`${cardBg} border p-4 text-center rounded-lg`}>
            <div className={`text-3xl font-light mb-1 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              85%
            </div>
            <div className={`text-xs ${mutedText}`}>Win Rate</div>
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className={`${cardBg} border p-4 rounded-lg mb-4`}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-600" />
            <h3 className={`text-sm font-semibold ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Global Leaderboard
            </h3>
          </div>
          <div className="space-y-2">
            {globalLeaderboard.map((player) => (
              <div key={player.rank} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`text-xs font-semibold ${mutedText} w-4`}>#{player.rank}</div>
                  <div className={`text-sm ${textColor}`}>{player.name}</div>
                </div>
                <div className={`text-sm ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {player.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini League */}
        <div className={`${cardBg} border p-4 rounded-lg`}>
          <h3 className={`text-sm font-semibold mb-3 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your Mini League
          </h3>
          <div className="space-y-2">
            {miniLeague.map((player) => (
              <div key={player.rank} className={`flex justify-between items-center ${player.name === 'You' && 'font-semibold'}`}>
                <div className="flex items-center gap-3">
                  <div className={`text-xs ${mutedText} w-4`}>#{player.rank}</div>
                  <div className={`text-sm ${textColor}`}>{player.name}</div>
                </div>
                <div className={`text-sm ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {player.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
