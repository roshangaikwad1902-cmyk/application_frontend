// Dashboard Perspective Hub V2.1 - Refined Interactions
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  User,
  LogOut, 
  Brush, 
  Trash2,
  Key, 
  LayoutGrid, 
  Calendar, 
  ArrowRight, X,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Eye,
  Receipt,
  Grid,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/constants';
import { getBookingFinancials } from '../utils/financials';
import { 
  useHotelsList, 
  useRoomStatus, 
  useActiveBookings, 
  useRoomAvailabilityMap 
} from '../hooks/useHotelData';

export const ReceptionSchedule = ({ bookings, activeHotel, onRefresh }: { bookings: any[], activeHotel: any, onRefresh: () => void }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  
  const dashboardBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return bookings.filter(b => {
      const bDate = new Date(b.checkin);
      bDate.setHours(0,0,0,0);
      return activeTab === 'today' ? bDate.getTime() === today.getTime() : bDate.getTime() === tomorrow.getTime();
    });
  }, [bookings, activeTab]);

  return (
    <div className="bg-[var(--lux-card)] p-6 rounded-[2.5rem] border border-[var(--lux-border)] space-y-10 shadow-2xl relative overflow-hidden group">
       <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--lux-gold)]/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
       
       <div className="flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex gap-2 p-1.5 bg-[var(--lux-glass)] rounded-2xl border border-[var(--lux-border)] shadow-inner">
          <button 
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'today' ? 'bg-[var(--lux-gold)] text-black shadow-2xl scale-105' : 'text-[var(--lux-muted)] hover:text-white hover:bg-white/5'}`}
          >
            Today Arrivals
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('tomorrow')}
            className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'tomorrow' ? 'bg-[var(--lux-gold)] text-black shadow-2xl scale-105' : 'text-[var(--lux-muted)] hover:text-white hover:bg-white/5'}`}
          >
            Tomorrow
          </button>
        </div>
        <div className="text-center sm:text-right">
           <p className="text-[9px] font-black uppercase text-[var(--lux-gold)] tracking-[0.3em] mb-1">Live Manifest</p>
           <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest">
              {dashboardBookings.length} ENTERPRISE ARRIVALS EXPECTED
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardBookings.map((b: any) => (
          <div key={b._id} className="p-6 bg-[var(--lux-bg)] rounded-3xl border border-[var(--lux-border)] group hover:border-[var(--lux-gold)]/30 transition-all flex flex-col justify-between h-48 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--lux-gold)]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <p className="text-lg font-bold truncate max-w-[160px] leading-tight tracking-tight">{b.guestDetails?.name}</p>
                <p className="text-[9px] text-[var(--lux-muted)] uppercase font-black tracking-[0.2em]">{b.guestDetails?.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black text-[var(--lux-gold)] bg-[var(--lux-gold)]/10 px-3 py-1.5 rounded-xl border border-[var(--lux-gold)]/20 uppercase tracking-widest shadow-lg">
                  {b.roomNumber ? `RM ${b.roomNumber}` : 'UNASSIGNED'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
               <div>
                  <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">Contract Value</p>
                  <p className="text-2xl font-display font-bold text-[var(--lux-gold)] shadow-sm">₹{b.totalAmount}</p>
               </div>
               <button type="button" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[var(--lux-gold)] hover:text-black transition-all shadow-xl border border-white/5">
                  <ArrowRight size={20} />
               </button>
            </div>
          </div>
        ))}

        {dashboardBookings.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-6 bg-white/[0.02] border border-dashed border-[var(--lux-border)] rounded-[3rem]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                <Calendar size={28} className="text-[var(--lux-muted)] opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)]">No Arrivals Manifested</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const GlobalDashboard = ({ activeHotelId, onHotelChange, onWalkInClick }: { activeHotelId: string, onHotelChange: (id: string) => void, onWalkInClick: () => void }) => {
  const queryClient = useQueryClient();
  const { data: allHotels = [], isLoading: loadingHotels } = useHotelsList();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Booked' | 'Cleaning' | 'Dirty'>('All');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  
  // Quick State for Walk-in side panel
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [offlineAmount, setOfflineAmount] = useState<string>('');
  const [onlineAmount, setOnlineAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Quick Settlement States for Sidebar
  const [cashPayment, setCashPayment] = useState<string>('');
  const [upiPayment, setUpiPayment] = useState<string>('');

  // ESC Key Listener
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedRoom(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // State Reset and Population on Room Switch
  useEffect(() => {
    setCashPayment('');
    setUpiPayment('');
    setExtraName('');
    setExtraPrice('');
    
    // Pre-fill form if room has a booking (Reserved or Dirty but booked)
    const booking = selectedRoom?.booking;
    if (booking) {
      setGuestName(booking.guestDetails?.name || '');
      setGuestMobile(booking.guestDetails?.phone || '');
      setGuestEmail(booking.guestDetails?.email || '');
    } else {
      setGuestName('');
      setGuestMobile('');
      setGuestEmail('');
    }
  }, [selectedRoom?.number, selectedRoom?.booking]);

  const hotels = useMemo(() => allHotels.filter((h: any) => h.id && h.rooms?.length > 0), [allHotels]);

  useEffect(() => {
    if (hotels.length > 0 && !activeHotelId) onHotelChange(hotels[0].id);
  }, [hotels, activeHotelId, onHotelChange]);

  const activeHotel = useMemo(() => hotels.find((h: any) => h.id === activeHotelId), [hotels, activeHotelId]);
  const { data: physicalStatuses = [] } = useRoomStatus(activeHotelId);

  const { data: allBookings = [], refetch: refetchAll } = useQuery({
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

  const { data: activeBookings = [] } = useActiveBookings(activeHotelId);
  const { data: availabilityMap = { occupied: [], blocked: [] } } = useRoomAvailabilityMap(activeHotelId, new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const handleIntegratedCheckIn = async (booking: any) => {
    const tid = toast.loading(`Checking-in ${booking.guestDetails?.name}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`
        }
      });
      if (res.ok) {
        toast.success("Guest Checked-in Successfully!", { id: tid });
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
        queryClient.invalidateQueries({ queryKey: ['room-status'] });
      } else {
        const err = await res.json();
        throw new Error(err.message || "Check-in failed");
      }
    } catch (err: any) { toast.error(err.message, { id: tid }); }
  };

  const rooms = useMemo(() => {
    if (!activeHotel) return [];
    
    const bMap = new Map();
    activeBookings.forEach((b: any) => { if (b.roomNumber) bMap.set(b.roomNumber.toString(), b); });
    
    const sMap = new Map();
    physicalStatuses.forEach((s: any) => { if (s.roomNumber) sMap.set(s.roomNumber.toString(), s); });
    
    const occSet = new Set((availabilityMap.occupied || []).map((n: any) => n.toString()));
    const blkSet = new Set((availabilityMap.blocked || []).map((n: any) => n.toString()));

    const generated: any[] = [];
    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      const count = roomType.total_rooms || 10;
      const startNum = (idx + 1) * 100 + 1;
      const numbers = roomType.numbers && roomType.numbers.length > 0 ? roomType.numbers : Array.from({ length: count }, (_, i) => (startNum + i).toString());

      numbers.forEach((num: string) => {
        const curBooking = bMap.get(num.toString());
        const manStatus = sMap.get(num.toString());
        const isOcc = !!curBooking || occSet.has(num.toString());
        const isBlk = manStatus?.status === 'Maintenance' || manStatus?.status === 'Blocked' || blkSet.has(num.toString());
        
        let status: 'Available' | 'Booked' | 'Cleaning' | 'Maintenance' | 'Dirty' | 'Reserved' = 'Available';
        if (isBlk) status = 'Maintenance';
        else if (manStatus?.status === 'Cleaning') status = 'Cleaning';
        else if (manStatus?.status === 'Dirty') status = 'Dirty';
        else if (curBooking?.status === 'checked-in' || (isOcc && !curBooking)) status = 'Booked';
        else if (curBooking?.status === 'reserved' || curBooking?.status === 'confirmed') status = 'Reserved';

        generated.push({ 
          number: num, 
          type: roomType.type, 
          price: roomType.price, 
          roomId: roomType.id, 
          status,
          booking: curBooking
        });
      });
    });
    return generated;
  }, [activeHotel, activeBookings, physicalStatuses, availabilityMap]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchesSearch = r.number.toString().includes(searchQuery) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  const liveSelectedRoom = useMemo(() => {
    if (!selectedRoom) return null;
    return rooms.find((r: any) => r.number === selectedRoom.number) || selectedRoom;
  }, [rooms, selectedRoom]);

  const groupedRooms = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredRooms.forEach(r => {
      const type = r.type || 'Standard';
      if (!groups[type]) groups[type] = [];
      groups[type].push(r);
    });
    return groups;
  }, [filteredRooms]);

  const TimeAgo = ({ date }: { date: string }) => {
    const [time, setTime] = useState('');
    useEffect(() => {
      const update = () => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.max(0, Math.floor(diff / 60000));
        const hours = Math.floor(mins / 60);
        if (hours > 0) setTime(`${hours}h ${mins % 60}m`);
        else setTime(`${mins}m`);
      };
      update();
      const interval = setInterval(update, 60000);
      return () => clearInterval(interval);
    }, [date]);
    return <span>{time}</span>;
  };

  const handleUpdateRoomStatus = async (roomNumber: string, status: string) => {
    const tid = toast.loading(`Updating Room ${roomNumber} to ${status}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/room-status/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ hotelId: activeHotelId, roomNumber, status })
      });
      if (res.ok) {
        toast.success(`Room ${roomNumber} is now ${status}`, { id: tid });
        queryClient.invalidateQueries({ queryKey: ['room-status', activeHotelId] });
      } else throw new Error("Update failed");
    } catch (err: any) { toast.error(err.message, { id: tid }); }
  };

  const handleForceCheckout = async () => {
    if (!liveSelectedRoom?.booking?._id) return;
    const tid = toast.loading("Executing Force Check-out...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${liveSelectedRoom.booking._id}/checkout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
      });
      if (res.ok) {
        toast.success(`Room ${liveSelectedRoom.number} checked out.`, { id: tid });
        setShowCheckoutConfirm(false);
        setSelectedRoom(null);
        refetchAll();
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['room-status'] });
      } else throw new Error("Check-out failed");
    } catch (err: any) { toast.error(err.message, { id: tid }); }
  };

  const handleSidebarPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const booking = liveSelectedRoom?.booking;
    if (!booking) return;

    const offline = Number(cashPayment) || 0;
    const online = Number(upiPayment) || 0;
    const totalNewPayment = offline + online;
    
    // Integrity Checks
    if (offline < 0 || online < 0) return toast.error("NEGATIVE PAYMENT REJECTED");
    if (totalNewPayment <= 0) return toast.error("Enter a valid settlement amount");
    
    const financials = getBookingFinancials(booking);
    if (totalNewPayment > financials.balance) {
      return toast.error(`EXCEEDS BALANCE: Max ₹${financials.balance}`);
    }

    setIsSubmitting(true);
    const tid = toast.loading(`Processing ₹${totalNewPayment} Transaction...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id || booking.id}/record-payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` 
        },
        body: JSON.stringify({ offlinePaid: offline, onlinePaid: online })
      });

      if (res.ok) {
        toast.success("FINANCIAL RECORD UPDATED", { id: tid });
        setCashPayment('');
        setUpiPayment('');
        refetchAll();
        queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      } else throw new Error("Settle Balance Failed");
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    } finally { setIsSubmitting(false); }
  };

  const handleAddExtraCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const booking = liveSelectedRoom?.booking;
    if (!booking || !extraName || !extraPrice) return toast.error("Enter Manifest Details");
    if (Number(extraPrice) < 0) return toast.error("INVALID PRICE");
    
    setIsSubmitting(true);
    try {
      const newExtras = [...(booking.extraCharges || []), { name: extraName, price: Number(extraPrice), paid: false }];
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ extraCharges: newExtras })
      });
      if (res.ok) {
        toast.success("Extra Charge Added to Ledger");
        setExtraName(''); setExtraPrice('');
        refetchAll();
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteExtraCharge = async (index: number) => {
    const booking = liveSelectedRoom?.booking;
    if (!booking) return;
    if (!window.confirm("TERMINATE THIS CHARGE?")) return;

    try {
      const newExtras = (booking.extraCharges || []).filter((_: any, i: number) => i !== index);
      await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ extraCharges: newExtras })
      });
      toast.success("CHARGE REMOVED");
      refetchAll();
      queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
    } catch (err) { toast.error("Removal Failed"); }
  };

  const toggleExtraPaidStatus = async (index: number) => {
    const booking = liveSelectedRoom?.booking;
    if (!booking) return;

    try {
      const newExtras = [...(booking.extraCharges || [])];
      newExtras[index].paid = !newExtras[index].paid;
      await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ extraCharges: newExtras })
      });
      refetchAll();
      queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
    } catch (err) { toast.error("Status Update Failed"); }
  };

  // Live Ledger Calculations for Integrated Check-In
  const checkInTotal = Number(liveSelectedRoom?.price) || 0;
  const checkInOffline = Number(offlineAmount) || 0;
  const checkInOnline = Number(onlineAmount) || 0;
  const totalPaidCheckIn = checkInOffline + checkInOnline;
  const balanceCheckIn = checkInTotal - totalPaidCheckIn;

  const handleIntegratedWalkIn = async () => {
    if (!liveSelectedRoom || !guestName || !guestMobile) return toast.error("Complete Identity Details");
    
    // Financial Integrity
    if (checkInOffline < 0 || checkInOnline <0) return toast.error("NEGATIVE PAYMENT REJECTED");
    if (totalPaidCheckIn > checkInTotal) return toast.error(`EXCEEDS TOTAL: Max ₹${checkInTotal}`);

    setIsSubmitting(true);
    const tid = toast.loading(`Enrolling ${guestName} to Room ${liveSelectedRoom.number}...`);
    
    try {
      const checkin = new Date();
      const checkout = new Date();
      checkout.setDate(checkout.getDate() + 1); // Default to 1 night

      const bookingData = {
        hotel_id: activeHotelId,
        room_id: liveSelectedRoom.roomId,
        checkin: checkin.toISOString(),
        checkout: checkout.toISOString(),
        roomNumber: liveSelectedRoom.number,
        guests: 1, // Fix: Schema requirement
        totalAmount: checkInTotal,
        paidAmount: totalPaidCheckIn,
        offlinePaid: checkInOffline,
        onlinePaid: checkInOnline,
        guestDetails: {
          name: guestName,
          phone: guestMobile,
          email: guestEmail || 'guest@example.com'
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/content/bookings/pay-at-hotel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`
        },
        body: JSON.stringify({ bookingData })
      });

      if (res.ok) {
        toast.success("CHECK-IN SUCCESSFUL", { id: tid });
        setGuestName(''); setGuestMobile(''); setGuestEmail('');
        setOfflineAmount(''); setOnlineAmount('');
        refetchAll();
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['room-status'] });
        
        const data = await res.json();
        if (data.booking) {
           setSelectedRoom({ ...liveSelectedRoom, status: 'Booked', booking: data.booking });
        }
      } else {
        const error = await res.json();
        throw new Error(error.message || "Enrollment Failed");
      }
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingHotels) return <div className="h-[60vh] flex items-center justify-center text-[var(--lux-gold)] animate-pulse font-display text-2xl uppercase tracking-[0.2em]">Restoring Assets...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-8 items-start">
        {/* UPCOMING ARRIVALS - TOP MINI SECTION */}
        <div className="w-full bg-[var(--lux-card)] rounded-[2rem] border border-[var(--lux-border)] p-6 overflow-hidden">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)]">
                    <Clock size={14} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">Upcoming Arrivals <span className="opacity-40">(Today/Tomorrow)</span></h4>
              </div>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar scroll-smooth">
              {activeBookings.filter((b: any) => b.status === 'reserved' || b.status === 'confirmed').slice(0, 8).map((b: any) => (
                 <div key={b._id} className="min-w-[200px] bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between group hover:border-[var(--lux-gold)]/40 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <p className="font-bold text-[12px] truncate max-w-[120px]">{b.guestDetails?.name}</p>
                       <span className="text-[9px] font-black text-[var(--lux-gold)] bg-[var(--lux-gold)]/10 px-2 py-0.5 rounded-md">Room {b.roomNumber}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                       <p className="text-[8px] font-bold opacity-40">{new Date(b.checkin).toLocaleDateString()}</p>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleIntegratedCheckIn(b);
                         }}
                         className="px-3 py-1 bg-white/5 hover:bg-[var(--lux-gold)] hover:text-black text-[8px] font-black uppercase tracking-widest rounded-lg transition-all"
                       >
                          Check-in
                       </button>
                    </div>
                 </div>
              ))}
              {activeBookings.filter((b: any) => b.status === 'reserved' || b.status === 'confirmed').length === 0 && (
                 <p className="text-[10px] text-[var(--lux-muted)] py-4 font-bold italic tracking-wider">No arrivals pending today.</p>
              )}
           </div>
        </div>
        {/* ROOM GRID HUB */}
        <div className="flex-1 w-full space-y-10">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-2 p-1.5 bg-[var(--lux-card)] rounded-2xl border border-white/5 shadow-inner">
                  {['All', 'Available', 'Booked', 'Cleaning', 'Dirty'].map((f) => (
                    <button 
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f as any)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${statusFilter === f ? 'bg-[var(--lux-gold)] text-black shadow-lg shadow-[var(--lux-gold)]/20' : 'text-[var(--lux-muted)] hover:text-white hover:bg-white/5'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
               
               <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
                  <div className="relative group flex-1 sm:w-96">
                     <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-colors" />
                     <input 
                       type="text" placeholder="Search registry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full h-12 bg-[var(--lux-card)] border border-white/5 rounded-2xl py-3.5 pl-14 pr-4 text-[12px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-inner placeholder:text-white/10" 
                     />
                  </div>

                  <div className="flex items-center gap-1.5 p-1.5 bg-[var(--lux-card)] rounded-2xl border border-white/5 shadow-inner">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
                      >
                        <Grid size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('compact')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'compact' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white'}`}
                      >
                        <LayoutGrid size={18} />
                      </button>
                  </div>
               </div>
            </div>

           {viewMode === 'grid' ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredRooms.map((room) => {
                  const isActive = selectedRoom?.number === room.number;
                  const statusColors: any = {
                    'Available': 'room-card-available',
                    'Booked': 'room-card-booked',
                    'Cleaning': 'room-card-cleaning',
                    'Dirty': 'room-card-dirty',
                    'Maintenance': 'bg-gray-800 border-gray-700 opacity-50'
                  };
                  return (
                    <motion.div 
                        key={room.number}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedRoom(room)}
                        className={`room-box-saas p-0 border-[1.5px] ${isActive ? 'ring-2 ring-[var(--lux-gold)] ring-offset-4 ring-offset-black shadow-2xl !bg-[#D4AF37] !text-black !border-transparent' : statusColors[room.status] || 'bg-[var(--lux-card)]'}`}
                      >
                         <div className="h-full flex flex-col justify-between p-5 relative">
                            {/* Status Dot */}
                            <div className={`absolute top-4 right-4 ${room.status === 'Booked' ? 'pulse-green' : ''}`}>
                               <div className={`${room.status === 'Available' ? 'dot-available' : room.status === 'Booked' ? 'dot-booked' : 'dot-dirty'}`} />
                            </div>

                            {/* Header row */}
                            <div className="flex flex-col">
                               <span className={`text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1 ${isActive ? 'text-black' : ''}`}>UNIT REGISTRY</span>
                               <span className={`text-[13px] font-bold leading-none ${isActive ? 'text-black' : ''}`}>#{room.number}</span>
                            </div>

                            {/* Body row: Large Number & Type */}
                            <div className="flex flex-col items-center justify-center -translate-y-2">
                               <h4 className={`text-[46px] font-display font-black leading-none tracking-tighter ${isActive ? 'text-black' : ''}`}>{room.number}</h4>
                               <p className={`text-[11px] font-black uppercase tracking-[0.2em] opacity-30 mt-1 whitespace-nowrap overflow-hidden text-center max-w-full truncate ${isActive ? 'text-black/60' : ''}`}>{room.type}</p>
                            </div>

                            {/* Footer row: Guest Info */}
                            <div className={`pt-3 border-t flex flex-col gap-0.5 ${isActive ? 'border-black/10' : 'border-black/5'}`}>
                               {room.booking ? (
                                 <div className="flex justify-between items-center gap-2 overflow-hidden">
                                    <div className="flex flex-col min-w-0">
                                       <span className={`text-[13px] font-bold truncate ${isActive ? 'text-black' : ''}`} title={room.booking.guestDetails?.name}>
                                          {room.booking.guestDetails?.name || 'In-House Client'}
                                       </span>
                                       <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${isActive ? 'text-black/40' : ''}`}>
                                          {room.status === 'Booked' ? 'Stay Duration' : 'Reserved Delay'}
                                       </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                       <span className={`text-[10px] font-black ${isActive ? 'text-black/60' : 'text-[var(--lux-gold)]'}`}>
                                          <TimeAgo date={room.booking.checkin} />
                                       </span>
                                       <span className={`text-[8px] font-bold opacity-20 italic ${isActive ? 'text-black/20' : ''}`}>
                                          {room.status === 'Booked' ? 'ELAPSED' : 'STANDBY'}
                                       </span>
                                    </div>
                                 </div>
                               ) : (
                                 <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-30 ${isActive ? 'text-black/40' : ''}`}>{room.status}</span>
                                    <span className={`text-[9px] font-bold opacity-20 italic ${isActive ? 'text-black/20' : ''}`}>STANDBY</span>
                                 </div>
                               )}
                            </div>
                         </div>
                      </motion.div>
                    );
                 })}
             </div>
           ) : (
             <div className="space-y-10">
                {Object.entries(groupedRooms).map(([type, rms]) => (
                  <div key={type} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/5"></div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--lux-gold)] opacity-60">{type}</h3>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                      {rms.map((room) => {
                        const isActive = selectedRoom?.number === room.number;
                        const roomFin = room.booking ? getBookingFinancials(room.booking) : null;
                        
                        const statusStyles: any = {
                          'Available': 'bg-[#FFFFFF] text-[#18181b] border-zinc-200',
                          'Booked': 'bg-[#22c55e] text-white border-green-600',
                          'Reserved': 'bg-[#22c55e] text-white border-green-600',
                          'Dirty': 'bg-[#ef4444] text-white border-red-600',
                          'Cleaning': 'bg-[#facc15] text-black border-yellow-600',
                          'Maintenance': 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        };

                        const dotStyles: any = {
                          'Available': 'dot-available',
                          'Booked': 'dot-booked pulse-booked',
                          'Reserved': 'dot-reserved pulse-reserved',
                          'Dirty': 'dot-dirty',
                          'Cleaning': 'dot-cleaning'
                        };

                        return (
                          <motion.div
                            key={room.number}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedRoom(room)}
                            className={`grid-room-box group cursor-pointer ${isActive ? 'ring-2 ring-[var(--lux-gold)] ring-offset-2 ring-offset-black' : ''} ${statusStyles[room.status] || 'bg-zinc-900'}`}
                          >
                            {/* Status Dot */}
                            <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                            
                            <div className="flex flex-col items-center justify-center text-center space-y-1">
                              <span className="text-3xl font-display font-black leading-none">{room.number}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 truncate w-full px-1" title={room.booking?.guestDetails?.name}>
                                {room.status === 'Booked' && room.booking?.guestDetails?.name 
                                  ? room.booking.guestDetails.name 
                                  : (room.status === 'Dirty' ? 'Dirty' : room.status === 'Cleaning' ? 'Cleaning' : room.type)}
                              </span>
                            </div>

                            {room.status === 'Booked' && room.booking && (
                              <div className="mt-2 flex flex-col items-center space-y-0.5 border-t border-black/10 pt-2 w-full">
                                <span className="text-sm font-bold">₹{roomFin?.total}</span>
                                <div className="text-[9px] font-black opacity-80 flex items-center gap-1">
                                   <TimeAgo date={room.booking.checkin} />
                                </div>
                              </div>
                            )}

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl z-20">
                               <button className="p-1.5 hover:bg-[var(--lux-gold)] hover:text-black rounded-xl transition-all text-white">
                                  <Eye size={14} />
                                </button>
                               <button className="p-1.5 hover:bg-[var(--lux-gold)] hover:text-black rounded-xl transition-all text-white">
                                  <Receipt size={14} />
                                </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* PREMIUM ROOM PERSPECTIVE DRAWER */}
        <AnimatePresence>
          {selectedRoom && (
            <>
              {/* Backdrop with Outside Click */}
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 onClick={() => setSelectedRoom(null)}
                 className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500]"
              />
              
              <motion.div 
                 initial={{ x: '100%' }} 
                 animate={{ x: 0 }} 
                 exit={{ x: '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                 className="fixed top-0 right-0 w-full md:max-w-6xl h-full bg-[var(--lux-bg)] border-l border-[var(--lux-border)] z-[501] shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[var(--lux-card)]">
                   <div>
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Perspective View</p>
                      <h2 className="text-5xl font-display font-bold tracking-tight leading-none">Unit <span className="text-[var(--lux-gold)]">{liveSelectedRoom.number}</span></h2>
                   </div>
                   <button type="button" onClick={() => setSelectedRoom(null)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all border border-white/5 shadow-xl text-white">
                      <LogOut size={24} />
                   </button>
                </div>

                {liveSelectedRoom.booking ? (() => {
                   const financials = getBookingFinancials(liveSelectedRoom.booking);
                   return (
                      <div className="flex-1 flex flex-col md:flex-row bg-[var(--lux-bg)] overflow-hidden lg:h-full">
                         {/* LEFT COLUMN: GUEST & SERVICES */}
                         <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar pb-32 md:pb-10">
                            {/* Guest Quick Identity */}
                            <section className="space-y-4">
                               <p className="text-[10px] font-black uppercase tracking-widest text-white/50 pl-2">1. Guest Profile</p>
                               <div className="flex items-center gap-6 p-6 bg-[var(--lux-card)] border border-white/10 rounded-[2.5rem] relative group hover:border-[var(--lux-gold)]/20 transition-all duration-500 shadow-xl">
                                  <div className="w-20 h-20 rounded-2xl bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)] font-display font-bold text-4xl border border-[var(--lux-gold)]/20 shadow-inner">
                                     {financials.status === 'PAID' ? <ShieldCheck size={36} /> : liveSelectedRoom.booking.guestDetails?.name?.[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <h4 className="text-3xl font-black tracking-tighter truncate leading-tight text-white">{liveSelectedRoom.booking.guestDetails?.name}</h4>
                                     <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.1em]">{liveSelectedRoom.booking.guestDetails?.phone}</p>
                                        <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                        <p className="text-[11px] font-bold text-[var(--lux-gold)] uppercase tracking-[0.1em]">Verified Profile</p>
                                     </div>
                                  </div>
                                  <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl ${financials.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-[var(--lux-gold)] text-black'}`}>
                                     {financials.status}
                                  </div>
                               </div>
                            </section>

                            {/* Extra Services Module */}
                            <section className="space-y-6">
                               <div className="flex justify-between items-center px-4">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-muted)]">2. Extra Services & Food</p>
                                  <button type="button" className="text-[10px] font-black uppercase text-[var(--lux-gold)] hover:underline underline-offset-4 transition-all">Import Charges</button>
                               </div>

                               <div className="grid grid-cols-1 gap-3">
                                  {(liveSelectedRoom.booking.extraCharges || []).length > 0 ? liveSelectedRoom.booking.extraCharges.map((item: any, idx: number) => (
                                     <motion.div 
                                       key={idx} 
                                       whileHover={{ scale: 1.01 }}
                                       className="flex justify-between items-center p-5 bg-[#161616] rounded-2xl border border-white/10 group hover:border-[var(--lux-gold)]/30 transition-all shadow-sm"
                                     >
                                        <div className="flex items-center gap-4 flex-1">
                                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.paid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                              <TrendingUp size={18} />
                                           </div>
                                           <div className="space-y-0.5">
                                              <p className="text-sm font-bold tracking-tight text-white">{item.name}</p>
                                              <p className="text-[11px] font-black text-white/40 uppercase">₹{item.price}</p>
                                           </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <button 
                                             type="button" onClick={() => toggleExtraPaidStatus(idx)}
                                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${item.paid ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                           >
                                              {item.paid ? 'PAID' : 'UNPAID'}
                                           </button>
                                           <button type="button" onClick={() => handleDeleteExtraCharge(idx)} className="p-3 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                              <Trash2 size={16} />
                                           </button>
                                        </div>
                                     </motion.div>
                                  )) : (
                                    <div className="text-center py-10 rounded-3xl border border-dashed border-white/10 opacity-40">
                                       <LayoutGrid size={32} className="mx-auto mb-3 text-white" />
                                       <p className="text-[10px] uppercase font-black tracking-widest text-white">No extra charges recorded</p>
                                    </div>
                                  )}
                               </div>

                               <form onSubmit={handleAddExtraCharge} className="flex gap-3 pt-4 border-t border-white/5">
                                  <div className="flex-1">
                                     <input 
                                        type="text" placeholder="Service Name (e.g. Dinner)" value={extraName} onChange={(e) => setExtraName(e.target.value)}
                                        className="premium-input"
                                     />
                                  </div>
                                  <div className="w-28">
                                     <input 
                                        type="number" placeholder="₹" value={extraPrice} onChange={(e) => setExtraPrice(e.target.value)}
                                        className="premium-input text-center"
                                     />
                                  </div>
                                  <button 
                                     type="submit" disabled={isSubmitting}
                                     className="px-8 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-all border border-white/5"
                                  >
                                     Add
                                  </button>
                               </form>
                            </section>

                            {/* Settlement Form */}
                            <section className="space-y-6">
                               <p className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-muted)] pl-2">3. Settle Balance</p>
                               <form onSubmit={handleSidebarPayment} className="p-8 bg-[#161616] border border-[#222] rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--lux-gold)]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[var(--lux-gold)]/10 transition-all duration-1000"></div>
                                  
                                  <div className="grid grid-cols-2 gap-6 relative z-10">
                                     <div className="premium-input-container">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">Offline / Cash</label>
                                        <input 
                                          type="number" value={cashPayment} onChange={(e) => setCashPayment(e.target.value)}
                                          placeholder="₹0" className="premium-input text-xl text-green-500 font-display" 
                                        />
                                     </div>
                                     <div className="premium-input-container">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">Online / UPI</label>
                                        <input 
                                          type="number" value={upiPayment} onChange={(e) => setUpiPayment(e.target.value)}
                                          placeholder="₹0" className="premium-input text-xl text-blue-500 font-display" 
                                        />
                                     </div>
                                  </div>
                                  <button 
                                    type="submit" disabled={isSubmitting}
                                    className="btn-premium-gold relative z-10"
                                  >
                                     {isSubmitting ? 'Recording...' : 'RECORD SETTLEMENT'}
                                  </button>
                               </form>
                            </section>
                         </div>

                         {/* RIGHT COLUMN: SUMMARY PANEL */}
                         <div className="w-full md:w-[380px] bg-[var(--lux-card)] border-l border-white/5 flex flex-col">
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                               <div className="space-y-6">
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Financial History</p>
                                  
                                  <div className="bg-black/20 rounded-3xl p-6 border border-white/10 space-y-4">
                                     <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-white/40">Room Charges:</span>
                                        <span className="text-white">₹{financials.total - financials.extrasTotal}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-white/40">Extras Hub:</span>
                                        <span className="text-[var(--lux-gold)]">₹{financials.extrasTotal}</span>
                                     </div>
                                     <div className="h-px bg-white/5 my-2"></div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-white/30">Gross Invoice</span>
                                        <span className="text-3xl font-display font-bold text-white">₹{financials.total}</span>
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Collection Dashboard</p>
                                  <div className="bg-[#161616] rounded-3xl p-8 border border-[#222] space-y-8 relative overflow-hidden group shadow-xl">
                                     <div className="absolute inset-0 bg-gradient-to-br from-[var(--lux-gold)]/[0.02] to-transparent"></div>
                                     
                                     <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-1">
                                           <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Actual Collected</p>
                                           <h4 className="text-3xl font-display font-bold text-green-400 italic">₹{financials.paid}</h4>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl ${financials.balance <= 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                           {financials.status}
                                        </div>
                                     </div>

                                     <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/40">
                                           <span>Wallet Health</span>
                                           <span className="text-white font-bold">{financials.paidPercent}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                                           <motion.div 
                                             initial={{ width: 0 }}
                                             animate={{ width: `${financials.paidPercent}%` }}
                                             className="h-full rounded-full bg-gradient-to-r from-[var(--lux-gold)] to-yellow-400 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-1000" 
                                           />
                                        </div>
                                     </div>

                                     <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                                        <div className="space-y-1">
                                           <span className="text-[10px] font-black uppercase tracking-widest text-red-500/80">Net Balance Due</span>
                                           <h5 className="text-4xl font-display font-bold text-red-500 italic">₹{financials.balance}</h5>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               {/* Quick Controls */}
                               <div className="grid grid-cols-2 gap-3">
                                  <button type="button" onClick={() => setShowCheckoutConfirm(true)} className="flex items-center justify-center gap-2 h-14 bg-black border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#111] transition-all">
                                     <LogOut size={14} /> Rapid C/O
                                  </button>
                                  <button type="button" className="flex items-center justify-center gap-2 h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                     <CreditCard size={14} /> Invoice
                                  </button>
                               </div>
                            </div>

                            {/* PRIMARY ACTION: CHECKOUT */}
                            <div className="p-8 bg-[var(--lux-card)] border-t border-white/5 sticky-action-container">
                               {financials.balance > 0 ? (
                                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-4 group">
                                     <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-110 transition-transform">
                                        <ShieldCheck size={24} className="rotate-180" strokeWidth={3} />
                                     </div>
                                     <p className="text-[10px] font-black uppercase text-red-400 tracking-widest leading-relaxed">
                                        ⚠️ CHECK-OUT RESTRICTED.<br />CLEAR ₹{financials.balance} BALANCE FIRST.
                                     </p>
                                  </div>
                               ) : (
                                 <button 
                                   type="button" onClick={handleForceCheckout}
                                   className="w-full h-16 bg-green-500 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-green-600 transition-all shadow-2xl shadow-green-500/20 active:scale-95"
                                 >
                                    Finalize & Check-out Room
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>
                   );
                })() : (
                  <div className="flex-1 flex flex-col md:flex-row bg-[var(--lux-bg)] overflow-hidden lg:h-full">
                     {/* LEFT COLUMN: FORM */}
                     <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar pb-32 md:pb-10">
                        <section className="space-y-8">
                           <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--lux-gold)]">1. Guest Information</h4>
                              <span className="text-[10px] font-bold text-white/50 uppercase italic">Required for ledger</span>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="premium-input-container">
                                 <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--lux-gold)] ml-1 opacity-80">
                                    <UserPlus size={12} className="text-[var(--lux-gold)]" /> Guest Name
                                 </label>
                                 <input 
                                    type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget.parentElement?.nextElementSibling?.querySelector('input') as HTMLInputElement)?.focus(); }}
                                    placeholder="e.g. John Doe"
                                    className="premium-input"
                                 />
                              </div>
                              <div className="premium-input-container">
                                 <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--lux-gold)] ml-1 opacity-80">
                                    <CreditCard size={12} className="text-[var(--lux-gold)]" /> Mobile Number
                                 </label>
                                 <input 
                                    type="text" value={guestMobile} onChange={(e) => setGuestMobile(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget.parentElement?.nextElementSibling?.querySelector('input') as HTMLInputElement)?.focus(); }}
                                    placeholder="08668XXXXX"
                                    className="premium-input"
                                 />
                              </div>
                              <div className="premium-input-container md:col-span-2">
                                 <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--lux-gold)] ml-1 opacity-80">
                                    <Key size={12} className="text-[var(--lux-gold)]" /> Email Address (Optional)
                                 </label>
                                 <input 
                                    type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                                    placeholder="guest@example.com"
                                    className="premium-input"
                                 />
                              </div>
                           </div>
                        </section>

                        <section className="space-y-8">
                           <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--lux-gold)]">2. Payment Method</h4>
                              <div className="flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Selector</span>
                              </div>
                           </div>
                           
                           <div className="segmented-control">
                              {['UPI', 'CASH', 'PARTIAL', 'Pay Later'].map((m) => (
                                 <button 
                                    key={m} 
                                    type="button"
                                    onClick={() => {
                                       setPaymentMethod(m);
                                       if (m === 'Pay Later') { setOfflineAmount(''); setOnlineAmount(''); }
                                    }}
                                    className={`segmented-item ${paymentMethod === m ? 'bg-[var(--lux-gold)] text-black shadow-lg scale-[1.02]' : 'text-[var(--lux-muted)] hover:text-white'}`}
                                 >
                                    {m}
                                 </button>
                              ))}
                           </div>

                           {paymentMethod === 'Pay Later' ? (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">⚠️</div>
                                 <p className="text-[11px] font-bold text-amber-500 uppercase tracking-widest leading-tight">
                                    Payment pending. Checkout will be restricted until balance is cleared.
                                 </p>
                              </motion.div>
                           ) : (
                               <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {(paymentMethod === 'CASH' || paymentMethod === 'PARTIAL') && (
                                     <div className="premium-input-container">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-1">Cash Paid (Offline)</label>
                                        <input 
                                           type="number" value={offlineAmount} onChange={(e) => setOfflineAmount(e.target.value)}
                                           className="premium-input text-lg text-green-400"
                                           placeholder="₹0"
                                        />
                                     </div>
                                  )}
                                  {(paymentMethod === 'UPI' || paymentMethod === 'PARTIAL') && (
                                     <div className="premium-input-container">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-1">Online Paid (UPI)</label>
                                        <input 
                                           type="number" value={onlineAmount} onChange={(e) => setOnlineAmount(e.target.value)}
                                           className="premium-input text-lg text-blue-400"
                                           placeholder="₹0"
                                        />
                                     </div>
                                  )}
                               </motion.div>
                           )}
                        </section>
                     </div>

                     {/* RIGHT COLUMN: SUMMARY PANEL */}
                     <div className="w-full md:w-[380px] bg-[var(--lux-card)] border-l border-white/5 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                           <div className="space-y-6">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)]">Booking Summary</p>
                              
                              <div className="bg-black/20 rounded-3xl p-6 border border-white/10 space-y-4">
                                 <div className="flex justify-between items-center text-sm font-bold">
                                     <span className="opacity-40">Room:</span>
                                     <span className="text-[var(--lux-gold)] font-black">{liveSelectedRoom.number}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm font-bold">
                                     <span className="opacity-40">Base Price:</span>
                                     <span>₹{liveSelectedRoom.price}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm font-bold">
                                     <span className="opacity-40">Nights:</span>
                                     <span>1</span>
                                  </div>
                                  <div className="h-px bg-white/5 my-2"></div>
                                  <div className="flex justify-between items-end pt-4">
                                     <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-gold)] leading-none">Gross Total</p>
                                        <h2 className="text-4xl font-display font-black tracking-tighter mt-1">₹{liveSelectedRoom.price}</h2>
                                     </div>
                                  </div>
                              </div>
                           </div>

                            <div className="space-y-6">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Payment Status</p>
                               <div className="bg-[#161616] rounded-3xl p-6 border border-[#222] space-y-6 shadow-xl">
                                  <div className="flex justify-between items-start">
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Total Paid</p>
                                        <h4 className="text-3xl font-display font-bold text-green-400 italic">₹{totalPaidCheckIn}</h4>
                                     </div>
                                     <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${balanceCheckIn <= 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : balanceCheckIn === Number(liveSelectedRoom.price) ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                        {balanceCheckIn <= 0 ? 'PAID' : balanceCheckIn === Number(liveSelectedRoom.price) ? 'UNPAID' : 'PARTIAL'}
                                     </div>
                                  </div>

                                  <div className="space-y-3">
                                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <span>Settlement Progress</span>
                                        <span className="text-white font-bold">{Math.min(100, Math.round((totalPaidCheckIn / (Number(liveSelectedRoom.price) || 1)) * 100))}%</span>
                                     </div>
                                     <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${Math.min(100, (totalPaidCheckIn / (Number(liveSelectedRoom.price) || 1)) * 100)}%` }}
                                           className="h-full bg-gradient-to-r from-[#D4AF37] to-yellow-400 shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all duration-1000" 
                                        />
                                     </div>
                                  </div>

                                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                     <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Balance Due</span>
                                     <span className="text-2xl font-display font-bold text-red-500">₹{Math.max(0, balanceCheckIn)}</span>
                                  </div>
                               </div>
                            </div>
                        </div>

                        {/* STICKY ACTION BUTTON */}
                        <div className="p-8 bg-[var(--lux-card)] border-t border-white/5 sticky-action-container">
                           {liveSelectedRoom.status === 'Available' ? (
                              <button 
                                 type="button" 
                                 onClick={handleIntegratedWalkIn}
                                 disabled={isSubmitting}
                                 className="btn-premium-gold"
                              >
                                 {isSubmitting ? 'GENERATING LEDGER...' : 'Confirm Check-in'}
                              </button>
                           ) : liveSelectedRoom.status === 'Dirty' ? (
                               <button type="button" onClick={() => handleUpdateRoomStatus(liveSelectedRoom.number, 'Cleaning')} className="w-full h-14 bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-blue-600 transition-all">
                                  Mark as Cleaning
                               </button>
                           ) : liveSelectedRoom.status === 'Cleaning' ? (
                               <button type="button" onClick={() => handleUpdateRoomStatus(liveSelectedRoom.number, 'Available')} className="w-full h-14 bg-green-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-green-600 transition-all">
                                  Mark Ready for Guest
                               </button>
                           ) : null}
                        </div>
                     </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <button type="button" onClick={onWalkInClick} className="flex items-center justify-center gap-3 py-6 btn-premium group"><UserPlus size={18} /> <span>Rapid Enrollment</span></button>
         <button type="button" onClick={() => { if(liveSelectedRoom?.status === 'Booked') setShowCheckoutConfirm(true); }} className="flex items-center justify-center gap-3 py-6 btn-premium group"><LogOut size={18} /> <span>Secure Check-out</span></button>
         <button 
           type="button" 
           onClick={() => { 
              if(liveSelectedRoom?.status === 'Dirty') handleUpdateRoomStatus(liveSelectedRoom.number, 'Cleaning');
              else if(liveSelectedRoom?.status === 'Cleaning') handleUpdateRoomStatus(liveSelectedRoom.number, 'Available');
           }} 
           className="flex items-center justify-center gap-3 py-6 btn-premium group"
         >
             <Brush size={18} /> <span>Cleaning Terminal</span>
         </button>
       </div>

      {showCheckoutConfirm && (
         <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--lux-card)] border border-white/10 p-10 rounded-[3rem] max-w-sm w-full text-center space-y-8">
               <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 text-4xl">⚠️</div>
               <div>
                  <h3 className="text-3xl font-display font-bold mb-2">Confirm Check-out?</h3>
                  <p className="text-[11px] text-[var(--lux-muted)] font-medium leading-relaxed">System will finalize Room {liveSelectedRoom?.number} and mark it as Dirty.</p>
               </div>
               <div className="flex flex-col gap-3">
                  <button type="button" onClick={handleForceCheckout} className="py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 transition-all">Complete Check-out</button>
                  <button type="button" onClick={() => setShowCheckoutConfirm(false)} className="py-5 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase">Cancel</button>
               </div>
            </motion.div>
         </div>
      )}

      {activeHotel && <ReceptionSchedule bookings={allBookings} activeHotel={activeHotel} onRefresh={refetchAll} />}
    </div>
  );
};
