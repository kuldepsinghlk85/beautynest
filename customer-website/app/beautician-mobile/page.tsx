'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Phone,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Navigation,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Bell,
  Check,
  X,
  ArrowRight,
  Compass,
  Car,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
  ChevronRight,
  Lock,
  User,
  LogOut,
  Layers,
  Award,
  ExternalLink,
} from 'lucide-react';

export type ServiceFlowStep =
  | 'LOGIN'
  | 'NEW_ORDER'
  | 'ACCEPT_ORDER'
  | 'VIEW_LOCATION'
  | 'NAVIGATE'
  | 'REACH_CUSTOMER'
  | 'START_SERVICE'
  | 'COMPLETE_SERVICE';

interface MobileOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  customerLocation: string;
  landmark: string;
  distanceKm: number;
  orderAmount: number;
  payoutAmount: number;
  startOtp: string;
  status: 'NEW' | 'ACCEPTED' | 'REJECTED' | 'NAVIGATING' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
}

const INITIAL_ORDER: MobileOrder = {
  id: 'ord-101',
  orderNumber: 'BK-69006',
  customerName: 'Pooja Sharma',
  customerPhone: '+91 98765 43210',
  serviceName: 'O3+ Bridal Glow & Radiance Oxygenating Facial',
  bookingDate: 'Today, 12 Sep 2026',
  bookingTime: '03:30 PM',
  customerLocation: 'Flat 302, 3rd Floor, Anand Nagar Colony, Lane 3, Opposite Sigra Stadium, Varanasi',
  landmark: 'Opposite Sigra Sports Stadium Gate 2',
  distanceKm: 2.4,
  orderAmount: 1899,
  payoutAmount: 570, // 30% Gold Tier Commission
  startOtp: '1234',
  status: 'NEW',
};

export default function BeauticianMobileApp() {
  // Mobile Session State
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [loginStep, setLoginStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Bottom Navigation Tab
  const [currentTab, setCurrentTab] = useState<'HOME' | 'ORDERS' | 'NAV' | 'EARNINGS'>('ORDERS');

  // 8-Step Service Flow State
  const [serviceFlowStep, setServiceFlowStep] = useState<ServiceFlowStep>('NEW_ORDER');
  const [currentOrder, setCurrentOrder] = useState<MobileOrder>(INITIAL_ORDER);
  const [isOnline, setIsOnline] = useState(true);

  // Navigation simulation state
  const [simulatedDistance, setSimulatedDistance] = useState(2.4);
  const [simulatedEta, setSimulatedEta] = useState(14);
  const [serviceTimerMin, setServiceTimerMin] = useState(45);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Notifications
  const [notifications] = useState([
    { id: '1', text: 'New booking BK-69006 assigned to your Sigra Hub', time: '5m ago' },
    { id: '2', text: 'Daily incentive bonus ₹200 unlocked!', time: '1h ago' },
    { id: '3', text: 'Customer rated your previous facial 5.0 ⭐', time: '2h ago' },
  ]);

  // Handle Login with Demo OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setLoginError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoginError(null);
    setLoginStep('OTP');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === '1234' || enteredOtp === '0000') {
      setIsLoggedIn(true);
      setLoginError(null);
      setServiceFlowStep('NEW_ORDER');
    } else {
      setLoginError('Invalid OTP! Please enter 1234 for demo login.');
    }
  };

  // Step 2 & 3: Order Actions
  const handleAcceptOrder = () => {
    setCurrentOrder((prev) => ({ ...prev, status: 'ACCEPTED' }));
    setServiceFlowStep('VIEW_LOCATION');
    setCurrentTab('NAV');
  };

  const handleRejectOrder = () => {
    setCurrentOrder((prev) => ({ ...prev, status: 'REJECTED' }));
    setServiceFlowStep('NEW_ORDER');
    alert('Order declined. Returning to available queue.');
  };

  // Step 5: Start "Go To Customer" Navigation
  const handleStartNavigation = () => {
    setCurrentOrder((prev) => ({ ...prev, status: 'NAVIGATING' }));
    setServiceFlowStep('NAVIGATE');
    setCurrentTab('NAV');
    setSimulatedDistance(2.4);
    setSimulatedEta(14);
  };

  // Step 6: Reach Customer Doorstep
  const handleReachCustomer = () => {
    setSimulatedDistance(0);
    setSimulatedEta(0);
    setCurrentOrder((prev) => ({ ...prev, status: 'ARRIVED' }));
    setServiceFlowStep('REACH_CUSTOMER');
  };

  // Step 7: Verify OTP & Start Service
  const handleStartService = () => {
    if (otpInput !== currentOrder.startOtp && otpInput !== '1234') {
      setOtpError('Invalid OTP! Ask customer for their 4-digit start OTP (Demo: 1234)');
      return;
    }
    setOtpError(null);
    setCurrentOrder((prev) => ({ ...prev, status: 'IN_PROGRESS' }));
    setServiceFlowStep('START_SERVICE');
  };

  // Step 8: Complete Service
  const handleCompleteService = () => {
    setCurrentOrder((prev) => ({ ...prev, status: 'COMPLETED' }));
    setServiceFlowStep('COMPLETE_SERVICE');
  };

  const handleResetDemoFlow = () => {
    setCurrentOrder(INITIAL_ORDER);
    setServiceFlowStep('NEW_ORDER');
    setCurrentTab('ORDERS');
    setOtpInput('');
    setOtpError(null);
    setSimulatedDistance(2.4);
    setSimulatedEta(14);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-4 sm:py-8 px-2 sm:px-4 flex flex-col items-center justify-center font-sans antialiased text-gray-900">
      
      {/* Top Floating Helper Bar on Desktop */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span className="font-semibold text-slate-200">BeautyNest Beautician Mobile App</span>
          <span className="bg-pink-900/60 text-pink-300 px-1.5 py-0.2 rounded text-[10px]">PWA Demo</span>
        </div>
        <button
          onClick={handleResetDemoFlow}
          className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restart 8-Step Flow</span>
        </button>
      </div>

      {/* MOBILE DEVICE CONTAINER */}
      <div className="w-full max-w-md bg-white rounded-[36px] shadow-2xl overflow-hidden border-8 border-slate-800 flex flex-col relative min-h-[760px] max-h-[92vh]">
        
        {/* Mobile App Status Bar */}
        <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] select-none shrink-0">
          <span className="font-bold font-mono">03:30</span>
          {/* Dynamic Island / Speaker cutout */}
          <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* 8-STEP INTERACTIVE PROGRESS STEPPER STRIP */}
        <div className="bg-pink-50/90 border-b border-pink-200 px-3 py-2 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
            <span className="font-bold text-[#D84374] uppercase tracking-wider">
              8-Step Service Flow ({
                serviceFlowStep === 'LOGIN' ? '1/8' :
                serviceFlowStep === 'NEW_ORDER' ? '2/8' :
                serviceFlowStep === 'ACCEPT_ORDER' ? '3/8' :
                serviceFlowStep === 'VIEW_LOCATION' ? '4/8' :
                serviceFlowStep === 'NAVIGATE' ? '5/8' :
                serviceFlowStep === 'REACH_CUSTOMER' ? '6/8' :
                serviceFlowStep === 'START_SERVICE' ? '7/8' : '8/8'
              })
            </span>
            <span className="font-mono text-gray-500">Step: {serviceFlowStep}</span>
          </div>

          <div className="grid grid-cols-8 gap-1">
            {[
              { id: 'LOGIN', label: '1' },
              { id: 'NEW_ORDER', label: '2' },
              { id: 'ACCEPT_ORDER', label: '3' },
              { id: 'VIEW_LOCATION', label: '4' },
              { id: 'NAVIGATE', label: '5' },
              { id: 'REACH_CUSTOMER', label: '6' },
              { id: 'START_SERVICE', label: '7' },
              { id: 'COMPLETE_SERVICE', label: '8' },
            ].map((step, idx) => {
              const orderMap: Record<ServiceFlowStep, number> = {
                LOGIN: 1,
                NEW_ORDER: 2,
                ACCEPT_ORDER: 3,
                VIEW_LOCATION: 4,
                NAVIGATE: 5,
                REACH_CUSTOMER: 6,
                START_SERVICE: 7,
                COMPLETE_SERVICE: 8,
              };
              const currentStepNumber = orderMap[serviceFlowStep] || 2;
              const isPast = idx + 1 < currentStepNumber;
              const isCurrent = idx + 1 === currentStepNumber;

              return (
                <div
                  key={step.id}
                  className={`h-1.5 rounded-full transition-all ${
                    isPast
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-[#D84374] animate-pulse'
                      : 'bg-gray-200'
                  }`}
                  title={step.id}
                />
              );
            })}
          </div>
        </div>

        {/* MAIN SCROLLABLE APP BODY */}
        <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          
          {/* VIEW: LOGIN SCREEN */}
          {!isLoggedIn ? (
            <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-300 shadow-md mx-auto p-0.5 bg-white">
                  <img src="/logo.png" alt="BeautyNest Logo" className="w-full h-full object-cover rounded-full" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Beautician Partner App</h2>
                <p className="text-xs text-gray-500">
                  Welcome to BeautyNest Doorstep Salon Varanasi. Login to manage live trips and orders.
                </p>
              </div>

              {loginStep === 'PHONE' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter 10-digit number"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-mono font-bold outline-none focus:border-[#D84374]"
                      />
                    </div>
                  </div>

                  {loginError && <p className="text-xs text-rose-600 font-medium">{loginError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D84374] to-pink-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all"
                  >
                    Send OTP (ओटीपी भेजें)
                  </button>
                  <p className="text-[10px] text-center text-gray-400">Demo mobile: 9876543210</p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Enter 4-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full py-3 text-center text-xl font-mono font-extrabold tracking-widest bg-white border-2 border-pink-300 rounded-2xl outline-none focus:border-[#D84374]"
                    />
                  </div>

                  {loginError && <p className="text-xs text-rose-600 font-medium">{loginError}</p>}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D84374] to-pink-600 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all"
                  >
                    Verify &amp; Login (लॉगिन करें)
                  </button>
                  <p className="text-[10px] text-center text-emerald-600 font-semibold">
                    ✓ Demo OTP is 1234
                  </p>
                </form>
              )}
            </div>
          ) : (
            /* VIEW: AUTHENTICATED APP CONTENT */
            <div className="p-4 space-y-4">
              
              {/* Beautician Top Profile Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"
                      alt="Ananya"
                      className="w-11 h-11 rounded-full object-cover border-2 border-[#D84374]"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-xs leading-tight">Ananya Sharma</h3>
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                        GOLD ★4.9
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block">Varanasi Hub • 30% Tier</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {isOnline ? '● Online' : '○ Offline'}
                  </button>
                </div>
              </div>

              {/* TAB 1: DASHBOARD OVERVIEW */}
              {currentTab === 'HOME' && (
                <div className="space-y-4">
                  {/* Today Earnings Card */}
                  <div className="bg-gradient-to-br from-[#D84374] to-pink-600 text-white p-4 rounded-3xl shadow-md space-y-2">
                    <span className="text-[11px] text-pink-200 uppercase tracking-widest font-semibold block">
                      Today&apos;s Earnings (आज की कमाई)
                    </span>
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-3xl font-extrabold">₹4,850</h2>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                        3 Services Done
                      </span>
                    </div>
                    <p className="text-[11px] text-pink-100 pt-1 border-t border-white/20 flex items-center justify-between">
                      <span>Monthly Payout: ₹38,400</span>
                      <span className="text-amber-300 font-semibold">Gold Incentive +₹250</span>
                    </p>
                  </div>

                  {/* 3 Metric Counters */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-3 rounded-2xl border border-gray-200">
                      <span className="text-lg font-bold text-gray-900 block">3</span>
                      <span className="text-[10px] text-gray-500">Today&apos;s Bookings</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-gray-200">
                      <span className="text-lg font-bold text-[#D84374] block">2</span>
                      <span className="text-[10px] text-gray-500">Upcoming</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-gray-200">
                      <span className="text-lg font-bold text-emerald-600 block">18</span>
                      <span className="text-[10px] text-gray-500">Completed</span>
                    </div>
                  </div>

                  {/* Notifications Feed */}
                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-[#D84374]" />
                        <span>Live Notifications</span>
                      </span>
                      <span className="text-[10px] text-gray-400">All read</span>
                    </div>
                    <div className="space-y-1.5">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-2 rounded-xl bg-pink-50/50 text-[11px] text-gray-700 flex justify-between">
                          <span>{n.text}</span>
                          <span className="text-[9px] text-gray-400 shrink-0 ml-2">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SERVICE ORDER MODULE (Spec 6) */}
              {currentTab === 'ORDERS' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-[#D84374]" />
                      <span>New Service Requests (नया ऑर्डर)</span>
                    </h3>
                    <span className="bg-pink-100 text-[#D84374] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      1 Pending
                    </span>
                  </div>

                  {/* Order Request Card */}
                  <div className="bg-white p-4 rounded-3xl border-2 border-pink-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400 block font-semibold">
                          Order #{currentOrder.orderNumber}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 leading-tight">
                          {currentOrder.serviceName}
                        </h4>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        Earn ₹{currentOrder.payoutAmount}
                      </span>
                    </div>

                    {/* Customer Info & Date Time */}
                    <div className="bg-gray-50 p-2.5 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-gray-700">
                        <span className="font-semibold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#D84374]" />
                          <span>{currentOrder.customerName}</span>
                        </span>
                        <span className="font-mono text-gray-500 text-[11px]">
                          {currentOrder.customerPhone}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{currentOrder.bookingDate}</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[#D84374]">
                          <Clock className="w-3 h-3" />
                          <span>{currentOrder.bookingTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Customer Location & Distance */}
                    <div className="p-2.5 rounded-xl border border-pink-100 bg-pink-50/40 text-xs space-y-1">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-[#D84374] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-gray-900 block text-[11px]">
                            Customer Location:
                          </span>
                          <span className="text-[11px] text-gray-600 leading-tight block">
                            {currentOrder.customerLocation}
                          </span>
                          <span className="text-[10px] text-pink-700 font-medium block mt-0.5">
                            Landmark: {currentOrder.landmark}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-pink-200 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500 font-medium">Distance from Sigra Hub:</span>
                        <span className="font-mono font-extrabold text-[#D84374] bg-white px-2 py-0.5 rounded border border-pink-200">
                          {currentOrder.distanceKm} KM (14 Mins)
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Accept, Reject, Navigate */}
                    {currentOrder.status === 'NEW' ? (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={handleRejectOrder}
                          className="w-full py-2.5 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5 text-rose-500" />
                          <span>Reject (अस्वीकार)</span>
                        </button>
                        <button
                          onClick={handleAcceptOrder}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl text-xs shadow-md hover:from-emerald-700 flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept (स्वीकार करें)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-2 rounded-xl text-xs font-semibold">
                          <span>✓ Order Accepted</span>
                          <span className="text-[10px] uppercase">Status: {currentOrder.status}</span>
                        </div>

                        <button
                          onClick={handleStartNavigation}
                          className="w-full py-3 bg-gradient-to-r from-[#D84374] to-pink-600 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Go To Customer (नेविगेशन शुरू करें)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMER LOCATION NAVIGATION & SERVICE FLOW (Spec 7 & 8) */}
              {currentTab === 'NAV' && (
                <div className="space-y-3">
                  {/* Persistent Customer Address Card (Spec Requirement) */}
                  <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Active Order #{currentOrder.orderNumber}
                      </span>
                      <span className="bg-pink-100 text-[#D84374] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {serviceFlowStep}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{currentOrder.customerName}</h4>
                      <p className="text-[11px] text-gray-600 leading-snug mt-0.5">
                        {currentOrder.customerLocation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <a
                        href={`tel:${currentOrder.customerPhone}`}
                        className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-1 border border-emerald-200"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>
                      <a
                        href="https://maps.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs flex items-center gap-1 border border-blue-200"
                        title="Open External Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* INTERACTIVE DEMO MAP CANVAS (Spec 7) */}
                  <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 relative shadow-inner p-4 text-white">
                    {/* Map Diagram Overlay */}
                    <div className="relative h-48 w-full bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex flex-col justify-between p-3">
                      
                      {/* River Curve & Route Polyline Vector SVG */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        <path
                          d="M 20 160 Q 90 90, 160 120 T 320 30"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 50 140 L 120 100 L 200 110 L 270 50"
                          fill="none"
                          stroke="#D84374"
                          strokeWidth="4"
                          strokeDasharray="6,4"
                        />
                      </svg>

                      {/* Origin Pin (Beautician) */}
                      <div className="relative z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-pink-500 self-start">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                        <span className="text-[10px] font-bold text-pink-300">Your GPS: Sigra Center</span>
                      </div>

                      {/* Destination Pin (Customer) */}
                      <div className="relative z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-500 self-end">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300">Destination: Assi Ghat</span>
                      </div>
                    </div>

                    {/* Navigation Metrics Strip */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Distance Remaining</span>
                        <span className="text-base font-extrabold font-mono text-pink-400">
                          {simulatedDistance} KM
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Estimated Time</span>
                        <span className="text-base font-extrabold font-mono text-amber-300">
                          {simulatedEta} Mins
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Map Engine</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          Demo Vector Map
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SERVICE FLOW STAGES ACTIONS (Spec 8) */}
                  <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">
                      Next Step in Flow:
                    </span>

                    {/* State: NAVIGATE */}
                    {serviceFlowStep === 'NAVIGATE' && (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-semibold flex items-center gap-2">
                          <Compass className="w-4 h-4 text-blue-600 animate-spin" />
                          <span>Turn-by-turn routing active to Sigra-Assi corridor</span>
                        </div>
                        <button
                          onClick={handleReachCustomer}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md"
                        >
                          I Have Reached Customer Doorstep (पहुंच गए)
                        </button>
                      </div>
                    )}

                    {/* State: REACH_CUSTOMER -> Enter OTP to Start Service */}
                    {(serviceFlowStep === 'REACH_CUSTOMER' || serviceFlowStep === 'VIEW_LOCATION') && (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-xs space-y-1">
                          <span className="font-bold block">🚪 You have arrived at customer door</span>
                          <span className="text-[11px] text-amber-800">
                            Ask customer for their 4-digit service start code to begin.
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700 block">
                            Customer Start OTP (Demo: 1234)
                          </label>
                          <input
                            type="text"
                            maxLength={4}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="Enter 4-digit OTP"
                            className="w-full py-2.5 px-3 text-center font-mono font-extrabold text-base bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D84374]"
                          />
                        </div>

                        {otpError && <p className="text-xs text-rose-600 font-medium">{otpError}</p>}

                        <button
                          onClick={handleStartService}
                          className="w-full py-3.5 bg-gradient-to-r from-[#D84374] to-pink-600 text-white font-bold rounded-2xl text-xs shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Verify OTP &amp; Start Service (सर्विस शुरू करें)</span>
                        </button>
                      </div>
                    )}

                    {/* State: START_SERVICE -> In Progress */}
                    {serviceFlowStep === 'START_SERVICE' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[#D84374] font-bold">
                            <span>Service In Progress...</span>
                            <span className="font-mono">⏱ {serviceTimerMin} Mins</span>
                          </div>
                          <p className="text-[11px] text-gray-600">
                            Perform facial treatment, massage, and mask as per hygiene standards.
                          </p>
                        </div>

                        <button
                          onClick={handleCompleteService}
                          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finish &amp; Complete Service (सर्विस पूर्ण करें)</span>
                        </button>
                      </div>
                    )}

                    {/* State: COMPLETE_SERVICE */}
                    {serviceFlowStep === 'COMPLETE_SERVICE' && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="font-bold text-sm">Service Successfully Completed! 🎉</h4>
                        <p className="text-[11px] text-emerald-800">
                          ₹{currentOrder.payoutAmount} credited to your Beautician Wallet.
                        </p>
                        <button
                          onClick={handleResetDemoFlow}
                          className="mt-2 w-full py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs"
                        >
                          Ready for Next Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: EARNINGS & SETTLEMENTS */}
              {currentTab === 'EARNINGS' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-3xl border border-gray-200 space-y-2">
                    <span className="text-xs text-gray-500 font-semibold block">Beautician Wallet</span>
                    <h2 className="text-3xl font-extrabold text-[#D84374]">₹5,420.00</h2>
                    <span className="text-[11px] text-emerald-600 font-bold block">
                      ✓ Weekly direct bank transfer scheduled every Monday
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
                    <span className="font-bold text-gray-800 block">Recent Earnings Payouts</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between p-2 rounded-xl bg-gray-50">
                        <div>
                          <span className="font-bold text-gray-900 block">BK-69006 • Bridal Facial</span>
                          <span className="text-[10px] text-gray-400">12 Sep 2026</span>
                        </div>
                        <span className="font-bold text-emerald-700">+₹570.00</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-xl bg-gray-50">
                        <div>
                          <span className="font-bold text-gray-900 block">BK-68992 • Hair Spa</span>
                          <span className="text-[10px] text-gray-400">11 Sep 2026</span>
                        </div>
                        <span className="font-bold text-emerald-700">+₹420.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* BOTTOM NATIVE PWA APP NAVIGATION BAR */}
        {isLoggedIn && (
          <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-around shrink-0 text-[10px] font-semibold text-gray-500">
            <button
              onClick={() => setCurrentTab('HOME')}
              className={`flex flex-col items-center gap-0.5 ${
                currentTab === 'HOME' ? 'text-[#D84374]' : 'hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentTab('ORDERS')}
              className={`flex flex-col items-center gap-0.5 relative ${
                currentTab === 'ORDERS' ? 'text-[#D84374]' : 'hover:text-gray-900'
              }`}
            >
              <Car className="w-5 h-5" />
              <span>Orders</span>
              <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#D84374]" />
            </button>

            <button
              onClick={() => setCurrentTab('NAV')}
              className={`flex flex-col items-center gap-0.5 ${
                currentTab === 'NAV' ? 'text-[#D84374]' : 'hover:text-gray-900'
              }`}
            >
              <Navigation className="w-5 h-5" />
              <span>Navigation</span>
            </button>

            <button
              onClick={() => setCurrentTab('EARNINGS')}
              className={`flex flex-col items-center gap-0.5 ${
                currentTab === 'EARNINGS' ? 'text-[#D84374]' : 'hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Earnings</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
