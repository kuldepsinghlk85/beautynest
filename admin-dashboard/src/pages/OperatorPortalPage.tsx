import React, { useState } from 'react';
import {
  Headphones,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  PhoneCall,
  User,
  MapPin,
  Calendar,
  Lock,
  EyeOff,
  Filter,
} from 'lucide-react';
import { RECENT_BOOKINGS, AdminBooking } from '../lib/mockAdminData';

export default function OperatorPortalPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(RECENT_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (bookingId: string, newStatus: AdminBooking['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              DISPATCH &amp; CALL CENTER
            </span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Role: Operational Agent
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Operator Console &amp; Service Dispatch
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Handle customer calling, beautician dispatch, schedule adjustments, and live status monitoring
          </p>
        </div>

        {/* Security / Privacy Alert Badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
          <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px]">
            <strong>Role Privacy Enforced:</strong> Company commissions, internal profit margins, and beautician net payouts are hidden in Operator view.
          </span>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <span className="text-gray-400 text-xs font-semibold block">Active Orders</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">5</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <span className="text-gray-400 text-xs font-semibold block">Awaiting Dispatch</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">2</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <span className="text-gray-400 text-xs font-semibold block">Beauticians En Route</span>
          <span className="text-2xl font-bold text-[#0071E3] mt-1 block">3</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <span className="text-gray-400 text-xs font-semibold block">Completed Today</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">18</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search booking number, customer, area..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#0071E3] font-medium text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="On the Way">On the Way</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table with Redacted Financials */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-bold">Booking #</th>
                <th className="py-3.5 px-6 font-bold">Customer Contact</th>
                <th className="py-3.5 px-6 font-bold">Location &amp; Area</th>
                <th className="py-3.5 px-6 font-bold">Service &amp; Time</th>
                <th className="py-3.5 px-6 font-bold">Assigned Beautician</th>
                <th className="py-3.5 px-6 font-bold">Customer Payable</th>
                <th className="py-3.5 px-6 font-bold">Internal Margins</th>
                <th className="py-3.5 px-6 font-bold">Status</th>
                <th className="py-3.5 px-6 text-right font-bold">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">{b.bookingNumber}</td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{b.customerName}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      <span>{b.customerPhone}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>{b.area}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900 block">{b.serviceName}</span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{b.timeSlot}</span>
                    </span>
                  </td>

                  <td className="py-4 px-6 font-medium text-gray-800">{b.beauticianName}</td>

                  {/* Customer Payable Amount (Visible to Operator) */}
                  <td className="py-4 px-6 font-bold text-gray-900 text-sm">₹{b.amount}</td>

                  {/* Internal Profit / Company Commission (Strictly REDACTED) */}
                  <td className="py-4 px-6">
                    <span className="bg-gray-100 text-gray-400 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-200" title="Hidden under Operator Role Privacy Rule">
                      🔒 [REDACTED]
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full text-[11px] border ${
                        b.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.status === 'In Progress'
                          ? 'bg-blue-50 text-[#0071E3] border-blue-200'
                          : b.status === 'On the Way'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                    <button
                      onClick={() => alert(`Calling customer ${b.customerName} at ${b.customerPhone} (Demo Call API)`)}
                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-emerald-200 transition-colors"
                      title="Initiate Customer Call"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                      className="px-2 py-1 text-[11px] bg-gray-50 border border-gray-200 rounded-lg outline-none font-semibold text-gray-700"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="On the Way">On the Way</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
