import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Phone,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Search,
  Users,
  Sun,
  Sunrise,
  Sunset,
  X,
  CalendarDays,
  CalendarCheck2,
} from 'lucide-react';
import { RECENT_BOOKINGS, BEAUTICIANS_LIST, AdminBooking } from '../lib/mockAdminData';
import {
  getSeenBookingIds,
  markBookingAsSeen,
  getBookingGroupInfo,
} from '../lib/bookingNotificationService';

interface DayTab {
  offset: number;
  key: string;
  label: string;
  hindiLabel: string;
  dateStr: string;
  fullDate: Date;
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(RECENT_BOOKINGS);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [customDate, setCustomDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [seenBookingIds, setSeenBookingIds] = useState<string[]>([]);
  const [assignModalBooking, setAssignModalBooking] = useState<AdminBooking | null>(null);

  const dayTabs: DayTab[] = useMemo(() => {
    const tabs: DayTab[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('en-IN', { month: 'short' });
      const year = d.getFullYear();
      const dateStr = `${dayNum} ${monthShort} ${year}`;
      
      let label = `${dayNum} ${monthShort}`;
      let hindiLabel = 'आज (Today)';
      if (i === 1) hindiLabel = 'कल (Tomorrow)';
      else if (i === 2) hindiLabel = 'परसों (Day 3)';
      else if (i === 3) hindiLabel = 'चौथा दिन (Day 4)';
      else if (i === 4) hindiLabel = 'पांचवा दिन (Day 5)';

      tabs.push({
        offset: i,
        key: `day-${i}`,
        label,
        hindiLabel,
        dateStr,
        fullDate: d,
      });
    }
    return tabs;
  }, []);

  const loadLiveBookings = async () => {
    let liveBookings: AdminBooking[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('beautynest_all_bookings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            liveBookings = parsed.map((b: any) => ({
              id: b.id || b.bookingNumber,
              bookingNumber: b.bookingNumber || b.id,
              customerName: b.customerName || 'Priya Sharma',
              customerPhone: b.customerPhone || '+91 98765 43210',
              serviceName: b.serviceName,
              area: b.area ? `${b.area}, Varanasi` : 'Sigra, Varanasi',
              beauticianName: b.beauticianName || 'Sunita Sharma',
              timeSlot: b.scheduledTime || '11:30 AM',
              date: b.scheduledDate || 'Today, 12 Sep 2026',
              amount: b.totalAmount || b.servicePrice || 1299,
              status: (b.status === 'CONFIRMED' ? 'Confirmed' : b.status || 'Confirmed') as any,
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const res = await fetch('http://localhost:4200/api/services/bookings');
      if (res.ok) {
        const apiBookings = await res.json();
        if (Array.isArray(apiBookings)) {
          const mappedApi = apiBookings.map((b: any) => ({
            id: b.id || b.bookingNumber,
            bookingNumber: b.bookingNumber || b.id,
            customerName: b.customerName || 'Priya Sharma',
            customerPhone: b.customerPhone || '+91 98765 43210',
            serviceName: b.serviceName,
            area: b.area ? `${b.area}, Varanasi` : 'Sigra, Varanasi',
            beauticianName: b.beauticianName || 'Sunita Sharma',
            timeSlot: b.scheduledTime || '11:30 AM',
            date: b.scheduledDate || 'Today, 12 Sep 2026',
            amount: b.totalAmount || b.servicePrice || 1299,
            status: (b.status === 'CONFIRMED' ? 'Confirmed' : b.status || 'Confirmed') as any,
          }));
          mappedApi.forEach((item) => {
            if (!liveBookings.some((x) => x.id === item.id)) {
              liveBookings.unshift(item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Backend bookings skipped:', e);
    }

    const combined = [...liveBookings];
    RECENT_BOOKINGS.forEach((mock) => {
      if (!combined.some((c) => c.bookingNumber === mock.bookingNumber)) {
        combined.push(mock);
      }
    });
    setBookings(combined);
    setSeenBookingIds(getSeenBookingIds());
  };

  useEffect(() => {
    loadLiveBookings();
    const handleUpdate = () => loadLiveBookings();
    const handleSeen = () => setSeenBookingIds(getSeenBookingIds());

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('beautynest_booking_created', handleUpdate);
    window.addEventListener('beautynest_seen_updated', handleSeen);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('beautynest_booking_created', handleUpdate);
      window.removeEventListener('beautynest_seen_updated', handleSeen);
    };
  }, []);

  const doesBookingMatchTab = (b: AdminBooking, tabIndex: number): boolean => {
    const rawDate = (b.date || '').toLowerCase();
    const targetTab = dayTabs[tabIndex];
    if (!targetTab) return false;

    if (tabIndex === 0) {
      if (rawDate.includes('today')) return true;
      const todayShort = targetTab.dateStr.toLowerCase();
      if (rawDate.includes(todayShort)) return true;
      return !rawDate.includes('tomorrow') && !rawDate.includes('sep') ? true : false;
    } else if (tabIndex === 1) {
      if (rawDate.includes('tomorrow')) return true;
      const tomorrowShort = targetTab.dateStr.toLowerCase();
      return rawDate.includes(tomorrowShort);
    } else {
      const dayNum = targetTab.fullDate.getDate().toString();
      const monthShort = targetTab.fullDate.toLocaleDateString('en-IN', { month: 'short' }).toLowerCase();
      return rawDate.includes(monthShort) && rawDate.includes(dayNum);
    }
  };

  const todayBookings = useMemo(() => bookings.filter((b) => doesBookingMatchTab(b, 0)), [bookings, dayTabs]);
  const tomorrowBookings = useMemo(() => bookings.filter((b) => doesBookingMatchTab(b, 1)), [bookings, dayTabs]);
  const nextDaysBookings = useMemo(() => {
    return bookings.filter((b) => doesBookingMatchTab(b, 2) || doesBookingMatchTab(b, 3) || doesBookingMatchTab(b, 4));
  }, [bookings, dayTabs]);

  const currentDayBookings = useMemo(() => {
    let list: AdminBooking[] = [];
    if (customDate) {
      const selectedD = new Date(customDate);
      const dayNum = selectedD.getDate().toString();
      const monthShort = selectedD.toLocaleDateString('en-IN', { month: 'short' }).toLowerCase();
      list = bookings.filter((b) => {
        const raw = (b.date || '').toLowerCase();
        return raw.includes(monthShort) && raw.includes(dayNum);
      });
    } else {
      list = bookings.filter((b) => doesBookingMatchTab(b, selectedDayOffset));
    }

    return list.filter((b) => {
      const matchSearch =
        b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.beauticianName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchArea = selectedArea === 'ALL' || b.area.includes(selectedArea);
      return matchSearch && matchArea;
    });
  }, [bookings, selectedDayOffset, customDate, searchTerm, selectedArea, dayTabs]);

  const morningSlots = useMemo(() => {
    return currentDayBookings.filter((b) => {
      const t = b.timeSlot.toLowerCase();
      return t.includes('am') || t.startsWith('09') || t.startsWith('10') || t.startsWith('11');
    });
  }, [currentDayBookings]);

  const afternoonSlots = useMemo(() => {
    return currentDayBookings.filter((b) => {
      const t = b.timeSlot.toLowerCase();
      return (
        t.includes('12:') ||
        t.includes('01:') ||
        t.includes('02:') ||
        t.includes('03:') ||
        (t.includes('pm') && !t.includes('04:') && !t.includes('05:') && !t.includes('06:') && !t.includes('07:') && !t.includes('08:'))
      );
    });
  }, [currentDayBookings]);

  const eveningSlots = useMemo(() => {
    return currentDayBookings.filter((b) => {
      const t = b.timeSlot.toLowerCase();
      return (
        t.includes('04:') ||
        t.includes('05:') ||
        t.includes('06:') ||
        t.includes('07:') ||
        t.includes('08:') ||
        t.includes('09:')
      );
    });
  }, [currentDayBookings]);

  const handleMarkSeen = (bId: string) => {
    markBookingAsSeen(bId);
    setSeenBookingIds(getSeenBookingIds());
  };

  const handleReassign = (beauticianName: string) => {
    if (!assignModalBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === assignModalBooking.id ? { ...b, beauticianName } : b))
    );
    setAssignModalBooking(null);
  };

  const activeTabInfo = dayTabs[selectedDayOffset];

  const beauticianWorkload = useMemo(() => {
    const map: Record<string, number> = {};
    currentDayBookings.forEach((b) => {
      const name = b.beauticianName.replace(/\s*\(.*\)/, '').trim();
      map[name] = (map[name] || 0) + 1;
    });
    return map;
  }, [currentDayBookings]);

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              DISPATCH &amp; TIMELINE
            </span>
            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              Day-Wise Dispatch Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            दैनिक व आगामी बुकिंग शेड्यूल (Booking Schedule &amp; Timeline)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            आज की तारीख की बुकिंग्स, कल की बुकिंग्स और आगामी 2-3 दिनों के स्लॉट्स की संपूर्ण लाइव जानकारी
          </p>
        </div>

        {/* Date Jump / Custom Date Picker */}
        <div className="flex items-center gap-2.5 bg-white p-2 rounded-2xl border border-gray-200 shadow-xs">
          <CalendarIcon className="w-4 h-4 text-brand-primary ml-1" />
          <span className="text-xs font-bold text-gray-700">पर्टिकुलर डेट चुनें:</span>
          <input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-brand-primary cursor-pointer"
          />
          {customDate && (
            <button
              onClick={() => setCustomDate('')}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold px-1.5"
              title="Reset to Day Tabs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3 High-Impact KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Today's Bookings */}
        <div
          onClick={() => {
            setCustomDate('');
            setSelectedDayOffset(0);
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedDayOffset === 0 && !customDate
              ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-200 border-transparent scale-[1.01]'
              : 'bg-white border-gray-100 shadow-xs hover:border-pink-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedDayOffset === 0 && !customDate ? 'text-pink-100' : 'text-gray-400'
              }`}
            >
              📍 आज की बुकिंग्स (Today)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedDayOffset === 0 && !customDate
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {dayTabs[0].dateStr}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold font-serif">
                {todayBookings.length}
              </span>
              <span
                className={`text-xs ml-1.5 ${
                  selectedDayOffset === 0 && !customDate ? 'text-pink-100' : 'text-gray-500'
                }`}
              >
                बुकिंग्स लगी हैं
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold block">
                ₹{todayBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}
              </span>
              <span
                className={`text-[10px] ${
                  selectedDayOffset === 0 && !customDate ? 'text-pink-100' : 'text-gray-400'
                }`}
              >
                कुल अनुमानित वैल्यू
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Tomorrow's Bookings */}
        <div
          onClick={() => {
            setCustomDate('');
            setSelectedDayOffset(1);
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedDayOffset === 1 && !customDate
              ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-lg shadow-indigo-200 border-transparent scale-[1.01]'
              : 'bg-white border-gray-100 shadow-xs hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedDayOffset === 1 && !customDate ? 'text-indigo-100' : 'text-gray-400'
              }`}
            >
              🗓️ कल की बुकिंग्स (Tomorrow)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedDayOffset === 1 && !customDate
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-50 text-purple-700'
              }`}
            >
              {dayTabs[1].dateStr}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold font-serif">
                {tomorrowBookings.length}
              </span>
              <span
                className={`text-xs ml-1.5 ${
                  selectedDayOffset === 1 && !customDate ? 'text-indigo-100' : 'text-gray-500'
                }`}
              >
                बुकिंग्स शेड्यूल्ड
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold block">
                ₹{tomorrowBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}
              </span>
              <span
                className={`text-[10px] ${
                  selectedDayOffset === 1 && !customDate ? 'text-indigo-100' : 'text-gray-400'
                }`}
              >
                कल की प्री-बुकिंग
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Next 2-3 Days Pipeline */}
        <div
          onClick={() => {
            setCustomDate('');
            setSelectedDayOffset(2);
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            selectedDayOffset >= 2 && !customDate
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200 border-transparent scale-[1.01]'
              : 'bg-white border-gray-100 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                selectedDayOffset >= 2 && !customDate ? 'text-amber-100' : 'text-gray-400'
              }`}
            >
              📅 आगामी 2-3 दिन (Next Days)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedDayOffset >= 2 && !customDate
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {dayTabs[2].label} - {dayTabs[4].label}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold font-serif">
                {nextDaysBookings.length}
              </span>
              <span
                className={`text-xs ml-1.5 ${
                  selectedDayOffset >= 2 && !customDate ? 'text-amber-100' : 'text-gray-500'
                }`}
              >
                एडवांस बुकिंग्स पाइपलाइन
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold block">
                ₹{nextDaysBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}
              </span>
              <span
                className={`text-[10px] ${
                  selectedDayOffset >= 2 && !customDate ? 'text-amber-100' : 'text-gray-400'
                }`}
              >
                ब्राइडल व पैकेज बुकिंग्स
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector Navigation Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {dayTabs.map((tab) => {
            const count = bookings.filter((b) => doesBookingMatchTab(b, tab.offset)).length;
            const isCurrentActive = selectedDayOffset === tab.offset && !customDate;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  setCustomDate('');
                  setSelectedDayOffset(tab.offset);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isCurrentActive
                    ? 'bg-brand-primary text-white shadow-md shadow-pink-200 scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-pink-50'
                }`}
              >
                <span>{tab.hindiLabel}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    isCurrentActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white text-gray-800 shadow-xs'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in this day..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary"
            />
          </div>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-brand-primary font-medium text-gray-700"
          >
            <option value="ALL">All Varanasi Areas</option>
            <option value="Sigra">Sigra</option>
            <option value="Lanka">Lanka (BHU)</option>
            <option value="Godowlia">Godowlia</option>
            <option value="Assi">Assi Ghat</option>
            <option value="Bhelupur">Bhelupur</option>
            <option value="Cantt">Varanasi Cantt</option>
            <option value="Shivpur">Shivpur</option>
          </select>
        </div>
      </div>

      {/* Selected Day Status Banner */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-xs text-gray-800">
          <CalendarCheck2 className="w-4 h-4 text-brand-primary" />
          <span className="font-bold font-serif text-sm">
            {customDate ? `विशेष चयनित तारीख: ${customDate}` : activeTabInfo.hindiLabel} (
            {customDate ? customDate : activeTabInfo.dateStr})
          </span>
          <span className="text-gray-500">•</span>
          <span className="font-medium text-gray-600">
            कुल <strong>{currentDayBookings.length}</strong> बुकिंग्स निर्धारित हैं
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-600">
          <span>🌅 सुबह: <strong>{morningSlots.length}</strong></span>
          <span>☀️ दोपहर: <strong>{afternoonSlots.length}</strong></span>
          <span>🌆 शाम: <strong>{eveningSlots.length}</strong></span>
        </div>
      </div>

      {/* Main Content Layout: Slot Grouping Timeline (Left) + Beautician Workload (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentDayBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400 space-y-3">
              <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-serif font-bold text-gray-700 text-base">
                इस तारीख के लिए कोई बुकिंग उपलब्ध नहीं है
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                चुने गए दिन के लिए कोई अपॉइंटमेंट शेड्यूल नहीं है। आप किसी अन्य दिन का चयन कर सकते हैं।
              </p>
            </div>
          ) : (
            <>
              <SlotSection
                title="🌅 सुबह के स्लॉट्स (Morning: 09:00 AM - 12:00 PM)"
                count={morningSlots.length}
                icon={<Sunrise className="w-4 h-4 text-amber-500" />}
                badgeColor="bg-amber-100 text-amber-900 border-amber-200"
                bookings={morningSlots}
                allBookings={bookings}
                seenBookingIds={seenBookingIds}
                onMarkSeen={handleMarkSeen}
                onOpenReassign={(b) => setAssignModalBooking(b)}
              />

              <SlotSection
                title="☀️ दोपहर के स्लॉट्स (Afternoon: 12:00 PM - 04:00 PM)"
                count={afternoonSlots.length}
                icon={<Sun className="w-4 h-4 text-orange-500" />}
                badgeColor="bg-orange-100 text-orange-900 border-orange-200"
                bookings={afternoonSlots}
                allBookings={bookings}
                seenBookingIds={seenBookingIds}
                onMarkSeen={handleMarkSeen}
                onOpenReassign={(b) => setAssignModalBooking(b)}
              />

              <SlotSection
                title="🌆 शाम के स्लॉट्स (Evening: 04:00 PM - 08:30 PM)"
                count={eveningSlots.length}
                icon={<Sunset className="w-4 h-4 text-purple-600" />}
                badgeColor="bg-purple-100 text-purple-900 border-purple-200"
                bookings={eveningSlots}
                allBookings={bookings}
                seenBookingIds={seenBookingIds}
                onMarkSeen={handleMarkSeen}
                onOpenReassign={(b) => setAssignModalBooking(b)}
              />
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <h3 className="text-sm font-bold font-serif text-gray-900">
                  ब्यूटीशियन कार्यभार (Workload)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-pink-50 text-brand-primary px-2 py-0.5 rounded-full">
                {activeTabInfo.label}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              इस दिन किस ब्यूटीशियन को कितने स्लॉट्स मिले हैं और कौन उपलब्ध है:
            </p>

            <div className="space-y-2.5 mt-3 max-h-[500px] overflow-y-auto pr-1">
              {BEAUTICIANS_LIST.filter((bea) => bea.isOnline).map((bea) => {
                const assignedCount = beauticianWorkload[bea.name] || 0;
                const isHeavy = assignedCount >= 3;

                return (
                  <div
                    key={bea.id}
                    className="p-3 rounded-2xl border border-gray-100 hover:border-pink-200 bg-gray-50/50 hover:bg-white transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <span>{bea.name}</span>
                        {bea.skills.includes('Korean Glass Skin') && (
                          <span className="text-[9px] bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded font-semibold">
                            मेकअप/स्किन
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        ★ {bea.rating} • {bea.area}
                      </div>
                    </div>

                    <div className="text-right">
                      {assignedCount === 0 ? (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          उपलब्ध (Free)
                        </span>
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isHeavy
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {assignedCount} स्लॉट बुक
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Single Reassign Modal */}
      {assignModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-6 border border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900">
                  Reassign Professional
                </h3>
                <p className="text-xs text-gray-500">
                  Booking: {assignModalBooking.bookingNumber} ({assignModalBooking.serviceName})
                </p>
              </div>
              <button
                onClick={() => setAssignModalBooking(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mt-4 max-h-80 overflow-y-auto">
              <span className="text-xs font-bold text-gray-700 block">
                Available Online Beauticians in Varanasi:
              </span>
              {BEAUTICIANS_LIST.filter((bea) => bea.isOnline).map((bea) => (
                <div
                  key={bea.id}
                  onClick={() => handleReassign(bea.name)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-brand-primary hover:bg-pink-50/50 cursor-pointer transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{bea.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      ★ {bea.rating} • {bea.experienceYears} yrs exp • {bea.area}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-brand-primary bg-pink-50 px-2.5 py-1 rounded-lg">
                    Select
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SlotSectionProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  badgeColor: string;
  bookings: AdminBooking[];
  allBookings: AdminBooking[];
  seenBookingIds: string[];
  onMarkSeen: (id: string) => void;
  onOpenReassign: (b: AdminBooking) => void;
}

function SlotSection({
  title,
  count,
  icon,
  badgeColor,
  bookings,
  allBookings,
  seenBookingIds,
  onMarkSeen,
  onOpenReassign,
}: SlotSectionProps) {
  if (bookings.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
          {count} बुकिंग्स
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {bookings.map((b) => {
          const isSeen = seenBookingIds.includes(b.id);
          const groupInfo = getBookingGroupInfo(b, allBookings);

          return (
            <div
              key={b.id}
              onClick={() => onMarkSeen(b.id)}
              className={`p-4.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                !isSeen
                  ? 'bg-amber-50/70 border-l-4 border-amber-500'
                  : groupInfo.isGrouped
                  ? 'bg-purple-50/20 border-l-4 border-purple-400'
                  : 'bg-white border-l-4 border-transparent hover:bg-gray-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    {b.bookingNumber}
                  </span>
                  <span className="text-xs font-bold text-brand-primary flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" />
                    {b.timeSlot}
                  </span>
                  {groupInfo.isGrouped && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      <LinkIcon className="w-2.5 h-2.5 text-purple-600" />
                      🔗 संयुक्त बुकिंग ({groupInfo.totalInGroup} सेवाएं)
                    </span>
                  )}
                  {!isSeen && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                      ✨ नई (Unread)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="font-bold text-xs text-gray-900">{b.customerName}</span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {b.customerPhone}
                  </span>
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-primary" />
                    {b.area}
                  </span>
                </div>

                <div className="text-xs text-gray-700 font-medium pt-0.5">
                  {b.serviceName}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                <div className="text-right">
                  <div className="text-xs font-bold text-brand-primary flex items-center gap-1 justify-end">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{b.beauticianName}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">
                    ₹{b.amount}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenReassign(b);
                  }}
                  className="px-3 py-1.5 bg-pink-50 hover:bg-brand-primary hover:text-white text-brand-primary text-xs font-bold rounded-xl transition-colors"
                >
                  Reassign
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
