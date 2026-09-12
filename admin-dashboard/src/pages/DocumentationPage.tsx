import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Layers,
  Smartphone,
  Shield,
  Server,
  Settings,
  Tag,
  Gift,
  Sparkles,
  Sliders,
  MapPin,
  FileCheck,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Info,
  DollarSign,
  Car,
  Compass,
  ArrowRight,
  Code2,
  Cpu,
  BookMarked,
  Printer,
  Download,
} from 'lucide-react';

export default function DocumentationPage({
  onNavigateTab,
}: {
  onNavigateTab?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CUSTOMER' | 'BEAUTICIAN' | 'ADMIN' | 'BACKEND' | 'HOWTO'
  >('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-900">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-purple-800/30">
        <div className="flex items-start sm:items-center gap-4 max-w-2xl">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-400/50 shadow-lg shrink-0">
            <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>BEAUTY NEST MASTER MANUAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              Complete Platform Documentation &amp; Admin Guide (संपूर्ण सिस्टम दस्तावेज़)
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
              Comprehensive reference manual containing customer features, beautician doorstep mobile app, admin controls, dynamic pricing formulas, and step-by-step modification guides.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Printer className="w-3.5 h-3.5 text-pink-300" />
            <span>Print / Save PDF</span>
          </button>
          <a
            href="http://localhost:4200/api/docs"
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-[#D84374] to-pink-600 hover:from-[#c23664] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Swagger API Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-semibold text-gray-600">
        {[
          { id: 'OVERVIEW', label: '1. Architecture & Overview', icon: Layers },
          { id: 'CUSTOMER', label: '2. Customer Website & Booking', icon: Sparkles },
          { id: 'BEAUTICIAN', label: '3. Beautician Mobile App (PWA)', icon: Smartphone },
          { id: 'ADMIN', label: '4. Admin Modules & Features', icon: Shield },
          { id: 'BACKEND', label: '5. Backend APIs & Database', icon: Server },
          { id: 'HOWTO', label: '6. Customization Handbook (बदलाव गाइड)', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#D84374] to-pink-600 text-white shadow-xs'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE & SYSTEM OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-[#D84374] uppercase tracking-wider block">
                CUSTOMER WEB APP
              </span>
              <h3 className="font-bold text-base text-gray-900">Next.js 14 Web &amp; PWA</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Server-side rendered storefront on port <strong>3100</strong>. Features instant booking, 12 Varanasi hubs, GPS detection, map simulator, and itemized billing.
              </p>
              <div className="pt-2">
                <a
                  href="http://localhost:3100"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#D84374] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Website (localhost:3100)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                BEAUTICIAN MOBILE PWA
              </span>
              <h3 className="font-bold text-base text-gray-900">Native Mobile Style App</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Mobile web app on port <strong>3100/beautician-mobile</strong> with phone/OTP login, order accept/reject, vector routing, and 8-step service flow.
              </p>
              <div className="pt-2">
                <a
                  href="http://localhost:3100/beautician-mobile"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Mobile PWA (localhost:3100)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                BACKEND MICROSERVICES
              </span>
              <h3 className="font-bold text-base text-gray-900">NestJS 10 REST &amp; Prisma</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Modular REST backend on port <strong>4200</strong> with 7 specialized microservices: packages, sliders, offers, coupons, beautician web, navigation, and auth.
              </p>
              <div className="pt-2">
                <a
                  href="http://localhost:4200/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Explore Swagger API Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Master Live Ports Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#D84374]" />
                <span>Live Service Ports &amp; Direct Access URLs</span>
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                ● All 3 Servers Running
              </span>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-semibold text-[10px] uppercase">
                    <th className="p-3.5">Component</th>
                    <th className="p-3.5">Port</th>
                    <th className="p-3.5">Direct URL</th>
                    <th className="p-3.5">Default Credentials</th>
                    <th className="p-3.5">Key Features</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  <tr>
                    <td className="p-3.5 font-bold text-gray-900">Customer Storefront</td>
                    <td className="p-3.5 font-mono text-gray-600">3100</td>
                    <td className="p-3.5">
                      <a href="http://localhost:3100" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        http://localhost:3100
                      </a>
                    </td>
                    <td className="p-3.5 text-gray-500">Public Access</td>
                    <td className="p-3.5 text-gray-600">Rotating Hero Carousel, 132 Services, Dynamic Booking</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-purple-700">Beautician Mobile App (PWA)</td>
                    <td className="p-3.5 font-mono text-gray-600">3100</td>
                    <td className="p-3.5">
                      <a href="http://localhost:3100/beautician-mobile" target="_blank" rel="noreferrer" className="text-purple-600 font-semibold hover:underline">
                        http://localhost:3100/beautician-mobile
                      </a>
                    </td>
                    <td className="p-3.5 text-gray-700 font-mono">Mobile: 9876543210 • OTP: 1234</td>
                    <td className="p-3.5 text-gray-600">8-step service flow, accept/reject, "Go To Customer" routing</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-amber-700">Beautician Web Portal</td>
                    <td className="p-3.5 font-mono text-gray-600">3100</td>
                    <td className="p-3.5">
                      <a href="http://localhost:3100/beautician-portal" target="_blank" rel="noreferrer" className="text-amber-600 font-semibold hover:underline">
                        http://localhost:3100/beautician-portal
                      </a>
                    </td>
                    <td className="p-3.5 text-gray-500">Auto-authenticated</td>
                    <td className="p-3.5 text-gray-600">Current trip countdown, persistent address, next booking info</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-[#D84374]">Admin Command Dashboard</td>
                    <td className="p-3.5 font-mono text-gray-600">5175</td>
                    <td className="p-3.5">
                      <a href="http://localhost:5175" target="_blank" rel="noreferrer" className="text-[#D84374] font-semibold hover:underline">
                        http://localhost:5175
                      </a>
                    </td>
                    <td className="p-3.5 text-gray-700">Admin Role Switcher</td>
                    <td className="p-3.5 text-gray-600">Packages, Sliders, Offers, Coupons Analytics, Formula Simulator</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-emerald-700">Backend API Daemon</td>
                    <td className="p-3.5 font-mono text-gray-600">4200</td>
                    <td className="p-3.5">
                      <a href="http://localhost:4200" target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline">
                        http://localhost:4200
                      </a>
                    </td>
                    <td className="p-3.5 text-gray-500">JWT Token Auth</td>
                    <td className="p-3.5 text-gray-600">7 microservices running on NestJS 10 + PostgreSQL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER WEBSITE & BOOKING ENGINE */}
      {activeTab === 'CUSTOMER' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D84374]" />
              <span>Customer Booking Engine &amp; Doorstep Checkout</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              The booking system in <code>customer-website/components/BookingModal.tsx</code> guides the customer through a streamlined 6-step flow with real-time location mapping, medical consent verification, and transparent itemized billing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2 text-xs">
                <span className="font-bold text-[#D84374] block">Step 1: Date &amp; Time Slot Selection</span>
                <p className="text-gray-600 text-[11px]">
                  Customer picks their preferred appointment date and hour (from 09:00 AM to 08:00 PM) based on beautician availability.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs">
                <span className="font-bold text-blue-900 block">Step 2: Varanasi Location Demo &amp; GPS</span>
                <p className="text-gray-600 text-[11px]">
                  GPS Auto-detect button locks coordinates (<code>25.3176° N, 82.9739° E</code>). 12 Varanasi hub chips (Sigra, Lanka, Assi, Bhelupur, etc.), interactive Ganga river map canvas, and distance tariff calculator.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs">
                <span className="font-bold text-purple-900 block">Step 3: Assigned Certified Beautician</span>
                <p className="text-gray-600 text-[11px]">
                  Displays assigned verified female professional (e.g. <em>Ananya Sharma, Gold Tier ★4.9</em>) with background verification badge and customer reviews.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2 text-xs">
                <span className="font-bold text-emerald-900 block">Step 4: Pre-Service Health &amp; Allergy Consent</span>
                <p className="text-gray-600 text-[11px]">
                  Mandatory declaration screening for Ammonia, Bleach, Wax allergies, skin sensitivity profile, and pregnancy. Legally archives digital consent.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2 text-xs col-span-1 md:col-span-2">
                <span className="font-bold text-amber-900 block">Step 5: Itemized Dynamic Pricing Formula &amp; Coupons</span>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Displays exact component breakdown: <strong>Base Labor Cost</strong> + <strong>Cosmetic Products</strong> (with <em>"I have my own cosmetic products"</em> ₹0 waiver) + <strong>Doorstep Travel Fee</strong> (≤3 KM Free) + <strong>Safety Kit (₹49)</strong> - <strong>Applied Coupon Discount</strong> + <strong>GST</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BEAUTICIAN MOBILE APP (PWA) */}
      {activeTab === 'BEAUTICIAN' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span>Beautician Mobile Web Application (PWA)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Accessible directly on mobile devices at <code>http://localhost:3100/beautician-mobile</code>.
                </p>
              </div>

              <a
                href="http://localhost:3100/beautician-mobile"
                target="_blank"
                rel="noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <span>Launch Mobile App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* The 8-Step Service Flow */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <span className="font-bold text-xs text-gray-800 block">
                The 8-Step Complete Doorstep Service Flow Engine:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">1. Login</span>
                  <span className="text-[10px] text-gray-500">Phone 9876543210 &amp; OTP 1234</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">2. New Order</span>
                  <span className="text-[10px] text-gray-500">Alert card with customer, service, payout</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">3. Accept Order</span>
                  <span className="text-[10px] text-gray-500">Accept or Reject action buttons</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">4. View Location</span>
                  <span className="text-[10px] text-gray-500">Customer address &amp; famous landmark</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">5. Navigate</span>
                  <span className="text-[10px] text-gray-500">"Go To Customer" vector routing</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">6. Reach Customer</span>
                  <span className="text-[10px] text-gray-500">"I Have Reached Doorstep" button</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">7. Start Service</span>
                  <span className="text-[10px] text-gray-500">Customer provides 4-digit start OTP (1234)</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="font-bold text-purple-700 block">8. Complete Service</span>
                  <span className="text-[10px] text-gray-500">Finish service &amp; payout credited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADMIN MODULES & FEATURES */}
      {activeTab === 'ADMIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package Builder */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-pink-100 text-[#D84374]">
                    <Gift className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">1. Package Builder Module</h4>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('packages')}
                    className="text-xs text-[#D84374] font-bold hover:underline"
                  >
                    Open Page →
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Create and manage multi-service bundles. Automatically calculates <strong>Package Base Price = Sum of selected service prices</strong>, with custom selling price override and validity.
              </p>
            </div>

            {/* Home Slider Manager */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
                    <Sliders className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">2. Home Slider Management</h4>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('slider')}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Open Page →
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Controls homepage right-hand hero carousel banners. Upload images directly from computer/phone, edit titles, buttons, links, and change display priority.
              </p>
            </div>

            {/* Offer Management */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-100 text-purple-600">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">3. Offer Management Module</h4>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('offers')}
                    className="text-xs text-purple-600 font-bold hover:underline"
                  >
                    Open Page →
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Create Service Offers, Package Offers, Festival Offers (त्योहार ऑफ़र), and Seasonal Offers with fixed or percentage discounts and date ranges.
              </p>
            </div>

            {/* Coupon Management & Analytics */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <Tag className="w-5 h-5" />
                  </span>
                  <h4 className="font-bold text-sm text-gray-900">4. Coupon Code &amp; Analytics</h4>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('coupons')}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Open Page →
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Manage promo codes with minimum order limits, usage quotas, and live analytics dashboard tracking Total Created, Total Used, Remaining Usage, and Revenue Generated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BACKEND APIS & DATABASE */}
      {activeTab === 'BACKEND' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>Backend Microservices Architecture (NestJS 10)</span>
            </h3>
            <p className="text-xs text-gray-600">
              The backend running on <code>http://localhost:4200</code> contains 7 dedicated modules:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-900 block">1. package_service</span>
                <span className="font-mono text-[10px] text-gray-500">/packages</span>
                <p className="text-[11px] text-gray-600 mt-1">Package CRUD, auto-sum pricing, validity.</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-900 block">2. slider_service</span>
                <span className="font-mono text-[10px] text-gray-500">/sliders</span>
                <p className="text-[11px] text-gray-600 mt-1">Banner upload, priority reordering, status.</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-900 block">3. offer_service</span>
                <span className="font-mono text-[10px] text-gray-500">/offers</span>
                <p className="text-[11px] text-gray-600 mt-1">Festival, seasonal, package &amp; service deals.</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-900 block">4. coupon_service</span>
                <span className="font-mono text-[10px] text-gray-500">/coupons</span>
                <p className="text-[11px] text-gray-600 mt-1">Fixed/percent discount validation and rules.</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-900 block">5. coupon_tracking_service</span>
                <span className="font-mono text-[10px] text-gray-500">/coupons/analytics</span>
                <p className="text-[11px] text-gray-600 mt-1">Usage logging, revenue, and quota metrics.</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="font-bold text-gray-900 block">6. beautician_web_service</span>
                <span className="font-mono text-[10px] text-gray-500">/beautician-web</span>
                <p className="text-[11px] text-gray-600 mt-1">Phone OTP auth, dashboard, order accept/reject.</p>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 col-span-1 sm:col-span-2 lg:col-span-3">
                <span className="font-bold text-gray-900 block">7. navigation_service</span>
                <span className="font-mono text-[10px] text-gray-500">/navigation/session/:orderId</span>
                <p className="text-[11px] text-gray-600 mt-1">
                  Vector route tracking, distance remaining, ETA calculation, and Google Maps API abstraction layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HOW-TO CUSTOMIZATION HANDBOOK */}
      {activeTab === 'HOWTO' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#D84374]" />
              <span>Step-by-Step Customization Handbook (बदलाव करने की गाइड)</span>
            </h3>
            <p className="text-xs text-gray-600">
              Quick instructions for non-technical administrators to modify prices, images, formulas, and offers.
            </p>

            <div className="space-y-4 pt-2">
              {/* How to 1 */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#D84374] text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>How to Change or Upload Photos for the Hero Slider:</span>
                </span>
                <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 pl-6">
                  <li>Click <strong>OPERATIONS → Hero Sliders</strong> in the admin sidebar.</li>
                  <li>Click <strong>"+ Add New Slide"</strong> or click <strong>Edit</strong> on an existing slide.</li>
                  <li>Click <strong>"Upload from Device"</strong> to select a photo from your computer/mobile, or paste any image URL.</li>
                  <li>Update Title, Description, and CTA Button text.</li>
                  <li>Click <strong>"Save Slide"</strong>. The slide immediately appears in the customer website hero carousel!</li>
                </ol>
              </div>

              {/* How to 2 */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>How to Create a New Combo Package / Offer:</span>
                </span>
                <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 pl-6">
                  <li>Navigate to <strong>CATALOG → Package Builder</strong>.</li>
                  <li>Click <strong>"+ Create New Package / Offer"</strong>.</li>
                  <li>Enter Package Name and select services to bundle. The system automatically sums their base prices!</li>
                  <li>Enter your custom discounted <strong>Package Offer Price</strong> (e.g. ₹2,199 instead of ₹3,499).</li>
                  <li>Upload a banner photo from device or paste URL, set validity (e.g. 365 Days), and click <strong>"Create Package Now"</strong>.</li>
                </ol>
              </div>

              {/* How to 3 */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>How to Add a New Promo Coupon Code:</span>
                </span>
                <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 pl-6">
                  <li>Click <strong>OPERATIONS → Coupons &amp; Promos</strong> in the sidebar.</li>
                  <li>Click <strong>"+ Create Coupon Code"</strong>.</li>
                  <li>Enter Code (e.g. <code>KASHI2026</code>), select Fixed (₹) or Percentage (%), and enter discount value.</li>
                  <li>Set Minimum Booking Value (e.g. ₹599) and Maximum Usage Limit.</li>
                  <li>Click <strong>"Create Coupon"</strong>. Customers can now apply it in the booking modal!</li>
                </ol>
              </div>

              {/* How to 4 */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <span className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>How to Modify the Dynamic Pricing Formula for a Service:</span>
                </span>
                <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-1 pl-6">
                  <li>Navigate to <strong>CATALOG → Services</strong>.</li>
                  <li>Click the <strong>Edit (Pencil)</strong> icon on any service.</li>
                  <li>In the Dynamic Pricing panel, adjust Labor, Beautician Cut (15-30%), Cosmetic Cost, Travel Allowance, or Safety Kit.</li>
                  <li>Observe the live equation update in real time and click <strong>"Save Service Changes"</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
