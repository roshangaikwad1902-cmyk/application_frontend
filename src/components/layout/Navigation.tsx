import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  UserPlus, 
  Calendar, 
  Users, 
  Bed, 
  LogOut, 
  Sparkles, 
  Sun,
  Moon,
  CreditCard,
  Clock as ClockIcon
} from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--lux-card)]/40 backdrop-blur-md border border-[var(--lux-border)] rounded-2xl group hover:border-[var(--lux-gold)]/30 transition-all duration-500 shadow-lg shadow-black/5">
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--lux-soft)] border border-[var(--lux-border)] text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)] transition-colors duration-500">
        <ClockIcon size={14} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-black uppercase tracking-tighter text-[var(--lux-text)] leading-none">
          {formatTime(time)}
        </span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--lux-muted)] mt-0.5 whitespace-nowrap">
          {formatDate(time)}
        </span>
      </div>
    </div>
  );
};


export const Header = ({ theme, setTheme, onMenuClick, hotelName, bookedCount, arrivalsCount }: any) => {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] h-20 bg-[var(--lux-bg)]/80 backdrop-blur-xl border-b border-[var(--lux-border)] z-40 px-6 md:px-10 flex items-center justify-between">
       <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden w-10 h-10 rounded-xl bg-[var(--lux-card)] flex items-center justify-center border border-[var(--lux-border)]">
             <LayoutGrid size={18} />
          </button>
          <div className="hidden sm:block">
             <h2 className="text-xl font-display font-bold tracking-tight italic">{hotelName}</h2>
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)]">Enterprise Operations Console</p>
          </div>
       </div>
       
       <div className="flex items-center gap-6">
           <LiveClock />
           <div className="hidden md:flex items-center gap-4 border-l border-[var(--lux-border)] pl-6">
             <div className="text-right">
                <p className="text-[10px] font-bold text-green-500 uppercase leading-none">{bookedCount} ACTIVE</p>
                <p className="text-[7px] font-black uppercase opacity-40 mt-1 tracking-tighter">Live Bookings</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--lux-gold)] uppercase leading-none">{arrivalsCount} TODAY</p>
                <p className="text-[7px] font-black uppercase opacity-40 mt-1 tracking-tighter">New Arrivals</p>
             </div>
          </div>
          <button 
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-14 h-8 rounded-full bg-[var(--lux-card)] border border-[var(--lux-border)] p-1 flex items-center shadow-lg hover:border-[var(--lux-gold)] hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all group`}
          >
            <motion.div
              initial={false}
              animate={{ x: theme === 'dark' ? 0 : 24 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-6 h-6 rounded-full bg-[var(--lux-gold)] flex items-center justify-center shadow-md z-10"
            >
              {theme === 'dark' ? <Moon size={12} className="text-black" /> : <Sun size={12} className="text-black" />}
            </motion.div>
            
            <div className="absolute inset-0 flex justify-between px-2 items-center opacity-20 pointer-events-none">
              <Moon size={10} className={theme === 'dark' ? 'text-[var(--lux-gold)]' : ''} />
              <Sun size={10} className={theme === 'light' ? 'text-[var(--lux-gold)]' : ''} />
            </div>
          </button>
       </div>
    </header>
  );
};

export const Sidebar = ({ theme, isOpen, setIsOpen, onLogout }: any) => {
  const location = useLocation();
  const navItems = [
    { icon: LayoutGrid, label: 'Room Grid', path: '/dashboard' },
    { icon: UserPlus, label: 'Reception', path: '/reception' },
    { icon: Sparkles, label: 'Future Booking', path: '/future-booking' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" />
        )}
      </AnimatePresence>
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--lux-card)] border-r border-[var(--lux-border)] z-[70] transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="px-6 pt-0 pb-2 border-b border-[var(--lux-border)] flex justify-center overflow-hidden">
            <img 
               src="/logo.jpg" 
               alt="Bhagat Group" 
               className={`w-full h-auto brightness-110 transition-all duration-300 -mt-2 ${theme === 'dark' ? 'mix-blend-screen invert-0' : 'mix-blend-multiply invert-[1]'}`} 
            />
         </div>
         <nav className="p-6 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === item.path ? 'bg-[var(--lux-gold)] text-black shadow-xl shadow-[var(--lux-gold)]/20 scale-[1.02]' : 'text-[var(--lux-muted)] hover:bg-[var(--lux-gold)]/5 hover:text-[var(--lux-gold)]'}`}
              >
                 <item.icon size={16} />
                 <span>{item.label}</span>
              </Link>
            ))}
         </nav>
         <div className="absolute bottom-10 left-6 right-6 p-6 bg-white/5 rounded-3xl border border-white/5">
            <button 
              type="button"
              onClick={onLogout}
              className="w-full py-4 flex items-center justify-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-all"
            >
               <LogOut size={16} /> Logout
            </button>
         </div>
      </aside>
    </>
  );
};

export const BottomActionBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabs = [
    { icon: LayoutGrid, path: '/dashboard', label: 'Grid' },
    { icon: UserPlus, path: '/reception', label: 'Check-in' },
    { icon: Sparkles, path: '/future-booking', label: 'Future' },
    { icon: CreditCard, path: '/payments', label: 'Revenue' },
    { icon: Calendar, path: '/bookings', label: 'Ledger' }
  ];

  return (
    <div className="lg:hidden fixed bottom-4 left-4 right-4 h-20 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-around px-6 shadow-2xl">
       {tabs.map((tab) => (
         <button 
           key={tab.path}
           type="button"
           onClick={() => navigate(tab.path)}
           className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${location.pathname === tab.path ? 'text-[var(--lux-gold)] scale-110' : 'text-white/40'}`}
         >
            <div className={`p-3 rounded-2xl ${location.pathname === tab.path ? 'bg-[var(--lux-gold)]/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : ''}`}>
               <tab.icon size={22} />
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest">{tab.label}</span>
         </button>
       ))}
    </div>
  );
};
