import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header, { UserRole } from './components/Header';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import BeauticiansPage from './pages/BeauticiansPage';
import CustomersPage from './pages/CustomersPage';
import ServicesPage from './pages/ServicesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import CitiesPage from './pages/CitiesPage';
import WorkerPortalPage from './pages/WorkerPortalPage';
import OperatorPortalPage from './pages/OperatorPortalPage';
import BeauticianTiersPage from './pages/BeauticianTiersPage';
import ConsentFormsPage from './pages/ConsentFormsPage';
import DistanceRulesPage from './pages/DistanceRulesPage';
import CategoriesPage from './pages/CategoriesPage';
import CouponsPage from './pages/CouponsPage';
import SliderManagerPage from './pages/SliderManagerPage';
import PackagesPage from './pages/PackagesPage';
import OffersPage from './pages/OffersPage';
import DocumentationPage from './pages/DocumentationPage';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [currentTab, setCurrentTab] = useState('dashboard');

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'WORKER') {
      setCurrentTab('worker-dashboard');
    } else if (role === 'OPERATOR') {
      setCurrentTab('operator-console');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const renderContent = () => {
    // If worker dashboard tab
    if (currentTab === 'worker-dashboard' || currentTab === 'worker-bookings' || currentTab === 'worker-earnings' || currentTab === 'worker-profile') {
      return <WorkerPortalPage />;
    }

    // If operator portal
    if (currentTab === 'operator-console') {
      return <OperatorPortalPage />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigateTab={setCurrentTab} />;
      case 'cities':
        return <CitiesPage />;
      case 'tiers':
        return <BeauticianTiersPage />;
      case 'distance':
        return <DistanceRulesPage />;
      case 'consent-forms':
        return <ConsentFormsPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'beauticians':
        return <BeauticiansPage />;
      case 'customers':
        return <CustomersPage />;
      case 'categories':
        return (
          <CategoriesPage
            initialView="categories"
            onNavigateToServices={() => setCurrentTab('services')}
          />
        );
      case 'subcategories':
        return (
          <CategoriesPage
            initialView="subcategories"
            onNavigateToServices={() => setCurrentTab('services')}
          />
        );
      case 'services':
      case 'products':
      case 'inventory':
        return <ServicesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'coupons':
        return <CouponsPage />;
      case 'slider':
      case 'sliders':
        return <SliderManagerPage />;
      case 'packages':
        return <PackagesPage />;
      case 'offers':
        return <OffersPage />;
      case 'reports':
      case 'reviews':
      case 'notifications':
      case 'audit':
        return <ReportsPage />;
      case 'docs':
      case 'documentation':
        return <DocumentationPage onNavigateTab={setCurrentTab} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#2D2D2D] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={currentTab}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onOpenDocs={() => setCurrentTab('docs')}
          onRefresh={() => {
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

