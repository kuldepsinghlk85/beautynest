import React from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  Briefcase,
  Headphones,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'WORKER' | 'OPERATOR';

interface HeaderProps {
  title: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRefresh?: () => void;
}

export default function Header({
  title,
  currentRole,
  onRoleChange,
  onRefresh,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0 select-none z-10">
      {/* Left: Role Switcher & Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold font-serif text-gray-900 capitalize hidden sm:block">
          {title.replace('-', ' ')}
        </h1>

        {/* 3 Role Switcher Pills (Admin, Worker, Operator) */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/80 text-xs">
          <button
            onClick={() => onRoleChange('ADMIN')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentRole === 'ADMIN'
                ? 'bg-white text-[#0071E3] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>

          <button
            onClick={() => onRoleChange('WORKER')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentRole === 'WORKER'
                ? 'bg-white text-brand-primary shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Worker Portal</span>
          </button>

          <button
            onClick={() => onRoleChange('OPERATOR')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentRole === 'OPERATOR'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Operator</span>
          </button>
        </div>
      </div>

      {/* Right Controls (Matching Screenshots 1 & 2) */}
      <div className="flex items-center gap-3">
        {/* Search Platform Input */}
        <div className="relative hidden lg:block w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search platform..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50/90 border border-gray-200/90 rounded-xl outline-none focus:border-[#0071E3] focus:bg-white text-gray-800"
          />
        </div>

        {/* Theme Toggle Icon */}
        <button
          onClick={() => {}}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          title="Toggle Light / Dark"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
        </button>

        {/* User Profile Pill (Matches Screenshots 1 & 2) */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentRole === 'WORKER' ? 'P' : currentRole === 'OPERATOR' ? 'O' : 'B'}
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <p className="font-bold text-gray-900">
              {currentRole === 'WORKER'
                ? 'Priya Beautician'
                : currentRole === 'OPERATOR'
                ? 'Neha Operator'
                : 'BeautyNest Admin'}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {currentRole === 'WORKER'
                ? 'Worker / Beautician'
                : currentRole === 'OPERATOR'
                ? 'Dispatch / Operator'
                : 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
