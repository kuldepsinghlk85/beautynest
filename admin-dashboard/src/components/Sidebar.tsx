import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderTree,
  ListTree,
  Scissors,
  Building2,
  CalendarCheck,
  CreditCard,
  Tag,
  Star,
  Bell,
  History,
  FileCheck,
  Award,
  Compass,
  Settings,
  Sparkles,
  LogOut,
  Briefcase,
  Headphones,
  Gift,
  Sliders,
} from 'lucide-react';
import { UserRole } from './Header';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  groupTitle: string | null;
  items: NavItem[];
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  currentRole,
}: SidebarProps) {
  // Navigation sections matching Screenshot 2
  const adminSections: NavSection[] = [
    {
      groupTitle: null,
      items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      groupTitle: 'USERS',
      items: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'beauticians', label: 'Workers', icon: UserCheck, badge: '20' },
      ],
    },
    {
      groupTitle: 'CATALOG',
      items: [
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'subcategories', label: 'Subcategories', icon: ListTree },
        { id: 'services', label: 'Services', icon: Scissors, badge: '132' },
        { id: 'packages', label: 'Offers & Packages', icon: Gift, badge: 'Deals' },
      ],
    },
    {
      groupTitle: 'OPERATIONS',
      items: [
        { id: 'cities', label: 'Cities', icon: Building2, badge: '7' }, // Screenshot 2 Serviceable Cities!
        { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: '5 New' },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
        { id: 'slider', label: 'Hero Sliders', icon: Sliders },
      ],
    },
    {
      groupTitle: 'QUALITY',
      items: [
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'consent-forms', label: 'Consent Forms', icon: FileCheck },
      ],
    },
    {
      groupTitle: 'SYSTEM',
      items: [
        { id: 'tiers', label: 'Partner Tiers & %', icon: Award },
        { id: 'distance', label: 'Distance Rules', icon: Compass },
        { id: 'audit', label: 'Audit Logs', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  // Worker sections (Screenshot 1)
  const workerSections: NavSection[] = [
    {
      groupTitle: null,
      items: [{ id: 'worker-dashboard', label: 'My Dashboard', icon: LayoutDashboard }],
    },
    {
      groupTitle: 'MY OPERATIONS',
      items: [
        { id: 'customers', label: 'My Customers', icon: Users },
        { id: 'worker-bookings', label: 'My Bookings', icon: CalendarCheck, badge: 'Active' },
        { id: 'services', label: 'My Services', icon: Scissors },
        { id: 'reviews', label: 'My Reviews', icon: Star },
        { id: 'worker-earnings', label: 'My Earnings', icon: CreditCard },
        { id: 'consent-forms', label: 'Consent Verifications', icon: FileCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
      ],
    },
    {
      groupTitle: 'ACCOUNT',
      items: [{ id: 'worker-profile', label: 'My Profile', icon: UserCheck }],
    },
  ];

  // Operator sections
  const operatorSections: NavSection[] = [
    {
      groupTitle: 'DISPATCH',
      items: [
        { id: 'operator-console', label: 'Operator Console', icon: Headphones },
        { id: 'bookings', label: 'Live Bookings', icon: CalendarCheck },
        { id: 'customers', label: 'Customer Lookup', icon: Users },
        { id: 'beauticians', label: 'Beautician Locator', icon: UserCheck },
        { id: 'consent-forms', label: 'Consent Status', icon: FileCheck },
      ],
    },
  ];

  const sections =
    currentRole === 'WORKER'
      ? workerSections
      : currentRole === 'OPERATOR'
      ? operatorSections
      : adminSections;

  return (
    <aside className="w-64 bg-white text-gray-700 flex flex-col justify-between border-r border-gray-100 h-screen flex-shrink-0 select-none shadow-xs">
      {/* Brand Header matching Screenshot 2 */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#0071E3] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-gray-900 tracking-tight">BeautyNest</span>
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
              {currentRole === 'WORKER'
                ? 'Worker Portal'
                : currentRole === 'OPERATOR'
                ? 'Operator Console'
                : 'Admin Panel'}
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {sec.groupTitle && (
                <span className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  {sec.groupTitle}
                </span>
              )}
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50/80 text-[#0071E3] font-bold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive ? 'text-[#0071E3]' : 'text-gray-400'}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-[#0071E3] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>v2.4 Enterprise</span>
        <span className="text-emerald-600 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Cloud Sync
        </span>
      </div>
    </aside>
  );
}
