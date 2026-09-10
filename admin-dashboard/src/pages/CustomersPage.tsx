import React from 'react';
import { CUSTOMERS_LIST } from '../lib/mockAdminData';
import { Users, Phone, MapPin, Calendar } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      <div>
        <h2 className="text-xl font-bold font-serif text-gray-900">
          Customer Directory &amp; LTV Metrics
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          View customer booking histories, addresses in Lucknow, and wallet balances
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
                <th className="py-3.5 px-6">Lifetime Value</th>
                <th className="py-3.5 px-6">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {CUSTOMERS_LIST.map((c) => (
                <tr key={c.id} className="hover:bg-pink-50/30">
                  <td className="py-4 px-6 font-bold text-gray-900">{c.name}</td>
                  <td className="py-4 px-6 text-gray-600">{c.phone}</td>
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
