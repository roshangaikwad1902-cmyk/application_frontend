import React from 'react';
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
  Clock,
  Sun,
  Moon
} from 'lucide-react';

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

export const Sidebar = ({ isOpen, setIsOpen, onLogout }: any) => {
  const location = useLocation();
  const navItems = [
    { icon: LayoutGrid, label: 'Room Grid', path: '/dashboard' },
    { icon: UserPlus, label: 'Reception', path: '/reception' },
    { icon: Sparkles, label: 'Future Booking', path: '/future-booking' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--lux-card)] border-r border-[var(--lux-border)] z-50 transition-transform duration-500 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-10 border-b border-[var(--lux-border)]">
            <h1 className="text-2xl font-display font-bold italic tracking-tighter mb-1">BHAGAT GROUP</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Core Console v4</p>
         </div>
         <nav className="p-6 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === item.path ? 'bg-[var(--lux-gold)] text-black shadow-xl shadow-[var(--lux-gold)]/20 scale-[1.02]' : 'text-[var(--lux-muted)] hover:bg-white/5 hover:text-white'}`}
              >
                 <item.icon size={16} />
                 <span>{item.label}</span>
              </Link>
            ))}
         </nav>
         <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/5 rounded-3xl border border-white/5">
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
