import React from 'react';
import {
  TrendingUp,
  CalendarCheck,
  Users,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DASHBOARD_STATS,
  CHART_DATA,
  RECENT_BOOKINGS,
  AdminBooking,
} from '../lib/mockAdminData';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export default function DashboardPage({ onNavigateTab }: DashboardPageProps) {
  const getStatusBadge = (status: AdminBooking['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On the Way':
        return 'bg-pink-50 text-brand-primary border-pink-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-64px)]">
      
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Today&apos;s Revenue
            </span>
            <div className="w-9 h-9 rounded-2xl bg-pink-50 text-brand-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              {DASHBOARD_STATS.todayRevenue}
            </h3>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">vs. ₹1,05,200 yesterday</p>
        </div>

        {/* Card 2: Total Bookings */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              {DASHBOARD_STATS.totalBookings}
            </h3>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +12%
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">210 completed, 35 scheduled</p>
        </div>

        {/* Card 3: Active Customers */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              {DASHBOARD_STATS.activeCustomers}
            </h3>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +8 Today
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">94% repeat retention</p>
        </div>

        {/* Card 4: Online Beauticians */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Online Beauticians
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              {DASHBOARD_STATS.onlineBeauticians}
            </h3>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Active Now
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Out of 115 registered experts</p>
        </div>
      </div>

      {/* Bookings Overview Pink Chart Section (Screen 8) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif">
              Bookings &amp; Revenue Overview
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Hourly order flow and platform volume across Lucknow hubs today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-primary bg-pink-50 px-3 py-1 rounded-full">
              Today (Live)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E91E8C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E91E8C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E1B1E', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#F48FB1' }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#E91E8C"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorPink)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings Table (Screen 8) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-serif">
              Recent Bookings
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Live customer appointments and assigned doorstep professionals
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-xs font-bold text-brand-primary hover:text-brand-primaryDark flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-6">Booking ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Service</th>
                <th className="py-3.5 px-6">Time Slot</th>
                <th className="py-3.5 px-6">Professional</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_BOOKINGS.map((b) => (
                <tr key={b.id} className="hover:bg-pink-50/40 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">{b.bookingNumber}</td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{b.customerName}</div>
                    <div className="text-[11px] text-gray-400">{b.area}</div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">{b.serviceName}</td>
                  <td className="py-4 px-6 text-gray-600 font-medium">{b.timeSlot}</td>
                  <td className="py-4 px-6 font-semibold text-brand-primary">{b.beauticianName}</td>
                  <td className="py-4 px-6 font-bold text-gray-900">₹{b.amount}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        b.status,
                      )}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onNavigateTab('bookings')}
                      className="text-gray-400 hover:text-brand-primary p-1"
                    >
                      <MoreVertical className="w-4 h-4 inline" />
                    </button>
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
