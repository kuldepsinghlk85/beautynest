import React, { useState, useRef } from 'react';
import {
  Image,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  MoveUp,
  MoveDown,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export interface HeroSlideItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  scriptText: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
}

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'hs-1',
    title: 'Glow Like Never Before',
    subtitle: 'Varanasi Top Doorstep Facial & Cleanup Treatments',
    badge: '★ 4.9 (11,500+ Reviews)',
    scriptText: 'Glow Like Never Before ✨',
    imageUrl: '/slider/slide1.png',
    ctaText: 'Book Facial Now',
    ctaLink: '/services',
    order: 1,
    isActive: true,
  },
  {
    id: 'hs-2',
    title: 'Bridal & Festive Elegance',
    subtitle: 'Pre-wedding & Party Glow Rituals at Your Doorstep',
    badge: 'Flat ₹1000 OFF with BRIDAL1000',
    scriptText: 'Royal Bridal Rituals 🌸',
    imageUrl: '/slider/slide2.png',
    ctaText: 'Explore Bridal Packages',
    ctaLink: '/offers',
    order: 2,
    isActive: true,
  },
  {
    id: 'hs-3',
    title: 'Korean Glass Skin Ritual',
    subtitle: 'Deep Pore Hydration & Ultrasonic Skin Pampering',
    badge: 'Trending in Varanasi',
    scriptText: 'Pure Glass Skin 💧',
    imageUrl: '/slider/slide3.png',
    ctaText: 'Book Korean Ritual',
    ctaLink: '/services',
    order: 3,
    isActive: true,
  },
  {
    id: 'hs-4',
    title: 'Rica Waxing & Full Body Care',
    subtitle: '100% Painless Cartridge Waxing with Sterile Strips',
    badge: '100% Hygienic Kits',
    scriptText: 'Silky Smooth Care 🍯',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    ctaText: 'Book Body Care',
    ctaLink: '/services',
    order: 4,
    isActive: true,
  },
];

export default function SliderManagerPage() {
  const [slides, setSlides] = useState<HeroSlideItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('beautynest_hero_slides');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_HERO_SLIDES;
  });

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);

  // Form states for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formScriptText, setFormScriptText] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCtaText, setFormCtaText] = useState('Book Now');
  const [formCtaLink, setFormCtaLink] = useState('/services');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const saveSlides = (newSlides: HeroSlideItem[]) => {
    setSlides(newSlides);
    if (typeof window !== 'undefined') {
      localStorage.setItem('beautynest_hero_slides', JSON.stringify(newSlides));
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    saveSlides(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this hero slider image?')) {
      const updated = slides.filter((s) => s.id !== id);
      saveSlides(updated);
    }
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const newArr = [...slides];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    saveSlides(newArr);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlide: HeroSlideItem = {
      id: `hs-${Date.now()}`,
      title: formTitle,
      subtitle: formSubtitle,
      badge: formBadge || 'Doorstep Salon 🌸',
      scriptText: formScriptText || 'Glow in Varanasi ✨',
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=800&q=80',
      ctaText: formCtaText || 'Book Now',
      ctaLink: formCtaLink || '/services',
      order: slides.length + 1,
      isActive: true,
    };
    saveSlides([...slides, newSlide]);
    setShowAddModal(false);
    setFormTitle('');
    setFormSubtitle('');
    setFormImageUrl('');
  };

  const handleStartEdit = (s: HeroSlideItem) => {
    setEditingSlide(s);
    setFormTitle(s.title);
    setFormSubtitle(s.subtitle);
    setFormBadge(s.badge);
    setFormScriptText(s.scriptText);
    setFormImageUrl(s.imageUrl);
    setFormCtaText(s.ctaText);
    setFormCtaLink(s.ctaLink);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    const updated = slides.map((s) =>
      s.id === editingSlide.id
        ? {
            ...s,
            title: formTitle,
            subtitle: formSubtitle,
            badge: formBadge,
            scriptText: formScriptText,
            imageUrl: formImageUrl,
            ctaText: formCtaText,
            ctaLink: formCtaLink,
          }
        : s
    );
    saveSlides(updated);
    setEditingSlide(null);
  };

  const activeSlides = slides.filter((s) => s.isActive);
  const currentPreviewSlide = activeSlides[activePreviewIndex] || slides[0];

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            HOME PAGE MARKETING
          </span>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Hero Slider &amp; Banner Photo Manager
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage the luxury rotating carousel on the right-hand side of the Customer Home Page. Upload new photos, update captions &amp; offer badges.
          </p>
        </div>

        <button
          onClick={() => {
            setFormTitle('');
            setFormSubtitle('');
            setFormBadge('Special Offer');
            setFormScriptText('Pamper at Home ✨');
            setFormImageUrl('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary to-pink-600 hover:from-brand-primaryDark hover:to-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-pink-soft hover:shadow-pink-hover transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Slider Photo</span>
        </button>
      </div>

      {/* Live Preview of Home Page Right-Hand Carousel */}
      <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-gray-900">
              Live Home Page Right-Hand Slider Simulator
            </h3>
          </div>
          <span className="text-[10px] bg-pink-50 text-brand-primary font-bold px-2 py-0.5 rounded-full border border-pink-200">
            Auto-rotates every 4s on website
          </span>
        </div>

        {currentPreviewSlide && (
          <div className="max-w-md mx-auto relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] bg-slate-900">
            <img
              src={currentPreviewSlide.imageUrl}
              alt={currentPreviewSlide.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Top Floating Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-pink-200 px-3 py-1 rounded-xl shadow-sm text-xs font-bold text-gray-800">
              {currentPreviewSlide.badge}
            </div>

            {/* Bottom Gradient Overlay with Luxury Script Tag */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xl font-bold font-serif leading-tight">
                {currentPreviewSlide.title}
              </span>
              <p className="text-xs text-pink-200 font-light mt-0.5">
                {currentPreviewSlide.subtitle}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-script text-amber-300">
                  {currentPreviewSlide.scriptText}
                </span>
                <span className="text-[10px] bg-brand-primary text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span>{currentPreviewSlide.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Slider Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activePreviewIndex === idx ? 'w-5 bg-brand-primary' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sliders Grid & Manager */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex gap-4 items-center ${
              slide.isActive ? 'border-pink-200 hover:border-brand-primary' : 'border-gray-200 opacity-60'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative group">
              <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
              <button
                onClick={() => handleStartEdit(slide)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-[10px] font-bold"
              >
                Change
              </button>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono font-bold">
                  #{index + 1}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                  slide.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {slide.isActive ? 'Active on Home' : 'Paused'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-gray-900 truncate">
                {slide.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {slide.subtitle}
              </p>
              <div className="text-[11px] text-brand-primary font-serif italic">
                {slide.scriptText}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1 items-end shrink-0">
              <div className="flex items-center gap-1">
                <button
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'UP')}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={index === slides.length - 1}
                  onClick={() => handleMove(index, 'DOWN')}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded hover:bg-gray-100"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => handleStartEdit(slide)}
                  className="text-brand-primary p-1 rounded-lg hover:bg-pink-50 border border-pink-200"
                  title="Edit Slide & Photo"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleActive(slide.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                    slide.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                  title="Toggle Display"
                >
                  {slide.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="text-gray-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50"
                  title="Delete Slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD NEW SLIDE MODAL WITH PHOTO UPLOADER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            <div className="p-5 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2 text-brand-primary">
                <Image className="w-4 h-4" />
                <h3 className="text-lg font-bold font-serif text-gray-900">
                  Add New Home Slider Photo
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Photo Uploader */}
              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 space-y-2">
                <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-primary" />
                  <span>Upload Slider Photo Image *</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-white border-2 border-brand-primary shrink-0 shadow-sm">
                    <img src={formImageUrl || 'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=800&q=80'} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Computer / Mobile</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Or paste direct image URL"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Slide Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Pure Ayurvedic Kashi Spa Ritual"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. 100% Herbal Products delivered at your home"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. 40% OFF Festive"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Bottom Script Caption ✨
                  </label>
                  <input
                    type="text"
                    value={formScriptText}
                    onChange={(e) => setFormScriptText(e.target.value)}
                    placeholder="e.g. Feel Like Royalty 👑"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Button Action Text
                  </label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="e.g. Book Now"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Target Route / URL
                  </label>
                  <input
                    type="text"
                    value={formCtaLink}
                    onChange={(e) => setFormCtaLink(e.target.value)}
                    placeholder="/services"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white font-bold px-5 py-2.5 rounded-xl shadow-pink-soft"
                >
                  Publish Slider Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLIDE MODAL WITH PHOTO UPLOADER */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            <div className="p-5 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2 text-brand-primary">
                <Edit className="w-4 h-4" />
                <h3 className="text-lg font-bold font-serif text-gray-900">
                  Change Photo &amp; Edit Slide
                </h3>
              </div>
              <button
                onClick={() => setEditingSlide(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Photo Uploader */}
              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 space-y-2">
                <label className="block font-bold text-gray-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-primary" />
                  <span>Replace Photo Image *</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-white border-2 border-brand-primary shrink-0 shadow-sm">
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, true)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload New Photo from Device</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Or paste direct image URL"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Slide Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Bottom Script Caption ✨
                  </label>
                  <input
                    type="text"
                    value={formScriptText}
                    onChange={(e) => setFormScriptText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white font-bold px-5 py-2.5 rounded-xl shadow-pink-soft"
                >
                  Save Photo &amp; Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
