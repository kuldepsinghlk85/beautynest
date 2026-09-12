// Central user & booking state management for BeautyNest

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
}

// Check current logged in user
export function getCurrentUser(): CustomerProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('beautynest_current_user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading current user:', e);
  }
  return null;
}

// Set logged in user & broadcast change
export function setCurrentUser(user: CustomerProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem('beautynest_current_user', JSON.stringify(user));
      saveCustomer(user);
    } else {
      localStorage.removeItem('beautynest_current_user');
    }
    window.dispatchEvent(new Event('beautynest_user_change'));
  } catch (e) {
    console.error('Error saving current user:', e);
  }
}

// Save customer to list and backend
export function saveCustomer(user: CustomerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('beautynest_customers');
    let customers: CustomerProfile[] = saved ? JSON.parse(saved) : [];
    const index = customers.findIndex((c) => c.phone === user.phone || c.id === user.id);
    if (index >= 0) {
      customers[index] = { ...customers[index], ...user };
    } else {
      customers.unshift(user);
    }
    localStorage.setItem('beautynest_customers', JSON.stringify(customers));
    window.dispatchEvent(new Event('beautynest_customers_updated'));

    fetch('http://localhost:4200/api/services/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).catch(() => {});
  } catch (e) {
    console.error('Error saving customer list:', e);
  }
}

// Get all customer bookings
export function getCustomerBookings(phone?: string): BookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('beautynest_all_bookings');
    let all: BookingRecord[] = saved ? JSON.parse(saved) : [];
    if (phone) {
      return all.filter((b) => b.customerPhone === phone);
    }
    return all;
  } catch (e) {
    console.error('Error reading bookings:', e);
    return [];
  }
}

// Save a new booking
export function saveNewBooking(booking: BookingRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('beautynest_all_bookings');
    let all: BookingRecord[] = saved ? JSON.parse(saved) : [];
    all.unshift(booking);
    localStorage.setItem('beautynest_all_bookings', JSON.stringify(all));
    window.dispatchEvent(new Event('beautynest_booking_created'));

    fetch('http://localhost:4200/api/services/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).catch(() => {});
  } catch (e) {
    console.error('Error saving booking:', e);
  }
}
