import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  DollarSign,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import { DEFAULT_DISTANCE_RULES, DistanceRuleConfig } from '../lib/masterConfig';

export default function DistanceRulesPage() {
  const [rules, setRules] = useState<DistanceRuleConfig>(DEFAULT_DISTANCE_RULES);
  const [testKm, setTestKm] = useState('5.5');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test calculation
  const distance = Number(testKm) || 0;
  let simulatedCharge = 0;
  if (rules.isEnabled && distance > rules.freeDistanceKm) {
    simulatedCharge =
      Math.round((distance - rules.freeDistanceKm) * rules.perKmCharge) +
      rules.fixedChargeAfterThreshold;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            LOGISTICS &amp; DISPATCH
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Salon Distance &amp; Travel Charge Engine
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure free service distance thresholds, per-KM travel charges, fixed fees, and GPS matching radiuses
          </p>
        </div>

        {/* Master Distance Toggle */}
        <button
          onClick={() => setRules({ ...rules, isEnabled: !rules.isEnabled })}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            rules.isEnabled
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {rules.isEnabled ? (
            <>
              <ToggleRight className="w-4 h-4" />
              <span>Distance Charges ACTIVE</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4" />
              <span>Distance Charges DISABLED (Free Everywhere)</span>
            </>
          )}
        </button>
      </div>

      {/* Rules Config Form & Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold text-gray-900">Distance Thresholds &amp; Tariffs</h3>
            <p className="text-xs text-gray-500">
              Admin configurable rules applied automatically at customer booking checkout
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Free Distance Threshold */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Free Service Distance (KM) *
              </label>
              <input
                type="number"
                min={0}
                step="0.5"
                required
                value={rules.freeDistanceKm}
                onChange={(e) => setRules({ ...rules, freeDistanceKm: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-bold text-emerald-600"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Travel up to this distance incurs ₹0 doorstep charge.
              </span>
            </div>

            {/* Charge per KM after threshold */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Charge Per KM After Free Tier (₹/KM) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={rules.perKmCharge}
                onChange={(e) => setRules({ ...rules, perKmCharge: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-bold text-brand-primary"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Standard default: ₹50 per KM after 3 KM.
              </span>
            </div>

            {/* Fixed Charge after threshold */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Fixed Base Fee After Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={rules.fixedChargeAfterThreshold}
                onChange={(e) =>
                  setRules({ ...rules, fixedChargeAfterThreshold: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Optional flat travel surcharge if distance exceeds free tier.
              </span>
            </div>

            {/* Maximum Service Matching Radius */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Beautician Matching Radius *
              </label>
              <select
                value={rules.maxServiceRadiusKm}
                onChange={(e) => setRules({ ...rules, maxServiceRadiusKm: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-semibold text-gray-800"
              >
                <option value={3}>3 KM (Hyper-local Hub)</option>
                <option value={5}>5 KM (Neighborhood Zone)</option>
                <option value={7}>7 KM (City Sector)</option>
                <option value={10}>10 KM (Standard Metropolitan)</option>
                <option value={25}>All City (Full City Coverage)</option>
              </select>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Maximum radius for auto-assigning nearby available beauticians.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Distance Rules Saved Successfully!
              </span>
            ) : (
              <span className="text-xs text-gray-400">Rules update live across booking engine</span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Distance Rules</span>
            </button>
          </div>
        </form>

        {/* Live Interactive Tariff Simulator */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0071E3] mb-2">
              <Calculator className="w-5 h-5" />
              <h3 className="text-sm font-bold text-gray-900">Tariff Calculation Simulator</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Test customer distance charges in real-time based on current configured rules.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sample Customer Distance (KM)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={testKm}
                  onChange={(e) => setTestKm(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-bold text-gray-900"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Free Tier Allowance:</span>
                  <span className="font-bold text-emerald-600">{rules.freeDistanceKm} KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Billable Extra Distance:</span>
                  <span className="font-bold text-gray-900">
                    {Math.max(0, distance - rules.freeDistanceKm)} KM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate:</span>
                  <span className="font-bold text-gray-900">₹{rules.perKmCharge}/KM</span>
                </div>
                {rules.fixedChargeAfterThreshold > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fixed Threshold Fee:</span>
                    <span className="font-bold text-gray-900">₹{rules.fixedChargeAfterThreshold}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                  <span>Travel Charge Payable:</span>
                  <span className="text-brand-primary">₹{simulatedCharge}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900">
            <strong>Customer View:</strong> Displayed transparently as:
            <br />
            <em>&quot;Distance: {testKm} km (First {rules.freeDistanceKm} km Free + ₹{simulatedCharge} travel fee)&quot;</em>
          </div>
        </div>
      </div>
    </div>
  );
}
