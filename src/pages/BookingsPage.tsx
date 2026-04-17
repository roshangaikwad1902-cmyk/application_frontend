import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  Calendar, 
  CreditCard, 
  MoreVertical,
  ChevronDown,
  User
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/constants';
import { useHotelsList } from '../hooks/useHotelData';
import { getBookingFinancials } from '../utils/financials';
import { 
  BookingActionsMenu, 
  BookingDetailsDrawer, 
  EditBookingDrawer 
} from '../components/booking/BookingControls';

export const BookingsManagement = ({ activeHotelId, onWalkInClick, onInvoiceClick, onReportClick }: any) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings-all', activeHotelId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
      });
      const data = await res.json();
      return data.filter((b: any) => b.hotel_id === activeHotelId);
    },
    enabled: !!activeHotelId
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter((b: any) => {
      const matchesSearch = b.guestDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || b.guestDetails?.phone?.includes(searchQuery) || b.roomNumber?.toString().includes(searchQuery);
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const revenue = filteredBookings.reduce((sum: number, b: any) => sum + (Number(b.paidAmount) || 0), 0);
    const pending = filteredBookings.filter((b: any) => (b.balanceAmount || 0) > 0).length;
    return { total, revenue, pending };
  }, [filteredBookings]);

  if (isLoading) return <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
    <div className="w-16 h-16 border-4 border-[var(--lux-gold)] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--lux-gold)]">Syncing Global Ledger...</p>
  </div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
         <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-auto">
            <div className="bg-[var(--lux-card)] p-6 rounded-[2rem] border border-[var(--lux-border)] space-y-1 min-w-[160px]">
               <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Total Ledger</p>
               <h3 className="text-3xl font-display font-bold">{stats.total}</h3>
            </div>
            <div className="bg-[var(--lux-card)] p-6 rounded-[2rem] border border-[var(--lux-border)] space-y-1 min-w-[160px]">
               <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Realized Revenue</p>
               <h3 className="text-3xl font-display font-bold text-green-500">₹{stats.revenue}</h3>
            </div>
            <div className="bg-[var(--lux-card)] p-6 rounded-[2rem] border border-[var(--lux-border)] space-y-1 min-w-[160px] hidden md:block">
               <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Unsettled Case</p>
               <h3 className="text-3xl font-display font-bold text-red-500">{stats.pending}</h3>
            </div>
         </div>

         <div className="flex gap-4 w-full lg:w-auto">
            <button type="button" onClick={onWalkInClick} className="flex-1 lg:flex-none px-8 py-4 bg-[var(--lux-gold)] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[var(--lux-gold)]/20 hover:scale-105 active:scale-95 transition-all">
               <Plus size={16} /> New Booking
            </button>
            <button type="button" onClick={() => onReportClick(filteredBookings)} className="flex-1 lg:flex-none px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
               <Download size={16} /> Audit Export
            </button>
         </div>
      </div>

      <div className="bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[2.5rem] shadow-2xl overflow-hidden">
         <div className="p-8 border-b border-[var(--lux-border)] flex flex-col md:flex-row justify-between items-center gap-6 bg-black/5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[var(--lux-gold)]/10 rounded-xl flex items-center justify-center text-[var(--lux-gold)]">
                  <Filter size={18} />
               </div>
               <div className="relative group">
                  <select 
                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[11px] font-black uppercase tracking-widest appearance-none pr-8 outline-none border-none cursor-pointer"
                  >
                     {['All', 'confirmed', 'completed', 'cancelled', 'pending'].map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
               </div>
            </div>

            <div className="relative group w-full md:max-w-md">
               <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)]" />
               <input 
                 type="text" placeholder="Search by name, phone or room..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-inner" 
               />
            </div>
         </div>

         <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-black/20 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--lux-muted)] border-b border-white/5">
                     <th className="p-6">Guest / Dossier</th>
                     <th className="p-6">Stay Architecture</th>
                     <th className="p-6">Ledger Performance</th>
                     <th className="p-6">Status</th>
                     <th className="p-6 text-right">Operations</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((b: any) => {
                    const financials = getBookingFinancials(b);
                    return (
                      <tr key={b._id} className="group hover:bg-white/[0.02] transition-colors relative">
                         <td className="p-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[var(--lux-gold)]/30 transition-all">
                                  <User size={18} className="opacity-40 group-hover:opacity-100 group-hover:text-[var(--lux-gold)] transition-all" />
                               </div>
                               <div>
                                  <p className="font-bold text-[13px] tracking-tight">{b.guestDetails?.name}</p>
                                  <p className="text-[10px] font-bold text-[var(--lux-muted)]">{b.guestDetails?.phone}</p>
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <div className="space-y-1.5">
                               <p className="text-[10px] font-black text-[var(--lux-gold)] bg-[var(--lux-gold)]/10 px-3 py-1 rounded-lg inline-block">Room {b.roomNumber}</p>
                               <div className="flex items-center gap-2 text-[9px] font-bold opacity-40">
                                  <Calendar size={12} />
                                  <span>{new Date(b.checkin).toLocaleDateString()} — {new Date(b.checkout).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <div className="space-y-1.5">
                               <div className="flex items-center gap-2">
                                  <CreditCard size={12} className="opacity-40" />
                                  <p className="text-[11px] font-bold">₹{financials.paid} <span className="opacity-40 text-[9px] ml-1">Paid</span></p>
                               </div>
                               <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                  <div className={`h-full rounded-full ${financials.paidPercent === 100 ? 'bg-green-500' : 'bg-[var(--lux-gold)]'}`} style={{ width: `${financials.paidPercent}%` }} />
                               </div>
                            </div>
                         </td>
                         <td className="p-6">
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : b.status === 'completed' ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-[var(--lux-muted)]'}`}>
                               {b.status}
                            </span>
                         </td>
                         <td className="p-6 text-right relative">
                            <div className="flex justify-end items-center gap-3">
                               <button 
                                 type="button" 
                                 onClick={() => { setSelectedBooking(b); setShowDrawer(true); }}
                                 className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-[var(--lux-gold)] hover:text-black transition-all cursor-pointer border border-white/5 shadow-xl"
                               >
                                  <ChevronRight size={18} />
                               </button>
                               <div className="relative">
                                  <button type="button" onClick={() => setMenuOpen(menuOpen === b._id ? null : b._id)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-all"><MoreVertical size={18} /></button>
                                  <AnimatePresence>
                                     {menuOpen === b._id && (
                                       <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-12 z-[100]">
                                          <BookingActionsMenu 
                                            booking={b} 
                                            onAction={() => { setMenuOpen(null); queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] }); }} 
                                            onViewDetails={() => { setSelectedBooking(b); setShowDrawer(true); setMenuOpen(null); }}
                                            onEdit={() => { setSelectedBooking(b); setShowEdit(true); setMenuOpen(null); }}
                                            onDownload={() => onInvoiceClick(b)}
                                          />
                                       </motion.div>
                                     )}
                                  </AnimatePresence>
                               </div>
                            </div>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      <BookingDetailsDrawer 
        booking={selectedBooking} 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] })}
        onEditClick={() => { setShowDrawer(false); setShowEdit(true); }}
        onInvoiceClick={(b: any) => onInvoiceClick(b)}
      />
      <EditBookingDrawer 
        booking={selectedBooking} 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] })} 
      />
    </div>
  );
};
