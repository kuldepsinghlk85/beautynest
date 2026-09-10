import React from 'react';
import { Search, Bell, MapPin, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
}

export default function Header({ title, onRefresh }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      {/* Title & Hub */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold font-serif text-brand-charcoal capitalize">
          {title}
        </h1>
        <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-full text-xs font-semibold text-brand-primary">
          <MapPin className="w-3.5 h-3.5" />
          <span>Lucknow Hub (Active)</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bookings, customers, beauticians..."
            className="w-64 pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white text-gray-800 transition-all"
          />
        </div>

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-gray-500 hover:text-brand-primary hover:bg-pink-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-gray-500 hover:text-brand-primary hover:bg-pink-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-600 font-medium hidden sm:inline">Realtime System Live</span>
        </div>
      </div>
    </header>
  );
}
