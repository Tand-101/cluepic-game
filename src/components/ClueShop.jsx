import React, { useState } from 'react';
import { X } from 'lucide-react';

const ClueShop = ({ cluesRemaining, onClose, onPurchase }) => {
  const [loading, setLoading] = useState(false);

  const packages = [
    { clues: 5, price: '£0.49', id: 'clues_5' },
    { clues: 15, price: '£0.99', id: 'clues_15', save: 'Save 34%' },
    { clues: 50, price: '£2.99', id: 'clues_50', save: 'Best Value' }
  ];

  const handlePurchase = async (pkg) => {
    setLoading(true);
    await onPurchase('clues', pkg);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              CLUE SHOP
            </h1>
            <p className="text-xs text-stone-500 mt-1">You have {cluesRemaining} clues</p>
          </div>
          <button onClick={onClose} className="text-stone-600 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        <div className="bg-stone-100 border border-stone-200 p-4 mb-4 text-center">
          <div className="text-sm text-stone-700 mb-2">
            Clues reveal the category hint immediately
          </div>
          <div className="text-xs text-stone-500">
            Premium members get unlimited clues
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handlePurchase(pkg)}
              disabled={loading}
              className="w-full bg-white border border-stone-200 p-4 hover:bg-stone-50 transition-colors disabled:opacity-50 relative"
            >
              {pkg.save && (
                <div className="absolute top-2 right-2 text-xs font-medium text-amber-700">
                  {pkg.save}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {pkg.clues} Clues
                  </div>
                  <div className="text-xs text-stone-600">
                    {(parseFloat(pkg.price.slice(1)) / pkg.clues * 100).toFixed(0)}p per clue
                  </div>
                </div>
                <div className="text-xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {pkg.price}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePurchase({ type: 'premium' })}
          className="w-full bg-stone-900 hover:bg-black text-stone-50 py-3 text-sm tracking-widest transition-colors mb-2"
        >
          GET PREMIUM - UNLIMITED CLUES
        </button>

        <p className="text-xs text-stone-500 text-center">
          All purchases are final. No refunds except as required by law.
        </p>
      </div>
    </div>
  );
};

export default ClueShop;
