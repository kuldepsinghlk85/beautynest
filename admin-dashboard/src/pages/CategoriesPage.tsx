import React, { useState, useRef, useEffect } from 'react';
import {
  FolderTree,
  ListTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Scissors,
  Layers,
  ArrowRight,
  Upload,
  Check,
  Filter,
  Image as ImageIcon,
  RefreshCw,
  Globe,
} from 'lucide-react';
import { SERVICE_CATEGORIES, type ServiceCategory } from '../lib/allServices';

export const CATEGORY_PRESETS = [
  { name: 'Facial & Cleanup', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80' },
  { name: 'Bleach & De-Tan', url: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&q=80' },
  { name: 'Hair Care & Salon', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80' },
  { name: 'Bridal & Makeup', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80' },
  { name: 'Mehendi Art', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80' },
  { name: 'Male Grooming', url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80' },
  { name: 'Kids Hair & Care', url: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&q=80' },
  { name: 'Body Care & Spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80' },
  { name: 'Manicure & Pedicure', url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80' },
];

interface CategoriesPageProps {
  initialView?: 'categories' | 'subcategories';
  onNavigateToServices?: (categoryName: string) => void;
}

export default function CategoriesPage({
  initialView = 'categories',
  onNavigateToServices,
}: CategoriesPageProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>(SERVICE_CATEGORIES);
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>(initialView);
  const [searchQuery, setSearchQuery] = useState('');

  // Backend Sync States
  const [backendOnline, setBackendOnline] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Load from backend on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:4200/api/services/categories');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBackendOnline(true);
            setCategories(data);
          }
        }
      } catch {
        setBackendOnline(false);
      }
    };
    fetchCategories();
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<ServiceCategory | null>(null);

  // Form States
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formSubcats, setFormSubcats] = useState('');

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Total metrics
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);
  const totalServices = categories.reduce((acc, cat) => acc + (cat.count || 0), 0);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories?.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormSlug('');
    setFormImage('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80');
    setFormSubcats('');
    setIsAddModalOpen(true);
  };

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const subcatsArray = formSubcats
      ? formSubcats.split(',').map((s) => s.trim()).filter(Boolean)
      : ['General'];

    const newCat: ServiceCategory = {
      id: `cat-${Date.now()}`,
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      count: 0,
      subcategories: subcatsArray,
      icon: 'Sparkles',
      image: formImage || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    };

    setCategories((prev) => [newCat, ...prev]);
    setIsAddModalOpen(false);

    try {
      const res = await fetch('http://localhost:4200/api/services/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        setBackendOnline(true);
        setSyncMessage(`Category "${formName}" created & synced with Customer Website!`);
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Backend save failed:', err);
    }
  };

  const handleOpenEdit = (cat: ServiceCategory) => {
    setSelectedCat(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormImage(cat.image);
    setFormSubcats(cat.subcategories?.join(', ') || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat) return;

    const subcatsArray = formSubcats
      ? formSubcats.split(',').map((s) => s.trim()).filter(Boolean)
      : selectedCat.subcategories || [];

    const updatedCategory = {
      ...selectedCat,
      name: formName,
      slug: formSlug || selectedCat.slug,
      image: formImage || selectedCat.image,
      subcategories: subcatsArray,
    };

    setCategories((prev) =>
      prev.map((c) => (c.id === selectedCat.id ? updatedCategory : c))
    );
    setIsEditModalOpen(false);

    // Sync directly to backend
    try {
      const cId = selectedCat.id || selectedCat.slug;
      const res = await fetch(`http://localhost:4200/api/services/categories/${encodeURIComponent(cId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory),
      });
      if (res.ok) {
        setBackendOnline(true);
        setSyncMessage(`Category "${formName}" photo & details synced with Customer Website!`);
        setTimeout(() => setSyncMessage(null), 3500);
      }
    } catch (err) {
      console.warn('Backend category sync failed:', err);
    }

    setSelectedCat(null);
  };

  // Push all categories to backend & website in 1 click
  const handleSyncAllToWebsite = async () => {
    setSyncLoading(true);
    try {
      const res = await fetch('http://localhost:4200/api/services/categories/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories),
      });
      if (res.ok) {
        setBackendOnline(true);
        setSyncMessage('All categories & images synced with Customer Website!');
        setTimeout(() => setSyncMessage(null), 3500);
      } else {
        throw new Error('Batch sync failed with ' + res.status);
      }
    } catch {
      setSyncMessage('Failed to sync. Please ensure backend is active.');
      setTimeout(() => setSyncMessage(null), 3500);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#F8F9FA] space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span>Catalog</span>
            <span>/</span>
            <span className="text-gray-700 font-semibold">Categories &amp; Subcategories</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-gray-900">
              Categories &amp; Taxonomy Hierarchy
            </h1>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                backendOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{backendOnline ? 'Live Website Sync Active' : 'Offline Mode'}</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your doorstep beauty catalog structure, subcategories, custom images, and active services.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Tab Switcher */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'categories'
                  ? 'bg-white text-[#0071E3] font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Categories ({totalCategories})</span>
            </button>
            <button
              onClick={() => setActiveTab('subcategories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'subcategories'
                  ? 'bg-white text-[#0071E3] font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>Subcategories ({totalSubcategories})</span>
            </button>
          </div>

          <button
            onClick={handleSyncAllToWebsite}
            disabled={syncLoading}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-60"
            title="Push all categories and custom photos to Customer Website"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>{syncLoading ? 'Syncing...' : 'Sync All with Website'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#0071E3] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Category</span>
          </button>
        </div>
      </div>

      {/* Sync notification banner */}
      {syncMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards (HostApp / Tabler Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Categories</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalCategories}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">100% Configured</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Subcategories</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalSubcategories}</p>
            <span className="text-[11px] text-purple-600 font-semibold">Across all groups</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ListTree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Catalog Services</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalServices}</p>
            <span className="text-[11px] text-blue-600 font-semibold">BS-001 to BS-132</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-brand-primary flex items-center justify-center">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Taxonomy Status</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">Active</p>
            <span className="text-[11px] text-gray-400 font-medium">Auto-mapped in booking</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category, subcategory, slug..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-gray-400 font-medium">Showing {filteredCategories.length} of {totalCategories}</span>
        </div>
      </div>

      {/* VIEW 1: Categories Card Grid */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                      <span className="text-[11px] font-mono text-gray-400">/{cat.slug}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#0071E3]">
                    {cat.count} Services
                  </span>
                </div>

                {/* Subcategories Tags */}
                <div className="mt-4 pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Subcategories ({cat.subcategories?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories?.map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200/60"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateToServices ? onNavigateToServices(cat.name) : null}
                  className="text-xs text-[#0071E3] font-bold hover:underline flex items-center gap-1"
                >
                  <span>View Services</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: Subcategories Hierarchy View */}
      {activeTab === 'subcategories' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Category &amp; Subcategory Taxonomic Map
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {totalSubcategories} Total Subcategories mapped to {totalCategories} Categories
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[200px]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{cat.name}</h4>
                    <span className="text-[10px] text-gray-400">{cat.count} linked services</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {cat.subcategories?.map((sub) => (
                    <div
                      key={sub}
                      className="flex items-center gap-1.5 bg-blue-50/60 border border-blue-200/80 text-[#0071E3] px-2.5 py-1 rounded-lg text-xs font-semibold"
                    >
                      <ListTree className="w-3 h-3 text-blue-500" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="text-xs font-bold text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Edit Subs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add Category */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0071E3] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Add New Service Category</h3>
                  <p className="text-[11px] text-gray-500">Create a category to group doorstep services</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayurvedic Body Therapy"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. ayurvedic-body-therapy"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-gray-600 focus:border-[#0071E3]"
                />
              </div>

              {/* Category Photo Image Uploader */}
              <div className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100 space-y-2.5">
                <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-primary" />
                  <span>Category Photo &amp; Image Uploader *</span>
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border-2 border-brand-primary shrink-0 shadow-sm flex items-center justify-center">
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] text-gray-400 font-semibold">No Image</div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        ref={addFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image from Device</span>
                      </button>
                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="text-[11px] text-gray-400 hover:text-rose-500 font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-pink-100">
                  <span className="block text-[10px] font-bold text-gray-500 mb-1.5">
                    Or Quick Select Preset Photo:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORY_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImage(p.url)}
                        className={`text-left p-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                          formImage === p.url
                            ? 'border-brand-primary bg-pink-100/60 font-bold text-brand-primary'
                            : 'border-gray-200 hover:border-pink-200 bg-white text-gray-700'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-6 h-6 rounded object-cover shrink-0" />
                        <span className="text-[10px] truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Subcategories (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Herbal Scrub, Ubtan, Shirodhara"
                  value={formSubcats}
                  onChange={(e) => setFormSubcats(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white font-bold shadow-xs"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Category */}
      {isEditModalOpen && selectedCat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0071E3] flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Edit Category: {selectedCat.name}</h3>
                  <p className="text-[11px] text-gray-500">Update naming, image, and subcategories</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-gray-600 focus:border-[#0071E3]"
                />
              </div>

              {/* Category Photo Image Uploader */}
              <div className="bg-pink-50/60 p-3.5 rounded-2xl border border-pink-100 space-y-2.5">
                <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-primary" />
                  <span>Category Photo &amp; Image Uploader *</span>
                </label>

                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border-2 border-brand-primary shrink-0 shadow-sm flex items-center justify-center">
                    {formImage ? (
                      <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] text-gray-400 font-semibold">No Image</div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Image from Device</span>
                      </button>
                      {formImage && (
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="text-[11px] text-gray-400 hover:text-rose-500 font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-pink-100">
                  <span className="block text-[10px] font-bold text-gray-500 mb-1.5">
                    Or Quick Select Preset Photo:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORY_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImage(p.url)}
                        className={`text-left p-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                          formImage === p.url
                            ? 'border-brand-primary bg-pink-100/60 font-bold text-brand-primary'
                            : 'border-gray-200 hover:border-pink-200 bg-white text-gray-700'
                        }`}
                      >
                        <img src={p.url} alt={p.name} className="w-6 h-6 rounded object-cover shrink-0" />
                        <span className="text-[10px] truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>


              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Subcategories (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={formSubcats}
                  onChange={(e) => setFormSubcats(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-blue-600 text-white font-bold shadow-xs"
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