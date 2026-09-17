'use client';

import React from 'react';
import {
  AlertTriangle,
  Users,
  Split,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { FeasibilityValidationResult, CartItem } from '../lib/cartStore';

interface SkillConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: FeasibilityValidationResult;
  onProceedDualBeauticians: () => void;
  onProceedSplitOrders: () => void;
}

export default function SkillConflictModal({
  isOpen,
  onClose,
  validationResult,
  onProceedDualBeauticians,
  onProceedSplitOrders,
}: SkillConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-amber-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header with warning banner */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <AlertTriangle className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase bg-white/25 px-2.5 py-0.5 rounded-full text-white inline-block mb-1">
                  स्मार्ट ब्यूटीशियन वैलिडेशन • Smart Feasibility Check
                </span>
                <h3 className="text-xl font-bold font-serif leading-tight">
                  2 अलग-अलग विशेषज्ञ ब्यूटीशियन की आवश्यकता
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Reason explanation card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 leading-relaxed space-y-2">
            <p className="font-semibold flex items-center gap-2 text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>आपके चुने हुए पैकेज में अलग-अलग विशेषज्ञता (Specializations) शामिल हैं:</span>
            </p>
            <p className="text-amber-800">
              {validationResult.conflictReason ||
                'मेकअप वाली लेडी (Makeup Artist) मैनीक्योर/पेडीक्योर या वैक्सिंग नहीं करती हैं, और सैलून ब्यूटीशियन ब्राइडल/पार्टी मेकअप नहीं करती हैं। सर्वोत्तम परिणाम के लिए दोनों सेवाओं के अलग-अलग प्रमाणित एक्सपर्ट्स होते हैं।'}
            </p>
          </div>

          {/* Assigned Specialists Preview */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              प्रस्तावित एक्सपर्ट्स (Assigned Specialists for your Services):
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {validationResult.recommendedSpecialists.map((spec, idx) => (
                <div
                  key={idx}
                  className="bg-brand-bg/60 border border-pink-100 rounded-2xl p-3.5 flex items-start gap-3"
                >
                  <img
                    src={spec.beautician.imageUrl}
                    alt={spec.beautician.name}
                    className="w-12 h-12 rounded-xl object-cover border border-pink-200 shrink-0 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-brand-primary uppercase">
                        {spec.category === 'makeup' ? '💄 मेकअप एक्सपर्ट' : spec.category === 'spa' ? '🧖‍♀️ स्पा थेरेपिस्ट' : '💅 सैलून ब्यूटीशियन'}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-gray-900 truncate">
                      {spec.beautician.name}
                    </h5>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {spec.beautician.specialization}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {spec.serviceNames.map((sName, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] bg-white text-gray-700 px-1.5 py-0.5 rounded border border-pink-100 truncate max-w-[150px]"
                        >
                          • {sName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Actionable Choice Cards */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              कृपया अपनी पसंद का विकल्प चुनें (Select Your Booking Flow):
            </h4>

            {/* Option 1: Dual Beauticians */}
            <button
              onClick={onProceedDualBeauticians}
              className="w-full text-left group bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 border-2 border-brand-primary rounded-2xl p-4 transition-all shadow-sm hover:shadow-md flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-brand-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand-charcoal">
                      विकल्प 1: दो अलग-अलग एक्सपर्ट्स असाइन करें
                    </span>
                    <span className="text-[10px] bg-brand-primary text-white font-bold px-2 py-0.5 rounded-full">
                      अनुशंसित (Recommended)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    एक ही आर्डर में दोनों प्रमाणित ब्यूटीशियन आपके घर आएंगी। प्रत्येक सेवा अपनी विशेषज्ञ द्वारा पूरी की जाएगी।
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-brand-primary shrink-0 group-hover:translate-x-1 transition-transform mt-2" />
            </button>

            {/* Option 2: Split Orders */}
            <button
              onClick={onProceedSplitOrders}
              className="w-full text-left group bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 border-2 border-gray-200 hover:border-amber-500 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Split className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      विकल्प 2: दो अलग-अलग ऑर्डर में बांटें (Split into 2 Orders)
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    मेकअप और सैलून सेवाओं के 2 अलग-अलग बुकिंग नंबर बनेंगे। आप दोनों के लिए अलग-अलग तारीख या समय चुन सकती हैं।
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-600 shrink-0 group-hover:translate-x-1 transition-transform mt-2" />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 px-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% वेरिफाइड व प्रशिक्षित ब्यूटीशियन
          </span>
          <button
            onClick={onClose}
            className="font-medium text-gray-600 hover:text-gray-900 underline"
          >
            कार्ट में बदलाव करें (Edit Cart)
          </button>
        </div>

      </div>
    </div>
  );
}
