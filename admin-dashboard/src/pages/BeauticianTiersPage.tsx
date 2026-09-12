import React, { useState } from 'react';
import {
  Award,
  Percent,
  Plus,
  Star,
  CheckCircle2,
  Briefcase,
  Edit2,
  Trash2,
  Save,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_BEAUTICIAN_TIERS, BeauticianCategoryTier } from '../lib/masterConfig';

export default function BeauticianTiersPage() {
  const [tiers, setTiers] = useState<BeauticianCategoryTier[]>(INITIAL_BEAUTICIAN_TIERS);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState<BeauticianCategoryTier | null>(null);

  // Add Tier State
  const [newTierName, setNewTierName] = useState('');
  const [newCommission, setNewCommission] = useState('18');
  const [newMinJobs, setNewMinJobs] = useState('100');
  const [newMinRating, setNewMinRating] = useState('4.7');
  const [newPerks, setNewPerks] = useState('Priority VIP Dispatches, Kit Subsidy');

  const handleSaveNewTier = (e: React.FormEvent) => {
    e.preventDefault();
    const tier: BeauticianCategoryTier = {
      id: `tier-${Date.now()}`,
      name: newTierName,
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
      commissionPercent: Number(newCommission) || 15,
      minJobsRequired: Number(newMinJobs) || 0,
      minRating: Number(newMinRating) || 4.5,
      perks: newPerks.split(',').map((p) => p.trim()),
    };
    setTiers([...tiers, tier]);
    setShowAddTierModal(false);
    setNewTierName('');
  };

  const handleSaveEditTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;
    setTiers((prev) =>
      prev.map((t) => (t.id === editingTier.id ? editingTier : t))
    );
    setEditingTier(null);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            PARTNER ARCHITECTURE
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Beautician Categories &amp; Dynamic Commissions
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure partner tier levels (Bronze, Silver, Gold, etc.), dynamic commission percentages, and promotion criteria
          </p>
        </div>

        <button
          onClick={() => setShowAddTierModal(true)}
          className="inline-flex items-center gap-1.5 bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Category Tier</span>
        </button>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${tier.badgeColor}`}>
                  {tier.name}
                </span>
                <button
                  onClick={() => setEditingTier(tier)}
                  className="text-gray-400 hover:text-[#0071E3] p-1 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Edit Commission &amp; Requirements"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Commission Rate */}
              <div className="my-4">
                <span className="text-xs font-bold text-gray-400 block uppercase">
                  Payout Commission
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold text-brand-primary">
                    {tier.commissionPercent}%
                  </span>
                  <span className="text-xs font-bold text-gray-500">of service cost</span>
                </div>
              </div>

              {/* Qualifications */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5 text-xs text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Min Jobs:</span>
                  <span className="font-bold text-gray-900">{tier.minJobsRequired}+ bookings</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Min Rating:</span>
                  <span className="font-bold text-amber-600 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {tier.minRating}★
                  </span>
                </div>
              </div>

              {/* Perks */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Category Perks:
                </span>
                {tier.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">Automatic Tier Progression</span>
              <button
                onClick={() => setEditingTier(tier)}
                className="text-xs font-bold text-[#0071E3] hover:underline"
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900">Edit {editingTier.name}</h3>
              <button
                onClick={() => setEditingTier(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTier} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tier Name</label>
                <input
                  type="text"
                  value={editingTier.name}
                  onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Commission Percentage (%) *</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={editingTier.commissionPercent}
                  onChange={(e) =>
                    setEditingTier({ ...editingTier, commissionPercent: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-bold text-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Jobs Required</label>
                  <input
                    type="number"
                    value={editingTier.minJobsRequired}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, minJobsRequired: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Rating Required</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingTier.minRating}
                    onChange={(e) =>
                      setEditingTier({ ...editingTier, minRating: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  Save Tier Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Tier Modal */}
      {showAddTierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900">Add New Partner Category Tier</h3>
              <button
                onClick={() => setShowAddTierModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTier} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tier Name *</label>
                <input
                  type="text"
                  required
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  placeholder="e.g. Diamond Master Pro"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Commission Rate (%) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={90}
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  placeholder="18"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-bold text-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Jobs</label>
                  <input
                    type="number"
                    value={newMinJobs}
                    onChange={(e) => setNewMinJobs(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMinRating}
                    onChange={(e) => setNewMinRating(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Perks (Comma Separated)</label>
                <input
                  type="text"
                  value={newPerks}
                  onChange={(e) => setNewPerks(e.target.value)}
                  placeholder="e.g. VIP Kit, Priority Dispatch"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTierModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  Create Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
