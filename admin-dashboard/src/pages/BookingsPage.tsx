import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, UserCheck, X } from 'lucide-react';
import { RECENT_BOOKINGS, BEAUTICIANS_LIST, AdminBooking } from '../lib/mockAdminData';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(RECENT_BOOKINGS);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignModalBooking, setAssignModalBooking] = useState<AdminBooking | null>(null);

  const filtered = bookings.filter((b) => {
    const matchStatus = selectedStatus === 'ALL' || b.status.toUpperCase() === selectedStatus;
    const matchSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.beauticianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleReassign = (beauticianName: string) => {
    if (!assignModalBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === assignModalBooking.id ? { ...b, beauticianName } : b)),
    );
    setAssignModalBooking(null);
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-gray-900">
            Booking Operations &amp; Dispatch
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor live customer bookings, auto-assignment status, and manually reassign professionals
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CONFIRMED', 'ON THE WAY', 'IN PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking #, client, service..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-gray-800"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6">Booking #</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Service</th>
                <th className="py-3.5 px-6">Slot</th>
                <th className="py-3.5 px-6">Assigned Pro</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-pink-50/30">
                  <td className="py-4 px-6 font-bold text-gray-900">{b.bookingNumber}</td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{b.customerName}</div>
                    <div className="text-[11px] text-gray-400">{b.area}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium">{b.serviceName}</td>
                  <td className="py-4 px-6 text-gray-600">{b.timeSlot}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 font-bold text-brand-primary">
                      <span>{b.beauticianName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">₹{b.amount}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border bg-pink-50 text-brand-primary border-pink-200">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setAssignModalBooking(b)}
                      className="px-3 py-1 bg-pink-50 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Assignment Modal */}
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

            <div className="space-y-2 mt-4">
              <span className="text-xs font-bold text-gray-700 block">
                Available Online Beauticians in Lucknow:
              </span>
              {BEAUTICIANS_LIST.filter((bea) => bea.isOnline).map((bea) => (
                <div
                  key={bea.id}
                  onClick={() => handleReassign(bea.name)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:border-brand-primary hover:bg-pink-50/50 cursor-pointer transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{bea.name}</h4>
                    <p className="text-[11px] text-gray-500">★ {bea.rating} • {bea.experienceYears} yrs exp</p>
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
