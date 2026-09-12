import React, { useState, useEffect } from 'react';
import { CUSTOMERS_LIST, AdminCustomer } from '../lib/mockAdminData';
import { Users, Phone, MapPin, Calendar, Sparkles } from 'lucide-react';

export interface CustomerItem extends AdminCustomer {
  isLive?: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>(CUSTOMERS_LIST);

  const loadLiveCustomers = async () => {
    let liveList: any[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('beautynest_customers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            liveList = parsed.map((c: any) => ({
              id: c.id,
              name: c.fullName || 'Registered Customer',
              phone: `+91 ${c.phone}`,
              area: `${c.area || 'Sigra'}, Varanasi`,
              totalBookings: 1,
              totalSpent: c.walletBalance || 200,
              lastBooking: 'Today (Registered)',
              isLive: true,
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const res = await fetch('http://localhost:4200/api/services/customers');
      if (res.ok) {
        const apiCustomers = await res.json();
        if (Array.isArray(apiCustomers)) {
          apiCustomers.forEach((c: any) => {
            if (!liveList.some((x) => x.id === c.id || x.phone.includes(c.phone))) {
              liveList.unshift({
                id: c.id,
                name: c.fullName || 'Registered Customer',
                phone: `+91 ${c.phone}`,
                area: `${c.area || 'Sigra'}, Varanasi`,
                totalBookings: 1,
                totalSpent: c.walletBalance || 200,
                lastBooking: 'Recently Active',
                isLive: true,
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Backend customers skipped, using local store:', e);
    }

    const merged = [...liveList];
    CUSTOMERS_LIST.forEach((mock) => {
      if (!merged.some((m) => m.name === mock.name)) {
        merged.push(mock);
      }
    });
    setCustomers(merged);
  };

  useEffect(() => {
    loadLiveCustomers();
    const handleSync = () => loadLiveCustomers();
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      <div>
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Customer Directory &amp; LTV Metrics
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          View registered customer accounts, booking histories, addresses in Varanasi, and wallet balances
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Total Bookings</th>
                <th className="py-3.5 px-6">Wallet / LTV</th>
                <th className="py-3.5 px-6">Status / Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-pink-50/30">
                  <td className="py-4 px-6 font-bold text-gray-900 flex items-center gap-2">
                    {c.isLive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Registered User" />
                    )}
                    <span>{c.name}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-mono">{c.phone}</td>
                  <td className="py-4 px-6 text-gray-700">{c.area}</td>
                  <td className="py-4 px-6 font-semibold">{c.totalBookings} orders</td>
                  <td className="py-4 px-6 font-bold text-brand-primary">₹{c.totalSpent.toLocaleString()}</td>
                  <td className="py-4 px-6 text-gray-500">{c.lastBooking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
