import React, { useState } from 'react';
import { Save, ShieldAlert, Sliders, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [radius, setRadius] = useState(10);
  const [commission, setCommission] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] max-w-4xl">
      <div>
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Platform Configurations
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure matching algorithm thresholds, commission rates, and notification gateways
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-primary" />
          <span>Auto-Assignment Matching Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Maximum Matching Radius (km): {radius} km
            </label>
            <input
              type="range"
              min="3"
              max="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-brand-primary"
            />
            <span className="text-[11px] text-gray-400">Default: 10km radius in Lucknow</span>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Platform Commission Rate (%): {commission}%
            </label>
            <input
              type="range"
              min="10"
              max="35"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              className="w-full accent-brand-primary"
            />
            <span className="text-[11px] text-gray-400">Beautician keeps {100 - commission}% of gross value</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-emerald-700 font-semibold">
            {saved ? '✓ Configurations saved successfully' : ''}
          </span>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-pink-soft"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
