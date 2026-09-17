import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  Briefcase,
  Headphones,
  Sparkles,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  getSeenBookingIds,
  markBookingAsSeen,
  markAllBookingsAsSeen,
} from '../lib/bookingNotificationService';

export type UserRole = 'ADMIN' | 'WORKER' | 'OPERATOR';

interface HeaderProps {
  title: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRefresh?: () => void;
  onOpenDocs?: () => void;
  onNavigateToBooking?: (bookingId: string) => void;
}

export default function Header({
  title,
  currentRole,
  onRoleChange,
  onRefresh,
  onOpenDocs,
  onNavigateToBooking,
}: HeaderProps) {
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [unreadBookings, setUnreadBookings] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUnreadBookings = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('beautynest_all_bookings');
      if (saved) {
        const all: any[] = JSON.parse(saved);
        const seenIds = getSeenBookingIds();
        const unread = all.filter((b) => {
          const id = b.id || b.bookingNumber;
          return id && !seenIds.includes(id);
        });
        setUnreadBookings(unread);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUnreadBookings();
    const handleUpdate = () => loadUnreadBookings();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('beautynest_booking_created', handleUpdate);
    window.addEventListener('beautynest_seen_updated', handleUpdate);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('beautynest_booking_created', handleUpdate);
      window.removeEventListener('beautynest_seen_updated', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = () => {
    markAllBookingsAsSeen(unreadBookings);
    setUnreadBookings([]);
  };

  const handleItemClick = (bId: string) => {
    markBookingAsSeen(bId);
    setIsBellOpen(false);
    if (onNavigateToBooking) {
      onNavigateToBooking(bId);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0 select-none z-10 relative">
      {/* Left: Role Switcher & Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold font-serif text-gray-900 capitalize hidden sm:block">
          {title.replace('-', ' ')}
        </h1>

        {/* 3 Role Switcher Pills (Admin, Worker, Operator) */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 text-xs">
          <button
            onClick={() => onRoleChange('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentRole === 'ADMIN'
                ? 'bg-white text-[#0071E3] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>

          <button
            onClick={() => onRoleChange('WORKER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentRole === 'WORKER'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Worker Portal</span>
          </button>

          <button
            onClick={() => onRoleChange('OPERATOR')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentRole === 'OPERATOR'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Operator</span>
          </button>
        </div>
      </div>

      {/* Right Controls (Matching Screenshots 1 & 2) */}
      <div className="flex items-center gap-3">
        {/* Search Platform Input */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search platform..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50/90 border border-gray-200/90 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white text-gray-800"
          />
        </div>

        {/* Master System Documentation Button */}
        {onOpenDocs && (
          <button
            onClick={onOpenDocs}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Open Master System Documentation & Control Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Master Docs</span>
          </button>
        )}

        {/* Theme Toggle Icon */}
        <button
          onClick={() => {}}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          title="Toggle Light / Dark"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Notification Bell with Badge & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsBellOpen(!isBellOpen)}
            className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadBookings.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-xs animate-pulse">
                {unreadBookings.length}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isBellOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-gray-900 font-serif">
                    बुकिंग नोटिफिकेशन्स (Alerts)
                  </span>
                  {unreadBookings.length > 0 && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadBookings.length} New
                    </span>
                  )}
                </div>
                {unreadBookings.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-brand-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    सभी पढ़ी गई (Mark All Read)
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 mt-1">
                {unreadBookings.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    🎉 कोई नई अनरीड बुकिंग नहीं है (All caught up!)
                  </div>
                ) : (
                  unreadBookings.slice(0, 6).map((b: any) => {
                    const bId = b.id || b.bookingNumber;
                    return (
                      <div
                        key={bId}
                        onClick={() => handleItemClick(bId)}
                        className="py-2.5 px-2 hover:bg-pink-50/50 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-gray-900">
                            {b.bookingNumber || bId}
                          </span>
                          <span className="text-[11px] font-bold text-brand-primary">
                            ₹{b.totalAmount || b.servicePrice || 1299}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-gray-800 mt-0.5">
                          {b.customerName || 'Priya Sharma'}
                        </div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">
                          {b.serviceName}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-between">
                          <span>{b.scheduledTime || '11:30 AM'} • {b.area || 'Sigra'}</span>
                          <span className="text-brand-primary font-bold">देखें &rarr;</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill (Matches Screenshots 1 & 2) */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentRole === 'WORKER' ? 'P' : currentRole === 'OPERATOR' ? 'O' : 'B'}
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <p className="font-bold text-gray-900">
              {currentRole === 'WORKER'
                ? 'Priya Beautician'
                : currentRole === 'OPERATOR'
                ? 'Neha Operator'
                : 'BeautyNest Admin'}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {currentRole === 'WORKER'
                ? 'Worker / Beautician'
                : currentRole === 'OPERATOR'
                ? 'Dispatch / Operator'
                : 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
