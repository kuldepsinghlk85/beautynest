'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ShoppingBag,
  Sparkles,
  Menu,
  X,
  User,
  CheckCircle2,
  Heart,
  Camera,
  Upload,
  Shield,
  ChevronRight,
  LocateFixed,
  Navigation,
  Bike,
  Smartphone,
  Calendar,
  Clock,
  ChevronDown,
  LogOut,
  Phone,
  Check,
  Award,
} from 'lucide-react';
import { VARANASI_AREAS } from '../lib/data';
import { INITIAL_CITIES } from '../lib/masterConfig';
import { getCartCount } from '../lib/cartStore';
import {
  getCurrentUser,
  setCurrentUser,
  saveCustomer,
  getCustomerBookings,
  type CustomerProfile,
  type BookingRecord,
} from '../lib/userStore';

const PRESET_USER_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Varanasi');
  const [selectedArea, setSelectedArea] = useState<string>(VARANASI_AREAS[0]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [regArea, setRegArea] = useState<string>(VARANASI_AREAS[0]);
  const [doorstepAddress, setDoorstepAddress] = useState('');
  const [customerPhotoUrl, setCustomerPhotoUrl] = useState<string>(PRESET_USER_AVATARS[0]);
  const [regSuccess, setRegSuccess] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // User session & bookings state
  const [currentUser, setLocalCurrentUser] = useState<CustomerProfile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);
  const [userBookings, setUserBookings] = useState<BookingRecord[]>([]);
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [cartCount, setCartCount] = useState(0);
  const customerFileInputRef = useRef<HTMLInputElement>(null);

  const loadUserData = () => {
    const u = getCurrentUser();
    setLocalCurrentUser(u);
    const b = getCustomerBookings(u?.phone);
    setUserBookings(b);
    setCartCount(getCartCount());
  };

  useEffect(() => {
    loadUserData();
    const handleUserChange = () => loadUserData();
    const handleBookingChange = () => loadUserData();
    const handleCartChange = () => setCartCount(getCartCount());
    window.addEventListener('beautynest_user_change', handleUserChange);
    window.addEventListener('beautynest_booking_created', handleBookingChange);
    window.addEventListener('beautynest_cart_updated', handleCartChange);
    return () => {
      window.removeEventListener('beautynest_user_change', handleUserChange);
      window.removeEventListener('beautynest_booking_created', handleBookingChange);
      window.removeEventListener('beautynest_cart_updated', handleCartChange);
    };
  }, []);

  const handleCustomerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomerPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoFillVaranasiLocation = () => {
    setIsDetectingLocation(true);
    setTimeout(() => {
      setIsDetectingLocation(false);
      setRegArea('Sigra');
      setDoorstepAddress('House 42, 2nd Floor, Anand Nagar Colony, Opposite Sigra Sports Stadium, Sigra, Varanasi');
    }, 700);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: CustomerProfile = {
      id: `CUST-${Date.now().toString().slice(-5)}`,
      fullName: fullName.trim() || 'Priya Sharma',
      phone: phoneNumber.replace(/\D/g, '') || '9876543210',
      email: email.trim() || 'priya@example.com',
      area: regArea,
      address: doorstepAddress.trim() || `${regArea}, Varanasi`,
      photoUrl: customerPhotoUrl,
      walletBalance: 200,
      registeredAt: new Date().toISOString(),
    };
    setCurrentUser(newCustomer);
    setLocalCurrentUser(newCustomer);
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setShowAuthModal(false);
    }, 1800);
  };

  const handleLoginSubmit = () => {
    const cleanPhone = loginPhone.replace(/\D/g, '') || '9876543210';
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('beautynest_customers');
        const list: CustomerProfile[] = saved ? JSON.parse(saved) : [];
        const existing = list.find((c) => c.phone === cleanPhone);
        if (existing) {
          setCurrentUser(existing);
          setLocalCurrentUser(existing);
          setRegSuccess(true);
          setTimeout(() => {
            setRegSuccess(false);
            setShowAuthModal(false);
          }, 1200);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const profile: CustomerProfile = {
      id: `CUST-${cleanPhone.slice(-4)}`,
      fullName: 'Priya Sharma',
      phone: cleanPhone,
      email: 'priya@example.com',
      area: 'Sigra',
      address: 'House 42, Anand Nagar, Sigra, Varanasi',
      photoUrl: customerPhotoUrl,
      walletBalance: 200,
      registeredAt: new Date().toISOString(),
    };
    setCurrentUser(profile);
    setLocalCurrentUser(profile);
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setShowAuthModal(false);
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm">
      {/* Top Bar for Multi-City Announcement & Portals Switcher */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
            ONLINE
          </span>
          <span className="text-[11px]">
            Ladies Doorstep Salon • Certified Beauticians in <strong className="text-white">{selectedCity}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/beautician-mobile"
            className="text-pink-200 hover:text-white font-bold transition-colors flex items-center gap-1.5 text-[11px] bg-pink-500/20 px-2.5 py-0.5 rounded-full border border-pink-400/30"
            title="Beautician Mobile Web App PWA"
          >
            <Smartphone className="w-3.5 h-3.5 text-pink-300" />
            <span>📱 Beautician App</span>
          </Link>

          <Link
            href="/beautician-portal"
            className="text-amber-300 hover:text-white font-bold transition-colors flex items-center gap-1.5 text-[11px] bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-300/30"
            title="Beautician Doorstep Navigation Portal"
          >
            <Bike className="w-3.5 h-3.5 text-amber-300" />
            <span>Beautician Portal</span>
          </Link>

          <a
            href="http://localhost:5175"
            target="_blank"
            rel="noreferrer"
            className="text-pink-300 hover:text-white font-bold transition-colors flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full"
          >
            <Shield className="w-3 h-3 text-brand-primary" />
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-pink-200 shadow-pink-soft group-hover:scale-105 transition-transform bg-white flex items-center justify-center p-0.5 shrink-0">
              <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold tracking-tight text-brand-charcoal block">
                Beauty<span className="text-brand-primary">Nest</span>
              </span>
              <p className="text-[11px] text-gray-500 tracking-wider uppercase font-medium">
                Ladies Doorstep Salon
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-700">
            <Link href="/" className="text-brand-primary font-semibold hover:text-brand-primaryDark transition-colors">
              Home
            </Link>
            <Link href="/services" className="hover:text-brand-primary transition-colors">
              Services
            </Link>
            <Link href="/professionals" className="hover:text-brand-primary transition-colors">
              Our Beauticians
            </Link>
            <Link href="/offers" className="hover:text-brand-primary transition-colors flex items-center gap-1">
              Offers
              <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>
            </Link>
            <Link href="/about" className="hover:text-brand-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-brand-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-4">
            {/* Multi-City & Area Selector */}
            <div className="flex items-center gap-1.5 bg-brand-bg px-3.5 py-1.5 rounded-full border border-pink-200 text-xs font-semibold text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-brand-primary font-bold"
              >
                {INITIAL_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {selectedCity === 'Varanasi' && (
                <>
                  <span className="text-gray-300">|</span>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="bg-transparent border-none outline-none cursor-pointer text-gray-800 font-medium max-w-[110px] truncate"
                  >
                    {VARANASI_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* Cart / Bookings Quick View */}
            <Link
              href="/services"
              className="p-2.5 rounded-full text-gray-600 hover:text-brand-primary hover:bg-brand-primaryLight transition-all relative"
              title="कार्ट / चयनित पैकेज (Cart Packages)"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-brand-primary text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Customer Profile Pill (When Logged In) vs Customer Register CTA */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-pink-50 via-white to-pink-50 hover:from-pink-100 hover:to-pink-100 border border-pink-200 py-1.5 px-3 rounded-full transition-all shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-brand-primary shrink-0 shadow-xs">
                    <img src={currentUser.photoUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900">{currentUser.fullName.split(' ')[0]}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Logged in" />
                    </div>
                    <span className="text-[10px] text-brand-primary font-bold block">₹{currentUser.walletBalance} Wallet</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-brand-primary transition-transform" />
                </button>

                {/* Account Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2.5">
                      <img src={currentUser.photoUrl} alt="Customer" className="w-10 h-10 rounded-full object-cover border border-pink-200" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 truncate">{currentUser.fullName}</p>
                        <p className="text-[11px] text-gray-500">+91 {currentUser.phone}</p>
                        <p className="text-[10px] text-brand-primary font-semibold truncate">📍 {currentUser.area}, Varanasi</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMyBookingsModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 hover:bg-pink-50 hover:text-brand-primary rounded-xl transition-all flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-primary" />
                        <span>My Bookings (मेरी बुकिंग्स)</span>
                      </span>
                      <span className="bg-pink-100 text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {userBookings.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUser(null);
                        setLocalCurrentUser(null);
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-pink-soft hover:shadow-pink-hover transition-all transform hover:-translate-y-0.5"
              >
                <User className="w-4 h-4" />
                <span>Customer Register</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-brand-primary focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-brand-charcoal" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-brand-border px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-200 shadow-xs shrink-0">
              <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 block font-serif">BeautyNest</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-primary" />
                Varanasi: {selectedArea}
              </span>
            </div>
          </div>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-pink-50"
          >
            Home
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-pink-50"
          >
            Services Catalog (Varanasi)
          </Link>
          <Link
            href="/professionals"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-pink-50"
          >
            Our 20 Verified Beauticians
          </Link>
          <Link
            href="/offers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-pink-50"
          >
            Offers & Packages
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-pink-50"
          >
            About BeautyNest
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-pink-50"
          >
            Contact & Support
          </Link>
          <div className="pt-2 space-y-2 border-t border-gray-100">
            {currentUser ? (
              <div className="p-3 bg-pink-50 rounded-2xl border border-pink-100 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={currentUser.photoUrl} alt="User" className="w-10 h-10 rounded-full object-cover border border-pink-200" />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{currentUser.fullName}</span>
                    <span className="text-[11px] text-brand-primary font-semibold">₹{currentUser.walletBalance} Wallet Balance</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowMyBookingsModal(true);
                  }}
                  className="w-full py-2 bg-white border border-pink-200 hover:bg-pink-100 text-brand-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>My Bookings ({userBookings.length})</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setLocalCurrentUser(null);
                  }}
                  className="w-full py-1.5 text-rose-600 text-xs font-bold hover:underline text-center block"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-primary to-pink-500 text-white py-3 rounded-xl font-semibold shadow-md text-xs uppercase"
              >
                <User className="w-4 h-4" />
                Customer Registration (Varanasi)
              </button>
            )}
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex justify-center items-center gap-2 bg-pink-100 text-brand-primary py-3 rounded-xl font-semibold text-xs uppercase"
            >
              Book Doorstep Service Now
            </Link>
          </div>
        </div>
      )}
    </header>

    {/* Customer Registration / Login Modal (Rendered outside sticky header to avoid backdrop-blur clipping) */}
    {showAuthModal && (
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowAuthModal(false);
        }}
        className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center min-h-screen py-6 sm:py-10"
      >
        <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-pink-100 max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Fixed Header */}
          <div className="p-5 sm:p-6 pb-3 border-b border-pink-50 relative shrink-0 bg-white">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-200 shadow-sm shrink-0">
                  <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-brand-primary">
                    <Heart className="w-3.5 h-3.5 fill-brand-primary" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ladies Doorstep Salon</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-serif text-gray-900">
                    {authMode === 'register' ? 'New Customer Registration' : 'Customer Login'}
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {authMode === 'register'
                    ? 'Register with photo & address for safe doorstep salon services'
                    : 'Sign in to your registered BeautyNest account'}
                </p>
                <Link
                  href="/register"
                  onClick={() => setShowAuthModal(false)}
                  className="text-[11px] text-brand-primary hover:underline font-bold shrink-0 ml-2"
                >
                  Full Page ↗
                </Link>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-pink-50 p-1 mt-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Register New Customer
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Existing Customer Login
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {regSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-primary mx-auto shadow-md">
                    <img src={customerPhotoUrl} alt={fullName || 'Customer'} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    Welcome to BeautyNest!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Congratulations {fullName || 'Dear Customer'}! Your customer account for Varanasi ({regArea}) is registered with your photo. A verified female beautician can now be booked at your doorstep!
                  </p>
                  <div className="bg-pink-50 p-4 rounded-2xl text-xs text-brand-primary font-medium">
                    🎉 Special Welcome Gift: ₹200 added to your BeautyNest Wallet!
                  </div>
                </div>
              ) : authMode === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Photo Uploader */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Customer Photo / Profile Picture
                    </label>
                    <div className="flex items-center gap-4 p-3 bg-pink-50/50 rounded-2xl border border-pink-100">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-brand-primary shrink-0 shadow-sm">
                        <img
                          src={customerPhotoUrl}
                          alt="Customer Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => customerFileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => customerFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 bg-white border border-pink-200 text-brand-primary px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:bg-pink-50 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo</span>
                          </button>
                          <input
                            ref={customerFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCustomerPhotoUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Click to upload your photo or choose a preset:
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          {PRESET_USER_AVATARS.map((avatar, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCustomerPhotoUrl(avatar)}
                              className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                                customerPhotoUrl === avatar
                                  ? 'border-brand-primary scale-110 ring-2 ring-pink-200'
                                  : 'border-gray-200 hover:border-pink-300'
                              }`}
                            >
                              <img src={avatar} alt="Preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name (Female Customer) *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-xs bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-semibold">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-r-xl outline-none focus:border-brand-primary focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Select Varanasi Major Area *
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoFillVaranasiLocation}
                        disabled={isDetectingLocation}
                        className="text-[10px] font-bold text-brand-primary hover:text-brand-primaryDark bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-md border border-pink-200 transition-colors flex items-center gap-1"
                      >
                        <LocateFixed className="w-3 h-3" />
                        <span>{isDetectingLocation ? 'Scanning GPS...' : '📍 Auto-Detect (Varanasi GPS)'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <select
                        value={regArea}
                        onChange={(e) => setRegArea(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white appearance-none cursor-pointer font-medium"
                      >
                        {VARANASI_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}, Varanasi
                          </option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-brand-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Doorstep Address (House / Flat No, Street, Landmark) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={doorstepAddress}
                      onChange={(e) => setDoorstepAddress(e.target.value)}
                      placeholder="e.g. Flat 302, Gangotri Enclave, Near BHU Main Gate, Varanasi"
                      className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white resize-none"
                    />
                  </div>

                  <div className="p-3 bg-pink-50/70 rounded-2xl border border-pink-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      🛡️
                    </div>
                    <p className="text-[11px] text-gray-600 leading-snug">
                      <strong>100% Female Safety Guarantee:</strong> Services provided exclusively by background-verified female beauticians with single-use sterile kits.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold py-3.5 rounded-2xl shadow-pink-soft hover:shadow-pink-hover transition-all text-xs uppercase tracking-wider"
                  >
                    Complete Customer Registration
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Enter Registered Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-semibold">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-r-xl outline-none focus:border-brand-primary focus:bg-white font-medium"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Demo Mode: Instant auto-verification enabled with ₹200 welcome bonus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoginSubmit}
                    className="w-full bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold py-3.5 rounded-2xl shadow-pink-soft transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>Instant Login to Account</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Bookings Tracker Modal */}
      {showMyBookingsModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMyBookingsModal(false);
          }}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center min-h-screen py-6 sm:py-10"
        >
          <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-pink-100 max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-pink-100 relative bg-gradient-to-r from-pink-50 to-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 shadow-xs shrink-0">
                  <img src="/logo.png" alt="BeautyNest" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900">
                    My Bookings (मेरी बुकिंग्स)
                  </h3>
                  <p className="text-xs text-gray-500">
                    {currentUser ? `${currentUser.fullName} • +91 ${currentUser.phone}` : 'Track live & past doorstep salon orders'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMyBookingsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bookings List Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {userBookings.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-16 h-16 bg-pink-50 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-pink-400" />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">No Bookings Yet</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    You haven&apos;t booked any doorstep salon services yet. Choose from 130+ verified services!
                  </p>
                  <Link
                    href="/services"
                    onClick={() => setShowMyBookingsModal(false)}
                    className="inline-block bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-pink-soft transition-all"
                  >
                    Book Doorstep Salon Now
                  </Link>
                </div>
              ) : (
                userBookings.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="bg-white rounded-2xl border border-pink-100 shadow-xs p-4 space-y-3 hover:border-pink-300 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {b.bookingNumber || b.id}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {b.bookingDate || 'Recent'}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        {b.status || 'CONFIRMED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 text-[11px] block">Booked Service</span>
                        <span className="font-bold text-gray-900">{b.serviceName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[11px] block">Scheduled Slot</span>
                        <span className="font-semibold text-gray-800">
                          {b.scheduledDate} • {b.scheduledTime}
                        </span>
                      </div>
                    </div>

                    <div className="bg-pink-50/60 p-2.5 rounded-xl border border-pink-100 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Assigned Beautician</span>
                        <span className="font-bold text-brand-primary">{b.beauticianName}</span>
                        <span className="text-[11px] text-gray-500 block">{b.beauticianTier || 'Gold Tier'} • Verified</span>
                      </div>
                      <a
                        href={`https://wa.me/${b.beauticianPhone?.replace(/\D/g, '') || '919839012001'}?text=Hello%20${b.beauticianName},%20I%20am%20${b.customerName}%20regarding%20booking%20${b.bookingNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    <div className="text-[11px] text-gray-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                      <span>{b.customerAddress} ({b.area})</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs font-bold">
                      <span className="text-gray-600">Total Amount ({b.paymentMethod || 'UPI'})</span>
                      <span className="text-brand-primary text-sm">₹{b.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
