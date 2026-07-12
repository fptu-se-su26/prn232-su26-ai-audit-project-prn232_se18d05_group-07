import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import RoomDetail from './pages/RoomDetail';
import ForLandlords from './pages/ForLandlords';
import HowItWorks from './pages/HowItWorks';
import Support from './pages/Support';
import Footer from './components/Footer';
import OwnerLayout from './components/owner/OwnerLayout';
import OwnerDashboard from './pages/owner/Dashboard';
import PropertyList from './pages/owner/PropertyList';
import PropertyDetail from './pages/owner/PropertyDetail';
import PropertyCreate from './pages/owner/PropertyCreate';
import UnitDetail from './pages/owner/UnitDetail';
import ListingCreate from './pages/owner/ListingCreate';
import ListingList from './pages/owner/ListingList';
import InvoiceList from './pages/owner/InvoiceList';
import InvoiceCreate from './pages/owner/InvoiceCreate';
import InvoiceDetail from './pages/owner/InvoiceDetail';
import Tenants from './pages/owner/Tenants';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import VerifySuccess from './pages/VerifySuccess';
import { AuthProvider } from './context/AuthContext';
import TenantLayout from './components/tenant/TenantLayout';
import TenantDashboard from './pages/tenant/Dashboard';
import TenantMyRoom from './pages/tenant/MyRoom';
import TenantMyInvoices from './pages/tenant/MyInvoices';
import TenantInvoiceDetail from './pages/tenant/InvoiceDetail';
import TenantFavorites from './pages/tenant/Favorites';
import TenantMaintenance from './pages/tenant/Maintenance';
import TenantProfile from './pages/tenant/Profile';
import TenantNotifications from './pages/tenant/Notifications';
import TenantMyReviews from './pages/tenant/MyReviews';
import TenantSearchHistory from './pages/tenant/SearchHistory';
import OwnerNotifications from './pages/owner/Notifications';
import Profile from './pages/owner/Profile';
import OwnerSubscription from './pages/owner/Subscription';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBuildings from './pages/admin/Buildings';
import AdminRooms from './pages/admin/Rooms';
import AdminModeration from './pages/admin/Moderation';
import AdminSubscriptions from './pages/admin/Subscriptions';
import Chat from './pages/Chat';

export type PageType = 
  | 'home' 
  | 'browse' 
  | 'detail' 
  | 'landlords' 
  | 'how-it-works' 
  | 'support'
  | 'owner-dashboard'
  | 'owner-properties'
  | 'owner-property-detail'
  | 'owner-properties-create'
  | 'owner-unit-detail'
  | 'owner-listings'
  | 'owner-listings-create'
  | 'owner-tenants'
  | 'owner-invoices'
  | 'owner-invoices-create'
  | 'owner-invoice-detail'
  | 'owner-cost-settings'
  | 'owner-notifications'
  | 'owner-profile'
  | 'owner-subscription'
  | 'owner-messages'
  | 'tenant-dashboard'
  | 'tenant-room'
  | 'tenant-invoices'
  | 'tenant-invoice-detail'
  | 'tenant-favorites'
  | 'tenant-maintenance'
  | 'tenant-messages'
  | 'tenant-profile'
  | 'tenant-notifications'
  | 'tenant-reviews'
  | 'tenant-search-history'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-buildings'
  | 'admin-rooms'
  | 'admin-moderation'
  | 'admin-subscriptions';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' ||
    location.pathname === '/verify-otp' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/verify-reset-otp' ||
    location.pathname === '/reset-password';

  // 1. Listen for hash changes to support direct URL typing for owner routes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#/') {
        setCurrentPage('home');
        return;
      }

      // Tenant routes
      if (hash.startsWith('#/tenant/')) {
        const sub = hash.replace('#/tenant/', '');
        if (sub.startsWith('invoices/')) {
          const id = sub.replace('invoices/', '');
          if (id && id !== 'detail') {
            setSelectedInvoiceId(id);
            setCurrentPage('tenant-invoice-detail');
            return;
          }
        }
        const tenantMap: Record<string, PageType> = {
          'dashboard': 'tenant-dashboard',
          'room': 'tenant-room',
          'invoices': 'tenant-invoices',
          'favorites': 'tenant-favorites',
          'maintenance': 'tenant-maintenance',
          'messages': 'tenant-messages',
          'profile': 'tenant-profile',
          'notifications': 'tenant-notifications',
          'reviews': 'tenant-reviews',
          'search-history': 'tenant-search-history',
        };
        if (tenantMap[sub]) { setCurrentPage(tenantMap[sub]); return; }
      }

      // Admin routes
      if (hash.startsWith('#/admin/')) {
        const sub = hash.replace('#/admin/', '');
        const adminMap: Record<string, PageType> = {
          'dashboard': 'admin-dashboard',
          'users': 'admin-users',
          'buildings': 'admin-buildings',
          'rooms': 'admin-rooms',
          'moderation': 'admin-moderation',
          'subscriptions': 'admin-subscriptions',
        };
        if (adminMap[sub]) { setCurrentPage(adminMap[sub]); return; }
      }

      // Owner routes
      if (hash === '#/owner/dashboard') { setCurrentPage('owner-dashboard'); return; }
      if (hash === '#/owner/properties/create') { setCurrentPage('owner-properties-create'); return; }
      if (hash.startsWith('#/owner/properties/')) {
        const idStr = hash.replace('#/owner/properties/', '');
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          setSelectedPropertyId(id);
          setCurrentPage('owner-property-detail');
          return;
        }
      }
      if (hash === '#/owner/properties') { setCurrentPage('owner-properties'); return; }
      if (hash.startsWith('#/owner/units/')) {
        const id = hash.replace('#/owner/units/', '');
        if (id) {
          setSelectedUnitId(id);
          setCurrentPage('owner-unit-detail');
          return;
        }
      }
      if (hash.startsWith('#/owner/listings/edit/')) {
        const idStr = hash.replace('#/owner/listings/edit/', '');
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          setSelectedListingId(id);
          setCurrentPage('owner-listings-create');
          return;
        }
      }
      if (hash === '#/owner/listings/create') {
        setSelectedListingId(null);
        setCurrentPage('owner-listings-create');
        return;
      }
      if (hash === '#/owner/listings') { setCurrentPage('owner-listings'); return; }
      if (hash === '#/owner/tenants') { setCurrentPage('owner-tenants'); return; }
      if (hash === '#/owner/invoices/create') { setCurrentPage('owner-invoices-create'); return; }
      if (hash.startsWith('#/owner/invoices/')) {
        const id = hash.replace('#/owner/invoices/', '');
        if (id) {
          setSelectedInvoiceId(id);
          setCurrentPage('owner-invoice-detail');
          return;
        }
      }
      if (hash === '#/owner/invoices') { setCurrentPage('owner-invoices'); return; }
      if (hash === '#/owner/cost-settings') { setCurrentPage('owner-cost-settings'); return; }
      if (hash === '#/owner/notifications') { setCurrentPage('owner-notifications'); return; }
      if (hash === '#/owner/profile') { setCurrentPage('owner-profile'); return; }
      if (hash === '#/owner/subscription') { setCurrentPage('owner-subscription'); return; }
      if (hash === '#/owner/messages') { setCurrentPage('owner-messages'); return; }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Sync hash on initial load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. Synchronize currentPage state changes back to window hash
  useEffect(() => {
    if (currentPage.startsWith('owner-')) {
      let targetHash = '#/owner/';
      if (currentPage === 'owner-dashboard') targetHash = '#/owner/dashboard';
      else if (currentPage === 'owner-properties-create') targetHash = '#/owner/properties/create';
      else if (currentPage === 'owner-listings-create') {
        if (selectedListingId !== null) {
          targetHash = `#/owner/listings/edit/${selectedListingId}`;
        } else {
          targetHash = '#/owner/listings/create';
        }
      }
      else if (currentPage === 'owner-property-detail' && selectedPropertyId !== null) {
        targetHash = `#/owner/properties/${selectedPropertyId}`;
      } else if (currentPage === 'owner-unit-detail' && selectedUnitId !== null) {
        targetHash = `#/owner/units/${selectedUnitId}`;
      } else if (currentPage === 'owner-invoices-create') {
        targetHash = '#/owner/invoices/create';
      } else if (currentPage === 'owner-invoice-detail' && selectedInvoiceId !== null) {
        targetHash = `#/owner/invoices/${selectedInvoiceId}`;
      } else {
        targetHash = '#/owner/' + currentPage.replace('owner-', '');
      }

      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }

    if (currentPage.startsWith('tenant-')) {
      const sub = currentPage === 'tenant-invoice-detail' && selectedInvoiceId
        ? `invoices/${selectedInvoiceId}`
        : currentPage.replace('tenant-', '');
      const targetHash = '#/tenant/' + sub;
      if (window.location.hash !== targetHash) window.location.hash = targetHash;
    }

    if (currentPage.startsWith('admin-')) {
      const targetHash = '#/admin/' + currentPage.replace('admin-', '');
      if (window.location.hash !== targetHash) window.location.hash = targetHash;
    }
  }, [currentPage, selectedPropertyId, selectedUnitId, selectedInvoiceId]);

  const isTenantRoute = currentPage.startsWith('tenant-');
  const isAdminRoute = currentPage.startsWith('admin-');

  if (isAdminRoute) {
    return (
      <AdminLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === 'admin-users' ? (
          <AdminUsers />
        ) : currentPage === 'admin-buildings' ? (
          <AdminBuildings />
        ) : currentPage === 'admin-rooms' ? (
          <AdminRooms />
        ) : currentPage === 'admin-moderation' ? (
          <AdminModeration />
        ) : currentPage === 'admin-subscriptions' ? (
          <AdminSubscriptions />
        ) : (
          <AdminDashboard setCurrentPage={setCurrentPage} />
        )}
      </AdminLayout>
    );
  }

  if (isTenantRoute) {
    return (
      <TenantLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === 'tenant-room' ? (
          <TenantMyRoom setCurrentPage={setCurrentPage} />
        ) : currentPage === 'tenant-invoices' ? (
          <TenantMyInvoices setCurrentPage={setCurrentPage} setSelectedInvoiceId={setSelectedInvoiceId} />
        ) : currentPage === 'tenant-invoice-detail' ? (
          <TenantInvoiceDetail invoiceId={selectedInvoiceId} setCurrentPage={setCurrentPage} />
        ) : currentPage === 'tenant-favorites' ? (
          <TenantFavorites setCurrentPage={setCurrentPage} />
        ) : currentPage === 'tenant-maintenance' ? (
          <TenantMaintenance />
        ) : currentPage === 'tenant-messages' ? (
          <Chat />
        ) : currentPage === 'tenant-profile' ? (
          <TenantProfile />
        ) : currentPage === 'tenant-notifications' ? (
          <TenantNotifications setCurrentPage={setCurrentPage} />
        ) : currentPage === 'tenant-reviews' ? (
          <TenantMyReviews />
        ) : currentPage === 'tenant-search-history' ? (
          <TenantSearchHistory setCurrentPage={setCurrentPage} />
        ) : (
          <TenantDashboard setCurrentPage={setCurrentPage} setSelectedInvoiceId={setSelectedInvoiceId} />
        )}
      </TenantLayout>
    );
  }

  const isOwnerRoute = currentPage.startsWith('owner-');

  if (isOwnerRoute) {
    return (
      <OwnerLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === 'owner-dashboard' ? (
          <OwnerDashboard setCurrentPage={setCurrentPage} setSelectedListingId={setSelectedListingId} />
        ) : currentPage === 'owner-properties' ? (
          <PropertyList setCurrentPage={setCurrentPage} setSelectedPropertyId={setSelectedPropertyId} />
        ) : currentPage === 'owner-property-detail' ? (
          <PropertyDetail propertyId={selectedPropertyId} setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-properties-create' ? (
          <PropertyCreate setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-unit-detail' ? (
          <UnitDetail unitId={selectedUnitId} setCurrentPage={setCurrentPage} setSelectedListingId={setSelectedListingId} />
        ) : currentPage === 'owner-listings-create' ? (
          <ListingCreate setCurrentPage={setCurrentPage} roomId={selectedListingId} setSelectedRoomId={setSelectedListingId} />
        ) : currentPage === 'owner-listings' ? (
          <ListingList setCurrentPage={setCurrentPage} setSelectedListingId={setSelectedListingId} />
        ) : currentPage === 'owner-invoices' ? (
          <InvoiceList setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-invoices-create' ? (
          <InvoiceCreate setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-invoice-detail' ? (
          <InvoiceDetail invoiceId={selectedInvoiceId} setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-tenants' ? (
          <Tenants setCurrentPage={setCurrentPage} setSelectedUnitId={setSelectedUnitId} />
        ) : currentPage === 'owner-notifications' ? (
          <OwnerNotifications setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-profile' ? (
          <Profile />
        ) : currentPage === 'owner-subscription' ? (
          <OwnerSubscription />
        ) : currentPage === 'owner-messages' ? (
          <Chat />
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 soft-shadow min-h-[400px] flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[64px] text-primary-container mb-4">construction</span>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Trang {currentPage.replace('owner-', '').toUpperCase()}</h2>
            <p className="text-gray-500 max-w-md">Giao diện tính năng chi tiết đang được phát triển trong các chặng tiếp theo của dự án RoomHub.</p>
            <button 
              onClick={() => setCurrentPage('owner-dashboard')} 
              className="mt-6 px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span> Quay lại Tổng quan
            </button>
          </div>
        )}
      </OwnerLayout>
    );
  }

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="/landlords" element={<ForLandlords />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/support" element={<Support />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
