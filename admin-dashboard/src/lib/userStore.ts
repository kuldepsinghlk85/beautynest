// Shared user & booking state management for Admin Dashboard

export interface CustomerProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  area: string;
  address: string;
  photoUrl: string;
  walletBalance: number;
  registeredAt: string;
}

export interface BookingRecord {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  area: string;
  serviceName: string;
  serviceCategory?: string;
  servicePrice: number;
  beauticianName: string;
  beauticianPhone: string;
  beauticianTier: string;
  scheduledDate: string;
  scheduledTime: string;
  hasOwnProducts: boolean;
  distanceKm: number;
  distanceFee: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'ON THE WAY' | 'IN PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  bookingDate: string;
  createdAt: string;
  consentSigned: boolean;
  secondaryBeauticianName?: string;
  secondaryBeauticianPhone?: string;
  isSplitBooking?: boolean;
}

export function getAllBookings(): BookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('beautynest_all_bookings');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading bookings:', e);
    return [];
  }
}

export function getAllCustomers(): CustomerProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('beautynest_customers');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading customers:', e);
    return [];
  }
}
