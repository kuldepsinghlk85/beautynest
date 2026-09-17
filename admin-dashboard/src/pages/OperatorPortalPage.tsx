import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { RECENT_BOOKINGS, AdminBooking } from '../lib/mockAdminData';
import {
  getSeenBookingIds,
  markBookingAsSeen,
  getBookingGroupInfo,
} from '../lib/bookingNotificationService';

export default function OperatorPortalPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(RECENT_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [seenBookingIds, setSeenBookingIds] = useState<string[]>([]);

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

  const filteredBookings = bookings.filter((b) => {
    const isSeen = seenBookingIds.includes(b.id);
    let matchesStatus = true;
    if (selectedStatus === 'NEW') {
      matchesStatus = !isSeen;
    } else if (selectedStatus === 'SEEN') {
      matchesStatus = isSeen;
    } else if (selectedStatus !== 'ALL') {
      matchesStatus = b.status === selectedStatus;
    }

    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (bookingId: string, newStatus: AdminBooking['status']) => {
    markBookingAsSeen(bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const handleMarkSeen = (bId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markBookingAsSeen(bId);
    setSeenBookingIds(getSeenBookingIds());
  };

  const unreadCount = bookings.filter((b) => !seenBookingIds.includes(b.id)).length;

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
            {unreadCount > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-2.5 h-2.5 text-rose-600" />
                {unreadCount} नई बुकिंग्स
              </span>
            )}
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
          <span className="text-gray-400 text-xs font-semibold block">Total Orders</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{bookings.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <span className="text-gray-400 text-xs font-semibold block">Unseen / New</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{unreadCount}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <span className="text-gray-400 text-xs font-semibold block">Beauticians Online</span>
          <span className="text-2xl font-bold text-[#0071E3] mt-1 block">8</span>
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
            <option value="NEW">✨ New / Unseen</option>
            <option value="SEEN">✓ Seen</option>
            <option value="Confirmed">Confirmed</option>
            <option value="On the Way">On the Way</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table with Redacted Financials & Linked Highlighting */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6 font-bold">Booking # &amp; Group</th>
                <th className="py-3.5 px-6 font-bold">Customer Contact</th>
                <th className="py-3.5 px-6 font-bold">Location &amp; Area</th>
                <th className="py-3.5 px-6 font-bold">Service &amp; Time</th>
                <th className="py-3.5 px-6 font-bold">Assigned Beautician</th>
                <th className="py-3.5 px-6 font-bold">Customer Payable</th>
                <th className="py-3.5 px-6 font-bold">Internal Margins</th>
                <th className="py-3.5 px-6 font-bold">Look / View Status</th>
                <th className="py-3.5 px-6 text-right font-bold">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((b) => {
                const isSeen = seenBookingIds.includes(b.id);
                const groupInfo = getBookingGroupInfo(b, bookings);

                return (
                  <tr
                    key={b.id}
                    onClick={() => handleMarkSeen(b.id)}
                    className={`transition-colors ${
                      !isSeen
                        ? 'bg-amber-50/70 border-l-4 border-amber-500 hover:bg-amber-100/50'
                        : groupInfo.isGrouped
                        ? 'bg-purple-50/20 border-l-4 border-purple-400 hover:bg-purple-50/40'
                        : 'bg-white border-l-4 border-transparent hover:bg-blue-50/20'
                    }`}
                  >
                    <td className="py-4 px-6 font-mono font-bold text-gray-900">
                      <div>{b.bookingNumber}</div>
                      {groupInfo.isGrouped && (
                        <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          <LinkIcon className="w-2.5 h-2.5 text-purple-600" />
                          🔗 संयुक्त बुकिंग
                        </span>
                      )}
                    </td>

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

                    <td className="py-4 px-6 max-w-xs">
                      <span className="font-semibold text-gray-900 block line-clamp-2">{b.serviceName}</span>
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
                      <span
                        className="bg-gray-100 text-gray-400 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-200"
                        title="Hidden under Operator Role Privacy Rule"
                      >
                        🔒 [REDACTED]
                      </span>
                    </td>

                    {/* Look / View Status */}
                    <td className="py-4 px-6">
                      {!isSeen ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                            <Sparkles className="w-2.5 h-2.5" />
                            ✨ नई
                          </span>
                          <button
                            onClick={(e) => handleMarkSeen(b.id, e)}
                            className="text-[10px] text-gray-500 hover:text-gray-800 underline font-medium"
                          >
                            देखी गई
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ✓ देखी जा चुकी
                        </span>
                      )}
                    </td>

                    {/* Quick Status Updating */}
                    <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateStatus(b.id, e.target.value as any)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#0071E3]"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="On the Way">On the Way</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
