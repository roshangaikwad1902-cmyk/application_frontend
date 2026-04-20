import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  LogOut, 
  DollarSign, 
  LayoutGrid, 
  UserPlus, 
  Search, 
  Eye, 
  User, 
  Bed, 
  CreditCard, 
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/constants';
import { 
  useHotelsList, 
  useActiveBookings, 
  useRoomStatus, 
  useRoomAvailabilityMap,
  useUnifiedBookings 
} from '../hooks/useHotelData';
import { 
  NormalInput, 
  NormalSelect, 
  NormalUploader 
} from '../components/ui/LayoutGrid';
import { PremiumDatePicker } from '../components/ui/DatePicker';
import { BookingDetailsDrawer } from '../components/booking/BookingControls';

export const ReceptionConsole = ({ activeHotelId, onHotelChange }: { activeHotelId: string, onHotelChange: (id: string) => void }) => {
  const queryClient = useQueryClient();
  const { data: allHotels = [], isLoading: loadingHotels } = useHotelsList();
  const [activeView, setActiveView] = useState<'dashboard' | 'form'>('dashboard');
  
  const getLocalDateStr = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA');
  };

  const [checkInDate, setCheckInDate] = useState(getLocalDateStr());
  const [checkOutDate, setCheckOutDate] = useState(getLocalDateStr(1));
  
  const { data: activeBookings = [] } = useActiveBookings(activeHotelId);
  const { data: physicalStatuses = [] } = useRoomStatus(activeHotelId);
  const { data: availabilityMap = { occupied: [], blocked: [] } } = useRoomAvailabilityMap(activeHotelId, checkInDate, checkOutDate);
  const { data: unifiedBookings = [] } = useUnifiedBookings(activeHotelId);

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ 
    name: '', phone: '', email: '', guests: 1,
    roomNumber: '', roomType: '', hotelName: '',
    checkin: getLocalDateStr(),
    checkout: getLocalDateStr(1),
    totalAmount: 0, paidAmount: 0, offlinePaid: 0, onlinePaid: 0, 
    paymentMethod: 'Partial', paymentStatus: 'Paid',
    bookingSource: 'walk_in', bookingPlatform: '', otaPaymentType: 'pay_at_hotel',
    photo: '', aadharFront: '', aadharBack: '', otherDoc: ''
  });

  const hotels = useMemo(() => allHotels.filter((h: any) => h.id && h.rooms?.length > 0), [allHotels]);
  const activeHotel = useMemo(() => hotels.find((h: any) => h.id === activeHotelId), [hotels, activeHotelId]);

  const rooms = useMemo(() => {
    if (!activeHotel) return [];
    const generated: any[] = [];
    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      const count = roomType.total_rooms || 20; 
      const startNum = (idx + 1) * 100 + 1;
      for (let i = 0; i < count; i++) {
        const num = (startNum + i).toString();
        const curBooking = activeBookings.find((b: any) => b.roomNumber === num);
        const manStatus = physicalStatuses.find((s: any) => s.roomNumber === num);
        const status = curBooking ? 'Booked' : (manStatus?.status || 'Available');
        generated.push({ number: num, type: roomType.type, price: roomType.price, status });
      }
    });
    return generated;
  }, [activeHotel, activeBookings, physicalStatuses]);

  const statsCards = useMemo(() => {
    const today = new Date().toDateString();
    return [
      { label: 'Total Guests Today', value: unifiedBookings.filter((b: any) => new Date(b.checkin).toDateString() === today).length, icon: Users, color: 'text-[var(--lux-gold)]' },
      { label: 'Checked-in Guests', value: unifiedBookings.filter((b: any) => b.status === 'confirmed').length, icon: CheckCircle, color: 'text-green-500' },
      { label: 'Checked-out Guests', value: unifiedBookings.filter((b: any) => b.status === 'completed').length, icon: LogOut, color: 'text-orange-500' },
      { label: 'Pending Payments', value: unifiedBookings.filter((b: any) => (b.balanceAmount || 0) > 0).length, icon: DollarSign, color: 'text-red-500' }
    ];
  }, [unifiedBookings]);

  const filteredBookings = useMemo(() => {
    return unifiedBookings.filter((b: any) => {
      const q = searchTerm.toLowerCase();
      return (
        b.guestDetails?.name?.toLowerCase().includes(q) ||
        b.guestDetails?.phone?.includes(q) ||
        b.roomNumber?.toString().includes(q)
      );
    });
  }, [unifiedBookings, searchTerm]);

  // Auto-suggest logic
  useEffect(() => {
    if (formData.phone.length === 10) {
      const pastBooking = unifiedBookings.find((b: any) => b.guestDetails?.phone === formData.phone);
      if (pastBooking) {
        setFormData(prev => ({ 
          ...prev, 
          name: pastBooking.guestDetails?.name || prev.name,
          email: pastBooking.guestDetails?.email || prev.email,
          bookingSource: pastBooking.bookingSource || 'walk_in',
          bookingPlatform: pastBooking.bookingPlatform || '',
          otaPaymentType: pastBooking.otaPaymentType || 'pay_at_hotel'
        }));
        if (pastBooking.bookingPlatform) {
          toast.info(`Returning Guest: ${pastBooking.guestDetails?.name}. Last Source: ${pastBooking.bookingPlatform}`);
        } else {
          toast.info(`Returning Guest: ${pastBooking.guestDetails?.name}`);
        }
      }
    }
  }, [formData.phone, unifiedBookings]);

  // Handle OTA Payment Logic
  useEffect(() => {
    if (formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online') {
      setFormData(prev => ({
        ...prev,
        offlinePaid: 0,
        onlinePaid: 0,
        paidAmount: prev.totalAmount,
        paymentStatus: 'Paid'
      }));
    }
  }, [formData.bookingSource, formData.otaPaymentType, formData.totalAmount]);


  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        guestDetails: { ...formData },
        stayDetails: {
          hotel_id: activeHotelId,
          room_id: activeHotel.rooms.find((r: any) => r.type === formData.roomType)?.id,
          roomNumber: formData.roomNumber,
          checkin: formData.checkin,
          checkout: formData.checkout,
          guests: Number(formData.guests) || 1
        },
        paymentDetails: {
          totalAmount: Number(formData.totalAmount) || 0,
          paidAmount: formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online' ? Number(formData.totalAmount) : (Number(formData.offlinePaid) || 0) + (Number(formData.onlinePaid) || 0),
          offlinePaid: Number(formData.offlinePaid) || 0,
          onlinePaid: Number(formData.onlinePaid) || 0,
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online' ? 'paid' : formData.paymentStatus,
          bookingSource: formData.bookingSource,
          bookingPlatform: formData.bookingPlatform,
          otaPaymentType: formData.otaPaymentType
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/content/bookings/walk-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Walk-in booking created!");
        setActiveView('dashboard');
        queryClient.invalidateQueries({ queryKey: ['unified-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      } else throw new Error(data.message || "Booking failed");
    } catch (err: any) { toast.error(err.message); } finally { setIsSubmitting(false); }
  };

  if (loadingHotels) return <div className="h-screen flex items-center justify-center font-display text-[var(--lux-gold)] animate-pulse">Bhagat Enterprise Console...</div>;

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-[var(--lux-border)]">
        <div>
           <h1 className="text-3xl font-display font-bold text-[var(--lux-text)]">Hotel <span className="text-[var(--lux-gold)]">Check-in</span></h1>
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)]">Reception Management Hub</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-[var(--lux-card)] rounded-xl border border-[var(--lux-border)]">
          {[{ id: 'dashboard', label: 'Ledger', icon: LayoutGrid }, { id: 'form', label: 'Check-in', icon: UserPlus }].map((v) => (
            <button key={v.id} onClick={() => setActiveView(v.id as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v.id ? 'bg-[var(--lux-gold)] text-black shadow-lg shadow-[var(--lux-gold)]/20' : 'text-[var(--lux-muted)] hover:bg-[var(--lux-bg)]'}`}>
              <span className="flex items-center gap-2"><v.icon size={12} /> {v.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statsCards.map((s, i) => (
                  <div key={i} className="bg-[var(--lux-card)] p-6 rounded-[2rem] border border-[var(--lux-border)] flex flex-col items-center text-center space-y-2">
                     <s.icon size={20} className={s.color} />
                     <h3 className="text-3xl font-display font-bold">{s.value}</h3>
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{s.label}</p>
                  </div>
                ))}
             </div>

             <div className="normal-card !p-0 overflow-hidden">
                <div className="p-6 border-b border-[var(--lux-border)] flex justify-between items-center bg-black/5">
                   <h3 className="font-bold text-sm uppercase tracking-wider">In-House Ledger</h3>
                   <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 pl-9 pr-3 bg-black/20 border border-white/5 rounded-md text-[10px] font-bold outline-none focus:border-[var(--lux-gold)]" 
                      />
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-black/20 border-b border-white/5 font-black uppercase text-[10px] text-[var(--lux-muted)]">
                         <tr>
                            <th className="p-4">Guest</th>
                            <th className="p-4">Room</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Balance</th>
                            <th className="p-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {filteredBookings.map((b: any) => (
                            <tr key={b._id} className="text-[11px] hover:bg-black/5">
                               <td className="p-4"><p className="font-bold">{b.guestDetails?.name}</p><p className="text-[9px] opacity-40">{b.guestDetails?.phone}</p></td>
                               <td className="p-4 font-bold text-[var(--lux-gold)]">{b.roomNumber}</td>
                               <td className="p-4 text-[9px] font-bold">IN: {new Date(b.checkin).toLocaleDateString()}<br/>OUT: {new Date(b.checkout).toLocaleDateString()}</td>
                               <td className="p-4 font-bold text-red-500">₹{b.balanceAmount}</td>
                               <td className="p-4 text-right"><button onClick={() => { setSelectedBooking(b); setShowDrawer(true); }} className="p-2 bg-white/5 rounded-lg hover:text-[var(--lux-gold)] transition-all cursor-pointer"><Eye size={16} /></button></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="max-w-2xl mx-auto space-y-6">
             <div className="normal-card space-y-8 p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4">
                      <User size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Guest Info</h4>
                   </div>
                   <NormalInput label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required placeholder="John Doe" />
                   <NormalInput label="Phone Number" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} required placeholder="+91..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4 pt-4">
                      <Bed size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Stay Info</h4>
                   </div>
                   <NormalSelect label="Room Type" value={formData.roomType} onChange={(v: string) => setFormData({...formData, roomType: v, roomNumber: ''})} options={activeHotel?.rooms.map((r: any) => ({ value: r.type, label: r.type }))} />
                   <NormalSelect label="Room No" value={formData.roomNumber} onChange={(v: string) => setFormData({...formData, roomNumber: v})} options={rooms.filter(r => r.type === formData.roomType && r.status === 'Available').map(r => ({ value: r.number, label: `Room ${r.number}` }))} />
                   <PremiumDatePicker label="Check-in Date" value={formData.checkin} onChange={(v: string) => setFormData({...formData, checkin: v})} />
                   <PremiumDatePicker label="Check-out Date" value={formData.checkout} onChange={(v: string) => setFormData({...formData, checkout: v})} />
                </div>

                {/* NEW: Booking Source Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4">
                      <LayoutGrid size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Booking Source</h4>
                   </div>
                   <div className="md:col-span-2 flex p-1 bg-black/5 dark:bg-black/20 rounded-xl border border-[var(--lux-border)]">
                      {[{ id: 'walk_in', label: 'Walk-in' }, { id: 'ota', label: 'Online Platform' }].map(s => (
                        <button key={s.id} type="button" onClick={() => setFormData({...formData, bookingSource: s.id as any})} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.bookingSource === s.id ? 'bg-[var(--lux-gold)] text-black shadow-lg' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}>
                          {s.label}
                        </button>
                      ))}
                   </div>
                   
                   {formData.bookingSource === 'ota' && (
                     <>
                        <NormalSelect 
                          label="Select Platform" 
                          value={formData.bookingPlatform} 
                          onChange={(v: string) => setFormData({...formData, bookingPlatform: v})} 
                          options={[
                            { value: 'OYO', label: 'OYO' },
                            { value: 'GoMMT', label: 'GoMMT' },
                            { value: 'Booking.com', label: 'Booking.com' },
                            { value: 'Agoda', label: 'Agoda' },
                            { value: 'Trivago', label: 'Trivago' },
                            { value: 'HotelMate', label: 'HotelMate' }
                          ]} 
                        />
                        <div className="premium-input-container">
                           <label className="normal-label">Payment Status Type</label>
                           <div className="flex gap-2">
                              {[{ id: 'paid_online', label: 'Fully Paid Online' }, { id: 'pay_at_hotel', label: 'Pay at Hotel' }].map(p => (
                                <button key={p.id} type="button" onClick={() => setFormData({...formData, otaPaymentType: p.id as any})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.otaPaymentType === p.id ? 'bg-[var(--lux-gold)]/10 border-[var(--lux-gold)] text-[var(--lux-gold)] shadow-sm' : 'border-[var(--lux-border)] text-[var(--lux-muted)] hover:text-[var(--lux-text)] hover:border-[var(--lux-muted)]'}`}>
                                  {p.label}
                                </button>
                              ))}
                           </div>
                        </div>
                     </>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4 pt-4">
                      <CreditCard size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Payment Settlement</h4>
                   </div>
                   <NormalInput label="Total Amount" type="number" value={formData.totalAmount} onChange={(v: string) => setFormData({...formData, totalAmount: parseInt(v)})} />
                   
                   {!(formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online') ? (
                     <>
                        <NormalInput label="Offline Paid (₹)" type="number" value={formData.offlinePaid} onChange={(v: string) => setFormData({...formData, offlinePaid: parseInt(v)})} />
                        <NormalInput label="Online Paid (₹)" type="number" value={formData.onlinePaid} onChange={(v: string) => setFormData({...formData, onlinePaid: parseInt(v)})} />
                        <NormalSelect label="Method" value={formData.paymentMethod} onChange={(v: string) => setFormData({...formData, paymentMethod: v})} options={['Cash', 'UPI', 'Card']} />
                     </>
                   ) : (
                     <div className="md:col-span-2 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center justify-center space-y-2">
                        <CheckCircle className="text-green-500" size={24} />
                        <p className="text-[11px] font-black uppercase tracking-widest text-green-500">Fully Paid Settlement via {formData.bookingPlatform}</p>
                        <p className="text-[9px] font-bold opacity-60">Balance: ₹0 (No manual collection required)</p>
                     </div>
                   )}
                </div>


                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-3 border-b pb-4">
                      <FileText size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Documents</h4>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <NormalUploader label="Guest Photo" value={formData.photo} onChange={(p: string) => setFormData({...formData, photo: p})} />
                      <NormalUploader label="Aadhar Front" value={formData.aadharFront} onChange={(p: string) => setFormData({...formData, aadharFront: p})} />
                      <NormalUploader label="Aadhar Back" value={formData.aadharBack} onChange={(p: string) => setFormData({...formData, aadharBack: p})} />
                      <NormalUploader label="Policy" value={formData.otherDoc} onChange={(p: string) => setFormData({...formData, otherDoc: p})} />
                   </div>
                </div>

                <div className="pt-10">
                   <button onClick={handleWalkInSubmit} disabled={isSubmitting || !formData.name || !formData.phone} className="w-full h-14 bg-[var(--lux-gold)] text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] shadow-xl transition-all disabled:opacity-50">
                      {isSubmitting ? 'Confirming...' : 'Complete Check-in'}
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingDetailsDrawer booking={selectedBooking} isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </div>
  );
};
