// src/components/Settings.jsx
// Amendment 4 - Sound effects disabled

import React from 'react';
import { X } from 'lucide-react';

const Settings = ({ 
  noirMode, 
  setNoirMode, 
  soundEnabled, 
  setSoundEnabled, 
  isPremium,
  onPurchasePremium,
  onClose 
}) => {
  const bgColor = noirMode ? 'bg-zinc-900' : 'bg-stone-50';
  const cardBg = noirMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200';
  const textColor = noirMode ? 'text-zinc-100' : 'text-stone-900';
  const mutedText = noirMode ? 'text-zinc-400' : 'text-stone-600';

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-light ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Settings
          </h2>
          <button onClick={onClose} className={mutedText}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Appearance Settings */}
          <div className={`${cardBg} border p-4 rounded-lg`}>
            <h3 className={`text-sm mb-3 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Appearance
            </h3>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs ${textColor}`}>
                Noir Mode {!isPremium && '(Premium)'}
              </span>
              <button
                onClick={() => isPremium && setNoirMode(!noirMode)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  noirMode ? 'bg-stone-800' : 'bg-stone-300'
                } ${!isPremium && 'opacity-50 cursor-not-allowed'}`}
                disabled={!isPremium}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  noirMode ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
            {/* Amendment 4: Sound effects locked */}
            <div className="flex justify-between items-center">
              <span className={`text-xs ${textColor}`}>Sound Effects (Coming Soon)</span>
              <button
                className="w-10 h-6 rounded-full transition-colors bg-stone-300 opacity-50 cursor-not-allowed"
                disabled={true}
              >
                <div className="w-4 h-4 bg-white rounded-full transition-transform translate-x-1" />
              </button>
            </div>
          </div>

          {/* Premium Options */}
          {!isPremium && (
            <div className={`${cardBg} border p-4 rounded-lg`}>
              <h3 className={`text-sm mb-3 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Upgrade to Premium
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => onPurchasePremium('monthly')}
                  className="w-full bg-amber-900 text-amber-50 py-3 text-sm rounded hover:bg-amber-800 transition-colors"
                >
                  <div className="font-semibold">£4.99/month</div>
                  <div className="text-xs opacity-80">Unlimited hints & clues</div>
                </button>
                <button 
                  onClick={() => onPurchasePremium('lifetime')}
                  className="w-full bg-emerald-900 text-emerald-50 py-3 text-sm rounded hover:bg-emerald-800 transition-colors"
                >
                  <div className="font-semibold">£29.99 Lifetime</div>
                  <div className="text-xs opacity-80">One-time payment • Best value</div>
                </button>
              </div>
            </div>
          )}

          {isPremium && (
            <div className={`${cardBg} border p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <h3 className={`text-sm font-semibold ${textColor}`}>Premium Active</h3>
              </div>
              <p className={`text-xs ${mutedText}`}>
                You have unlimited access to all features
              </p>
            </div>
          )}

          {/* About Us */}
          <div className={`${cardBg} border p-4 rounded-lg`}>
            <h3 className={`text-sm mb-2 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Information
            </h3>
            <a 
              href="https://cluepic.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 ${
                noirMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-stone-800 hover:bg-stone-900'
              } text-white py-2 text-xs rounded transition-colors`}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="w-4 h-4"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              About Us
            </a>
          </div>
        </div>

        {/* Thomas Andrews attribution */}
        <div className={`mt-6 text-center text-xs ${mutedText}`} style={{ fontSize: '10px' }}>
          Cluepic is a trading name of Thomas Andrews
        </div>
      </div>
    </div>
  );
};

export default Settings;
