import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Star,
  Award,
  Check,
  XCircle,
  Search,
  UserPlus,
  MapPin,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Briefcase,
  Phone,
  Mail,
  CreditCard,
  Edit,
  Save,
} from 'lucide-react';
import { BEAUTICIANS_LIST, AdminBeautician, VARANASI_AREAS } from '../lib/mockAdminData';

const AVAILABLE_SKILLS = [
  'Korean Glass Skin',
  'O3+ Whitening',
  'O3+ Bridal Glow',
  'Rica Italian Waxing',
  'Rica Brazilian Wax',
  'Honey Classic Waxing',
  'Sara Oxy D-Tan',
  'Raaga De-Tan Body',
  'L’Oreal Hair Spa',
  'Keratin Treatment',
  'Botoplex Hair Botox',
  'Deluxe Rose Mani-Pedi',
  'Crystal Spa Pedicure',
  'Full Face Threading',
  'Aromatherapy Spa',
  'Swedish Full Body Massage',
  'Deep Tissue Massage',
  'Full Body Sea Salt Polishing',
  'Royal Bridal HD Makeup',
  'Sangeet Glam Makeup',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
];

export default function BeauticiansPage() {
  const [beauticians, setBeauticians] = useState<AdminBeautician[]>(BEAUTICIANS_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regArea, setRegArea] = useState<string>(VARANASI_AREAS[0]);
  const [regExperience, setRegExperience] = useState('5');
  const [regSkills, setRegSkills] = useState<string[]>([
    'Korean Glass Skin',
    'O3+ Whitening',
    'Rica Italian Waxing',
  ]);
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regUpiId, setRegUpiId] = useState('');
  const [regPhotoUrl, setRegPhotoUrl] = useState<string>(PRESET_AVATARS[0]);
  const [regKycStatus, setRegKycStatus] = useState<'APPROVED' | 'PENDING'>('APPROVED');

  // Edit Beautician State
  const [editingBeautician, setEditingBeautician] = useState<AdminBeautician | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editExperience, setEditExperience] = useState('5');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editKycStatus, setEditKycStatus] = useState<'APPROVED' | 'PENDING' | 'REJECTED'>('APPROVED');
  const [editSuccess, setEditSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEdit = (b: AdminBeautician) => {
    setEditingBeautician(b);
    setEditName(b.name);
    setEditPhone(b.phone.replace('+91 ', '').replace('+91', ''));
    setEditEmail(b.email);
    setEditArea(b.area);
    setEditExperience(String(b.experienceYears));
    setEditSkills(b.skills || []);
    setEditPhotoUrl(b.avatarUrl || PRESET_AVATARS[0]);
    setEditKycStatus(b.kycStatus);
    setEditSuccess(false);
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditSkill = (skill: string) => {
    if (editSkills.includes(skill)) {
      setEditSkills(editSkills.filter((s) => s !== skill));
    } else {
      setEditSkills([...editSkills, skill]);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBeautician) return;
    setBeauticians((prev) =>
      prev.map((b) =>
        b.id === editingBeautician.id
          ? {
              ...b,
              name: editName,
              phone: editPhone.startsWith('+91') ? editPhone : `+91 ${editPhone}`,
              email: editEmail,
              area: editArea,
              experienceYears: Number(editExperience) || b.experienceYears,
              skills: editSkills.length > 0 ? editSkills : b.skills,
              avatarUrl: editPhotoUrl,
              kycStatus: editKycStatus,
            }
          : b
      )
    );
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setEditingBeautician(null);
    }, 1400);
  };

  const updateStatus = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setBeauticians((prev) =>
      prev.map((b) => (b.id === id ? { ...b, kycStatus: newStatus } : b)),
    );
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    if (regSkills.includes(skill)) {
      setRegSkills(regSkills.filter((s) => s !== skill));
    } else {
      setRegSkills([...regSkills, skill]);
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRegPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Submit Registration Form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBeautician: AdminBeautician = {
      id: `bea-${Date.now()}`,
      name: regName,
      phone: regPhone.startsWith('+91') ? regPhone : `+91 ${regPhone}`,
      email: regEmail || `${regName.toLowerCase().replace(/\s+/g, '.')}@beautynest.in`,
      area: regArea,
      avatarUrl: regPhotoUrl,
      skills: regSkills.length > 0 ? regSkills : ['General Salon', 'Facial & Waxing'],
      experienceYears: Number(regExperience) || 3,
      rating: 5.0,
      totalJobs: 0,
      isOnline: true,
      kycStatus: regKycStatus,
      earningsToday: 0,
      aadhaarNumber: regAadhaar ? `XXXX-XXXX-${regAadhaar.slice(-4)}` : 'XXXX-XXXX-9988',
      upiId: regUpiId || `${regName.toLowerCase().replace(/\s+/g, '')}@upi`,
    };

    setBeauticians([newBeautician, ...beauticians]);
    setRegisterSuccess(true);
    setTimeout(() => {
      setRegisterSuccess(false);
      setShowRegisterModal(false);
      // Reset form
      setRegName('');
      setRegPhone('');
      setRegEmail('');
      setRegAadhaar('');
      setRegUpiId('');
    }, 1600);
  };

  const filtered = beauticians.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArea = selectedArea === 'ALL' || b.area.toLowerCase() === selectedArea.toLowerCase();
    return matchesSearch && matchesArea;
  });

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-gray-900">
              Varanasi Beautician Partners &amp; Onboarding
            </h2>
            <span className="bg-pink-100 text-brand-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
              {beauticians.length} Active Partners
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage 20 Varanasi area beauticians, photo upload service, Aadhaar KYC verification, and live bookings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, area, skill..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
            />
          </div>

          {/* Area Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-primary" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-transparent border-none outline-none cursor-pointer text-gray-800 font-semibold"
            >
              <option value="ALL">All Varanasi Areas</option>
              {VARANASI_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Register Beautician Action Button */}
          <button
            onClick={() => setShowRegisterModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-pink-soft transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Beautician</span>
          </button>
        </div>
      </div>

      {/* Grid of Beautician Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Photo Avatar with upload indicator */}
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-pink-50 border-2 border-pink-100 shrink-0">
                    {b.avatarUrl ? (
                      <img
                        src={b.avatarUrl}
                        alt={b.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-brand-primary to-pink-300 text-white flex items-center justify-center font-bold text-base">
                        {b.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {b.isOnline ? (
                      <span
                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"
                        title="Online & Ready for booking"
                      />
                    ) : (
                      <span
                        className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white"
                        title="Offline"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-gray-900">{b.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-brand-primary font-semibold mt-0.5">
                      <MapPin className="w-3 h-3 text-brand-primary" />
                      <span>{b.area}, Varanasi</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{b.phone} • {b.experienceYears} Yrs Exp</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      b.kycStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : b.kycStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {b.kycStatus === 'APPROVED' ? '✓ Verified' : b.kycStatus}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary bg-pink-50 hover:bg-pink-100 px-2 py-0.5 rounded-lg border border-pink-200 transition-colors"
                    title="Edit Beautician & Change Photo"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Photo &amp; Info</span>
                  </button>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mt-3.5">
                {b.skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-pink-50 text-brand-primary px-2 py-0.5 rounded-md font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {b.skills.length > 3 && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-medium">
                    +{b.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 bg-gray-50/80 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Rating</span>
                  <span className="font-bold text-gray-900 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {b.rating}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Jobs Done</span>
                  <span className="font-bold text-gray-900">{b.totalJobs}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Today Earned</span>
                  <span className="font-bold text-emerald-600">₹{b.earningsToday}</span>
                </div>
              </div>
            </div>

            {/* KYC Workflow Controls */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-gray-500">
                Aadhaar: <span className="font-mono text-gray-700">{b.aadhaarNumber || 'Verified'}</span>
              </span>
              {b.kycStatus === 'PENDING' ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateStatus(b.id, 'APPROVED')}
                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, 'REJECTED')}
                    className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  KYC Cleared
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Beautician Registration Modal Form */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2 text-brand-primary mb-0.5">
                  <UserPlus className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Admin Portal • Varanasi Partner Onboarding
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900">
                  Register New Beautician Partner
                </h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {registerSuccess ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    Beautician Onboarded Successfully!
                  </h3>
                  <p className="text-xs text-gray-600">
                    <strong>{regName}</strong> has been registered for <strong>{regArea}, Varanasi</strong> with photo and skills. She is now ready to receive doorstep booking orders!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  {/* Photo Upload Section */}
                  <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100">
                    <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-brand-primary" />
                      Beautician Profile Photo Upload Service *
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Photo Avatar Preview */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-primary shadow-sm bg-white shrink-0">
                        {regPhotoUrl ? (
                          <img
                            src={regPhotoUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex flex-wrap gap-2">
                          {/* File input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo from Device</span>
                          </button>
                        </div>
                        {/* Preset Avatars picker */}
                        <div>
                          <span className="text-[10px] text-gray-500 block mb-1">
                            Or select from verified portrait presets:
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {PRESET_AVATARS.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setRegPhotoUrl(url)}
                                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                                  regPhotoUrl === url
                                    ? 'border-brand-primary scale-110'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal details row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name (Female Beautician) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Shalini Tripathi"
                        className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-xs bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9839012345"
                          className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-r-xl outline-none focus:border-brand-primary focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Varanasi Area & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Assigned Varanasi Area *
                      </label>
                      <div className="relative">
                        <select
                          value={regArea}
                          onChange={(e) => setRegArea(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white appearance-none font-semibold cursor-pointer"
                        >
                          {VARANASI_AREAS.map((a) => (
                            <option key={a} value={a}>
                              {a}, Varanasi
                            </option>
                          ))}
                        </select>
                        <MapPin className="w-4 h-4 text-brand-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Salon Experience (Years) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        required
                        value={regExperience}
                        onChange={(e) => setRegExperience(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Skills Checklist */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Service Specializations &amp; Certified Skills ({regSkills.length} selected)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <label
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                            regSkills.includes(skill)
                              ? 'bg-pink-100/70 text-brand-primary font-bold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={regSkills.includes(skill)}
                            onChange={() => {}}
                            className="rounded text-brand-primary focus:ring-0"
                          />
                          <span className="truncate">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* KYC & Financial details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Aadhaar Number (12-digit)
                      </label>
                      <input
                        type="text"
                        maxLength={12}
                        value={regAadhaar}
                        onChange={(e) => setRegAadhaar(e.target.value.replace(/\D/g, ''))}
                        placeholder="543210987654"
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Payout UPI ID
                      </label>
                      <input
                        type="text"
                        value={regUpiId}
                        onChange={(e) => setRegUpiId(e.target.value)}
                        placeholder="beautician@okhdfcbank"
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Initial KYC Status
                      </label>
                      <select
                        value={regKycStatus}
                        onChange={(e) => setRegKycStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white font-semibold cursor-pointer"
                      >
                        <option value="APPROVED">APPROVED (Verified)</option>
                        <option value="PENDING">PENDING (Review)</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold py-3.5 rounded-xl shadow-pink-soft hover:shadow-pink-hover transition-all text-xs uppercase tracking-wider"
                  >
                    Save &amp; Onboard Varanasi Beautician
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Beautician & Change Photo Modal */}
      {editingBeautician && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 flex items-center justify-center">
          <div className="my-auto w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100 max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2 text-brand-primary mb-0.5">
                  <Edit className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Beautician Profile &amp; Photo Editor
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-gray-900">
                  Edit {editingBeautician.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingBeautician(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              {editSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    Beautician Profile &amp; Photo Updated!
                  </h3>
                  <p className="text-xs text-gray-600">
                    Changes for <strong>{editName}</strong> ({editArea}, Varanasi) have been saved successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} className="space-y-5">
                  {/* Photo Uploader with Live Preview */}
                  <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100">
                    <label className="block text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-brand-primary" />
                      Change Beautician Photo with Image Uploader *
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Photo Avatar Preview */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-primary shadow-sm bg-white shrink-0">
                        {editPhotoUrl ? (
                          <img
                            src={editPhotoUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditPhotoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 bg-white hover:bg-pink-50 text-brand-primary border border-pink-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload New Photo from Device</span>
                          </button>
                        </div>
                        {/* Preset Avatars picker */}
                        <div>
                          <span className="text-[10px] text-gray-500 block mb-1">
                            Or choose from verified portrait presets:
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {PRESET_AVATARS.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setEditPhotoUrl(url)}
                                className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                                  editPhotoUrl === url
                                    ? 'border-brand-primary scale-110'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal details row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 text-xs bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-600 font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-r-xl outline-none focus:border-brand-primary focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Varanasi Area & Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Varanasi Coverage Area *
                      </label>
                      <div className="relative">
                        <select
                          value={editArea}
                          onChange={(e) => setEditArea(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white appearance-none font-semibold cursor-pointer"
                        >
                          {VARANASI_AREAS.map((a) => (
                            <option key={a} value={a}>
                              {a}, Varanasi
                            </option>
                          ))}
                        </select>
                        <MapPin className="w-4 h-4 text-brand-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Experience (Years) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        required
                        value={editExperience}
                        onChange={(e) => setEditExperience(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Skills Checklist */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Service Specializations ({editSkills.length} selected)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                      {AVAILABLE_SKILLS.map((skill) => (
                        <label
                          key={skill}
                          onClick={() => toggleEditSkill(skill)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                            editSkills.includes(skill)
                              ? 'bg-pink-100/70 text-brand-primary font-bold'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={editSkills.includes(skill)}
                            onChange={() => {}}
                            className="rounded text-brand-primary focus:ring-0"
                          />
                          <span className="truncate">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* KYC Status Select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      KYC Verification Status
                    </label>
                    <select
                      value={editKycStatus}
                      onChange={(e) => setEditKycStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white font-semibold cursor-pointer"
                    >
                      <option value="APPROVED">APPROVED (Verified)</option>
                      <option value="PENDING">PENDING (Under Review)</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingBeautician(null)}
                      className="px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-primary to-pink-500 hover:from-brand-primaryDark hover:to-brand-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-pink-soft text-xs uppercase tracking-wider"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
