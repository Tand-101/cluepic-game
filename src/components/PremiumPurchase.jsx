import React, { useState } from 'react';
import { X } from 'lucide-react';

const PremiumPurchase = ({ onClose, onPurchase }) => {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: { price: '£2.99', period: '/month', total: '£2.99' },
    yearly: { price: '£19.99', period: '/year', total: '£19.99', save: 'Save 44%' },
    lifetime: { price: '£49.99', period: '', total: '£49.99', save: 'Best Value' }
  };

  const handlePurchase = async () => {
    setLoading(true);
    await onPurchase(selectedPlan);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 
            className="text-2xl font-light" 
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            PREMIUM
          </h1>
          <button onClick={onClose} className="text-stone-600 hover:text-stone-900">
            <X size={20} />
          </button>
        </div>

        <div className="bg-white border border-stone-200 p-6 mb-4">
          <h2 className="text-lg font-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Unlock Everything
          </h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-5 h-5 flex items-center justify-center text-stone-900">✓</div>
              <span>Unlimited hints & clues</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-5 h-5 flex items-center justify-center text-stone-900">✓</div>
              <span>No ads</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-5 h-5 flex items-center justify-center text-stone-900">✓</div>
              <span>Early access to new features</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-stone-700">
              <div className="w-5 h-5 flex items-center justify-center text-stone-900">✓</div>
              <span>Support development</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {Object.entries(plans).map(([key, plan]) => (
              <button
                key={key}
                onClick={() => setSelectedPlan(key)}
                className={`w-full p-4 border-2 transition-all ${
                  selectedPlan === key
                    ? 'border-stone-900 bg-stone-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-sm font-medium capitalize">{key}</div>
                    <div className="text-xs text-stone-600">{plan.total}{plan.period}</div>
                  </div>
                  <div className="text-right">
                    {plan.save && (
                      <div className="text-xs font-medium text-amber-700 mb-1">
                        {plan.save}
                      </div>
                    )}
                    <div 
                      className="text-lg font-light" 
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {plan.price}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-black text-stone-50 py-3 text-sm tracking-widest transition-colors disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : 'SUBSCRIBE'}
          </button>
        </div>

        <p className="text-xs text-stone-500 text-center">
          Subscriptions automatically renew. Cancel anytime.
        </p>
      </div>
    </div>
  );
};

export default PremiumPurchase;
