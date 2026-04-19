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
  Clock,
  CheckCircle,
  Phone,
  MessageCircle
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



export const GlobalDashboard = ({ activeHotelId, onHotelChange, onWalkInClick, onInvoiceClick }: { activeHotelId: string, onHotelChange: (id: string) => void, onWalkInClick: () => void, onInvoiceClick: (booking: any) => void }) => {
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

  // --- NEW: Smart Check-In Logic ---
  const [checkinDate, setCheckinDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [checkoutDate, setCheckoutDate] = useState<string>(new Date(Date.now() + 86400000).toLocaleDateString('en-CA'));
  const [invoiceType, setInvoiceType] = useState<'gst' | 'non-gst'>('non-gst');

  // Date Logic
  const adjustDate = (type: 'checkin' | 'checkout', amount: number) => {
    if (type === 'checkin') {
      const d = new Date(checkinDate);
      d.setDate(d.getDate() + amount);
      const newCi = d.toLocaleDateString('en-CA');
      setCheckinDate(newCi);
      
      // Auto-shift checkout to maintain nights
      const currentNights = Math.max(1, Math.ceil((new Date(checkoutDate).getTime() - new Date(checkinDate).getTime()) / (1000 * 60 * 60 * 24)));
      const nextCo = new Date(d);
      nextCo.setDate(nextCo.getDate() + currentNights);
      setCheckoutDate(nextCo.toLocaleDateString('en-CA'));
    } else {
      const d = new Date(checkoutDate);
      d.setDate(d.getDate() + amount);
      const ci = new Date(checkinDate);
      if (d <= ci) return; // Min 1 night
      setCheckoutDate(d.toLocaleDateString('en-CA'));
    }
  };

  const nightsCount = useMemo(() => {
    const start = new Date(checkinDate);
    const end = new Date(checkoutDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkinDate, checkoutDate]);


  // Added: OTA state for Integrated Check-In
  const [ciSource, setCiSource] = useState('walk_in');
  const [ciPlatform, setCiPlatform] = useState('');
  const [ciOtaPayType, setCiOtaPayType] = useState('pay_at_hotel');

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

  // --- NEW: Smart Auto-fill for returning guests ---
  useEffect(() => {
    if (guestMobile.length === 10) {
       fetch(`${API_BASE_URL}/api/content/guests/search?query=${guestMobile}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const guest = data[0];
            setGuestName(guest.name || '');
            setGuestEmail(guest.email || '');
            setCiSource(guest.bookingSource || 'walk_in');
            setCiPlatform(guest.bookingPlatform || '');
            setCiOtaPayType(guest.otaPaymentType || 'pay_at_hotel');
            toast.info(`Returning Guest Identified: ${guest.name.toUpperCase()}`, {
              description: "Manifest records have been automatically synchronized."
            });
          }
        })
        .catch(err => console.error("Smart lookup error:", err));
    }
  }, [guestMobile]);


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
  const getLocalDateStr = (offsetDays = 0) => {
    const d = new Date();
    if (offsetDays) d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  };

  const { data: availabilityMap = { occupied: [], blocked: [] } } = useRoomAvailabilityMap(activeHotelId, getLocalDateStr(), getLocalDateStr(1));

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
      
      const today = new Date().toLocaleDateString('en-CA'); // Robust Local YYYY-MM-DD
      
      const bMap = new Map();
      activeBookings.forEach((b: any) => { 
        if (!b || !b.roomNumber) return;
        
        const bIn = b.checkin.split('T')[0];
        const bOut = b.checkout.split('T')[0];
        
        const isActuallyIn = b.status === 'checked-in';
        const isScheduledForToday = (b.status === 'reserved' || b.status === 'confirmed') && bIn <= today;
        
        if (isActuallyIn || isScheduledForToday) {
          const roomStr = String(b.roomNumber);
          const existing = bMap.get(roomStr);
          if (!existing || b.status === 'checked-in') {
            bMap.set(roomStr, b); 
          }
        }
      });
      
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
          const roomStr = String(num);
          const curBooking = bMap.get(roomStr);
          const manStatus = sMap.get(roomStr);
          const isOcc = !!curBooking || occSet.has(roomStr);
          const isBlk = manStatus?.status === 'Maintenance' || manStatus?.status === 'Blocked' || blkSet.has(roomStr);
          
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

  const subtotal = useMemo(() => (Number(liveSelectedRoom?.price) || 0) * nightsCount, [liveSelectedRoom?.price, nightsCount]);
  const gstValue = useMemo(() => invoiceType === 'gst' ? Math.round(subtotal * 0.05 * 100) / 100 : 0, [subtotal, invoiceType]);
  const finalTotal = subtotal + gstValue;

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
    return <span className="text-black">{time}</span>;
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
  const checkInTotal = finalTotal;
  const isOtaPaidOnline = ciSource === 'ota' && ciOtaPayType === 'paid_online';
  const checkInOffline = Number(offlineAmount) || 0;
  const checkInOnline = Number(onlineAmount) || 0;
  const totalPaidCheckIn = isOtaPaidOnline ? checkInTotal : (checkInOffline + checkInOnline);
  const balanceCheckIn = finalTotal - totalPaidCheckIn;

  useEffect(() => {
    if (ciSource === 'ota' && ciOtaPayType === 'paid_online') {
      setOfflineAmount('0');
      setOnlineAmount('0');
    }
  }, [ciSource, ciOtaPayType]);

  const handleIntegratedWalkIn = async () => {
    if (!liveSelectedRoom || !guestName || !guestMobile) return toast.error("Complete Identity Details");
    
    // Financial Integrity
    if (checkInOffline < 0 || checkInOnline < 0) return toast.error("NEGATIVE PAYMENT REJECTED");
    if (totalPaidCheckIn > finalTotal) return toast.error(`EXCEEDS TOTAL: Max ₹${finalTotal}`);

    setIsSubmitting(true);
    const tid = toast.loading(`Enrolling ${guestName} to Room ${liveSelectedRoom.number}...`);
    
    try {
      const checkin = new Date(checkinDate);
      const checkout = new Date(checkoutDate);

      const bookingData = {
        hotel_id: activeHotelId,
        room_id: liveSelectedRoom.roomId,
        checkin: checkin.toISOString(),
        checkout: checkout.toISOString(),
        roomNumber: liveSelectedRoom.number,
        guests: 1, // Fix: Schema requirement
        totalAmount: finalTotal,
        paidAmount: totalPaidCheckIn,
        offlinePaid: checkInOffline,
        onlinePaid: checkInOnline,
        guestDetails: {
          name: guestName,
          phone: guestMobile,
          email: guestEmail || 'guest@example.com'
        },
        bookingSource: ciSource,
        bookingPlatform: ciPlatform,
        otaPaymentType: ciOtaPayType,
        invoiceType: invoiceType,
        gstAmount: gstValue,
        paymentStatus: ciSource === 'ota' && ciOtaPayType === 'paid_online' ? 'paid' : (totalPaidCheckIn >= finalTotal ? 'paid' : 'partial')
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
        setCiSource('walk_in'); setCiPlatform(''); setCiOtaPayType('pay_at_hotel');
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

        {/* ROOM GRID HUB */}
        <div className="flex-1 w-full space-y-10">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-2 p-1.5 bg-[var(--lux-card)] rounded-2xl border border-white/5 shadow-inner overflow-x-auto no-scrollbar max-w-full">
                  {['All', 'Available', 'Booked', 'Cleaning', 'Dirty'].map((f) => (
                    <button 
                      key={f}
                      type="button"
                      onClick={() => setStatusFilter(f as any)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex-shrink-0 ${statusFilter === f ? 'bg-[var(--lux-gradient-gold)] text-black shadow-[0_8px_20px_rgba(212,175,55,0.25)] scale-105' : 'text-[var(--lux-muted)] hover:bg-white/5 hover:text-white'}`}
                    >
                      {f}
                    </button>
                  ))}
               </div>
               
               <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
                  <div className="relative group flex-1 sm:w-96">
                     <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-all duration-300 z-10" />
                     <input 
                       type="text" placeholder="Search registry or guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full h-14 lux-glass border border-white/10 rounded-[1.25rem] py-4 pl-16 pr-6 text-[13px] font-bold outline-none focus:border-[var(--lux-gold)] focus:ring-4 focus:ring-[var(--lux-gold)]/10 transition-all shadow-2xl placeholder:text-white/20 text-white" 
                     />
                  </div>

                  <div className="flex items-center gap-1.5 p-1.5 bg-[var(--lux-card)] rounded-2xl border border-[var(--lux-border)] shadow-inner">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--lux-soft)] text-[var(--lux-gold)]' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}
                      >
                        <Grid size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('compact')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'compact' ? 'bg-[var(--lux-soft)] text-[var(--lux-gold)]' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}
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
                    'Reserved': 'room-card-booked',
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
                               <span className={`text-[9px] font-black uppercase tracking-widest text-[var(--lux-muted)] leading-none mb-1 ${isActive ? 'text-black' : ''}`}>UNIT REGISTRY</span>
                               <span className={`text-[13px] font-bold leading-none ${isActive ? 'text-black' : 'text-[var(--lux-text)]'}`}>#{room.number}</span>
                            </div>

                            {/* Badge row for OTA */}
                            {room.booking?.bookingSource === 'ota' && (
                              <div className="absolute top-12 right-4 flex flex-col items-end gap-1">
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${isActive ? 'bg-black/20 text-black' : 'bg-[var(--lux-gold)]/20 text-[var(--lux-gold)]'}`}>
                                    {room.booking.bookingPlatform}
                                 </span>
                                 <div className={`w-2 h-2 rounded-full ${room.booking.otaPaymentType === 'paid_online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'}`} title={room.booking.otaPaymentType === 'paid_online' ? 'Paid Online' : 'Pay at Hotel'} />
                              </div>
                            )}

                            {/* Body row: Large Number & Type */}
                            <div className="flex flex-col items-center justify-center -translate-y-2">
                               <h4 className={`text-[46px] font-display font-black leading-none tracking-tighter ${isActive ? 'text-black' : 'text-zinc-900'}`}>{room.number}</h4>
                               <p className={`text-[11px] font-black uppercase tracking-[0.2em] text-[var(--lux-muted)] mt-1 whitespace-nowrap overflow-hidden text-center max-w-full truncate ${isActive ? 'text-black/60' : ''}`}>{room.type}</p>
                            </div>

                            {/* Footer row: Guest Info */}
                            <div className={`pt-3 border-t flex flex-col gap-0.5 ${isActive ? 'border-black/10' : 'border-[var(--lux-border)]'}`}>
                               {room.booking ? (
                                 <div className="flex justify-between items-center gap-2 overflow-hidden">
                                    <div className="flex flex-col min-w-0">
                                       <span className={`text-[13px] font-bold truncate ${isActive ? 'text-black' : 'text-[var(--lux-text)]'}`} title={room.booking.guestDetails?.name}>
                                          {room.booking.guestDetails?.name || 'In-House Client'}
                                       </span>
                                       <span className={`text-[9px] font-black uppercase tracking-widest text-[#6B7280] ${isActive ? 'text-black/40' : ''}`}>
                                          {room.status === 'Booked' ? 'Stay Duration' : (room.status === 'Reserved' ? 'Arrival Today' : 'System Standby')}
                                       </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                       <span className={`text-[10px] font-black ${isActive ? 'text-black/60' : 'text-black'}`}>
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
                            className={`grid-room-box group cursor-pointer ${isActive ? 'ring-2 ring-[var(--lux-gold)] ring-offset-4 ring-offset-black shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-105 z-10' : ''} ${statusStyles[room.status] || 'bg-zinc-900'} relative overflow-hidden bg-[var(--lux-gradient-surface)] border border-white/5`}
                          >
                             {/* Small indicator badges for compact view */}
                             {room.booking?.bookingSource === 'ota' && (
                               <div className="absolute top-1 right-1 flex items-center gap-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${room.booking.otaPaymentType === 'paid_online' ? 'bg-white' : 'bg-yellow-300'}`} />
                               </div>
                             )}

                            {/* Status Dot */}
                            <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_currentColor]`} />
                            
                            <div className="flex flex-col items-center justify-center text-center space-y-1">
                              <span className={`text-3xl font-display font-black leading-none ${room.status === 'Available' ? 'text-zinc-900' : ''}`}>{room.number}</span>
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
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onInvoiceClick(room.booking); }}
                                 className="p-1.5 hover:bg-[var(--lux-gold)] hover:text-black rounded-xl transition-all text-white"
                               >
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
                      <p className="text-[10px] font-black uppercase text-[#A1A1AA] mb-1">Perspective View</p>
                      <h2 className="text-5xl font-display font-bold tracking-tight leading-none text-[var(--lux-text)]">Unit <span className="text-[var(--lux-gold)]">{liveSelectedRoom.number}</span></h2>
                   </div>
                   <button type="button" onClick={() => setSelectedRoom(null)} className="w-14 h-14 bg-[var(--lux-soft)] rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all border border-white/5 shadow-xl text-[var(--lux-text)]">
                      <X size={24} />
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
                               <p className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-text-muted)] pl-2">1. Guest Profile</p>
                               <div className="flex items-center gap-6 p-6 bg-[#121214] border border-[#2A2A2E] rounded-[2.5rem] relative group hover:border-[var(--lux-gold)]/20 transition-all duration-500 shadow-xl">
                                  <div className="w-20 h-20 rounded-2xl bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)] font-display font-bold text-4xl border border-[var(--lux-gold)]/20 shadow-inner">
                                     {financials.status === 'PAID' ? <ShieldCheck size={36} /> : liveSelectedRoom.booking.guestDetails?.name?.[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <h4 className="text-3xl font-black tracking-tighter truncate leading-tight text-[#F5F5F7]">{liveSelectedRoom.booking.guestDetails?.name}</h4>
                                     <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-[0.1em]">{liveSelectedRoom.booking.guestDetails?.phone}</p>
                                        <div className="w-1 h-1 rounded-full bg-[var(--lux-border)]"></div>
                                        <p className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.1em]">Verified Profile</p>
                                     </div>
                                     <div className="flex items-center gap-3 mt-4">
                                      {liveSelectedRoom.booking.guestDetails?.phone && (
                                         <>
                                            <button 
                                               type="button" 
                                               onClick={() => {
                                                  const num = liveSelectedRoom.booking.guestDetails.phone.replace(/\D/g, '');
                                                  window.open(`tel:${num.startsWith('91') ? '+' : ''}${num}`);
                                               }}
                                               className="w-10 h-10 rounded-full bg-[rgba(59,130,246,0.12)] text-[#3B82F6] flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                               title="Call Guest"
                                            >
                                               <Phone size={16} />
                                            </button>
                                            <button 
                                               type="button" 
                                               onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  const guest = liveSelectedRoom.booking.guestDetails;
                                                  const room = liveSelectedRoom;
                                                  const hotel = activeHotel;
                                                  const fin = financials;
                                                  
                                                  const phone = guest.phone.replace(/\D/g, '');
                                                  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
                                                  const guestName = guest.name ? guest.name.charAt(0).toUpperCase() + guest.name.slice(1) : 'Guest';
                                                  const hotelName = hotel?.name || 'Hotel Samrat';

                                                  // Use CodePoints to avoid any encoding-related diamond issues
                                                  const h = String.fromCodePoint(0x1F3E8); // Hotel
                                                  const b = String.fromCodePoint(0x1F4B0); // Money Bag
                                                  const w = String.fromCodePoint(0x26A0) + String.fromCodePoint(0xFE0F); // Warning
                                                  const s = String.fromCodePoint(0x2705); // Success
                                                  const p = String.fromCodePoint(0x1F64F); // Prayer
                                                  const r = String.fromCodePoint(0x20B9); // Rupee

                                                  const messageParts = [
                                                     `*Hello ${guestName},*`,
                                                     `Your booking invoice from *${hotelName}* is ready.`,
                                                     `--------------------------------`,
                                                     `${h} *STAY DETAILS*`,
                                                     `--------------------------------`,
                                                     `*Room:* ${room.number}`,
                                                     `*Check-in:* ${new Date(room.booking.checkin).toLocaleDateString('en-IN')}`,
                                                     `*Check-out:* ${new Date(room.booking.checkout).toLocaleDateString('en-IN')}`,
                                                     `--------------------------------`,
                                                     `${b} *BILLING SUMMARY*`,
                                                     `--------------------------------`,
                                                     `*Total Amount:* ${r}${fin.total}`,
                                                     `*Paid:* ${r}${fin.paid}`,
                                                     fin.balance > 0 ? `*${w} Balance:* ${r}${fin.balance}` : `${s} *Payment Completed*`,
                                                     `\nThank you for choosing us! ${p}`
                                                  ];

                                                  const finalMessage = messageParts.join('\n');
                                                  toast.info("Opening WhatsApp...");
                                                  window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(finalMessage)}`, '_blank');
                                               }}
                                               className="w-10 h-10 rounded-full bg-[rgba(34,197,94,0.12)] text-[#22C55E] flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                               title="Send Invoice via WhatsApp"
                                            >
                                               <MessageCircle size={16} />
                                            </button>
                                         </>
                                      )}
                                      <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl ${financials.status === 'PAID' ? 'bg-green-500 text-white' : 'bg-[var(--lux-gold)] text-black'}`}>
                                         {financials.status}
                                      </div>
                                   </div>
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
                                              <p className="text-[11px] font-black text-white/70 uppercase">₹{item.price}</p>
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
                                    <div className="text-center py-10 rounded-3xl border border-dashed border-[#2A2A2E] bg-[#121214]">
                                       <LayoutGrid size={32} className="mx-auto mb-3 text-[#6B7280]" />
                                       <p className="text-[10px] uppercase font-black tracking-widest text-[#6B7280]">No extra charges recorded</p>
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
                                     className="px-8 bg-[var(--lux-soft)] text-[var(--lux-text)] rounded-xl text-[10px] font-black uppercase hover:bg-[var(--lux-gold)] hover:text-black transition-all border border-[var(--lux-border)]"
                                  >
                                     Add
                                  </button>
                               </form>
                            </section>

                            {/* Settlement Form */}
                            <section className="space-y-6">
                               <p className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA] pl-2">3. Settle Balance</p>
                               <form onSubmit={handleSidebarPayment} className="p-8 bg-[#0F0F10] border border-[#2A2A2E] rounded-[2.5rem] space-y-6 shadow-2xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--lux-gold)]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[var(--lux-gold)]/10 transition-all duration-1000"></div>
                                  
                                  <div className="grid grid-cols-2 gap-6 relative z-10">
                                     <div className="premium-input-container">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] ml-2">Offline / Cash</label>
                                        <input 
                                          type="number" value={cashPayment} onChange={(e) => setCashPayment(e.target.value)}
                                          placeholder="₹0" className="premium-input text-xl text-green-500 font-display" 
                                        />
                                     </div>
                                     <div className="premium-input-container">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] ml-2">Online / UPI</label>
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
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]">Financial History</p>
                                  
                                  <div className="bg-[#121214] rounded-3xl p-6 border border-[#2A2A2E] space-y-4 shadow-xl">
                                     <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-[#A1A1AA]">Room Charges:</span>
                                        <span className="text-[#F5F5F7] font-semibold">₹{financials.total - financials.extrasTotal}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-[#A1A1AA]">Extras Hub:</span>
                                        <span className="text-[#F5F5F7] font-semibold">₹{financials.extrasTotal}</span>
                                     </div>
                                     <div className="h-px bg-white/5 my-2"></div>
                                     <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Gross Invoice</span>
                                        <span className="text-3xl font-display font-bold text-[#D4AF37]">₹{financials.total}</span>
                                     </div>
                                  </div>
                               </div>

                               <div className="space-y-6">
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A1A1AA]">Collection Dashboard</p>
                                  <div className="bg-[#0F0F10] rounded-3xl p-8 border border-[#2A2A2E] space-y-8 relative overflow-hidden group shadow-xl">
                                     <div className="absolute inset-0 bg-gradient-to-br from-[var(--lux-gold)]/[0.02] to-transparent"></div>
                                     
                                     <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-1">
                                           <p className="text-[9px] font-black uppercase text-white/50 tracking-widest">Actual Collected</p>
                                           <h4 className="text-3xl font-display font-bold text-[#22C55E] italic">₹{financials.paid}</h4>
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl ${financials.balance <= 0 ? 'bg-[rgba(34,197,94,0.12)] text-[#22C55E] border border-[rgba(34,197,94,0.25)]' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                           {financials.status}
                                        </div>
                                     </div>

                                     <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/50">
                                           <span>Wallet Health</span>
                                           <span className="text-white font-bold">{financials.paidPercent}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-[#2A2A2E] rounded-full overflow-hidden p-0.5 border border-white/5">
                                           <motion.div 
                                             initial={{ width: 0 }}
                                             animate={{ width: `${financials.paidPercent}%` }}
                                             className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E6C15A] shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-1000" 
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
                                  <button type="button" onClick={() => setShowCheckoutConfirm(true)} className="flex items-center justify-center gap-2 h-14 bg-[var(--lux-soft)] border border-[var(--lux-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--lux-text)] hover:opacity-80 transition-all shadow-sm">
                                     <LogOut size={14} /> Rapid C/O
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => onInvoiceClick(liveSelectedRoom.booking)}
                                    className="flex items-center justify-center gap-2 h-14 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--lux-text)] hover:opacity-80 transition-all shadow-sm"
                                  >
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
                                   className="w-full h-16 bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] hover:scale-[1.02] transition-all shadow-[0_8px_25px_rgba(34,197,94,0.25)] active:scale-95"
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
                              <span className="text-[10px] font-bold text-[var(--lux-muted)] uppercase italic">Required for ledger</span>
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

                        {/* Sidebar OTA Selection */}
                        <section className="space-y-8">
                           <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--lux-gold)]">2. Booking Source</h4>
                           </div>
                           <div className="flex p-1 bg-black/5 dark:bg-black/20 rounded-xl border border-[var(--lux-border)]">
                              {[{id: 'walk_in', label: 'Walk-in'}, {id: 'ota', label: 'Online Platform'}].map(s => (
                                <button key={s.id} type="button" onClick={() => setCiSource(s.id)} className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${ciSource === s.id ? 'bg-[var(--lux-gold)] text-black shadow-lg' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}>
                                  {s.label}
                                </button>
                              ))}
                           </div>
                           
                           {ciSource === 'ota' && (
                             <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <select 
                                  value={ciPlatform} onChange={(e) => setCiPlatform(e.target.value)}
                                  className="w-full h-12 bg-black/5 dark:bg-black/20 border border-[var(--lux-border)] rounded-xl px-4 text-[11px] font-bold text-[var(--lux-text)] outline-none focus:border-[var(--lux-gold)] shadow-inner"
                                >
                                   <option value="" className="bg-[var(--lux-card)] text-[var(--lux-text)]">Select Platform Partner</option>
                                   {['OYO', 'GoMMT', 'Booking.com', 'Agoda', 'Trivago'].map(p => <option key={p} value={p} className="bg-[var(--lux-card)] text-[var(--lux-text)]">{p}</option>)}
                                </select>
                                <div className="flex gap-2">
                                   {[{id: 'paid_online', label: 'Fully Paid Online'}, {id: 'pay_at_hotel', label: 'Pay at Hotel'}].map(pt => (
                                     <button key={pt.id} type="button" onClick={() => setCiOtaPayType(pt.id)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${ciOtaPayType === pt.id ? 'border-[var(--lux-gold)] text-[var(--lux-gold)] bg-[var(--lux-gold)]/10 shadow-sm' : 'border-[var(--lux-border)] text-[var(--lux-muted)] hover:border-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}>
                                       {pt.label}
                                     </button>
                                   ))}
                                </div>
                             </div>
                           )}
                        </section>

                        <section className="space-y-8">
                           <div className="flex items-center justify-between border-b border-white/5 pb-4">
                              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--lux-gold)]">3. Payment Settlement</h4>
                           </div>

                           {ciSource === 'ota' && ciOtaPayType === 'paid_online' ? (
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-green-500/10 border border-green-500/20 rounded-3xl flex flex-col items-center text-center space-y-3">
                                  <CheckCircle className="text-green-500" size={32} />
                                  <div className="space-y-1">
                                    <p className="text-[12px] font-black uppercase tracking-widest text-green-500">Authorized via {ciPlatform || 'OTA'}</p>
                                    <p className="text-[9px] font-bold opacity-60">Settlement is fully secured. No manual cash/UPI collection needed.</p>
                                  </div>
                               </motion.div>
                            ) : (
                               <div className="space-y-6">
                                  <div className="segmented-control">
                                     {['UPI', 'CASH', 'PARTIAL', 'Pay Later'].map((m) => (
                                        <button 
                                           key={m} 
                                           type="button"
                                           onClick={() => {
                                              setPaymentMethod(m);
                                              if (m === 'Pay Later') { setOfflineAmount(''); setOnlineAmount(''); }
                                           }}
                                           className={`segmented-item ${paymentMethod === m ? 'bg-[var(--lux-gold)] text-black shadow-lg scale-[1.02]' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}
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
                               </div>
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
                                  
                                  {/* Date Controls */}
                                  <div className="pt-2 border-t border-white/5 space-y-3">
                                     <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                           <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Check-in</span>
                                           <p className="text-[10px] font-bold">{new Date(checkinDate).toDateString()}</p>
                                        </div>
                                        <div className="flex gap-1">
                                           <button type="button" onClick={() => adjustDate('checkin', -1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-[10px] font-bold">-1</button>
                                           <button type="button" onClick={() => adjustDate('checkin', 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-[10px] font-bold">+1</button>
                                        </div>
                                     </div>
                                     <div className="flex justify-between items-center">
                                        <div className="space-y-0.5">
                                           <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Check-out</span>
                                           <p className="text-[10px] font-bold">{new Date(checkoutDate).toDateString()}</p>
                                        </div>
                                        <div className="flex gap-1">
                                           <button type="button" onClick={() => adjustDate('checkout', -1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-[10px] font-bold">-1</button>
                                           <button type="button" onClick={() => adjustDate('checkout', 1)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-[10px] font-bold">+1</button>
                                        </div>
                                     </div>
                                  </div>

                                  <div className="flex justify-between items-center text-sm font-bold">
                                     <span className="opacity-40">Nights:</span>
                                     <span className="text-[var(--lux-gold)] font-black">{nightsCount}N</span>
                                  </div>
                                  
                                  <div className="h-px bg-white/5 my-2"></div>
                                  
                                  {/* Invoice Selector */}
                                  <div className="space-y-2">
                                     <div className="flex p-1 bg-black/40 rounded-xl border border-white/10">
                                        <button 
                                          type="button" onClick={() => setInvoiceType('non-gst')}
                                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${invoiceType === 'non-gst' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                                        >
                                           Non-GST
                                        </button>
                                        <button 
                                          type="button" onClick={() => setInvoiceType('gst')}
                                          className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${invoiceType === 'gst' ? 'bg-[#D4AF37] text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                                        >
                                           GST (5%)
                                        </button>
                                     </div>
                                  </div>

                                  <div className="flex flex-col gap-1 pt-2">
                                     {invoiceType === 'gst' && (
                                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                                          <div className="flex justify-between items-center text-[10px] font-bold opacity-60">
                                             <span>Subtotal:</span>
                                             <span>₹{subtotal}</span>
                                          </div>
                                          <div className="flex justify-between items-center text-[10px] font-bold text-[var(--lux-gold)]">
                                             <span>GST (5%):</span>
                                             <span>₹{gstValue}</span>
                                          </div>
                                       </motion.div>
                                     )}
                                     <div className="flex justify-between items-end">
                                        <div>
                                           <p className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-gold)] leading-none">Gross Total</p>
                                           <h2 className="text-4xl font-display font-black tracking-tighter mt-1">₹{finalTotal}</h2>
                                        </div>
                                     </div>
                                  </div>
                              </div>
                           </div>

                            <div className="space-y-6">
                               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)]">Payment Status</p>
                               <div className="bg-[#161616] rounded-3xl p-6 border border-[#222] space-y-6 shadow-xl">
                                  <div className="flex justify-between items-start">
                                     <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-widest">Total Paid</p>
                                        <h4 className="text-3xl font-display font-bold text-green-400 italic">₹{totalPaidCheckIn}</h4>
                                     </div>
                                     <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${balanceCheckIn <= 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : balanceCheckIn === finalTotal ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                        {balanceCheckIn <= 0 ? 'PAID' : balanceCheckIn === finalTotal ? 'UNPAID' : 'PARTIAL'}
                                     </div>
                                  </div>

                                  <div className="space-y-3">
                                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--lux-muted)]">
                                        <span>Settlement Progress</span>
                                        <span className="text-[var(--lux-text)] font-bold">{Math.min(100, Math.round((totalPaidCheckIn / (finalTotal || 1)) * 100))}%</span>
                                     </div>
                                     <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${Math.min(100, (totalPaidCheckIn / (finalTotal || 1)) * 100)}%` }}
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
                  <button type="button" onClick={() => setShowCheckoutConfirm(false)} className="py-5 bg-[var(--lux-soft)] text-[var(--lux-text)] rounded-2xl text-[10px] font-black uppercase border border-[var(--lux-border)]">Cancel</button>
               </div>
            </motion.div>
         </div>
      )}


    </div>
  );
};
