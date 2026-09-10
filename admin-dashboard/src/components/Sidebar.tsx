import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Sparkles,
  Scissors,
  Package,
  Boxes,
  CreditCard,
  Star,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: '5 New' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'beauticians', label: 'Beauticians', icon: Sparkles, badge: '1 KYC' },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1E1B1E] text-gray-300 flex flex-col justify-between border-r border-neutral-800 h-screen flex-shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-pink-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-serif font-bold text-white tracking-tight">
              Beauty<span className="text-brand-primary">Nest</span>
            </span>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
              Admin Operations
            </p>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm shadow-pink-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-pink-900/50 text-pink-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 text-brand-primary flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div>
            <p className="text-xs font-bold text-white">Nisha Admin</p>
            <p className="text-[10px] text-gray-400">Operations Lead</p>
          </div>
        </div>
        <button
          onClick={() => alert('Logged out from admin portal')}
          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
