'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Sparkles, ShieldCheck, CheckCircle2, User, Phone, Mail, Home, ArrowLeft, Camera, Upload } from 'lucide-react';
import { VARANASI_AREAS } from '../../lib/data';

export default function CustomerRegistrationPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState<string>(VARANASI_AREAS[0]);
  const [houseAddress, setHouseAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('221005');
  const [preferredService, setPreferredService] = useState('Facial & Clean Up');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80');
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-brand-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-pink-100 relative">
          {submitted ? (
            <div className="text-center py-10 space-y-5">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-gray-900">
                Registration Successful!
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dear <strong>{fullName}</strong>, your customer profile for <strong>{area}, Varanasi</strong> is active. Verified female doorstep beauticians are ready to serve you with 100% sterile kits.
              </p>
              <div className="bg-pink-50 p-4 rounded-2xl border border-pink-100 text-xs text-brand-primary font-bold">
                🎁 ₹200 Welcome Bonus credited to your BeautyNest Wallet!
              </div>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/services"
                  className="bg-brand-primary hover:bg-brand-primaryDark text-white text-xs font-bold px-6 py-3.5 rounded-full shadow-pink-soft transition-all"
                >
                  Explore Varanasi Services
                </Link>
                <Link
                  href="/professionals"
                  className="bg-white border border-gray-200 hover:border-brand-primary text-gray-700 text-xs font-bold px-6 py-3.5 rounded-full transition-all"
                >
                  View 20 Varanasi Beauticians
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-pink-100 text-brand-primary px-3 py-1 rounded-full text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Varanasi Ladies Doorstep Salon</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                  Customer Registration
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Create your profile to book certified salon professionals right at your doorstep in Varanasi
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Customer Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-primary" />
                    Customer Profile Picture / Photo
                  </label>
                  <div className="flex items-center gap-4 p-4 bg-pink-50/50 rounded-2xl border border-pink-100">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-brand-primary shrink-0 shadow-sm">
                      <img
                        src={photoUrl}
                        alt="Customer Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white border border-pink-200 text-brand-primary px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:bg-pink-50 transition-colors"
                      >
                        <span>Change / Upload Photo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <p className="text-[11px] text-gray-500">
                        Upload your photo for verified beautician doorstep safety
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-brand-primary" />
                    Full Name (Female Customer) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shalini Tripathi"
                    className="w-full px-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-primary" />
                      Mobile Number *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 text-xs bg-gray-100 border border-r-0 border-gray-200 rounded-l-2xl text-gray-600 font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9839012345"
                        className="w-full px-3 py-3 text-xs bg-gray-50 border border-gray-200 rounded-r-2xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-brand-primary" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="shalini@example.com"
                      className="w-full px-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Varanasi Area Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                    Varanasi Operational Area *
                  </label>
                  <div className="relative">
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white appearance-none font-medium cursor-pointer"
                    >
                      {VARANASI_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}, Varanasi
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-brand-primary absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Doorstep Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-brand-primary" />
                    Complete Doorstep Address (Flat, House No, Society) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={houseAddress}
                    onChange={(e) => setHouseAddress(e.target.value)}
                    placeholder="e.g. House No. B-12, Anand Vihar Colony, Near Durga Temple, Lanka"
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Nearest Landmark
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Sankat Mochan Mandir"
                      className="w-full px-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="221005"
                      className="w-full px-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
                    />
                  </div>
                </div>

                {/* Primary Beauty Interest */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Primary Service Interest
                  </label>
                  <select
                    value={preferredService}
                    onChange={(e) => setPreferredService(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white font-medium cursor-pointer"
                  >
                    <option>Facial & Clean Up (O3+ / Korean Hydra)</option>
                    <option>Waxing (Rica / Honey / Bikini)</option>
                    <option>Hair Care (Hair Spa / Keratin / Botox)</option>
                    <option>Bleach & D-Tan Removal</option>
                    <option>Manicure & Pedicure</option>
                    <option>Body Spa & Massage</option>
                    <option>Bridal & Party Makeup</option>
                  </select>
                </div>

                {/* Safety Badge */}
                <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>Safe Ladies Community:</strong> BeautyNest only serves female clients. Beauticians arrive with photo IDs, sealed disposable kits, and sanitized equipment.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold py-4 rounded-2xl shadow-pink-soft hover:shadow-pink-hover transition-all text-xs uppercase tracking-wider"
                >
                  Submit Registration &amp; Claim ₹200 Wallet Bonus
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
