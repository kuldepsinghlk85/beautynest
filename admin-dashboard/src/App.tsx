import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import BeauticiansPage from './pages/BeauticiansPage';
import CustomersPage from './pages/CustomersPage';
import ServicesPage from './pages/ServicesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigateTab={setCurrentTab} />;
      case 'bookings':
        return <BookingsPage />;
      case 'beauticians':
        return <BeauticiansPage />;
      case 'customers':
        return <CustomersPage />;
      case 'services':
      case 'products':
      case 'inventory':
        return <ServicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'reports':
      case 'reviews':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#2D2D2D] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={currentTab}
          onRefresh={() => {
            // refresh simulation
            const tab = currentTab;
            setCurrentTab('dashboard');
            setTimeout(() => setCurrentTab(tab), 50);
          }}
        />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  );
}
