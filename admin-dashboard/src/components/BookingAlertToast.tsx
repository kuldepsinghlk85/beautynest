import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowRight, CheckCircle, Sparkles, AlertCircle, Link as LinkIcon, Phone, MapPin } from 'lucide-react';
import {
  getSeenBookingIds,
  markBookingAsSeen,
  extractBaseBookingId,
  playNotificationChime,
} from '../lib/bookingNotificationService';
import { AdminBooking } from '../lib/mockAdminData';

interface BookingAlertToastProps {
  onViewBooking: (bookingId: string) => void;
}

export default function BookingAlertToast({ onViewBooking }: BookingAlertToastProps) {
  const [activeAlert, setActiveAlert] = useState<AdminBooking | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLinkedOrder, setIsLinkedOrder] = useState(false);

  // Check for any unseen bookings
  const checkNewBookings = () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('beautynest_all_bookings');
      if (!saved) return;
      const all: any[] = JSON.parse(saved);
      if (!Array.isArray(all) || all.length === 0) return;

      const seenIds = getSeenBookingIds();
      // Find latest unseen booking
      const unseen = all.find((b) => {
        const id = b.id || b.bookingNumber;
        return id && !seenIds.includes(id);
      });

      if (unseen) {
        const unseenId = unseen.id || unseen.bookingNumber;
        // Check if part of linked group
        const base = extractBaseBookingId(unseenId);
        const hasSiblings = all.filter((x) => {
          const xId = x.id || x.bookingNumber;
          return xId !== unseenId && (extractBaseBookingId(xId) === base || (x.customerPhone && x.customerPhone === unseen.customerPhone));
        }).length > 0;

        setIsLinkedOrder(hasSiblings);

        const mapped: AdminBooking = {
          id: unseenId,
          bookingNumber: unseen.bookingNumber || unseenId,
          customerName: unseen.customerName || 'Priya Sharma',
          customerPhone: unseen.customerPhone || '+91 98765 43210',
          serviceName: unseen.serviceName || 'Beauty Service',
          area: unseen.area ? `${unseen.area}, Varanasi` : 'Sigra, Varanasi',
          beauticianName: unseen.beauticianName || 'Sunita Sharma',
          timeSlot: unseen.scheduledTime || '11:30 AM',
          date: unseen.scheduledDate || 'Today',
          amount: unseen.totalAmount || unseen.servicePrice || 1299,
          status: 'Confirmed',
        };

        // If newly discovered
        if (!activeAlert || activeAlert.id !== mapped.id) {
          setActiveAlert(mapped);
          setIsDismissed(false);
          playNotificationChime();
        }
      }
    } catch (e) {
      console.error('Error checking alerts:', e);
    }
  };

  useEffect(() => {
    checkNewBookings();

    const handleBookingCreated = () => {
      checkNewBookings();
    };

    const handleSeenUpdated = () => {
      // Recheck if active alert is now seen
      if (activeAlert) {
        const seenIds = getSeenBookingIds();
        if (seenIds.includes(activeAlert.id)) {
          setActiveAlert(null);
        }
      }
    };

    window.addEventListener('beautynest_booking_created', handleBookingCreated);
    window.addEventListener('beautynest_seen_updated', handleSeenUpdated);
    window.addEventListener('storage', handleBookingCreated);

    // Periodic poll every 3 seconds for immediate detection
    const interval = setInterval(checkNewBookings, 3000);

    return () => {
      window.removeEventListener('beautynest_booking_created', handleBookingCreated);
      window.removeEventListener('beautynest_seen_updated', handleSeenUpdated);
      window.removeEventListener('storage', handleBookingCreated);
      clearInterval(interval);
    };
  }, [activeAlert]);

  if (!activeAlert || isDismissed) return null;

  const handleMarkSeen = () => {
    markBookingAsSeen(activeAlert.id);
    setActiveAlert(null);
  };

  const handleView = () => {
    markBookingAsSeen(activeAlert.id);
    onViewBooking(activeAlert.id);
    setActiveAlert(null);
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-bounce-short sm:w-[420px]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-brand-primary p-4 text-gray-900 shadow-pink-200/50">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold font-serif text-brand-primary uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              🚨 नई बुकिंग अलर्ट! (New Booking Alert)
            </span>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Linked Order Badge if combined */}
        {isLinkedOrder && (
          <div className="mt-2.5 bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-purple-800">
            <LinkIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>🔗 एक साथ की गई संयुक्त बुकिंग (Linked Cart Order)</span>
          </div>
        )}

        {/* Customer & Service Info */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
              {activeAlert.bookingNumber}
            </span>
            <span className="font-bold text-sm text-emerald-600">
              ₹{activeAlert.amount}
            </span>
          </div>

          <div className="font-bold text-gray-900 text-sm">
            {activeAlert.customerName}
          </div>

          <p className="text-xs text-gray-700 font-medium line-clamp-2">
            {activeAlert.serviceName}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-primary" />
              {activeAlert.area}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" />
              {activeAlert.customerPhone}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={handleMarkSeen}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
            देखी गई (Mark Seen)
          </button>

          <button
            onClick={handleView}
            className="px-4 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>तुरंत देखें (View)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
