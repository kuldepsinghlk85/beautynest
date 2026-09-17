import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  UserCheck,
  X,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Eye,
  Link as LinkIcon,
  Users,
  CheckSquare,
  Square,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';
import { RECENT_BOOKINGS, BEAUTICIANS_LIST, AdminBooking } from '../lib/mockAdminData';
import {
  getSeenBookingIds,
  markBookingAsSeen,
  markAllBookingsAsSeen,
  getBookingGroupInfo,
  extractBaseBookingId,
  BookingGroupInfo,
} from '../lib/bookingNotificationService';

interface BookingsPageProps {
  onNavigateTab?: (tab: string) => void;
}

export default function BookingsPage({ onNavigateTab }: BookingsPageProps) {
  const [bookings, setBookings] = useState<AdminBooking[]>(RECENT_BOOKINGS);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [seenBookingIds, setSeenBookingIds] = useState<string[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  
  // Single reassign modal
  const [assignModalBooking, setAssignModalBooking] = useState<AdminBooking | null>(null);
  // Group reassign modal
  const [groupReassignBookings, setGroupReassignBookings] = useState<AdminBooking[] | null>(null);

  const loadLiveBookings = async () => {
    let liveBookings: AdminBooking[] = [];
    // 1. Check localStorage
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

    // 2. Fetch from Backend API
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
          // Combine and deduplicate
          mappedApi.forEach((item) => {
            if (!liveBookings.some((x) => x.id === item.id)) {
              liveBookings.unshift(item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('Backend bookings fetch skipped, using storage data:', e);
    }

    // Merge live bookings before mock bookings
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

    const handleStorageChange = () => {
      loadLiveBookings();
    };

    const handleSeenChange = () => {
      setSeenBookingIds(getSeenBookingIds());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('beautynest_booking_created', handleStorageChange);
    window.addEventListener('beautynest_seen_updated', handleSeenChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('beautynest_booking_created', handleStorageChange);
      window.removeEventListener('beautynest_seen_updated', handleSeenChange);
    };
  }, []);

  const filtered = bookings.filter((b) => {
    const isSeen = seenBookingIds.includes(b.id);
    let matchStatus = true;
    if (selectedStatus === 'NEW') {
      matchStatus = !isSeen;
    } else if (selectedStatus === 'SEEN') {
      matchStatus = isSeen;
    } else if (selectedStatus !== 'ALL') {
      matchStatus = b.status.toUpperCase() === selectedStatus;
    }

    const matchSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.beauticianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectGroup = (siblingIds: string[]) => {
    setSelectedBookingIds((prev) => {
      const allSelected = siblingIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !siblingIds.includes(id));
      } else {
        const next = new Set([...prev, ...siblingIds]);
        return Array.from(next);
      }
    });
  };

  const handleMarkSelectedAsSeen = () => {
    if (selectedBookingIds.length === 0) return;
    markBookingAsSeen(selectedBookingIds);
    setSeenBookingIds(getSeenBookingIds());
    setSelectedBookingIds([]);
  };

  const handleMarkSingleAsSeen = (bId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markBookingAsSeen(bId);
    setSeenBookingIds(getSeenBookingIds());
  };

  const handleOpenReassign = (b: AdminBooking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleMarkSingleAsSeen(b.id);
    setAssignModalBooking(b);
  };

  const handleOpenGroupReassign = (siblings: AdminBooking[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    siblings.forEach((s) => markBookingAsSeen(s.id));
    setSeenBookingIds(getSeenBookingIds());
    setGroupReassignBookings(siblings);
  };

  const handleReassign = (beauticianName: string) => {
    if (!assignModalBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === assignModalBooking.id ? { ...b, beauticianName } : b)),
    );
    setAssignModalBooking(null);
  };

  const handleGroupReassignSubmit = (assignments: Record<string, string>) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (assignments[b.id]) {
          return { ...b, beauticianName: assignments[b.id] };
        }
        return b;
      })
    );
    setGroupReassignBookings(null);
  };

  const unreadCount = bookings.filter((b) => !seenBookingIds.includes(b.id)).length;

  return (
    <div className="p-8 space-y-6 overflow-y-auto h-[calc(100vh-64px)] bg-[#F8F9FA]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-gray-900">
              Booking Operations &amp; Dispatch
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {unreadCount} नई अनरीड बुकिंग्स
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            संयुक्त बुकिंग्स को आसानी से चुनें व रीअसाइन करें • नई बुकिंग्स का विशेष हाईलाइट व स्टेटस मॉनिटरिंग
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('schedule')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              <span>📅 दैनिक व आगामी शेड्यूल (Day Schedule)</span>
            </button>
          )}

          {/* Batch Actions Bar (visible when items selected) */}
          {selectedBookingIds.length > 0 && (
            <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/30 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-primary animate-fade-in">
              <span>{selectedBookingIds.length} बुकिंग्स चुनी गईं</span>
              <button
                onClick={handleMarkSelectedAsSeen}
                className="px-2.5 py-1 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-xs transition-colors"
              >
                देखी गई मार्क करें
              </button>
              <button
                onClick={() => {
                  const selectedList = bookings.filter((b) => selectedBookingIds.includes(b.id));
                  setGroupReassignBookings(selectedList);
                }}
                className="px-2.5 py-1 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-lg shadow-xs transition-colors"
              >
                रीअसाइन करें
              </button>
              <button
                onClick={() => setSelectedBookingIds([])}
                className="text-gray-400 hover:text-gray-700 p-1"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'ALL (सभी)' },
            { id: 'NEW', label: `✨ NEW (${unreadCount})`, badge: unreadCount > 0 },
            { id: 'SEEN', label: '✓ SEEN (देखी गई)' },
            { id: 'CONFIRMED', label: 'CONFIRMED' },
            { id: 'ON THE WAY', label: 'ON THE WAY' },
            { id: 'IN PROGRESS', label: 'IN PROGRESS' },
            { id: 'COMPLETED', label: 'COMPLETED' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === tab.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : tab.badge
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
              }`}
            >
              {tab.label}
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

      {/* Bookings Table with Grouping & Highlighting */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/90 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3.5 px-4 font-bold">Booking # &amp; Group</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Service Info</th>
                <th className="py-3.5 px-4 font-bold">Slot</th>
                <th className="py-3.5 px-4 font-bold">Assigned Pro</th>
                <th className="py-3.5 px-4 font-bold">Amount</th>
                <th className="py-3.5 px-4 font-bold">Look / View Status</th>
                <th className="py-3.5 px-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    कोई बुकिंग नहीं मिली (No bookings found matching filters)
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const isSeen = seenBookingIds.includes(b.id);
                  const isSelected = selectedBookingIds.includes(b.id);
                  const groupInfo = getBookingGroupInfo(b, bookings);
                  const siblings = bookings.filter((x) => groupInfo.siblingIds.includes(x.id));
                  const areAllSiblingsSelected = groupInfo.siblingIds.every((id) =>
                    selectedBookingIds.includes(id)
                  );

                  return (
                    <tr
                      key={b.id}
                      onClick={() => handleMarkSingleAsSeen(b.id)}
                      className={`transition-all ${
                        !isSeen
                          ? 'bg-amber-50/70 border-l-4 border-amber-500 hover:bg-amber-100/50'
                          : groupInfo.isGrouped
                          ? 'bg-purple-50/20 border-l-4 border-purple-400 hover:bg-purple-50/40'
                          : 'bg-white border-l-4 border-transparent hover:bg-pink-50/20'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleSelect(b.id)}
                          className="text-gray-400 hover:text-brand-primary p-1"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Booking Number & Group Link Badge */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-gray-900">{b.bookingNumber}</div>
                        {groupInfo.isGrouped && (
                          <div className="mt-1 flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              <LinkIcon className="w-2.5 h-2.5 text-purple-600" />
                              <span>🔗 संयुक्त बुकिंग ({groupInfo.totalInGroup} सेवाएं)</span>
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectGroup(groupInfo.siblingIds);
                              }}
                              className="text-[10px] text-purple-700 hover:text-purple-900 font-semibold underline"
                            >
                              {areAllSiblingsSelected ? '✓ दोनों चुनी गईं' : '🔗 दोनों को एक साथ चुनें'}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">{b.customerName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-primary" />
                          <span>{b.area}</span>
                        </div>
                      </td>

                      {/* Service Info */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-gray-800 font-medium line-clamp-2">{b.serviceName}</div>
                        {b.id.endsWith('-M') && (
                          <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded font-bold mt-0.5 inline-block">
                            💄 मेकअप स्पेशलिस्ट ऑर्डर
                          </span>
                        )}
                        {(b.id.endsWith('-B') || b.id.endsWith('-S')) && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold mt-0.5 inline-block">
                            🧖‍♀️ सैलून/स्पा स्पेशलिस्ट ऑर्डर
                          </span>
                        )}
                      </td>

                      {/* Slot */}
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{b.timeSlot}</td>

                      {/* Assigned Pro */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-brand-primary">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{b.beauticianName}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-bold text-gray-900">₹{b.amount}</td>

                      {/* Look / View Status (Changes color and appearance when seen) */}
                      <td className="py-4 px-4">
                        {!isSeen ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" />
                              ✨ नई (Unread)
                            </span>
                            <button
                              onClick={(e) => handleMarkSingleAsSeen(b.id, e)}
                              className="text-[10px] text-gray-500 hover:text-gray-800 underline font-medium"
                              title="देखी गई मार्क करें"
                            >
                              देखी गई मार्क करें
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ✓ देखी जा चुकी
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {groupInfo.isGrouped && (
                            <button
                              onClick={(e) => handleOpenGroupReassign(siblings, e)}
                              className="px-2.5 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              title="Reassign both bookings together"
                            >
                              <Users className="w-3 h-3" />
                              ग्रुप रीअसाइन
                            </button>
                          )}
                          <button
                            onClick={(e) => handleOpenReassign(b, e)}
                            className="px-3 py-1 bg-pink-50 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Reassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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

      {/* Group Reassignment Modal (For Linked Orders) */}
      {groupReassignBookings && (
        <GroupReassignModal
          bookings={groupReassignBookings}
          onClose={() => setGroupReassignBookings(null)}
          onSubmit={handleGroupReassignSubmit}
        />
      )}
    </div>
  );
}

// Subcomponent: Group Reassign Modal
interface GroupReassignModalProps {
  bookings: AdminBooking[];
  onClose: () => void;
  onSubmit: (assignments: Record<string, string>) => void;
}

function GroupReassignModal({ bookings, onClose, onSubmit }: GroupReassignModalProps) {
  const [selectedPros, setSelectedPros] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    bookings.forEach((b) => {
      initial[b.id] = b.beauticianName;
    });
    return initial;
  });

  const handleSelectProForBooking = (bId: string, proName: string) => {
    setSelectedPros((prev) => ({ ...prev, [bId]: proName }));
  };

  const handleAssignAllToSame = (proName: string) => {
    const updated: Record<string, string> = {};
    bookings.forEach((b) => {
      updated[b.id] = proName;
    });
    setSelectedPros(updated);
  };

  const handleSave = () => {
    onSubmit(selectedPros);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 border border-purple-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>संयुक्त बुकिंग ग्रुप रीअसाइन (Linked Group Batch Reassign)</span>
            </div>
            <h3 className="text-base font-serif font-bold text-gray-900 mt-0.5">
              रीअसाइन करें: {bookings.length} संयुक्त सेवाएं
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          ये सेवाएं ग्राहक द्वारा एक ही समय पर एक साथ बुक की गई हैं। आप प्रत्येक सेवा के लिए अलग-अलग स्पेशलिस्ट या दोनों के लिए एक ही ऑल-राउंडर ब्यूटीशियन चुन सकते हैं।
        </p>

        {/* List of bookings in this group */}
        <div className="space-y-4 mt-4 max-h-96 overflow-y-auto pr-1">
          {bookings.map((b) => (
            <div key={b.id} className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-gray-900">
                    {b.bookingNumber}
                  </span>
                  <h4 className="text-xs font-bold text-gray-800 mt-0.5">{b.serviceName}</h4>
                  <span className="text-[11px] text-gray-500">स्लॉट: {b.timeSlot} • ₹{b.amount}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">वर्तमान प्रो:</span>
                  <span className="text-xs font-bold text-brand-primary">
                    {selectedPros[b.id] || b.beauticianName}
                  </span>
                </div>
              </div>

              {/* Selector for this booking */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">स्पेशलिस्ट चुनें:</span>
                <select
                  value={selectedPros[b.id] || b.beauticianName}
                  onChange={(e) => handleSelectProForBooking(b.id, e.target.value)}
                  className="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3 py-1.5 font-medium outline-none focus:border-purple-600"
                >
                  {BEAUTICIANS_LIST.map((bea) => (
                    <option key={bea.id} value={bea.name}>
                      {bea.name} (★ {bea.rating} • {bea.experienceYears} yrs • {bea.area})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {/* Quick Option: Assign same pro to all */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-1.5">
              त्वरित विकल्प: दोनों सेवाओं को एक ही ब्यूटीशियन को सौंपें:
            </span>
            <div className="flex flex-wrap gap-2">
              {BEAUTICIANS_LIST.slice(0, 4).map((bea) => (
                <button
                  key={bea.id}
                  onClick={() => handleAssignAllToSame(bea.name)}
                  className="px-2.5 py-1 text-xs bg-white border border-gray-300 hover:border-purple-500 hover:bg-purple-50 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  {bea.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            रद्द करें
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            दोनों को रीअसाइन अपडेट करें
          </button>
        </div>
      </div>
    </div>
  );
}
