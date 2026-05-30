import React, { useState, useEffect } from 'react';
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
  | 'owner-profile';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // 1. Listen for hash changes to support direct URL typing (e.g. #/owner/dashboard)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#/') {
        setCurrentPage('home');
        return;
      }

      // Public routes
      if (hash === '#/browse') { setCurrentPage('browse'); return; }
      if (hash === '#/landlords') { setCurrentPage('landlords'); return; }
      if (hash === '#/how-it-works') { setCurrentPage('how-it-works'); return; }
      if (hash === '#/support') { setCurrentPage('support'); return; }
      if (hash.startsWith('#/detail/')) {
        const idStr = hash.replace('#/detail/', '');
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          setSelectedRoomId(id);
          setCurrentPage('detail');
          return;
        }
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
      if (hash === '#/owner/listings/create') { setCurrentPage('owner-listings-create'); return; }
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
    };

    window.addEventListener('hashchange', handleHashChange);
    // Sync hash on initial load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 2. SynchronizecurrentPage state changes back to window hash (e.g. when clicking sidebar links)
  useEffect(() => {
    let targetHash = '#/';
    if (currentPage === 'home') targetHash = '#/';
    else if (currentPage === 'browse') targetHash = '#/browse';
    else if (currentPage === 'landlords') targetHash = '#/landlords';
    else if (currentPage === 'how-it-works') targetHash = '#/how-it-works';
    else if (currentPage === 'support') targetHash = '#/support';
    else if (currentPage === 'detail' && selectedRoomId !== null) {
      targetHash = `#/detail/${selectedRoomId}`;
    } else if (currentPage === 'owner-properties-create') {
      targetHash = '#/owner/properties/create';
    } else if (currentPage === 'owner-listings-create') {
      targetHash = '#/owner/listings/create';
    } else if (currentPage === 'owner-property-detail' && selectedPropertyId !== null) {
      targetHash = `#/owner/properties/${selectedPropertyId}`;
    } else if (currentPage === 'owner-unit-detail' && selectedUnitId !== null) {
      targetHash = `#/owner/units/${selectedUnitId}`;
    } else if (currentPage === 'owner-invoices-create') {
      targetHash = '#/owner/invoices/create';
    } else if (currentPage === 'owner-invoice-detail' && selectedInvoiceId !== null) {
      targetHash = `#/owner/invoices/${selectedInvoiceId}`;
    } else if (currentPage.startsWith('owner-')) {
      targetHash = '#/owner/' + currentPage.replace('owner-', '');
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [currentPage, selectedRoomId, selectedPropertyId, selectedUnitId]);

  // Check if it's an owner route
  const isOwnerRoute = currentPage.startsWith('owner-');

  if (isOwnerRoute) {
    return (
      <OwnerLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {currentPage === 'owner-dashboard' ? (
          <OwnerDashboard setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-properties' ? (
          <PropertyList setCurrentPage={setCurrentPage} setSelectedPropertyId={setSelectedPropertyId} />
        ) : currentPage === 'owner-property-detail' ? (
          <PropertyDetail propertyId={selectedPropertyId} setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-properties-create' ? (
          <PropertyCreate setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-unit-detail' ? (
          <UnitDetail unitId={selectedUnitId} setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-listings-create' ? (
          <ListingCreate setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-listings' ? (
          <ListingList setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-invoices' ? (
          <InvoiceList setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-invoices-create' ? (
          <InvoiceCreate setCurrentPage={setCurrentPage} />
        ) : currentPage === 'owner-invoice-detail' ? (
          <InvoiceDetail invoiceId={selectedInvoiceId} setCurrentPage={setCurrentPage} />
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
      <Navbar currentPage={currentPage as any} setCurrentPage={setCurrentPage as any} />
      <div className="flex-grow">
        {currentPage === 'home' ? (
          <Home setCurrentPage={setCurrentPage as any} setSelectedRoomId={setSelectedRoomId} />
        ) : currentPage === 'browse' ? (
          <Browse setCurrentPage={setCurrentPage as any} setSelectedRoomId={setSelectedRoomId} />
        ) : currentPage === 'landlords' ? (
          <ForLandlords setCurrentPage={setCurrentPage as any} />
        ) : currentPage === 'how-it-works' ? (
          <HowItWorks setCurrentPage={setCurrentPage as any} />
        ) : currentPage === 'support' ? (
          <Support setCurrentPage={setCurrentPage as any} />
        ) : (
          <RoomDetail 
            selectedRoomId={selectedRoomId} 
            setCurrentPage={setCurrentPage as any} 
            setSelectedRoomId={setSelectedRoomId} 
          />
        )}
      </div>
      <Footer setCurrentPage={setCurrentPage as any} />
    </div>
  );
};

export default App;
