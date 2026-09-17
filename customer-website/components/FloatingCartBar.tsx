'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, ArrowRight, Trash2, Sparkles, ChevronUp } from 'lucide-react';
import {
  getCart,
  getCartCount,
  getCartTotal,
  getCartOriginalTotal,
  getCartDuration,
  clearCart,
  validateCartFeasibility,
  type CartItem,
} from '../lib/cartStore';
import { MASTER_CATEGORIES, MasterCategoryType } from '../lib/masterCategories';
import SkillConflictModal from './SkillConflictModal';

interface FloatingCartBarProps {
  onOpenCheckout: (mode?: 'single' | 'dual' | 'split') => void;
}

export default function FloatingCartBar({ onOpenCheckout }: FloatingCartBarProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictValidation, setConflictValidation] = useState<any>(null);

  const refreshCart = () => {
    const items = getCart();
    setCartItems(items);
  };

  useEffect(() => {
    refreshCart();
    const handleUpdate = () => refreshCart();
    window.addEventListener('beautynest_cart_updated', handleUpdate);
    return () => window.removeEventListener('beautynest_cart_updated', handleUpdate);
  }, []);

  const totalCount = getCartCount();
  const totalPrice = getCartTotal();
  const originalTotal = getCartOriginalTotal();
  const totalDuration = getCartDuration();
  const savings = Math.max(0, originalTotal - totalPrice);

  if (totalCount === 0) return null;

  // Master categories in cart
  const distinctCats = Array.from(new Set(cartItems.map((i) => i.masterCategory)));

  const handleReviewAndBook = () => {
    const validation = validateCartFeasibility(cartItems);
    if (validation.hasSkillMismatch) {
      setConflictValidation(validation);
      setShowConflictModal(true);
    } else {
      onOpenCheckout('single');
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          
          {/* Expanded Quick Items Drawer */}
          {showDetails && (
            <div className="bg-white/95 backdrop-blur-md rounded-t-3xl p-4 sm:p-5 border border-pink-200 border-b-0 shadow-2xl mb-[-1px] animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  <h4 className="text-sm font-bold text-gray-900">
                    चयनित पैकेज (Selected Packages - {totalCount})
                  </h4>
                </div>
                <button
                  onClick={() => clearCart()}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>हटाएं (Clear All)</span>
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-brand-bg/50 border border-pink-50 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-brand-primary bg-pink-100 px-1.5 py-0.5 rounded text-[10px]">
                        {item.masterCategory === 'makeup' ? '💄 मेकअप' : item.masterCategory === 'spa' ? '🧖‍♀️ स्पा' : '✨ ब्यूटी'}
                      </span>
                      <span className="font-medium text-gray-800 truncate max-w-[220px] sm:max-w-xs">
                        {item.service.name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-gray-500 font-bold">× {item.quantity}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">
                        ₹{item.service.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Floating Cart Pill */}
          <div className="bg-brand-charcoal/95 backdrop-blur-md text-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Left Info */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-primary to-pink-500 flex items-center justify-center text-white shadow-md">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-brand-primary text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-charcoal">
                    {totalCount}
                  </span>
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold">₹{totalPrice}</span>
                    {savings > 0 && (
                      <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        बचत: ₹{savings}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-pink-300" />
                      {totalDuration} मिनट
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[140px] sm:max-w-none text-pink-200">
                      {distinctCats
                        .map((c) => (c === 'makeup' ? '💄 मेकअप' : c === 'spa' ? '🧖‍♀️ स्पा' : '✨ ब्यूटी'))
                        .join(' + ')}
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-gray-400 hover:text-white p-1 rounded-lg sm:hidden"
              >
                <ChevronUp className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleReviewAndBook}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-pink-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-pink-soft transition-all transform active:scale-95"
              >
                <span>चेकआउट व बुकिंग करें (Review & Book)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Feasibility Alert Modal */}
      {showConflictModal && conflictValidation && (
        <SkillConflictModal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          validationResult={conflictValidation}
          onProceedDualBeauticians={() => {
            setShowConflictModal(false);
            onOpenCheckout('dual');
          }}
          onProceedSplitOrders={() => {
            setShowConflictModal(false);
            onOpenCheckout('split');
          }}
        />
      )}
    </>
  );
}
