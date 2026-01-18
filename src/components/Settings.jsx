// src/components/Settings.jsx
import React from 'react';
import { X } from 'lucide-react';

const Settings = ({ 
  noirMode, 
  setNoirMode, 
  soundEnabled, 
  setSoundEnabled, 
  isPremium, 
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
            <div className="flex justify-between items-center">
              <span className={`text-xs ${textColor}`}>Sound Effects</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-10 h-6 rounded-full transition-colors ${
                  soundEnabled ? 'bg-stone-800' : 'bg-stone-300'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className={`${cardBg} border p-4 rounded-lg`}>
            <h3 className={`text-sm mb-2 ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Account
            </h3>
            <button className="w-full bg-amber-900 text-amber-50 py-2 text-xs rounded hover:bg-amber-800 transition-colors">
              Upgrade to Premium - £4.99/mo
            </button>
          </div>

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
      </div>
    </div>
  );
};

export default Settings;
