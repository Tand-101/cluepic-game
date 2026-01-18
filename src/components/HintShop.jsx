// src/components/HintShop.jsx
import React from 'react';
import { X } from 'lucide-react';

const HintShop = ({ hintsRemaining, noirMode, onClose }) => {
  const bgColor = noirMode ? 'bg-zinc-900' : 'bg-stone-50';
  const cardBg = noirMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-stone-200';
  const textColor = noirMode ? 'text-zinc-100' : 'text-stone-900';
  const mutedText = noirMode ? 'text-zinc-400' : 'text-stone-600';

  const hintPacks = [
    { hints: 10, price: '£0.49' },
    { hints: 30, price: '£0.99' },
    { hints: 150, price: '£2.99' }
  ];

  return (
    <div className={`min-h-screen ${bgColor} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-light ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Hint Shop
          </h2>
          <button onClick={onClose} className={mutedText}>
            <X size={18} />
          </button>
        </div>

        {/* Premium Option */}
        <div className={`${noirMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border p-4 mb-4 rounded-lg`}>
          <div className="flex justify-between items-center">
            <div>
              <div className={`text-sm ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Premium
              </div>
              <div className={`text-xs ${mutedText}`}>
                Unlimited hints • Noir mode
              </div>
            </div>
            <button className="bg-amber-900 text-amber-50 px-4 py-2 text-xs rounded hover:bg-amber-800 transition-colors">
              £4.99/mo
            </button>
          </div>
        </div>

        {/* Hint Packs */}
        <div className="space-y-3">
          {hintPacks.map((pack, i) => (
            <button 
              key={i} 
              className={`w-full ${cardBg} border p-4 text-left hover:bg-stone-50 ${noirMode && 'hover:bg-zinc-700'} rounded-lg transition-colors`}
            >
              <div className="flex justify-between items-center">
                <div className={`text-lg ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {pack.hints} Hints
                </div>
                <div className={`text-xl ${textColor}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {pack.price}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Hints Remaining */}
        <div className={`mt-4 text-center text-xs ${mutedText}`}>
          You have {hintsRemaining} hints remaining
        </div>
      </div>
    </div>
  );
};

export default HintShop;
