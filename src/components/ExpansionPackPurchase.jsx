import React, { useState } from 'react';
import { X } from 'lucide-react';

const ExpansionPackPurchase = ({ pack, onClose, onPurchase }) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    await onPurchase(pack);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 text-stone-600 hover:text-stone-900 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Purchase Card */}
      <div className="w-full max-w-md">
        <div className="bg-white border border-stone-200 p-8 text-center">
          <h1 
            className="text-3xl font-light mb-2" 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            CLUEPIC
          </h1>
          <div className="w-16 h-px bg-stone-400 mx-auto mb-6" />

          <div className="text-6xl mb-4">{pack.emoji}</div>
          
          <h2 
            className="text-2xl font-light mb-6" 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {pack.name}
          </h2>

          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
              <div className="w-3 h-3 rounded-full bg-stone-900" />
              <span>50 Classic Puzzles</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
              <div className="w-3 h-3 rounded-full bg-stone-400" />
              <span>50 Challenge Puzzles</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-stone-600">
              <div className="w-3 h-3 rounded-full bg-stone-200 border border-stone-300" />
              <span>50 Timed Puzzles</span>
            </div>
          </div>

          <div className="mb-6">
            <div 
              className="text-4xl font-light mb-2" 
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {pack.price}
            </div>
            <div className="text-xs text-stone-500">One-time purchase</div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-black text-stone-50 py-3 px-6 text-sm tracking-widest transition-colors disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : 'PURCHASE'}
          </button>

          {pack.requiresReview && (
            <div className="mt-4 text-xs text-amber-700">
              Rate us on the App Store to unlock this pack for free
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpansionPackPurchase;
