import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hotel, User, Phone, Mail, Camera, CheckCircle, 
  Grid, Sparkles, Loader2, LogIn, ShieldCheck, 
  Search, Filter, Clock, DoorOpen, Key, FileText,
  TrendingUp, Calendar, ArrowRight, UserPlus, LogOut, Brush, Plus,
  LayoutDashboard, Bed, Users, CreditCard, BarChart3, Settings, 
  Sun, Moon, ChevronRight, Menu, Bell, FileDown, Eye, Edit, Trash2, 
  DollarSign, MoreHorizontal, Info, MapPin, LayoutGrid, Map, Smartphone
} from 'lucide-react';
import { useHotelsList } from './hooks/useContent';
import { useActiveBookings } from './hooks/useBookings';
import { ImageUpload } from './components/ui/ImageUpload';
import { API_BASE_URL } from './config/api';
import { toast, Toaster } from 'sonner';

// --- GLOBAL THEME & NAV ---

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reception', label: 'Reception Console', icon: DoorOpen },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'rooms', label: 'Rooms Management', icon: Bed },
];

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }: { activeTab: string, setActiveTab: (id: string) => void, isOpen: boolean, setIsOpen: (o: boolean) => void }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 bottom-0 w-[280px] bg-[var(--lux-card)] border-r border-[var(--lux-border)] z-[101] flex flex-col p-8 transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-4 mb-14 pl-2">
           <div className="w-12 h-12 bg-gradient-to-br from-[var(--lux-gold)] to-[#FFD700] rounded-2xl flex items-center justify-center text-black shadow-xl shadow-[var(--lux-gold)]/20 font-display font-black text-2xl">B</div>
           <div>
              <h2 className="text-xl font-display font-bold leading-none">Console <span className="text-[var(--lux-gold)] font-serif italic">Bhagat</span></h2>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--lux-muted)] mt-1">Enterprise Solution</p>
           </div>
        </div>

        <nav className="flex-1 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-[var(--lux-gold)] text-black shadow-lg shadow-[var(--lux-gold)]/10' : 'text-[var(--lux-muted)] hover:bg-[var(--lux-bg)] hover:text-[var(--lux-text)]'}`}
              >
                <Icon size={20} className={isActive ? 'text-black' : 'group-hover:text-[var(--lux-gold)] transition-colors'} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black"></div>}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] relative overflow-hidden group cursor-pointer hover:border-[var(--lux-gold)]/20 transition-all">
           <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--lux-gold)]/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[var(--lux-gold)]/10 border border-[var(--lux-gold)]/20 flex items-center justify-center text-[var(--lux-gold)] font-bold">A</div>
              <div>
                 <p className="text-[10px] font-bold uppercase tracking-tight">Admin Profile</p>
                 <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest leading-none">Premium Plan</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
           </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ theme, setTheme, onMenuClick, bookedCount = 12, arrivalsCount = 5 }: { theme: string, setTheme: (t: string) => void, onMenuClick: () => void, bookedCount?: number, arrivalsCount?: number }) => {
  return (
    <header className="sticky top-0 z-40 h-[70px] flex items-center justify-between px-3 md:px-8 bg-[var(--lux-bg)]/80 backdrop-blur-xl border-b border-[var(--lux-border)]">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden hover:bg-[var(--lux-glass)] rounded-xl transition-all"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-[var(--lux-gold)] rounded-xl flex items-center justify-center lg:hidden shadow-lg shadow-[var(--lux-gold)]/20">
              <Hotel size={16} className="text-black" />
           </div>
           <div className="flex flex-col lg:hidden">
              <span className="text-sm font-display font-bold leading-none">Console</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Bhagat</span>
           </div>
           <div className="hidden lg:flex items-center gap-3 text-[var(--lux-muted)] text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="hover:text-[var(--lux-gold)] transition-colors cursor-pointer">Home</span>
            <ChevronRight size={12} className="opacity-20" />
            <span className="text-[var(--lux-gold)] shadow-[0_0_10px_rgba(212,175,55,0.2)]">Console</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Online</span>
          </div>
          <div className="w-px h-6 bg-[var(--lux-border)]" />
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black uppercase opacity-40 leading-none tracking-widest mb-1">Booked</span>
               <span className="text-sm font-display font-bold leading-none">{bookedCount.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="text-[8px] font-black uppercase opacity-40 leading-none tracking-widest mb-1">Arrivals</span>
               <span className="text-sm font-display font-bold leading-none">{arrivalsCount.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center bg-[var(--lux-glass)] rounded-xl border border-[var(--lux-border)] hover:border-[var(--lux-gold)]/40 transition-all relative group shadow-sm">
            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--lux-gold)] rounded-full border-2 border-[var(--lux-bg)]" />
          </button>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 flex items-center justify-center bg-[var(--lux-glass)] rounded-xl border border-[var(--lux-border)] hover:border-[var(--lux-gold)]/40 transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

const BottomActionBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-[var(--lux-bg)]/90 backdrop-blur-xl border-t border-[var(--lux-border)] z-50 flex items-center justify-around px-4 lg:hidden">
       <button className="flex flex-col items-center gap-1 text-[var(--lux-gold)] active:scale-95 transition-all">
          <div className="w-10 h-10 bg-[var(--lux-gold)]/10 rounded-xl flex items-center justify-center">
             <Plus size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Check-in</span>
       </button>
       <button className="flex flex-col items-center gap-1 text-[var(--lux-muted)] active:scale-95 transition-all">
          <div className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center">
             <LogOut size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Check-out</span>
       </button>
       <button className="flex flex-col items-center gap-1 text-[var(--lux-muted)] active:scale-95 transition-all">
          <div className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center">
             <Brush size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Clean</span>
       </button>
       <button className="flex flex-col items-center gap-1 text-[var(--lux-muted)] active:scale-95 transition-all">
          <div className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center">
             <Settings size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Tools</span>
       </button>
    </div>
  );
};

const queryClient = new QueryClient();

// --- ENTERPRISE HOOKS ---

export const useRoomStatus = (hotelId: string) => {
    return useQuery({
        queryKey: ['room-status', hotelId],
        queryFn: async () => {
            if (!hotelId) return [];
            const res = await fetch(`${API_BASE_URL}/api/content/room-status/${hotelId}`);
            return res.json();
        },
        enabled: !!hotelId,
        refetchInterval: 10000
    });
};

export const useRoomAvailabilityMap = (hotelId: string, checkin: string, checkout: string) => {
    return useQuery({
        queryKey: ['availability', hotelId, checkin, checkout],
        queryFn: async () => {
            if (!hotelId || !checkin || !checkout) return { allUnavailable: [] };
            const res = await fetch(`${API_BASE_URL}/api/content/rooms/availability?hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}`);
            return res.json();
        },
        enabled: !!hotelId && !!checkin && !!checkout
    });
};

export const useGuestSearch = (query: string) => {
    return useQuery({
        queryKey: ['guests', query],
        queryFn: async () => {
            if (query.length < 3) return [];
            const res = await fetch(`${API_BASE_URL}/api/content/guests/search?query=${query}`);
            return res.json();
        },
        enabled: query.length >= 3
    });
};

// --- KYC DOCUMENT UPLOADER ---

const DocumentUploader = ({ label, value, onChange, placeholder = "Upload Document" }: { label: string, value: string, onChange: (url: string) => void, placeholder?: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/content/upload/guest-document`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
        toast.success(`${label} uploaded successfully`);
      } else throw new Error(data.message);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">{label}</label>
      <div className="relative h-24 bg-[var(--lux-bg)] border border-dashed border-[var(--lux-border)] rounded-2xl flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-[var(--lux-gold)]/40">
        {value ? (
          <div className="absolute inset-0 z-10">
            <img src={value} alt={label} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
          </div>
        ) : (
          <>
            {uploading ? <Loader2 className="animate-spin text-[var(--lux-gold)]" size={20} /> : <Plus size={20} className="text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)]" />}
            <span className="text-[8px] font-bold uppercase tracking-widest mt-2">{uploading ? 'Uploading...' : placeholder}</span>
            <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </>
        )}
      </div>
    </div>
  );
};

// --- ADMINISTRATIVE ACTIONS ---

const BookingActionsMenu = ({ booking, onAction, onViewDetails, onEdit, onDownload }: { booking: any, onAction: () => void, onViewDetails?: () => void, onEdit?: () => void, onDownload?: () => void }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const performAction = async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        toast.success(`${action.replace('-', ' ').toUpperCase()} SUCCESSFUL`);
        onAction();
      } else throw new Error("Action failed");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col w-full py-2 bg-[var(--lux-card)] rounded-xl border border-[var(--lux-border)] shadow-2xl overflow-hidden min-w-[200px]">
      <button onClick={onViewDetails} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all group text-left border-b border-white/5">
         <Eye size={18} className="text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)]" />
         <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
      </button>

      <button onClick={onEdit} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all group text-left border-b border-white/5">
         <Edit size={18} className="text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)]" />
         <span className="text-[10px] font-black uppercase tracking-widest">Edit Records</span>
      </button>

      <button onClick={onDownload} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all group text-left border-b border-white/5">
         <FileDown size={18} className="text-[var(--lux-muted)] group-hover:text-blue-500" />
         <span className="text-[10px] font-black uppercase tracking-widest text-[#E0E0E0]">Download Invoice</span>
      </button>

      <div className="my-2 border-t border-[var(--lux-border)] opacity-20" />

      {booking.balanceAmount > 0 && (
        <button 
          onClick={() => performAction('mark-paid')}
          disabled={!!loading}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-green-500/5 transition-all group text-left"
        >
          {loading === 'mark-paid' ? <Loader2 size={18} className="animate-spin text-green-500" /> : <CheckCircle size={18} className="text-green-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Mark as Paid</span>
        </button>
      )}

      {booking.status === 'confirmed' && (
        <button 
          onClick={() => performAction('checkout')}
          disabled={!!loading}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-orange-500/5 transition-all group text-left"
        >
          {loading === 'checkout' ? <Loader2 size={18} className="animate-spin text-orange-500" /> : <CheckCircle size={18} className="text-orange-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Force Checkout</span>
        </button>
      )}

      {(booking.status === 'confirmed' || booking.status === 'pending') && (
        <button 
          onClick={() => performAction('cancel')}
          disabled={!!loading}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-red-500/5 transition-all group text-left"
        >
          {loading === 'cancel' ? <Loader2 size={18} className="animate-spin text-red-500" /> : <ShieldCheck size={18} className="text-red-500" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Cancel Booking</span>
        </button>
      )}
    </div>
  );
};

// --- COMPONENTS ---

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === 'admin123') {
        onLogin();
        toast.success("Identity Verified. Welcome to Console Bhagat.");
      } else {
        toast.error("Invalid access code");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--lux-bg)] overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,var(--lux-gold),transparent_40%)] opacity-10"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[3rem] p-12 shadow-2xl relative z-10 lux-glow"
      >
        <div className="w-24 h-24 bg-[var(--lux-gold)]/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-[var(--lux-gold)]/10">
          <ShieldCheck size={48} className="text-[var(--lux-gold)]" />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold mb-3 tracking-tight">Console <span className="text-[var(--lux-gold)]">Bhagat</span></h1>
          <p className="text-[var(--lux-muted)] text-[10px] font-black uppercase tracking-[0.4em]">AUTHENTICATION REQUIRED</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-4">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--lux-bg)] border border-[var(--lux-border)] p-6 rounded-2xl outline-none focus:border-[var(--lux-gold)]/50 transition-all text-center text-3xl tracking-[0.6em] text-[var(--lux-gold)] shadow-inner"
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-[var(--lux-gold)] text-black font-bold py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-[var(--lux-gold)] hover:scale-[1.02] transition-all transform active:scale-95 disabled:opacity-50 shadow-xl shadow-[var(--lux-gold)]/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> AUTHORIZE ACCESS</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// --- ENTERPRISE COMPONENTS ---

const RoomDetailsDrawer = ({ 
  room, isOpen, onClose, onStatusUpdate,
  formData, setFormData, handleAssign, isSubmitting, showGuestResults, setShowGuestResults, guestsList
}: { 
  room: any, isOpen: boolean, onClose: () => void, onStatusUpdate: (status: string) => void,
  formData: any, setFormData: (d: any) => void, handleAssign: (e: any) => void, isSubmitting: boolean,
  showGuestResults: boolean, setShowGuestResults: (s: boolean) => void, guestsList: any[]
}) => {
  if (!room) return null;
  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-full md:max-w-md h-full bg-[var(--lux-card)] border-l border-[var(--lux-border)] z-[200] shadow-2xl overflow-y-auto p-6 md:p-12 pb-32"
    >
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl md:text-5xl font-display font-bold">Room <span className="text-[var(--lux-gold)]">{room.number}</span></h2>
        <button onClick={onClose} className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm border border-[var(--lux-border)]">
           <ArrowRight size={18} />
        </button>
      </div>

      <div className="space-y-8">
        <div className="p-6 md:p-10 bg-[var(--lux-bg)] rounded-2xl border border-[var(--lux-border)] space-y-4 shadow-inner">
           <div className="flex justify-between items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Category</span>
              <span className="text-[var(--lux-gold)] font-bold text-[10px] uppercase tracking-widest">{room.type}</span>
           </div>
           <div className="flex justify-between items-center text-2xl font-bold font-display leading-none">
              <span>₹{room.price}</span>
              <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${room.status === 'Available' ? 'bg-green-500/10 text-green-500' : room.status === 'Booked' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                 {room.status}
              </div>
           </div>
        </div>

        {room.status === 'Available' ? (
           <div className="space-y-4 bg-[var(--lux-glass)] p-6 rounded-2xl border border-[var(--lux-border)]">
              <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--lux-gold)] mb-2">Internal Check-in</h3>
              <form onSubmit={handleAssign} className="space-y-4">
                <div className="relative group">
                   <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)]" size={14} />
                   <input required type="text" placeholder="Full Name..." value={formData.name} 
                      onChange={e => { setFormData({...formData, name: e.target.value}); setShowGuestResults(true); }}
                      onBlur={() => setTimeout(() => setShowGuestResults(false), 200)}
                      className="w-full bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-xl py-3 pl-10 pr-4 text-xs focus:border-[var(--lux-gold)] outline-none" 
                   />
                   {showGuestResults && guestsList.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-xl shadow-2xl z-50 overflow-hidden">
                        {guestsList.slice(0, 3).map((g: any) => (
                          <button key={g._id} type="button" onClick={() => { setFormData({ ...formData, name: g.name, phone: g.phone, email: g.email || '' }); setShowGuestResults(false); }}
                            className="w-full text-left p-3 hover:bg-[var(--lux-gold)]/10 transition-colors border-b border-[var(--lux-border)] last:border-0"
                          >
                             <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold">{g.name}</p>
                             </div>
                          </button>
                        ))}
                      </div>
                   )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <input required type="tel" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-xl py-3 px-4 text-[10px] font-bold focus:border-[var(--lux-gold)] outline-none" />
                   <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-xl py-3 px-4 text-[10px] font-bold focus:border-[var(--lux-gold)] outline-none" />
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/5">
                   <span className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest">Total (Inc. Tax)</span>
                   <span className="text-xl font-bold text-[var(--lux-gold)]">₹{(room.price * 1.12).toFixed(0)}</span>
                </div>
                <button disabled={isSubmitting} className="w-full bg-[var(--lux-gold)] text-black py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[var(--lux-gold)]/10">
                  {isSubmitting ? 'Processing...' : 'Confirm Check-in'}
                </button>
              </form>
           </div>
        ) : (
          <div className="space-y-4">
             <h3 className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">Administrative Actions</h3>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onStatusUpdate('Cleaning')} className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl font-bold text-[10px] active:scale-95 transition-all flex flex-col items-center gap-2">
                   <Brush size={16} /> Mark Cleaning
                </button>
                <button onClick={() => onStatusUpdate('Maintenance')} className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl font-bold text-[10px] active:scale-95 transition-all flex flex-col items-center gap-2">
                   <ShieldCheck size={16} /> Maintenance
                </button>
                <button onClick={() => onStatusUpdate('Available')} className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold text-[10px] active:scale-95 transition-all flex flex-col items-center gap-2 col-span-2">
                   <CheckCircle size={16} /> Mark Available for Booking
                </button>
             </div>
          </div>
        )}

        {room.guestData && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5">
             <h3 className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">Current Occupant</h3>
             <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--lux-gold)]/20 flex items-center justify-center text-[var(--lux-gold)] font-bold">
                    {room.guestData.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{room.guestData.name}</h4>
                    <p className="text-[10px] text-[var(--lux-muted)] font-black uppercase tracking-widest">{room.guestData.phone}</p>
                  </div>
                </div>
             </div>
          </div>
        )}

        <div className="space-y-4">
           <h3 className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">Room Amenities</h3>
           <div className="flex flex-wrap gap-2">
              {['Ultra-WiFi', 'King Size Bed', 'Smart TV', 'Mini Bar', 'River View'].map(a => (
                <span key={a} className="px-3 py-1.5 bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-lg text-[10px] font-bold text-[var(--lux-muted)]">{a}</span>
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const BookingDetailsDrawer = ({ booking, isOpen, onClose }: { booking: any, isOpen: boolean, onClose: () => void }) => {
  if (!booking) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-[var(--lux-card)] border-l border-[var(--lux-border)] z-[201] p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-display font-bold">Booking <span className="text-[var(--lux-gold)]">Details</span></h2>
              <button onClick={onClose} className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="space-y-8">
              {/* Guest Segment */}
              <div className="p-6 bg-[var(--lux-bg)] rounded-3xl border border-[var(--lux-border)]">
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] mb-4">Guest Information</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)] font-bold text-xl">
                    {booking.guestDetails?.name?.[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">{booking.guestDetails?.name}</h4>
                    <p className="text-xs text-[var(--lux-muted)] font-medium">{booking.guestDetails?.phone}</p>
                    <p className="text-[10px] text-[var(--lux-muted)] mt-1">{booking.guestDetails?.email || 'No email provided'}</p>
                  </div>
                </div>
              </div>

              {/* KYC Segment */}
              {(booking.guestDetails?.photo || booking.guestDetails?.aadharFront) && (
                <div className="p-6 bg-[var(--lux-card)] rounded-3xl border border-[var(--lux-border)] space-y-4">
                  <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] mb-2">Verified KYC Documents</p>
                  <div className="grid grid-cols-2 gap-3">
                    {booking.guestDetails.photo && (
                      <div className="space-y-1">
                        <p className="text-[7px] font-black uppercase text-[var(--lux-muted)] ml-1">Guest Photo</p>
                        <img src={booking.guestDetails.photo} alt="KYC" className="w-full h-24 object-cover rounded-xl border border-[var(--lux-border)] shadow-md" />
                      </div>
                    )}
                    {booking.guestDetails.aadharFront && (
                      <div className="space-y-1">
                        <p className="text-[7px] font-black uppercase text-[var(--lux-muted)] ml-1">Aadhar Front</p>
                        <img src={booking.guestDetails.aadharFront} alt="Aadhar" className="w-full h-24 object-cover rounded-xl border border-[var(--lux-border)] shadow-md" />
                      </div>
                    )}
                    {booking.guestDetails.aadharBack && (
                      <div className="space-y-1">
                        <p className="text-[7px] font-black uppercase text-[var(--lux-muted)] ml-1">Aadhar Back</p>
                        <img src={booking.guestDetails.aadharBack} alt="Aadhar Back" className="w-full h-24 object-cover rounded-xl border border-[var(--lux-border)] shadow-md" />
                      </div>
                    )}
                    {booking.guestDetails.otherDoc && (
                      <div className="space-y-1">
                        <p className="text-[7px] font-black uppercase text-[var(--lux-muted)] ml-1">Other Doc</p>
                        <img src={booking.guestDetails.otherDoc} alt="Document" className="w-full h-24 object-cover rounded-xl border border-[var(--lux-border)] shadow-md" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stay Segment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-[var(--lux-glass)] rounded-2xl border border-[var(--lux-border)]">
                  <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] mb-1">Check-in</p>
                  <p className="text-sm font-bold">{new Date(booking.checkin).toDateString()}</p>
                </div>
                <div className="p-5 bg-[var(--lux-glass)] rounded-2xl border border-[var(--lux-border)] text-right">
                  <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] mb-1">Check-out</p>
                  <p className="text-sm font-bold">{new Date(booking.checkout).toDateString()}</p>
                </div>
              </div>

              {/* Financial Segment */}
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-[10px] uppercase font-black text-[var(--lux-muted)]">Total Amount</span>
                  <span className="text-lg font-bold">₹{booking.totalAmount}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--lux-muted)]">Paid Amount</span>
                    <span className="text-green-500 font-bold">₹{booking.paidAmount}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--lux-muted)]">Balance Due</span>
                    <span className="text-red-500 font-bold">₹{booking.balanceAmount}</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--lux-gold)]/10">Settle Balance</button>
              </div>

              {/* Internal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-[var(--lux-bg)] rounded-xl border border-[var(--lux-border)]">
                  <Info size={14} className="text-[var(--lux-gold)]" />
                  <p className="text-[10px] font-bold text-[var(--lux-muted)] uppercase tracking-tight">Booking Ref: {booking._id}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


const InvoiceView = ({ booking, hotel }: { booking: any, hotel: any }) => {
  if (!booking) return null;
  const tax = booking.taxAmount || booking.totalAmount * 0.12;
  const total = booking.totalAmount + (booking.taxAmount ? 0 : tax);
  return (
    <div className="p-10 bg-white text-black rounded-[40px] max-w-2xl mx-auto shadow-2xl font-serif">
       <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
          <div>
             <h2 className="text-4xl font-bold tracking-tighter uppercase italic">BHAGAT GROUP</h2>
             <p className="text-xs font-bold font-sans uppercase tracking-widest opacity-60">Hospitality Reimagined</p>
          </div>
          <div className="text-right font-sans">
             <p className="font-black text-sm uppercase">Invoice</p>
             <p className="text-xs opacity-60">#INV-{booking._id?.slice(-6).toUpperCase()}</p>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-10 mb-10 font-sans">
          <div>
             <p className="text-[10px] font-black uppercase opacity-40 mb-2">Guest Selection</p>
             <p className="font-bold text-lg">{booking.guestDetails?.name}</p>
             <p className="text-sm">{booking.guestDetails?.phone}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase opacity-40 mb-2">Property</p>
             <p className="font-bold">{hotel?.name}</p>
             <p className="text-sm">{hotel?.location}</p>
          </div>
       </div>

       <table className="w-full font-sans mb-10 text-sm">
          <thead className="border-b border-black/10">
             <tr className="text-left text-[10px] font-black uppercase opacity-40">
                <th className="py-4">Description</th>
                <th className="py-4 text-right">Amount</th>
             </tr>
          </thead>
          <tbody>
             <tr className="border-b border-black/5">
                <td className="py-6">Room Booking (Base Rate)</td>
                <td className="py-6 text-right font-bold">₹{booking.totalAmount - (booking.taxAmount || (booking.totalAmount * 0.12 / 1.12))}</td>
             </tr>
             <tr>
                <td className="py-6">GST (12% CGST/SGST)</td>
                <td className="py-6 text-right font-bold">₹{tax.toFixed(2)}</td>
             </tr>
          </tbody>
          <tfoot className="border-t-2 border-black">
             <tr className="text-xl font-bold">
                <td className="py-6">Grand Total</td>
                <td className="py-6 text-right font-display text-4xl">₹{total.toFixed(0)}</td>
             </tr>
          </tfoot>
       </table>

       <div className="p-6 bg-black text-white rounded-2xl text-center font-sans">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1">Payment Status</p>
          <p className="text-sm font-bold uppercase tracking-widest">{booking.paymentStatus || 'PENDING'}</p>
       </div>
    </div>
  );
};
const BookingReportView = ({ bookings, title, hotel }: { bookings: any[], title: string, hotel: any }) => {
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="p-12 bg-white text-black min-h-screen font-sans print:p-0">
      {/* Report Header */}
      <div className="border-b-4 border-black pb-8 mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none mb-2">BHAGAT GROUP</h1>
          <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">Hospitality Enterprise Records</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-tight">{title}</h2>
          <p className="text-xs opacity-60">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Booking Entries */}
      <div className="space-y-20">
        {bookings.map((b, idx) => (
          <div key={b._id} className="border-t border-gray-200 pt-12 break-inside-avoid">
            <div className="flex justify-between items-start mb-8">
               <div className="flex items-center gap-6">
                  <span className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">{idx + 1}</span>
                  <div>
                    <h3 className="text-2xl font-bold leading-none">{b.guestDetails?.name}</h3>
                    <p className="text-sm opacity-60">{b.guestDetails?.phone} • {b.guestDetails?.email || 'No Email'}</p>
                  </div>
               </div>
               <div className="text-right">
                  <span className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold uppercase tracking-widest">{b.status}</span>
                  <p className="text-[10px] mt-2 font-black uppercase opacity-40">Ref: {b._id?.slice(-8).toUpperCase()}</p>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-10 mb-10">
               <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">Stay Breakdown</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] uppercase opacity-40">
                        <th className="text-left font-black py-2">Property Details</th>
                        <th className="text-center font-black py-2">Check-in</th>
                        <th className="text-center font-black py-2">Check-out</th>
                        <th className="text-right font-black py-2">Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-4 font-bold">{b.roomNumber || 'TBD'} • {b.room_id?.slice(0, 8)}</td>
                        <td className="py-4 text-center">{new Date(b.checkin).toLocaleDateString()}</td>
                        <td className="py-4 text-center">{new Date(b.checkout).toLocaleDateString()}</td>
                        <td className="py-4 text-right font-bold">{b.guests || 1}</td>
                      </tr>
                    </tbody>
                  </table>
               </div>
               <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-black">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">Financial Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Total Bill</span><span className="font-bold">₹{b.totalAmount}</span></div>
                    <div className="flex justify-between text-sm"><span>Paid</span><span className="text-green-600 font-bold">₹{b.paidAmount}</span></div>
                    <div className="flex justify-between text-lg pt-2 border-t border-gray-200 mt-2 font-black"><span>Balance</span><span>₹{b.balanceAmount}</span></div>
                  </div>
               </div>
            </div>

            {/* KYC Documents */}
            <div className="bg-gray-50 p-8 rounded-[2rem] border-2 border-dashed border-gray-200">
               <p className="text-[10px] font-black uppercase opacity-40 mb-6 tracking-widest text-center">Verified KYC Documents Information</p>
               <div className="grid grid-cols-4 gap-6 h-40">
                  {['photo', 'aadharFront', 'aadharBack', 'otherDoc'].map(key => (
                    <div key={key} className="relative bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col items-center justify-center p-2">
                      {b.guestDetails?.[key] ? (
                        <img src={b.guestDetails[key]} alt={key} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center opacity-10">
                           <div className="w-8 h-8 rounded-full border-2 border-black" />
                           <span className="text-[8px] font-black uppercase mt-1">Missing</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[6px] font-black uppercase py-1 text-center backdrop-blur-sm">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 border-t-2 border-black pt-10 text-center text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">
        End of Bhagat Enterprise Report
      </div>
    </div>
  );
};

// --- SCHEDULE COMPONENT ---

const ReceptionSchedule = ({ bookings, activeHotel }: { bookings: any[], activeHotel: any }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  
  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return bookings.filter(b => {
      const bDate = new Date(b.checkin);
      bDate.setHours(0,0,0,0);
      if (activeTab === 'today') return bDate.getTime() === today.getTime();
      return bDate.getTime() === tomorrow.getTime();
    });
  };

  const dashboardBookings = getFilteredBookings();

  return (
    <div className="bg-[var(--lux-card)] p-6 rounded-xl border border-[var(--lux-border)] space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-1.5 p-1 bg-[var(--lux-glass)] rounded-xl border border-[var(--lux-border)]">
          <button 
            onClick={() => setActiveTab('today')}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${activeTab === 'today' ? 'bg-[var(--lux-gold)] text-black shadow-sm' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)] hover:bg-white/5'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setActiveTab('tomorrow')}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${activeTab === 'tomorrow' ? 'bg-[var(--lux-gold)] text-black shadow-sm' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)] hover:bg-white/5'}`}
          >
            Tomorrow
          </button>
        </div>
        <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest">
           {dashboardBookings.length} ARRIVALS SCHEDULED
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardBookings.map((b: any) => (
          <div key={b._id} className="p-5 bg-[var(--lux-bg)] rounded-xl border border-[var(--lux-border)] group hover:border-[var(--lux-gold)]/40 transition-all flex flex-col justify-between h-40 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <p className="text-base font-display font-bold truncate max-w-[150px] leading-tight">{b.guestDetails?.name}</p>
                <p className="text-[8px] text-[var(--lux-muted)] uppercase font-black tracking-widest">{b.guestDetails?.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[7px] font-black text-[var(--lux-gold)] bg-[var(--lux-gold)]/10 px-2 py-1 rounded border border-[var(--lux-gold)]/20 uppercase tracking-tighter">
                  {b.roomNumber ? `RM ${b.roomNumber}` : 'UNASSIGNED'}
                </span>
                <p className="text-[7px] font-black opacity-30 mt-1 uppercase tracking-tighter">{new Date(b.checkin).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
               <div>
                  <p className="text-[7px] font-black uppercase opacity-40 leading-none mb-1">Due</p>
                  <p className="text-lg font-display font-bold text-[var(--lux-gold)]">₹{b.totalAmount}</p>
               </div>
               <button className="w-8 h-8 bg-[var(--lux-glass)] rounded-lg flex items-center justify-center hover:bg-[var(--lux-gold)] hover:text-black transition-all shadow-sm border border-[var(--lux-border)]">
                  <ArrowRight size={14} />
               </button>
            </div>
          </div>
        ))}

        {dashboardBookings.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-4 bg-[var(--lux-bg)]/30 border border-dashed border-[var(--lux-border)] rounded-xl">
              <Calendar size={24} className="text-[var(--lux-muted)] opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--lux-muted)]">No arrivals</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- GLOBAL DASHBOARD COMPONENT ---

const GlobalDashboard = ({ activeHotelId, onHotelChange }: { activeHotelId: string, onHotelChange: (id: string) => void }) => {
  const { data: allHotels = [], isLoading: loadingHotels } = useHotelsList();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Booked' | 'Cleaning' | 'Maintenance'>('All');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');

  const hotels = useMemo(() => allHotels.filter((h: any) => h.id && h.rooms?.length > 0), [allHotels]);

  useEffect(() => {
    if (hotels.length > 0 && !activeHotelId) onHotelChange(hotels[0].id);
  }, [hotels, activeHotelId, onHotelChange]);

  const activeHotel = useMemo(() => hotels.find((h: any) => h.id === activeHotelId), [hotels, activeHotelId]);
  const { data: physicalStatuses = [] } = useRoomStatus(activeHotelId);

  const { data: activeBookings = [] } = useActiveBookings(activeHotelId);
  const { data: availabilityMap = { allUnavailable: [] } } = useRoomAvailabilityMap(activeHotelId, new Date().toISOString().split('T')[0], new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const rooms = useMemo(() => {
    if (!activeHotel) return [];
    const generated: any[] = [];
    
    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      // If specific room numbers are provided in DB, use them
      if (roomType.numbers && roomType.numbers.length > 0) {
        roomType.numbers.forEach((num: string) => {
          const currentBooking = activeBookings.find((b: any) => b.roomNumber === num);
          const manualStatus = physicalStatuses.find((s: any) => s.roomNumber === num);
          const isOccupied = currentBooking || (availabilityMap.occupied || []).includes(num);
          const isBlocked = manualStatus?.status === 'Maintenance' || manualStatus?.status === 'Blocked' || (availabilityMap.blocked || []).includes(num);
          
          let status: 'Available' | 'Booked' | 'Cleaning' | 'Maintenance' = 'Available';
          if (isBlocked) status = 'Maintenance';
          else if (manualStatus?.status === 'Cleaning') status = 'Cleaning';
          else if (isOccupied) status = 'Booked';

          generated.push({ number: num, type: roomType.type, price: roomType.price, roomId: roomType.id, status });
        });
      } else {
        // Fallback: Generate sequential numbers based on total_rooms (e.g., 101, 102...)
        const startNum = (idx + 1) * 100 + 1;
        const count = roomType.total_rooms || 10;
        for (let i = 0; i < count; i++) {
          const num = (startNum + i).toString();
          const currentBooking = activeBookings.find((b: any) => b.roomNumber === num);
          const manualStatus = physicalStatuses.find((s: any) => s.roomNumber === num);
          const isOccupied = currentBooking || (availabilityMap.occupied || []).includes(num);
          const isBlocked = manualStatus?.status === 'Maintenance' || manualStatus?.status === 'Blocked' || (availabilityMap.blocked || []).includes(num);
          
          let status: 'Available' | 'Booked' | 'Cleaning' | 'Maintenance' = 'Available';
          if (isBlocked) status = 'Maintenance';
          else if (manualStatus?.status === 'Cleaning') status = 'Cleaning';
          else if (isOccupied) status = 'Booked';

          generated.push({ number: num, type: roomType.type, price: roomType.price, roomId: roomType.id, status });
        }
      }
    });
    return generated;
  }, [activeHotel, activeBookings, physicalStatuses, availabilityMap]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchesSearch = r.number.includes(searchQuery) || r.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const counts = { available: 0, occupied: 0, cleaning: 0, maint: 0 };
    rooms.forEach(r => {
      if (r.status === 'Available') counts.available++;
      else if (r.status === 'Booked') counts.occupied++;
      else if (r.status === 'Cleaning') counts.cleaning++;
      else if (r.status === 'Maintenance') counts.maint++;
    });
    return counts;
  }, [rooms]);

  const handleQuickCheckIn = async () => {
    if (!selectedRoom || !guestName || !guestMobile) return;
    
    const toastId = toast.loading('Processing rapid check-in...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/walk-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestDetails: { name: guestName, phone: guestMobile, email: '', guests: 1 },
          stayDetails: {
            hotel_id: activeHotelId,
            room_id: selectedRoom.roomId || activeHotel.rooms.find((r: any) => r.type === selectedRoom.type)?.id,
            roomNumber: selectedRoom.number,
            checkin: new Date().toISOString().split('T')[0],
            checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            guests: 1
          },
          paymentDetails: {
            totalAmount: selectedRoom.price,
            paidAmount: 0,
            paymentMethod: 'Cash',
            paymentStatus: 'Pending'
          }
        })
      });

      if (res.ok) {
        toast.success(`Room ${selectedRoom.number} assigned to ${guestName}`, { id: toastId });
        setGuestName('');
        setGuestMobile('');
        setSelectedRoom(null);
        queryClient.invalidateQueries({ queryKey: ['room-status', activeHotelId] });
        queryClient.invalidateQueries({ queryKey: ['global-bookings'] });
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Check-in failed');
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  if (loadingHotels) return <div className="h-[60vh] flex items-center justify-center text-[var(--lux-gold)] animate-pulse font-display text-2xl uppercase tracking-[0.2em]">Restoring Enterprise Assets...</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. HOTEL SELECTOR TABS */}
      <div className="flex items-center gap-2 p-2 bg-[var(--lux-card)] rounded-2xl border border-[var(--lux-border)] overflow-x-auto no-scrollbar">
         {hotels.map((h: any) => (
           <button 
             key={h.id}
             onClick={() => onHotelChange(h.id)}
             className={`px-8 py-3.5 rounded-xl transition-all duration-500 text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${activeHotelId === h.id ? 'bg-[var(--lux-gold)] text-black shadow-lg shadow-[var(--lux-gold)]/20' : 'text-[var(--lux-muted)] hover:bg-[var(--lux-bg)] hover:text-[var(--lux-text)]'}`}
           >
             {h.name}
           </button>
         ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* LEFT COLUMN: ROOM GRID & CONTROLS */}
        <div className="flex-1 w-full space-y-8">
           {/* FILTERS & SEARCH */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-1.5 p-1 bg-[var(--lux-card)] rounded-xl border border-[var(--lux-border)]">
                 {['All', 'Available', 'Booked', 'Cleaning'].map((f) => (
                   <button 
                     key={f}
                     onClick={() => setStatusFilter(f as any)}
                     className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-black text-white shadow-lg' : 'text-[var(--lux-muted)] hover:text-[var(--lux-text)] hover:bg-[var(--lux-bg)]'}`}
                   >
                     {f}
                   </button>
                 ))}
              </div>
              
              <div className="relative group w-full md:max-w-md">
                 <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search Room..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-xl py-3.5 pl-14 pr-4 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-inner" 
                 />
              </div>
           </div>

           {/* ACTION BUTTONS */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center gap-3 py-4 bg-[var(--lux-glass)] border border-[var(--lux-border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--lux-gold)] transition-all group">
                 <UserPlus size={16} className="text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)]" />
                 <span>Walk-In Booking</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 bg-[var(--lux-glass)] border border-[var(--lux-border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--lux-gold)] transition-all group">
                 <LogOut size={16} className="text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)]" />
                 <span>Check-out</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 bg-[var(--lux-glass)] border border-[var(--lux-border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[var(--lux-gold)] transition-all group">
                 <Brush size={16} className="text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)]" />
                 <span>Mark Cleaning</span>
              </button>
           </div>

           {/* LEGEND */}
           <div className="flex items-center gap-6 px-2">
              {[
                { label: 'Available', color: 'bg-green-500' },
                { label: 'Booked', color: 'bg-red-500' },
                { label: 'Cleaning', color: 'bg-yellow-500' },
                { label: 'Selected', color: 'bg-[var(--lux-gold)]' }
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-[var(--lux-muted)]">{item.label}</span>
                </div>
              ))}
           </div>

           {/* ROOM GRID */}
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRooms.map((room) => {
                const isActive = selectedRoom?.number === room.number;
                return (
                  <motion.div 
                    key={room.number}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isActive ? 'bg-[var(--lux-gold)]/10 border-[var(--lux-gold)] shadow-[0_10px_30px_rgba(212,175,55,0.1)]' : 'bg-[var(--lux-card)] border-[var(--lux-border)] hover:border-white/20 shadow-lg'
                    }`}
                  >
                    <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                      room.status === 'Available' ? 'bg-green-500' :
                      room.status === 'Booked' ? 'bg-red-500' :
                      room.status === 'Cleaning' ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}></div>
                    
                    <div className="flex flex-col items-center text-center space-y-4">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
                         room.status === 'Booked' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                         room.status === 'Available' ? 'bg-white/5 border-white/5 text-[var(--lux-muted)]' :
                         'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                       }`}>
                          <Key size={24} />
                       </div>
                       <div>
                          <h4 className="text-2xl font-display font-bold leading-none mb-1 tracking-tight">{room.number}</h4>
                          <p className={`text-[8px] font-black uppercase tracking-widest opacity-60`}>{room.type}</p>
                       </div>
                    </div>
                  </motion.div>
                );
              })}
           </div>
        </div>

        {/* RIGHT COLUMN: GUEST ASSIGNMENT PANEL */}
        <div className="w-full xl:w-[400px] sticky top-24">
           <div className="bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--lux-gold)]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)] mb-2">Guest Assignment</p>
                 <h2 className="text-5xl font-display font-bold tracking-tight">Room <span className="text-[var(--lux-gold)] shadow-[0_0_15px_rgba(212,175,55,0.2)]">{selectedRoom?.number || '---'}</span></h2>
              </div>

              <div className="w-full aspect-video bg-[var(--lux-bg)] rounded-3xl border border-[var(--lux-border)] flex flex-col items-center justify-center gap-4 text-[var(--lux-muted)] shadow-inner">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <LayoutGrid size={32} className="opacity-20" />
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em]">{selectedRoom ? `${selectedRoom.type} • ₹${selectedRoom.price}` : 'Select an available room'}</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">
                       <Users size={10} /> Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Guest Name" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-inner" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)] ml-2">
                       <Smartphone size={10} /> Mobile
                    </label>
                    <input 
                      type="text" 
                      placeholder="9998XXXXXX" 
                      value={guestMobile}
                      onChange={(e) => setGuestMobile(e.target.value)}
                      className="w-full bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-2xl py-4 px-6 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-inner" 
                    />
                 </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-[var(--lux-muted)] ml-2">Check-in</label>
                    <div className="w-full bg-[var(--lux-bg)] h-12 rounded-xl border border-[var(--lux-border)] flex items-center px-4 text-[10px] font-bold opacity-40">Today</div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-[var(--lux-muted)] ml-2">Check-out</label>
                    <div className="w-full bg-[var(--lux-bg)] h-12 rounded-xl border border-[var(--lux-border)] flex items-center px-4 text-[10px] font-bold opacity-40">Tomorrow</div>
                 </div>
              </div>

              <button 
                onClick={handleQuickCheckIn}
                disabled={!selectedRoom || !guestName || !guestMobile}
                className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                  selectedRoom && guestName && guestMobile ? 'bg-[var(--lux-gold)] text-black shadow-[var(--lux-gold)]/20 hover:scale-[1.02]' : 'bg-[var(--lux-glass)] text-[var(--lux-muted)] cursor-not-allowed'
                }`}
              >
                 <CheckCircle size={18} />
                 <span>Confirm Check-in</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const ReceptionConsole = ({ activeHotelId, onHotelChange }: { activeHotelId: string, onHotelChange: (id: string) => void }) => {
  const { data: allHotels = [], isLoading: loadingHotels } = useHotelsList();
  const [activeView, setActiveView] = useState<'dashboard' | 'form' | 'rooms'>('dashboard');
  
  // Enterprise State
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  
  const { data: activeBookings = [] } = useActiveBookings(activeHotelId);
  const { data: physicalStatuses = [] } = useRoomStatus(activeHotelId);
  const { data: availabilityMap = { allUnavailable: [] } } = useRoomAvailabilityMap(activeHotelId, checkInDate, checkOutDate);
  
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Booked' | 'Cleaning' | 'Maintenance'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState<any>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', phone: '', email: '', guests: 1,
    roomNumber: '', roomType: '', hotelName: '',
    checkin: new Date().toISOString().split('T')[0],
    checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalAmount: 0, paidAmount: 0, paymentMethod: 'Cash', paymentStatus: 'Paid',
    photo: '', aadharFront: '', aadharBack: '', otherDoc: ''
  });

  const [isManualRoom, setIsManualRoom] = useState(false);

  const hotels = useMemo(() => allHotels.filter((h: any) => h.id && h.rooms?.length > 0), [allHotels]);

  useEffect(() => {
    if (hotels.length > 0 && !activeHotelId) onHotelChange(hotels[0].id);
  }, [hotels, activeHotelId, onHotelChange]);

  const activeHotel = useMemo(() => hotels.find((h: any) => h.id === activeHotelId), [hotels, activeHotelId]);

  const { data: unifiedBookings = [] } = useQuery({
    queryKey: ['unified-bookings', activeHotelId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      return data.filter((b: any) => b.hotel_id === activeHotelId);
    },
    enabled: !!activeHotelId
  });

  const rooms = useMemo(() => {
    if (!activeHotel) return [];
    const generated: any[] = [];
    const unassignedToMap: Record<string, number> = {};
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    activeBookings.forEach((b: any) => {
      if (!b.roomNumber && b.room_id) {
        const bStart = new Date(b.checkin);
        const bEnd = new Date(b.checkout);
        const overlaps = bStart < end && bEnd > start;
        if (overlaps) {
           const categoryMatch = activeHotel.rooms.find((rt: any) => rt.id === b.room_id || rt.type === b.room_id);
           if (categoryMatch) unassignedToMap[categoryMatch.id] = (unassignedToMap[categoryMatch.id] || 0) + 1;
        }
      }
    });

    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      const startNum = (idx + 1) * 100 + 1;
      const count = roomType.total_rooms || 20; 
      for (let i = 0; i < count; i++) {
        const num = (startNum + i).toString();
        const currentBooking = activeBookings.find((b: any) => b.roomNumber === num);
        const manualStatus = physicalStatuses.find((s: any) => s.roomNumber === num);
        const isSpecificallyBooked = currentBooking && (new Date(currentBooking.checkin) < end && new Date(currentBooking.checkout) > start);
        const isOccupied = isSpecificallyBooked || (availabilityMap.occupied || []).includes(num);
        const isBlocked = manualStatus?.status === 'Maintenance' || manualStatus?.status === 'Blocked' || (availabilityMap.blocked || []).includes(num);
        let status: 'Available' | 'Booked' | 'Cleaning' | 'Maintenance' = 'Available';
        if (isBlocked) status = 'Maintenance';
        else if (manualStatus?.status === 'Cleaning') status = 'Cleaning';
        else if (isOccupied) status = 'Booked';
        else if (unassignedToMap[roomType.id] > 0) { status = 'Booked'; unassignedToMap[roomType.id]--; }
        generated.push({ number: num, type: roomType.type, price: roomType.price, roomId: roomType.id, status, guestData: isSpecificallyBooked ? currentBooking?.guestDetails : null, manualData: manualStatus });
      }
    });
    return generated;
  }, [activeHotel, activeBookings, physicalStatuses, availabilityMap, checkInDate, checkOutDate]);

  const statsCards = useMemo(() => {
    const today = new Date().toDateString();
    return [
      { label: 'Total Guests Today', value: unifiedBookings.filter((b: any) => new Date(b.checkin).toDateString() === today).length, icon: Users, color: 'text-[var(--lux-gold)]' },
      { label: 'Checked-in Guests', value: unifiedBookings.filter((b: any) => b.status === 'confirmed').length, icon: CheckCircle, color: 'text-green-500' },
      { label: 'Checked-out Guests', value: unifiedBookings.filter((b: any) => b.status === 'completed').length, icon: LogOut, color: 'text-orange-500' },
      { label: 'Pending Payments', value: unifiedBookings.filter((b: any) => b.balanceAmount > 0).length, icon: DollarSign, color: 'text-red-500' }
    ];
  }, [unifiedBookings]);

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
          paidAmount: Number(formData.paidAmount) || 0,
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.paymentStatus
        }
      };

      const res = await fetch(`${API_BASE_URL}/api/content/bookings/walk-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success("Walk-in booking created successfully!");
        setActiveView('dashboard');
        queryClient.invalidateQueries({ queryKey: ['unified-bookings'] });
      } else {
        throw new Error(data.message || "Booking failed during database entry");
      }
    } catch (err: any) { 
      console.error('Submission error:', err);
      toast.error(err.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Smart Entry Logic (Fast Approach)
  useEffect(() => {
    const fetchGuest = async () => {
       if (formData.phone.length >= 10) {
          try {
             const res = await fetch(`${API_BASE_URL}/api/content/guests/search?query=${formData.phone}`);
             const data = await res.json();
             if (data.length > 0) {
                const guest = data[0];
                setFormData(prev => ({ ...prev, name: guest.name, email: guest.email || prev.email }));
             }
          } catch (err) { console.error('Guest lookup failed'); }
       }
    };
    fetchGuest();
  }, [formData.phone]);

  useEffect(() => {
    if (formData.checkin) setCheckInDate(formData.checkin);
    if (formData.checkout) setCheckOutDate(formData.checkout);
  }, [formData.checkin, formData.checkout]);

  useEffect(() => {
    if (formData.checkin && formData.checkout && formData.roomType && activeHotel) {
        const start = new Date(formData.checkin);
        const end = new Date(formData.checkout);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const room = activeHotel.rooms.find((r: any) => r.type === formData.roomType);
        
        // Auto-select first available room of this type
        const availableRoomsForType = rooms.filter(r => r.type === formData.roomType && r.status === 'Available');
        if (availableRoomsForType.length > 0 && !formData.roomNumber) {
           setFormData(f => ({ ...f, roomNumber: availableRoomsForType[0].number }));
        }

        if (room) {
           const total = (nights * room.price) + ((formData.guests > room.base_guests) ? (formData.guests - room.base_guests) * room.extra_guest_price : 0);
           setFormData(prev => ({ ...prev, totalAmount: total, paidAmount: prev.paidAmount || total }));
        }
    }
  }, [formData.checkin, formData.checkout, formData.roomType, formData.guests, activeHotel, rooms]);

  if (loadingHotels) return <div className="min-h-screen flex items-center justify-center font-display text-[var(--lux-gold)] animate-pulse">Bhagat Enterprise Console...</div>;

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      {/* 1. MINIMAL HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-[var(--lux-border)]">
        <div className="text-center md:text-left">
           <h1 className="text-3xl font-display font-bold tracking-tight text-[var(--lux-text)]">Hotel <span className="text-[var(--lux-gold)]">Check-in</span></h1>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)]">Reception Management Hub</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[var(--lux-border)] shadow-sm">
          {[{ id: 'dashboard', label: 'Ledger', icon: LayoutGrid }, { id: 'form', label: 'Check-in', icon: UserPlus }].map((v) => (
            <button key={v.id} onClick={() => setActiveView(v.id as any)} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v.id ? 'bg-[var(--lux-gold)] text-white' : 'text-[var(--lux-muted)] hover:bg-[var(--lux-bg)]'}`}>
              <span className="flex items-center gap-2"><v.icon size={12} /> {v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. ALL HOTELS FAST SWITCHER */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
         {allHotels.map((h: any) => (
            <button key={h.id} onClick={() => onHotelChange(h.id)} className={`px-4 py-2 rounded-lg whitespace-nowrap text-[10px] font-black uppercase tracking-widest border transition-all ${activeHotelId === h.id ? 'bg-white border-[var(--lux-gold)] text-[var(--lux-gold)] shadow-sm' : 'bg-transparent border-transparent text-[var(--lux-muted)] hover:text-[var(--lux-text)]'}`}>
               {h.name}
            </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
             {/* SIMPLIFIED TABLE */}
             <div className="normal-card !p-0 overflow-hidden">
                <div className="p-6 border-b border-[var(--lux-border)] flex justify-between items-center">
                   <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--lux-muted)]">In-House Ledger</h3>
                   <div className="relative group">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lux-muted)]" />
                      <input type="text" placeholder="Search..." className="h-8 pl-9 pr-3 bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-md text-[10px] font-bold outline-none focus:border-[var(--lux-gold)]" />
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-[var(--lux-bg)] border-b border-[var(--lux-border)]">
                         <tr className="text-[10px] font-black uppercase text-[var(--lux-muted)]">
                            <th className="p-4">Guest</th>
                            <th className="p-4">Room</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4">Balance</th>
                            <th className="p-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--lux-border)]">
                         {unifiedBookings.map((b: any) => (
                            <tr key={b._id} className="text-[11px] hover:bg-[var(--lux-bg)] transition-colors">
                               <td className="p-4"><p className="font-bold">{b.guestDetails?.name}</p><p className="text-[9px] text-[var(--lux-muted)]">{b.guestDetails?.phone}</p></td>
                               <td className="p-4 font-bold text-[var(--lux-gold)]">{b.roomNumber}</td>
                               <td className="p-4 text-[9px] font-bold"><p>IN: {new Date(b.checkin).toLocaleDateString()}</p><p>OUT: {new Date(b.checkout).toLocaleDateString()}</p></td>
                               <td className="p-4 font-bold text-red-500">₹{b.balanceAmount}</td>
                               <td className="p-4 text-right"><button onClick={() => { setSelectedBooking(b); setShowDrawer(true); }} className="text-[var(--lux-muted)] hover:text-[var(--lux-gold)]"><Eye size={16} /></button></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">
             {/* FAST FORM */}
             <div className="normal-card space-y-8">
                {/* Section 1: Guest */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4">
                      <User size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Guest Info</h4>
                   </div>
                   <NormalInput label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} required placeholder="John Doe" />
                   <NormalInput label="Phone Number" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} required placeholder="+91..." />
                   <div className="md:col-span-2">
                      <NormalInput label="Email Address" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="optional@gmail.com" />
                   </div>
                </div>

                {/* Section 2: Stay */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4 pt-4">
                      <Bed size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Stay Info</h4>
                   </div>
                   <NormalSelect label="Room Type" value={formData.roomType} onChange={v => setFormData({...formData, roomType: v, roomNumber: ''})} options={activeHotel?.rooms.map((r: any) => ({ value: r.type, label: r.type }))} />
                   <NormalSelect label="Room No" value={formData.roomNumber} onChange={v => setFormData({...formData, roomNumber: v})} options={rooms.filter(r => r.type === formData.roomType && r.status === 'Available').map(r => ({ value: r.number, label: `Room ${r.number}` }))} />
                   <NormalInput label="Check-in" type="date" value={formData.checkin} onChange={v => setFormData({...formData, checkin: v})} />
                   <NormalInput label="Check-out" type="date" value={formData.checkout} onChange={v => setFormData({...formData, checkout: v})} />
                   <NormalInput label="Total Guests" type="number" min="1" value={formData.guests} onChange={v => setFormData({...formData, guests: parseInt(v)})} />
                </div>

                {/* Section 3: Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 flex items-center gap-3 border-b pb-4 pt-4">
                      <CreditCard size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Payment</h4>
                   </div>
                   <NormalInput label="Total Amount" type="number" value={formData.totalAmount} onChange={v => setFormData({...formData, totalAmount: parseInt(v)})} />
                   <NormalSelect label="Method" value={formData.paymentMethod} onChange={v => setFormData({...formData, paymentMethod: v})} options={['Cash', 'UPI', 'Card']} />
                </div>

                {/* Section 4: Documents */}
                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-3 border-b pb-4">
                      <FileText size={16} className="text-[var(--lux-gold)]" />
                      <h4 className="text-[12px] font-black uppercase tracking-widest">Documents (Required)</h4>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <NormalUploader label="Guest Photo" value={formData.photo} onChange={p => setFormData({...formData, photo: p})} />
                      <NormalUploader label="Aadhar Front" value={formData.aadharFront} onChange={p => setFormData({...formData, aadharFront: p})} />
                      <NormalUploader label="Aadhar Back" value={formData.aadharBack} onChange={p => setFormData({...formData, aadharBack: p})} />
                      <NormalUploader label="Policy" value={formData.otherDoc} onChange={p => setFormData({...formData, otherDoc: p})} />
                   </div>
                </div>

                {/* Desktop Submission */}
                <div className="hidden md:block pt-10">
                   <button onClick={handleWalkInSubmit} disabled={isSubmitting || !formData.name || !formData.phone} className="w-full h-14 bg-[var(--lux-gold)] text-white rounded-xl font-black uppercase tracking-widest text-[13px] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
                      {isSubmitting ? 'Confirming...' : 'Confirm Check-in'}
                   </button>
                </div>
             </div>

             {/* Mobile Sticky Button */}
             <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                <button onClick={handleWalkInSubmit} disabled={isSubmitting || !formData.name || !formData.phone} className="w-full h-16 bg-[var(--lux-gold)] text-white rounded-2xl font-black uppercase tracking-widest text-[13px] shadow-2xl active:scale-95 transition-all">
                   {isSubmitting ? '...' : 'Complete Check-in'}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingDetailsDrawer 
        booking={selectedBooking} 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
      />
    </div>
  );
};


const BookingsManagement = () => {
  const { data: hotels = [] } = useHotelsList();
  const [activeHotelId, setActiveHotelId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showInvoice, setShowInvoice] = useState<any>(null);
  const [showReport, setShowReport] = useState<any[] | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data: allBookings = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-bookings-all'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    }
  });

  const activeHotel = hotels.find(h => h.id === activeHotelId) || hotels[0];

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b: any) => {
      const matchesHotel = activeHotelId ? b.hotel_id === activeHotelId : true;
      const matchesStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        b.guestDetails?.name?.toLowerCase().includes(searchLower) ||
        b.guestDetails?.phone?.includes(searchQuery) ||
        b.roomNumber?.toString().includes(searchQuery);
      return matchesHotel && matchesStatus && matchesSearch;
    });
  }, [allBookings, activeHotelId, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      checkins: filteredBookings.filter((b: any) => new Date(b.checkin).toDateString() === today).length,
      checkouts: filteredBookings.filter((b: any) => new Date(b.checkout).toDateString() === today).length,
      active: filteredBookings.filter((b: any) => b.status === 'confirmed').length,
      pending: filteredBookings.filter((b: any) => b.paymentStatus === 'pending' || b.balanceAmount > 0).length,
    };
  }, [filteredBookings]);

  const generateReport = (range: '7days' | 'monthly' | '3months') => {
    const now = new Date();
    let startDate = new Date();
    let title = "";

    if (range === '7days') {
      startDate.setDate(now.getDate() - 7);
      title = "Weekly Booking Report (Last 7 Days)";
    } else if (range === 'monthly') {
      startDate.setDate(now.getDate() - 30);
      title = "Monthly Booking Report (Last 30 Days)";
    } else if (range === '3months') {
      startDate.setDate(now.getDate() - 90);
      title = "Quarterly Booking Report (Last 3 Months)";
    }

    const reportData = filteredBookings.filter((b: any) => new Date(b.checkin) >= startDate);
    
    if (reportData.length === 0) {
      toast.error(`No records found for the selected period`);
      return;
    }

    setReportTitle(title);
    setShowReport(reportData);
    setShowExportMenu(false);
    setTimeout(() => window.print(), 1000);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64 text-[var(--lux-gold)] animate-pulse uppercase font-black text-[10px] tracking-widest">Loading Records...</div>;

  return (
    <div className="space-y-6">
      {/* 1. TOP ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-display font-bold">Bookings <span className="text-[var(--lux-gold)]">Management</span></h1>
           <p className="text-[var(--lux-muted)] text-[8px] font-black uppercase tracking-widest mt-1">Total {filteredBookings.length} Managed Records</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-[var(--lux-gold)] text-black rounded-xl text-[10px] font-black uppercase tracking-tight shadow-lg shadow-[var(--lux-gold)]/10 hover:scale-[1.02] active:scale-95 transition-all">
              <Plus size={14} /> New Booking
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-[var(--lux-glass)] border border-[var(--lux-border)] text-[var(--lux-text)] rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-white/5 active:scale-95 transition-all">
              <LogOut size={14} /> Walk-in
           </button>
           <div className="relative">
              <button 
                 onClick={() => setShowExportMenu(!showExportMenu)} 
                 className="p-2.5 bg-[var(--lux-glass)] border border-[var(--lux-border)] rounded-xl text-[var(--lux-muted)] hover:text-[var(--lux-gold)] transition-all flex items-center gap-2"
              >
                 <FileDown size={14} />
                 <ChevronRight size={10} className={`transition-transform ${showExportMenu ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                 {showExportMenu && (
                    <>
                       <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                       <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-2 z-50 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                       >
                          <div className="p-3 border-b border-white/5 bg-white/5">
                             <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Download PDF Reports</p>
                          </div>
                          <button onClick={() => generateReport('7days')} className="w-full text-left px-5 py-3 hover:bg-white/5 text-[10px] font-bold uppercase transition-all flex items-center justify-between group">
                             <span>Last 7 Days</span>
                             <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                          <button onClick={() => generateReport('monthly')} className="w-full text-left px-5 py-3 hover:bg-white/5 text-[10px] font-bold uppercase transition-all flex items-center justify-between group">
                             <span>Monthly Report</span>
                             <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                          <button onClick={() => generateReport('3months')} className="w-full text-left px-5 py-3 hover:bg-white/5 text-[10px] font-bold uppercase transition-all flex items-center justify-between group">
                             <span>Last 3 Months</span>
                             <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </button>
                       </motion.div>
                    </>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* 2. STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Today Check-ins', value: stats.checkins, icon: DoorOpen, color: 'text-green-500' },
           { label: 'Today Check-outs', value: stats.checkouts, icon: LogOut, color: 'text-orange-500' },
           { label: 'Active Bookings', value: stats.active, icon: Key, color: 'text-[var(--lux-gold)]' },
           { label: 'Pending Payments', value: stats.pending, icon: DollarSign, color: 'text-red-500' },
         ].map((s, i) => (
           <div key={i} className="bg-[var(--lux-card)] p-4 rounded-2xl border border-[var(--lux-border)] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <s.icon size={18} className={s.color} />
              </div>
              <div>
                 <p className="text-xl font-display font-bold leading-none">{s.value}</p>
                 <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest mt-1">{s.label}</p>
              </div>
           </div>
         ))}
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="sticky top-[60px] z-20 bg-[var(--lux-bg)] -mx-3 px-3 py-3 space-y-3">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lux-muted)]" size={14} />
            <input 
               type="text" placeholder="Search Guest Name, Phone or Room..." 
               value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-xl py-3 pl-10 pr-4 text-xs focus:border-[var(--lux-gold)] outline-none transition-all" 
            />
         </div>
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <Filter size={12} className="text-[var(--lux-muted)] flex-shrink-0" />
            {['All', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
               <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    statusFilter === f ? 'bg-[var(--lux-gold)] text-black' : 'bg-[var(--lux-glass)] text-[var(--lux-muted)] border border-[var(--lux-border)]'
                  }`}
               >
                  {f}
               </button>
            ))}
         </div>
      </div>

      {/* 4. BOOKINGS TABLE (DESKTOP) & CARDS (MOBILE) */}
      <div className="bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl overflow-hidden shadow-sm">
         {/* Desktop View */}
         <div className="hidden md:block overflow-x-auto">
            <table className="lux-table">
               <thead>
                  <tr>
                     <th>Guest Details</th>
                     <th>Room</th>
                     <th>Stay Dates</th>
                     <th>Status</th>
                     <th>Payment</th>
                     <th>Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                         <div className="flex flex-col items-center opacity-40">
                            <Sparkles size={40} className="mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest">No bookings found</p>
                         </div>
                      </td>
                    </tr>
                  ) : filteredBookings.map((b: any) => (
                    <tr key={b._id}>
                       <td>
                          <div>
                             <p className="font-bold text-sm tracking-tight">{b.guestDetails?.name}</p>
                             <p className="text-[10px] text-[var(--lux-muted)]">{b.guestDetails?.phone}</p>
                          </div>
                       </td>
                       <td>
                          <div className="flex items-center gap-2">
                             <div className="px-2 py-1 bg-[var(--lux-bg)] rounded text-[10px] font-bold border border-[var(--lux-border)]">
                                {b.roomNumber || 'TBD'}
                             </div>
                             <span className="text-[8px] font-black uppercase text-[var(--lux-muted)]">{b.room_id?.slice(0, 8)}</span>
                          </div>
                       </td>
                       <td>
                          <div className="flex items-center gap-2">
                             <div className="text-[10px]">
                                <p className="font-bold">{new Date(b.checkin).toLocaleDateString()}</p>
                                <p className="text-[var(--lux-muted)] font-black uppercase text-[7px] tracking-widest">Arrival</p>
                             </div>
                             <ArrowRight size={10} className="opacity-20" />
                             <div className="text-[10px]">
                                <p className="font-bold">{new Date(b.checkout).toLocaleDateString()}</p>
                                <p className="text-[var(--lux-muted)] font-black uppercase text-[7px] tracking-widest">Departure</p>
                             </div>
                          </div>
                       </td>
                       <td>
                          <span className={`status-badge ${b.status.toLowerCase() === 'confirmed' ? 'checked-in' : b.status.toLowerCase() === 'completed' ? 'completed' : 'cancelled'}`}>
                             <div className="w-1.5 h-1.5 rounded-full bg-current" />
                             {b.status}
                          </span>
                       </td>
                       <td>
                          <div className="text-right inline-block">
                             <p className="font-bold">₹{b.totalAmount}</p>
                             <p className={`text-[8px] font-black uppercase ${b.balanceAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {b.balanceAmount > 0 ? `Unpaid: ₹${b.balanceAmount}` : 'Paid In Full'}
                             </p>
                          </div>
                       </td>
                       <td>
                           <div className="relative">
                              <button 
                                 onClick={() => setOpenMenuId(openMenuId === b._id ? null : b._id)}
                                 className="p-2 hover:bg-white/5 rounded-lg text-[var(--lux-muted)] hover:text-[var(--lux-gold)] transition-all"
                              >
                                 <MoreHorizontal size={14} />
                              </button>
                              
                              <AnimatePresence>
                                 {openMenuId === b._id && (
                                    <>
                                       <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                       <motion.div 
                                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                          className="absolute right-0 top-full mt-2 z-50"
                                       >
                                          <BookingActionsMenu 
                                             booking={b} 
                                             onAction={() => { refetch(); setOpenMenuId(null); }}
                                             onViewDetails={() => { setSelectedBooking(b); setShowDrawer(true); setOpenMenuId(null); }}
                                             onEdit={() => { setEditingBooking(b); setShowEditDrawer(true); setOpenMenuId(null); }}
                                             onDownload={() => { setShowInvoice(b); setOpenMenuId(null); setTimeout(() => window.print(), 1000); }}
                                          />
                                       </motion.div>
                                    </>
                                 )}
                              </AnimatePresence>
                           </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Mobile View */}
         <div className="md:hidden divide-y divide-[var(--lux-border)]">
            {filteredBookings.length === 0 ? (
               <div className="p-10 text-center opacity-30 text-[10px] uppercase font-black">No matching records</div>
            ) : filteredBookings.map((b: any) => (
               <div key={b._id} onClick={() => { setSelectedBooking(b); setShowDrawer(true); }} className="p-4 space-y-3 active:bg-[var(--lux-glass)] transition-all">
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-base leading-tight">{b.guestDetails?.name}</h3>
                        <p className="text-[10px] text-[var(--lux-muted)]">{b.guestDetails?.phone}</p>
                     </div>
                     <span className={`status-badge ${b.status.toLowerCase() === 'confirmed' ? 'checked-in' : 'completed'}`}>
                        {b.status}
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] bg-[var(--lux-bg)] p-3 rounded-xl border border-[var(--lux-border)]">
                     <div>
                        <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest mb-1">Room</p>
                        <p className="font-bold">{b.roomNumber || 'TBD'}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-widest mb-1">Check-in</p>
                        <p className="font-bold">{new Date(b.checkin).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <p className="text-sm font-bold text-[var(--lux-gold)]">₹{b.totalAmount}</p>
                     <button className="px-4 py-2 bg-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/5">View Details</button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <BookingDetailsDrawer 
        booking={selectedBooking} 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
      />

      <EditBookingDrawer 
        booking={editingBooking}
        isOpen={showEditDrawer}
        onClose={() => setShowEditDrawer(false)}
        onUpdate={() => refetch()}
      />

      {showInvoice && (
        <div className="fixed inset-0 z-[300] bg-white text-black overflow-y-auto p-10 print:p-0 print-content">
           <div className="max-w-4xl mx-auto relative">
              <button 
                onClick={() => setShowInvoice(null)} 
                className="absolute top-0 right-0 p-4 font-bold uppercase text-[10px] tracking-widest hover:text-black print:hidden"
              >
                Close Preview
              </button>
              <InvoiceView booking={showInvoice} hotel={activeHotel} />
           </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 z-[400] bg-white text-black overflow-y-auto print:p-0 print-content">
           <div className="max-w-6xl mx-auto relative pt-10">
              <button 
                onClick={() => setShowReport(null)} 
                className="fixed top-6 right-6 p-4 bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-110 transition-all z-[401] print:hidden"
              >
                Close Report
              </button>
              <BookingReportView bookings={showReport} title={reportTitle} hotel={activeHotel} />
           </div>
        </div>
      )}
    </div>
  );
};

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeHotelId, setActiveHotelId] = useState<string>("");

  const { data: allBookings = [] } = useQuery({
    queryKey: ['global-bookings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return res.json();
    },
    refetchInterval: 30000
  });

  const headerStats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      booked: allBookings.filter((b: any) => b.status === 'confirmed').length,
      arrivals: allBookings.filter((b: any) => new Date(b.checkin).toDateString() === today).length
    };
  }, [allBookings]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-[var(--lux-bg)] transition-colors duration-500">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        <Header 
          theme={theme} 
          setTheme={setTheme} 
          onMenuClick={() => setIsSidebarOpen(true)} 
          bookedCount={headerStats.booked}
          arrivalsCount={headerStats.arrivals}
        />
        
        <main className="flex-1 p-3 md:p-8 lg:p-10 overflow-y-auto pb-24 lg:pb-10">
          <div className="max-w-[1440px] mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlobalDashboard activeHotelId={activeHotelId} onHotelChange={setActiveHotelId} />
                </motion.div>
              )}

              {activeTab === 'reception' && (
                <motion.div
                  key="reception"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReceptionConsole activeHotelId={activeHotelId} onHotelChange={setActiveHotelId} />
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookingsManagement />
                </motion.div>
              )}
              
              {activeTab !== 'dashboard' && activeTab !== 'reception' && activeTab !== 'bookings' && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-[70vh] text-center"
                >
                  <div className="w-20 h-20 bg-[var(--lux-glass)] rounded-full flex items-center justify-center mb-6 border border-[var(--lux-border)]">
                     <Sparkles size={40} className="text-[var(--lux-gold)] opacity-20" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-2 uppercase tracking-tighter">{SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}</h2>
                  <p className="text-[var(--lux-muted)] text-[8px] uppercase font-black tracking-widest leading-relaxed">Enterprise module under development</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <BottomActionBar />
      </div>
    </div>
  );
};

// --- MINIMALIST UI UTILITIES ---

const EditBookingDrawer = ({ booking, isOpen, onClose, onUpdate }: { booking: any, isOpen: boolean, onClose: () => void, onUpdate: () => void }) => {
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        name: booking.guestDetails?.name || '',
        phone: booking.guestDetails?.phone || '',
        email: booking.guestDetails?.email || '',
        checkin: new Date(booking.checkin).toISOString().split('T')[0],
        checkout: new Date(booking.checkout).toISOString().split('T')[0],
        roomNumber: booking.roomNumber || '',
        totalAmount: booking.totalAmount || 0,
        paidAmount: booking.paidAmount || 0
      });
    }
  }, [booking]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          guestDetails: { name: formData.name, phone: formData.phone, email: formData.email },
          stayDetails: { checkin: formData.checkin, checkout: formData.checkout, roomNumber: formData.roomNumber },
          paymentDetails: { totalAmount: formData.totalAmount, paidAmount: formData.paidAmount }
        })
      });
      if (res.ok) {
        toast.success("BOOKING RECORDS UPDATED");
        onUpdate();
        onClose();
      } else throw new Error("Update failed");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 w-full max-w-md h-full bg-[var(--lux-card)] border-l border-[var(--lux-border)] z-[251] p-8 overflow-y-auto">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-display font-bold uppercase tracking-tight">Edit <span className="text-[var(--lux-gold)] shadow-[0_0_20px_rgba(212,175,55,0.2)]">Booking</span></h2>
                <button onClick={onClose} className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center hover:bg-red-500 transition-all text-white"><ArrowRight size={18} /></button>
             </div>

             <form onSubmit={handleSave} className="space-y-6 pb-20">
                <div className="space-y-4">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Guest Details</p>
                   <NormalInput label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
                   <div className="grid grid-cols-2 gap-4">
                      <NormalInput label="Phone" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} required />
                      <NormalInput label="Email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Stay Information</p>
                   <div className="grid grid-cols-2 gap-4">
                      <NormalInput label="Check-in" type="date" value={formData.checkin} onChange={(v: string) => setFormData({...formData, checkin: v})} required />
                      <NormalInput label="Check-out" type="date" value={formData.checkout} onChange={(v: string) => setFormData({...formData, checkout: v})} required />
                   </div>
                   <NormalInput label="Room Number" value={formData.roomNumber} onChange={(v: string) => setFormData({...formData, roomNumber: v})} />
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Financial Records</p>
                   <div className="grid grid-cols-2 gap-4">
                      <NormalInput label="Total Amount (₹)" type="number" value={formData.totalAmount} onChange={(v: string) => setFormData({...formData, totalAmount: Number(v)})} required />
                      <NormalInput label="Paid Amount (₹)" type="number" value={formData.paidAmount} onChange={(v: string) => setFormData({...formData, paidAmount: Number(v)})} required />
                   </div>
                   <div className="p-4 bg-[var(--lux-bg)] rounded-xl border border-[var(--lux-border)]">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold uppercase text-[var(--lux-muted)]">Calculated Balance</span>
                         <span className={`text-lg font-bold ${formData.totalAmount - formData.paidAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{formData.totalAmount - formData.paidAmount}</span>
                      </div>
                   </div>
                </div>

                <button disabled={isSaving} className="w-full py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--lux-gold)]/20 active:scale-95 transition-all">
                   {isSaving ? 'Saving Changes...' : 'Save Updated Records'}
                </button>
             </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const NormalInput = ({ label, value, onChange, placeholder, type = 'text', min, required = false }: any) => (
  <div className="space-y-1">
     <label className="normal-label">{label} {required && '*'}</label>
     <input 
       type={type} min={min} required={required} placeholder={placeholder} value={value} 
       onChange={e => onChange(e.target.value)}
       className="normal-input" 
     />
  </div>
);

const NormalSelect = ({ label, value, onChange, options, required = false, placeholder = "Select Option" }: any) => (
  <div className="space-y-1">
     <label className="normal-label">{label} {required && '*'}</label>
     <div className="relative group">
        <select 
          required={required} value={value} onChange={e => onChange(e.target.value)}
          className="normal-input appearance-none pr-10"
        >
           <option value="">{placeholder}</option>
           {options?.map((o: any) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-colors">
           <ChevronRight size={14} className="rotate-90" />
        </div>
     </div>
  </div>
);

const NormalUploader = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
     <label className="normal-label truncate">{label}</label>
     <div className="relative h-24 rounded-lg border-2 border-dashed border-[var(--lux-border)] bg-[var(--lux-bg)] flex flex-col items-center justify-center p-2 group hover:border-[var(--lux-gold)] transition-colors overflow-hidden">
        {value ? (
           <div className="relative w-full h-full group">
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <button onClick={() => onChange('')} className="p-1 bg-red-500 rounded-md text-white"><Trash2 size={12} /></button>
              </div>
           </div>
        ) : (
           <>
              <Camera size={16} className="text-[var(--lux-muted)]" />
              <span className="text-[8px] font-bold uppercase mt-1">Upload</span>
              <ImageUpload onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
           </>
        )}
     </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-right" richColors theme="dark" />
    </QueryClientProvider>
  );
};

export default App;
