// Booking notification, seen status tracking, audio chime, and linked grouping service
import { AdminBooking } from './mockAdminData';

const SEEN_STORAGE_KEY = 'beautynest_seen_booking_ids';

// Get list of seen booking IDs
export function getSeenBookingIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(SEEN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading seen bookings:', e);
    return [];
  }
}

// Check if a specific booking has been seen
export function isBookingSeen(bookingId: string): boolean {
  const seenIds = getSeenBookingIds();
  return seenIds.includes(bookingId);
}

// Mark single or multiple bookings as seen
export function markBookingAsSeen(bookingIds: string | string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const idsToMark = Array.isArray(bookingIds) ? bookingIds : [bookingIds];
    const seen = new Set(getSeenBookingIds());
    idsToMark.forEach((id) => seen.add(id));
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(seen)));
    window.dispatchEvent(
      new CustomEvent('beautynest_seen_updated', {
        detail: { seenIds: Array.from(seen) },
      })
    );
  } catch (e) {
    console.error('Error saving seen bookings:', e);
  }
}

// Mark all bookings as seen
export function markAllBookingsAsSeen(bookings: { id: string }[]): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = bookings.map((b) => b.id);
    const seen = new Set(getSeenBookingIds());
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(Array.from(seen)));
    window.dispatchEvent(
      new CustomEvent('beautynest_seen_updated', {
        detail: { seenIds: Array.from(seen) },
      })
    );
  } catch (e) {
    console.error('Error marking all seen:', e);
  }
}

// Extract root/base booking ID (e.g. "BK-8491-M" -> "BK-8491")
export function extractBaseBookingId(id: string): string {
  if (!id) return '';
  return id.replace(/-[MBS]$/i, '').trim();
}

export interface BookingGroupInfo {
  isGrouped: boolean;
  groupId: string;
  groupLabel: string;
  totalInGroup: number;
  siblingIds: string[];
  isSplitMakeupBeauty: boolean;
}

// Detect if a booking is part of a linked group (created together)
export function getBookingGroupInfo(
  target: AdminBooking,
  allBookings: AdminBooking[]
): BookingGroupInfo {
  const targetBase = extractBaseBookingId(target.id || target.bookingNumber);
  
  // Find all bookings matching either the exact same base ID or matching customer phone + same scheduled date
  const siblings = allBookings.filter((b) => {
    if (b.id === target.id) return true;
    const bBase = extractBaseBookingId(b.id || b.bookingNumber);
    if (targetBase && bBase && targetBase === bBase) return true;
    // Also check if same phone and same date & area
    if (
      b.customerPhone &&
      target.customerPhone &&
      b.customerPhone === target.customerPhone &&
      b.date === target.date
    ) {
      return true;
    }
    return false;
  });

  if (siblings.length <= 1) {
    return {
      isGrouped: false,
      groupId: target.id,
      groupLabel: '',
      totalInGroup: 1,
      siblingIds: [target.id],
      isSplitMakeupBeauty: false,
    };
  }

  // Has 2 or more bookings placed together!
  const hasMakeup = siblings.some(
    (s) =>
      s.id.endsWith('-M') ||
      s.serviceName.toLowerCase().includes('makeup') ||
      s.serviceName.includes('मेकअप')
  );
  const hasBeautyOrSpa = siblings.some(
    (s) =>
      s.id.endsWith('-B') ||
      s.id.endsWith('-S') ||
      s.serviceName.toLowerCase().includes('facial') ||
      s.serviceName.toLowerCase().includes('waxing') ||
      s.serviceName.toLowerCase().includes('spa') ||
      s.serviceName.includes('ब्यूटी') ||
      s.serviceName.includes('स्पा')
  );

  return {
    isGrouped: true,
    groupId: targetBase || target.customerPhone,
    groupLabel: hasMakeup && hasBeautyOrSpa
      ? 'मेकअप + सैलून संयुक्त बुकिंग (Split Order)'
      : 'एक साथ की गई बुकिंग (Linked Cart Bundle)',
    totalInGroup: siblings.length,
    siblingIds: siblings.map((s) => s.id),
    isSplitMakeupBeauty: hasMakeup && hasBeautyOrSpa,
  };
}

// Gentle pleasant audio chime for new booking notification (Web Audio API)
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Pleasant double chime: 587Hz (D5) then 880Hz (A5)
    const now = ctx.currentTime;
    
    // Osc 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Osc 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    // AudioContext may be restricted until user interacts
  }
}
