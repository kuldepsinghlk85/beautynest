import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Coins,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  MapPin,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { INITIAL_CITIES, CityConfig } from '../lib/masterConfig';

export default function CitiesPage() {
  const [cities, setCities] = useState<CityConfig[]>(INITIAL_CITIES);
  const [isMultiCityEnabled, setIsMultiCityEnabled] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState<CityConfig | null>(null);

  // New City Form State
  const [newCityName, setNewCityName] = useState('');
  const [newStateName, setNewStateName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('499');
  const [newDeliveryRate, setNewDeliveryRate] = useState('50');

  // Stats calculation
  const totalCitiesCount = cities.length;
  const activeCitiesCount = cities.filter((c) => c.isActive).length;
  const totalOverridesCount = cities.reduce((acc, c) => acc + c.priceOverridesCount, 0);

  // Filtered Cities
  const filteredCities = cities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? c.isActive
        : !c.isActive;

    return matchesSearch && matchesStatus;
  });

  const handleToggleCityStatus = (cityId: string) => {
    setCities((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCity = (cityId: string) => {
    if (confirm('Are you sure you want to delete this serviceable city?')) {
      setCities((prev) => prev.filter((c) => c.id !== cityId));
    }
  };

  const handleSaveNewCity = (e: React.FormEvent) => {
    e.preventDefault();
    const city: CityConfig = {
      id: `city-${Date.now()}`,
      name: newCityName,
      state: newStateName,
      slug: newSlug.toLowerCase().replace(/\s+/g, '-'),
      priceOverridesCount: 0,
      isActive: true,
      minBookingValue: Number(newMinOrder) || 399,
      deliveryChargePerKm: Number(newDeliveryRate) || 50,
    };
    setCities([city, ...cities]);
    setShowAddCityModal(false);
    setNewCityName('');
    setNewStateName('');
    setNewSlug('');
  };

  const handleSaveEditCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    setCities((prev) =>
      prev.map((c) => (c.id === editingCity.id ? editingCity : c))
    );
    setEditingCity(null);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Top Header with Master Multi-City Switch */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            OPERATIONS
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Serviceable Cities
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage operational cities, local price overrides, delivery distance rates, and city launch toggles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Multi-City Switch (User Prompt Highlight) */}
          <div className="flex items-center gap-2.5 bg-white border border-pink-200 px-4 py-2 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-gray-800">
              Multi-City Marketplace:
            </span>
            <button
              onClick={() => setIsMultiCityEnabled(!isMultiCityEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                isMultiCityEnabled
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-amber-500 text-white shadow-xs'
              }`}
            >
              {isMultiCityEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>ENABLED (PAN-India)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>DISABLED (Varanasi Only)</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowAddCityModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New City</span>
          </button>
        </div>
      </div>

      {/* Multi-City Status Notice Banner */}
      {!isMultiCityEnabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Single-City Mode Active:</strong> Customer website and mobile app are currently locked exclusively to <strong>Varanasi</strong>. Enable Multi-City mode above to unlock other cities.
            </span>
          </div>
          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
            Varanasi Locked
          </span>
        </div>
      )}

      {/* Stat Cards (Matching Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Cities
            </span>
            <span className="text-2xl font-bold text-gray-900">{totalCitiesCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Active Cities
            </span>
            <span className="text-2xl font-bold text-gray-900">{activeCitiesCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              City Price Overrides
            </span>
            <span className="text-2xl font-bold text-purple-700">{totalOverridesCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar (Matching Screenshot 2) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cities by name or state..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-medium text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>

          <button
            onClick={() => {}}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Serviceable Cities Table (Exact match to Screenshot 2) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-bold">City Name</th>
                <th className="py-3.5 px-6 font-bold">State</th>
                <th className="py-3.5 px-6 font-bold">Slug</th>
                <th className="py-3.5 px-6 font-bold">Pricing Overrides</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{city.name}</span>
                      {city.name === 'Varanasi' && (
                        <span className="bg-pink-100 text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Primary Hub
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-600">{city.state}</td>
                  <td className="py-4 px-6 font-mono text-[11px] text-gray-500">{city.slug}</td>
                  <td className="py-4 px-6">
                    <span className="bg-purple-100 text-purple-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-purple-200">
                      {city.priceOverridesCount} overrides
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleCityStatus(city.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        city.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${city.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span>{city.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => alert(`Viewing city details for ${city.name} (${city.priceOverridesCount} active overrides)`)}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => setEditingCity(city)}
                      className="text-gray-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit City"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteCity(city.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete City"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New City Modal */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900">Add Serviceable City</h3>
              <button
                onClick={() => setShowAddCityModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCity} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  value={newCityName}
                  onChange={(e) => {
                    setNewCityName(e.target.value);
                    if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  placeholder="e.g. Telangana"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="e.g. hyderabad"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Distance (₹/KM)</label>
                  <input
                    type="number"
                    value={newDeliveryRate}
                    onChange={(e) => setNewDeliveryRate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  Create City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit City Modal */}
      {editingCity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-gray-900">Edit {editingCity.name}</h3>
              <button
                onClick={() => setEditingCity(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCity} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City Name</label>
                <input
                  type="text"
                  value={editingCity.name}
                  onChange={(e) => setEditingCity({ ...editingCity, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={editingCity.state}
                  onChange={(e) => setEditingCity({ ...editingCity, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Price Overrides Count</label>
                <input
                  type="number"
                  value={editingCity.priceOverridesCount}
                  onChange={(e) => setEditingCity({ ...editingCity, priceOverridesCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cityActive"
                  checked={editingCity.isActive}
                  onChange={(e) => setEditingCity({ ...editingCity, isActive: e.target.checked })}
                  className="rounded text-[#0071E3]"
                />
                <label htmlFor="cityActive" className="text-xs font-semibold text-gray-700">
                  City Active &amp; Bookable
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCity(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0071E3] hover:bg-[#005bb5] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
