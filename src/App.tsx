import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Config & Utils
import { API_BASE_URL } from './config/constants';
import { useActiveBookings } from './hooks/useHotelData';

// UI & Layout Components
import { Header, Sidebar, BottomActionBar } from './components/layout/Navigation';
import { ModulePlaceholder } from './components/ui/LayoutGrid';

// Pages
import { HotelSelectionPage, LoginPage } from './pages/AuthPages';
import { GlobalDashboard } from './pages/DashboardPage';
import { ReceptionConsole } from './pages/ReceptionPage';
import { BookingsManagement } from './pages/BookingsPage';
import { GuestsPage } from './pages/GuestsPage';
import { FutureBookingPage } from './pages/FutureBookingPage';
import { RevenuePage } from './pages/RevenuePage';
// Views
import { DetailedInvoice } from './views/DetailedInvoice';
import { BookingReportView } from './views/BookingReportView';
import { RevenueReportView } from './views/RevenueReportView';
import { BookingSlip } from './views/BookingSlip';

// Create Query Client
const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('lux_theme') as 'dark' | 'light') || 'dark'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('hotel_token'));
  const [activeHotel, setActiveHotel] = useState<{ id: string; name: string } | null>(
    JSON.parse(localStorage.getItem('active_hotel') || 'null')
  );

  // Print/Preview States
  const [invoiceBooking, setInvoiceBooking] = useState<any>(null);
  const [reportBookings, setReportBookings] = useState<any[] | null>(null);
  const [revenueReportData, setRevenueReportData] = useState<any | null>(null);
  const [slipBooking, setSlipBooking] = useState<any>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lux_theme', theme);
  }, [theme]);

  const handleHotelSelect = (id: string, name: string) => {
    const hotel = { id, name };
    setActiveHotel(hotel);
    localStorage.setItem('active_hotel', JSON.stringify(hotel));
  };

  const handleLogout = () => {
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('active_hotel');
    setIsAuthenticated(false);
    setActiveHotel(null);
    navigate('/');
  };

  const handlePrint = (type: 'invoice' | 'report') => {
    setTimeout(() => {
      window.print();
      if (type === 'invoice') setInvoiceBooking(null);
      else setReportBookings(null);
    }, 500);
  };

  const { data: activeBookings = [] } = useActiveBookings(activeHotel?.id || '');

  const bookedCount = activeBookings.length;
  const arrivalsCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activeBookings.filter((b: any) => b.checkin.startsWith(today)).length;
  }, [activeBookings]);

  // If printing, return special view
  if (invoiceBooking) return (
     <div className="print-view-wrapper">
        <DetailedInvoice booking={invoiceBooking} hotel={activeHotel} />
        <div className="fixed bottom-10 right-10 flex gap-4 no-print z-[1000]">
           <button onClick={() => setInvoiceBooking(null)} className="px-8 py-4 bg-gray-400 text-white rounded-xl font-bold uppercase text-[10px] shadow-xl hover:bg-gray-500 transition-all">Cancel</button>
           <button onClick={() => window.print()} className="px-8 py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold uppercase text-[10px] shadow-xl hover:scale-105 transition-all">Print Invoice</button>
        </div>
     </div>
  );

  if (slipBooking) return (
     <div className="print-view-wrapper">
        <BookingSlip booking={slipBooking} hotel={activeHotel} />
        <div className="fixed bottom-10 right-10 flex gap-4 no-print z-[1000]">
           <button onClick={() => setSlipBooking(null)} className="px-8 py-4 bg-gray-400 text-white rounded-xl font-bold uppercase text-[10px] shadow-xl">Back</button>
           <button onClick={() => window.print()} className="px-8 py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold uppercase text-[10px] shadow-xl">Print Slip</button>
        </div>
     </div>
  );

  if (reportBookings) return (
    <div className="print-view-wrapper">
       <BookingReportView bookings={reportBookings} title="System Audit Report" hotel={activeHotel} />
       <div className="fixed bottom-10 right-10 flex gap-4 no-print z-[1000]">
          <button onClick={() => setReportBookings(null)} className="px-8 py-4 bg-gray-400 text-white rounded-xl font-bold uppercase text-[10px] shadow-xl">Back</button>
          <button onClick={() => window.print()} className="px-8 py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold uppercase text-[10px] shadow-xl">Print Audit</button>
       </div>
    </div>
 );

  if (revenueReportData) return (
    <div className="print-view-wrapper">
       <RevenueReportView reportData={revenueReportData} hotel={activeHotel} />
       <div className="fixed bottom-10 right-10 flex gap-4 no-print z-[1000]">
          <button onClick={() => setRevenueReportData(null)} className="px-8 py-4 bg-gray-400 text-white rounded-xl font-bold uppercase text-[10px] shadow-xl">Back</button>
          <button onClick={() => window.print()} className="px-8 py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold uppercase text-[10px] shadow-xl">Print Report</button>
       </div>
    </div>
 );

  if (!activeHotel) return <HotelSelectionPage onSelect={handleHotelSelect} />;
  if (!isAuthenticated) return <LoginPage hotelName={activeHotel.name} hotelId={activeHotel.id} onBack={() => setActiveHotel(null)} onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[var(--lux-bg)] text-[var(--lux-text)] selection:bg-[var(--lux-gold)] selection:text-black">
      <Sidebar theme={theme} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} />
      
      <div className="lg:pl-[280px] min-h-screen transition-all duration-500">
        <Header 
          theme={theme} 
          setTheme={setTheme} 
          hotelName={activeHotel.name} 
          onMenuClick={() => setIsSidebarOpen(true)}
          bookedCount={bookedCount}
          arrivalsCount={arrivalsCount}
        />

        <main className="pt-28 px-4 sm:px-6 md:px-10 pb-28 lg:pb-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={<GlobalDashboard activeHotelId={activeHotel.id} onHotelChange={(id) => handleHotelSelect(id, "")} onWalkInClick={() => navigate('/reception')} onInvoiceClick={(b: any) => setInvoiceBooking(b)} />} 
              />
              <Route 
                path="/reception" 
                element={<ReceptionConsole activeHotelId={activeHotel.id} onHotelChange={(id) => handleHotelSelect(id, "")} />} 
              />
              <Route 
                path="/bookings" 
                element={<BookingsManagement activeHotelId={activeHotel.id} onWalkInClick={() => navigate('/reception')} onInvoiceClick={(b: any) => setInvoiceBooking(b)} onReportClick={(bs: any[]) => setReportBookings(bs)} />} 
              />
              <Route path="/guests" element={<GuestsPage activeHotelId={activeHotel.id} />} />
              <Route 
                 path="/future-booking" 
                 element={<FutureBookingPage activeHotelId={activeHotel.id} onSlipClick={(b: any) => setSlipBooking(b)} />} 
               />
              <Route 
                 path="/payments" 
                 element={<RevenuePage activeHotelId={activeHotel.id} onReportClick={(data: any) => setRevenueReportData(data)} />} 
               />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        <BottomActionBar />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_relativeSplatPath: true }}>
        <AppContent />
        <Toaster position="top-right" richColors theme="dark" expand={true} />
      </Router>
    </QueryClientProvider>
  );
}
