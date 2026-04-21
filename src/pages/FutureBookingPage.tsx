import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Filter, 
  User, 
  Bed, 
  CreditCard, 
  CheckCircle,
  FileText,
  Eye,
  Receipt,
  Sparkles,
  Plus,
  LayoutGrid,
  Shield, 
  ArrowRightCircle, 
  ArrowRight, 
  Clock,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/constants';
import { 
  useHotelsList, 
  useRoomStatus, 
  useRoomAvailabilityMap,
  useActiveBookings 
} from '../hooks/useHotelData';
import { 
  NormalInput, 
  NormalSelect 
} from '../components/ui/LayoutGrid';
import { PremiumDatePicker } from '../components/ui/DatePicker';
import { getBookingFinancials } from '../utils/financials';

export const FutureBookingPage = ({ activeHotelId, onSlipClick }: any) => {
  const queryClient = useQueryClient();
  const { data: allHotels = [], isLoading: loadingHotels } = useHotelsList();
  
  // 1. Core State
  const getLocalDateStr = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA');
  };

  // 1. Core State
  const [targetDate, setTargetDate] = useState(getLocalDateStr(2)); // Default +2 days
  const [checkoutDate, setCheckoutDate] = useState(getLocalDateStr(3)); // Default +3 days

  const handleTargetDateChange = (val: string) => {
    const start = new Date(val);
    const prevIn = new Date(targetDate);
    const prevOut = new Date(checkoutDate);
    const nights = Math.max(1, Math.ceil((prevOut.getTime() - prevIn.getTime()) / (24 * 60 * 60 * 1000)));

    setTargetDate(val);
    const nextEnd = new Date(start);
    nextEnd.setDate(nextEnd.getDate() + nights);
    setCheckoutDate(nextEnd.toLocaleDateString('en-CA'));
  };

  const handleCheckoutDateChange = (val: string) => {
    const start = new Date(targetDate);
    const end = new Date(val);
    if (end < start) {
      // Still prevent selecting a date BEFORE check-in
      setCheckoutDate(targetDate);
    } else {
      setCheckoutDate(val);
    }
  };

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2. Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '',
    offlinePaid: 0, onlinePaid: 0, 
    paymentMethod: 'UPI',
    bookingSource: 'walk_in', bookingPlatform: '', otaPaymentType: 'pay_at_hotel',
    guests: 1
  });

  // 3. Data Fetching
  const { data: availabilityMap = { occupied: [], blocked: [] } } = useRoomAvailabilityMap(activeHotelId, targetDate, checkoutDate);
  const { data: activeBookings = [] } = useActiveBookings(activeHotelId);
  const activeHotel = useMemo(() => allHotels.find((h: any) => h.id === activeHotelId), [allHotels, activeHotelId]);

  // Derived Grid
  const rooms = useMemo(() => {
    if (!activeHotel) return [];
    
    const bMap = new Map();
    activeBookings.forEach((b: any) => { 
      // Filter for bookings that overlap with our target range
      const bIn = new Date(b.checkin).getTime();
      const bOut = new Date(b.checkout).getTime();
      const tIn = new Date(targetDate).getTime();
      let tOut = new Date(checkoutDate).getTime();
      
      // If same-day query, look for overlaps within that single day
      if (tIn === tOut) {
          tOut += 24 * 60 * 60 * 1000;
      }
      
      const isOverlap = bIn < tOut && bOut > tIn;
      const isSameDayMatch = bIn === tIn && bOut === bIn; // Catch the specific 0-night booking

      if (b.roomNumber && (isOverlap || isSameDayMatch)) {
        bMap.set(b.roomNumber.toString(), b); 
      }
    });

    const occSet = new Set((availabilityMap.occupied || []).map((n: any) => n.toString()));
    const blkSet = new Set((availabilityMap.blocked || []).map((n: any) => n.toString()));

    const generated: any[] = [];
    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      const count = roomType.total_rooms || 10;
      const startNum = (idx + 1) * 100 + 1;
      const numbers = roomType.numbers && roomType.numbers.length > 0 ? roomType.numbers : Array.from({ length: count }, (_, i) => (startNum + i).toString());

      numbers.forEach((num: string) => {
        const isReserved = occSet.has(num.toString());
        const isBlk = blkSet.has(num.toString());
        
        generated.push({ 
          number: num, 
          type: roomType.type, 
          price: roomType.price, 
          roomId: roomType.id, 
          status: isReserved ? 'Reserved' : (isBlk ? 'Maintenance' : 'Available'),
          booking: bMap.get(num.toString())
        });
      });
    });
    return generated;
  }, [activeHotel, availabilityMap, activeBookings, targetDate, checkoutDate]);

  const filteredRoomsBySearch = useMemo(() => {
    return rooms.filter(r => r.number.toString().includes(searchQuery) || r.type.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rooms, searchQuery]);

  const groupedRooms = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredRoomsBySearch.forEach(r => {
      const type = r.type || 'Standard';
      if (!groups[type]) groups[type] = [];
      groups[type].push(r);
    });
    return groups;
  }, [filteredRoomsBySearch]);

  // Financials
  const financials = useMemo(() => {
    // Priority: Actual booking data > UI room price
    const unitPrice = selectedRoom?.price || 0;
    const total = selectedRoom?.booking?.totalAmount ?? unitPrice;
    
    const isOtaPaid = formData.bookingSource?.toLowerCase() === 'ota' && formData.otaPaymentType === 'paid_online';
    
    // For existing reservations, use the actual paid amount from the record
    let paid = 0;
    if (selectedRoom?.status === 'Reserved' && selectedRoom?.booking) {
      paid = Number(selectedRoom.booking.paidAmount) || 0;
    } else {
      paid = isOtaPaid ? total : (Number(formData.offlinePaid || 0) + Number(formData.onlinePaid || 0));
    }

    return { total, paid, balance: Math.max(0, total - paid) };
  }, [selectedRoom, formData.offlinePaid, formData.onlinePaid, formData.bookingSource, formData.otaPaymentType]);

  // Auto-fill Logic
  useEffect(() => {
    if (formData.phone.length === 10) {
       fetch(`${API_BASE_URL}/api/content/guests/search?query=${formData.phone}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const guest = data[0];
            setFormData(prev => ({ 
              ...prev, 
              name: guest.name, 
              email: guest.email || '',
              address: guest.address || '',
              bookingSource: guest.bookingSource || 'walk_in',
              bookingPlatform: guest.bookingPlatform || '',
              otaPaymentType: guest.otaPaymentType || 'pay_at_hotel'
            }));
            toast.info(`Returning Guest: ${guest.name}`);
          }
        });
    }
  }, [formData.phone]);

  // Handle OTA Payment Logic for Future Bookings
  useEffect(() => {
    if (formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online') {
      setFormData(prev => ({
        ...prev,
        offlinePaid: 0,
        onlinePaid: 0
      }));
    }
  }, [formData.bookingSource, formData.otaPaymentType]);


  const handleBookingSubmit = async () => {
    if (!selectedRoom || !formData.name || !formData.phone) return toast.error("Complete Mandatory Fields");
    if (selectedRoom.status !== 'Available') return toast.error("Unit not available for manifest");

    setIsSubmitting(true);
    const tid = toast.loading("Processing Future Reservation...");
    try {
      const payload = {
        guestDetails: { name: formData.name, phone: formData.phone, email: formData.email, address: formData.address },
        stayDetails: {
          hotel_id: activeHotelId,
          room_id: selectedRoom.roomId,
          roomNumber: selectedRoom.number,
          checkin: targetDate,
          checkout: checkoutDate,
          guests: formData.guests
        },
        paymentDetails: {
          totalAmount: financials.total,
          paidAmount: formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online' ? Number(financials.total) : financials.paid,
          offlinePaid: Number(formData.offlinePaid),
          onlinePaid: Number(formData.onlinePaid),
          paymentMethod: formData.paymentMethod,
          bookingSource: formData.bookingSource,
          bookingPlatform: formData.bookingPlatform,
          otaPaymentType: formData.otaPaymentType
        },
        status: 'reserved'
      };

      const res = await fetch(`${API_BASE_URL}/api/content/bookings/walk-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ ...payload, status: 'reserved' })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("FUTURE RESERVATION CONFIRMED", { id: tid });
        onSlipClick(data.booking);
        queryClient.invalidateQueries({ queryKey: ['availability'] });
        setFormData({ name: '', phone: '', email: '', address: '', offlinePaid: 0, onlinePaid: 0, paymentMethod: 'UPI', bookingSource: 'walk_in', bookingPlatform: '', otaPaymentType: 'pay_at_hotel', guests: 1 });
        setSelectedRoom(null);
      } else throw new Error("Manifest creation failed");
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-32 lg:pb-20">
      {/* 1. Left - Grid Side */}
      <div className="flex-1 space-y-8 lg:space-y-12">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 lg:gap-8">
           <div className="flex flex-col gap-1 lg:gap-2">
              <h2 className="text-2xl lg:text-4xl font-display font-black flex items-center gap-3 lg:gap-4">
                 <Sparkles className="text-[var(--lux-gold)]" size={24} /> Future <span className="text-[var(--lux-gold)]">Manifest</span>
              </h2>
              <div className="flex items-center gap-2">
                 <div className="h-1 w-8 bg-[var(--lux-gold)] rounded-full" />
                 <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--lux-muted)]">Reservation Architecture</p>
              </div>
           </div>

           <div className="flex w-full xl:w-auto bg-[var(--lux-card)] p-2 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-start gap-4 sm:gap-4 px-3 sm:px-4 w-full">
                <div className="flex flex-col w-full sm:w-auto">
                  <span className="text-[8px] font-black uppercase opacity-30 mb-1">Check-In</span>
                  <PremiumDatePicker value={targetDate} onChange={handleTargetDateChange} />
                </div>
                <ArrowRight size={14} className="hidden sm:block opacity-20 mt-4 shrink-0" />
                <div className="flex flex-col w-full sm:w-auto">
                  <span className="text-[8px] font-black uppercase opacity-30 mb-1">Check-Out</span>
                  <PremiumDatePicker value={checkoutDate} onChange={handleCheckoutDateChange} />
                </div>
              </div>
           </div>
        </div>

        <div className="relative group w-full">
           <Search size={16} className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-colors" />
           <input 
             type="text" placeholder="Search by type or room number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full h-12 sm:h-14 bg-[var(--lux-card)] border border-white/5 rounded-2xl pl-12 sm:pl-16 pr-4 sm:pr-6 text-[13px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-inner placeholder:text-white/10" 
           />
        </div>

        <div className="space-y-10 lg:space-y-16">
           {Object.entries(groupedRooms).map(([type, rms], typeIdx) => (
             <motion.div 
               key={type} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: typeIdx * 0.1 }}
               className="space-y-6 lg:space-y-10"
             >
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="py-1.5 px-4 lg:py-2 lg:px-5 bg-[var(--lux-gold)]/5 rounded-xl border border-[var(--lux-gold)]/10">
                    <h3 className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.4em] text-[var(--lux-gold)] whitespace-nowrap">{type}</h3>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[var(--lux-gold)]/20 to-transparent"></div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-8">
                  {rms.map((room, i) => {
                    const isActive = selectedRoom?.number === room.number;
                    const statusColors: any = {
                      'Available': 'room-card-available',
                      'Reserved': 'room-card-booked',
                      'Maintenance': 'opacity-40 grayscale shadow-none pointer-events-none'
                    };

                    return (
                      <motion.div
                        key={room.number}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (typeIdx * 0.1) + (i * 0.05) }}
                        whileHover={room.status === 'Available' || room.status === 'Reserved' ? { y: -5, scale: 1.02 } : {}}
                        whileTap={room.status === 'Available' || room.status === 'Reserved' ? { scale: 0.95 } : {}}
                        onClick={() => {
                           setSelectedRoom(room);
                           if (room.status === 'Reserved' && room.booking) {
                              const b = room.booking;
                              const p = b.paymentDetails || {};
                              setFormData({
                                 name: b.guestDetails?.name || '',
                                 phone: b.guestDetails?.phone || '',
                                 email: b.guestDetails?.email || '',
                                 // Smart mapping: if breakdown is missing, use total paidAmount as offline fallback for display
                                 offlinePaid: p.offlinePaid ?? (p.onlinePaid ? 0 : (b.paidAmount || 0)),
                                 onlinePaid: p.onlinePaid || 0,
                                 paymentMethod: p.paymentMethod || 'UPI',
                                 bookingSource: p.bookingSource || 'walk_in',
                                 bookingPlatform: p.bookingPlatform || '',
                                 otaPaymentType: p.otaPaymentType || 'pay_at_hotel',
                                 guests: b.stayDetails?.guests || 1,
                                 address: b.guestDetails?.address || ''
                              });
                           } else {
                              setFormData({
                                 name: '', phone: '', email: '',
                                 offlinePaid: 0, onlinePaid: 0, 
                                 paymentMethod: 'UPI',
                                 bookingSource: 'walk_in', bookingPlatform: '', otaPaymentType: 'pay_at_hotel',
                                 guests: 1,
                                 address: ''
                              });
                           }
                        }}
                        className={`room-box-saas p-0 border-[1.5px] min-w-0 w-full ${isActive ? 'ring-2 ring-[var(--lux-gold)] ring-offset-2 lg:ring-offset-4 ring-offset-black shadow-2xl !bg-[#D4AF37] !text-black !border-transparent' : statusColors[room.status]}`}
                      >
                         <div className="h-full flex flex-col justify-between p-3 sm:p-5 lg:p-6 relative overflow-hidden">
                            {/* Status Dot */}
                            <div className={`absolute top-4 right-4 ${room.status === 'Reserved' ? 'pulse-green' : ''}`}>
                               <div className={`${room.status === 'Available' ? 'dot-available' : 'dot-booked'}`} />
                            </div>

                            {/* Header row */}
                             <div className="flex flex-col">
                                <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1 ${isActive ? 'text-black' : 'text-zinc-800'}`}>UNIT REGISTRY</span>
                                <span className={`text-[11px] sm:text-[13px] font-bold leading-none ${isActive ? 'text-black' : 'text-zinc-800'}`}>#{room.number}</span>
                             </div>

                             {/* Body row: Large Number & Price */}
                             <div className="flex flex-col items-center justify-center -translate-y-1 sm:-translate-y-2">
                                <h4 className={`text-[32px] sm:text-[40px] lg:text-[48px] font-display font-black leading-none tracking-tighter ${isActive ? 'text-black' : 'text-zinc-800'}`}>{room.number}</h4>
                                <p className={`text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] opacity-40 mt-1 ${isActive ? 'text-black/60' : ''}`}>₹{room.price}</p>
                             </div>

                             {/* Footer row: Manifest Info */}
                             <div className={`pt-4 border-t flex flex-col gap-0.5 ${isActive ? 'border-black/10' : 'border-black/5'}`}>
                                {room.booking ? (
                                  <div className="flex justify-between items-center gap-2 overflow-hidden">
                                     <div className="flex flex-col min-w-0">
                                        <span className={`text-[12px] font-bold truncate ${isActive ? 'text-black' : 'text-zinc-800'}`} title={room.booking.guestDetails?.name}>
                                           {room.booking.guestDetails?.name || 'Future Guest'}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${isActive ? 'text-black/40' : 'text-zinc-800'}`}>
                                           SECURED
                                        </span>
                                     </div>
                                     <div className="text-right flex flex-col items-end">
                                        <span className={`text-[10px] font-black ${isActive ? 'text-black/60' : 'text-[var(--lux-gold)]'}`}>
                                           {new Date(room.booking.checkin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className={`w-1.5 h-1.5 rounded-full bg-[var(--lux-gold)] shadow-[0_0_8px_var(--lux-gold)] mt-1`} />
                                     </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center text-center">
                                     <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-black' : ''}`}>
                                       {room.status === 'Maintenance' ? 'BLOCKED' : 'OPEN'}
                                     </span>
                                     <div className={`w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-zinc-300' : 'bg-black/20'}`} />
                                  </div>
                                )}
                             </div>
                         </div>
                      </motion.div>
                    );
                  })}
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* 2. Right - Booking Drawer */}
      {/* Mobile: fixed overlay bottom sheet. Desktop: sticky side column */}
      <div className={`
        fixed inset-x-0 bottom-0 z-[60] lg:relative lg:inset-auto lg:z-auto
        lg:w-[450px] transition-transform duration-500
        ${selectedRoom ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
      `}>
        <div className="lg:sticky lg:top-28 space-y-8">
           <AnimatePresence mode="wait">
             {selectedRoom ? (
               <motion.div 
                 key="form"
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: 40 }}
                 className="lux-glass-premium rounded-t-[3rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 max-h-[85vh] lg:max-h-none overflow-y-auto"
               >
                  <div className="p-6 lg:p-10 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                     <div>
                        <div className="flex items-center gap-3 mb-1 lg:mb-2">
                           <div className="w-2 h-2 rounded-full bg-[var(--lux-gold)] animate-pulse shadow-[0_0_10px_var(--lux-gold)]" />
                           <h3 className="font-display font-black text-lg lg:text-2xl uppercase tracking-tighter">Manifest <span className="text-[var(--lux-gold)]">{selectedRoom.status === 'Reserved' ? 'Registry' : 'Authorization'}</span></h3>
                        </div>
                        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{selectedRoom.status === 'Reserved' ? 'Secured Registry' : 'Allocating Unit'} #{selectedRoom?.number}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        {selectedRoom.status === 'Reserved' && (
                           <button 
                             onClick={() => onSlipClick(selectedRoom.booking)}
                             className="w-12 h-12 rounded-2xl bg-[var(--lux-gold)]/10 text-[var(--lux-gold)] flex items-center justify-center hover:bg-[var(--lux-gold)] hover:text-black transition-all border border-[var(--lux-gold)]/20 shadow-xl"
                             title="Print Booking Slip"
                           >
                              <Printer size={18} />
                           </button>
                        )}
                        <button onClick={() => setSelectedRoom(null)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all">
                          <Plus size={20} className="rotate-45" />
                        </button>
                     </div>
                  </div>

                  <div className={`p-6 lg:p-10 space-y-8 lg:space-y-12 ${selectedRoom.status === 'Reserved' ? 'pointer-events-none opacity-80' : ''}`}>
                     <div className="space-y-8">
                        <div className="flex items-center gap-3 text-[var(--lux-gold)]">
                           <User size={16} />
                           <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Client Identity</h4>
                        </div>
                        <div className="space-y-5">
                           <NormalInput label="Contact Mobile" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} placeholder="+91 XXX XXX XXXX" />
                           <NormalInput label="Full Identity Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="As per Valid ID" />
                           <NormalInput label="Full Address" value={formData.address} onChange={(v: string) => setFormData({...formData, address: v})} placeholder="Street, City, State..." />
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="flex items-center gap-3 text-[var(--lux-gold)]">
                           <LayoutGrid size={16} />
                           <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Manifest Source</h4>
                        </div>
                        <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-xl border border-[var(--lux-border)]">
                           {[{ id: 'walk_in', label: 'Walk-in' }, { id: 'ota', label: 'OTA' }].map(s => (
                             <button key={s.id} type="button" onClick={() => setFormData({...formData, bookingSource: s.id as any})} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.bookingSource === s.id ? 'bg-[var(--lux-gold)] text-black' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}>
                               {s.label}
                             </button>
                           ))}
                        </div>
                        
                        {formData.bookingSource === 'ota' && (
                          <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                             <NormalSelect 
                               label="OTA Partner" 
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
                             <div className="flex gap-2">
                                {[{ id: 'paid_online', label: 'Pre-Paid Online' }, { id: 'pay_at_hotel', label: 'Pay at Hotel' }].map(p => (
                                  <button key={p.id} type="button" onClick={() => setFormData({...formData, otaPaymentType: p.id as any})} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.otaPaymentType === p.id ? 'bg-[var(--lux-gold)]/10 border-[var(--lux-gold)] text-[var(--lux-gold)] shadow-sm' : 'border-[var(--lux-border)] text-[var(--lux-muted)] hover:border-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}>
                                    {p.label}
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}
                     </div>

                     <div className="space-y-8">
                        <div className="flex items-center gap-3 text-[var(--lux-gold)]">
                           <CreditCard size={16} />
                           <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Advanced Payload</h4>
                        </div>
                        {!(formData.bookingSource === 'ota' && formData.otaPaymentType === 'paid_online') ? (
                          <div className="grid grid-cols-2 gap-6">
                             <NormalInput label="Offline Deposit" type="number" value={formData.offlinePaid || ""} onChange={(v: string) => setFormData({...formData, offlinePaid: parseInt(v) || 0})} />
                             <NormalInput label="Digital Deposit" type="number" value={formData.onlinePaid || ""} onChange={(v: string) => setFormData({...formData, onlinePaid: parseInt(v) || 0})} />
                          </div>
                        ) : (
                          <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
                             <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Full Value Secured via {formData.bookingPlatform}</p>
                          </div>
                        )}
                     </div>


                     <div className="p-10 bg-black/40 rounded-[2.5rem] border border-white/5 space-y-8">
                        <div className="flex justify-between items-end pb-6 border-b border-white/5">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-gold)] mb-2">{selectedRoom.status === 'Reserved' ? 'Amount Secured' : 'Authorized Advance'}</p>
                              <p className="text-4xl font-display font-black">₹{financials.paid}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Unit Value</p>
                              <p className="text-lg font-bold opacity-80">₹{financials.total}</p>
                           </div>
                        </div>

                        <div className="flex justify-between items-center">
                           <span className="text-[11px] font-black uppercase tracking-[0.2em] italic opacity-30">Outstanding Balance</span>
                           <span className={`text-xl font-black ${financials.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {financials.balance > 0 ? `₹${financials.balance}` : 'SECURED'}
                           </span>
                        </div>
                     </div>

                     <button 
                       onClick={handleBookingSubmit} 
                       disabled={isSubmitting || !formData.name || !formData.phone || selectedRoom.status === 'Reserved'}
                       className="w-full h-20 bg-[var(--lux-gold)] text-black rounded-3xl text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(212,175,55,0.25)] hover:shadow-[0_25px_70px_rgba(212,175,55,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-20 disabled:grayscale"
                     >
                        {selectedRoom.status === 'Reserved' ? 'Reservation Secured' : (isSubmitting ? 'Architecting...' : 'Authorize Reservation')}
                     </button>
                  </div>
               </motion.div>
             ) : (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="lux-glass-premium rounded-[3rem] p-20 text-center space-y-10 min-h-[600px] flex flex-col items-center justify-center border border-white/5"
               >
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 bg-[var(--lux-gold)]/5 rounded-[2.5rem] border border-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)]/30 shadow-inner"
                  >
                     <ArrowRightCircle size={56} />
                  </motion.div>
                  <div className="space-y-4">
                     <h4 className="text-2xl font-display font-black uppercase tracking-widest text-white">Unit Required</h4>
                     <p className="text-[11px] text-[var(--lux-muted)] font-black uppercase tracking-[0.4em] leading-relaxed max-w-[240px] mx-auto">Allocations require unit selection from the manifest registry grid.</p>
                  </div>
                  <div className="pt-6 flex gap-3">
                     {[0.2, 0.4, 0.2].map((op, i) => (
                       <div key={i} className="w-2 h-2 rounded-full bg-[var(--lux-gold)]" style={{ opacity: op }}></div>
                     ))}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
      {/* Mobile backdrop when drawer is open */}
      {selectedRoom && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          onClick={() => setSelectedRoom(null)}
        />
      )}
   </div>
  );
};
