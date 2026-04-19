import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useHotelsList } from '../hooks/useHotelData';
import { API_BASE_URL } from '../config/constants';

export const HotelSelectionPage = ({ onSelect }: { onSelect: (id: string, name: string) => void }) => {
  const { data: hotels = [], isLoading } = useHotelsList();

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-[var(--lux-gold)] animate-pulse font-display text-4xl uppercase tracking-[0.3em]">Bhagat Enterprise</div>;

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-0 pb-20 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-2 mt-0 flex flex-col items-center"
      >
         <img 
            src="/logo.jpg" 
            alt="Bhagat Group" 
            className="w-auto h-[200px] md:h-[280px] mix-blend-screen opacity-90 brightness-110 contrast-100 mb-4" 
         />
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {hotels.map((hotel: any) => (
          <motion.div 
            key={hotel.id}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => onSelect(hotel.id, hotel.name)}
            className="group cursor-pointer bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem] hover:border-[var(--lux-gold)] transition-all relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <Layers size={80} />
             </div>
             <p className="text-[10px] font-black uppercase text-[var(--lux-gold)] tracking-widest mb-2">Property Origin</p>
             <h3 className="text-3xl font-display font-bold mb-4">{hotel.name}</h3>
             <div className="flex items-center gap-2 text-[var(--lux-muted)] text-[11px] font-bold">
                <Clock size={14} />
                <span>Enterprise Active</span>
             </div>
             <button type="button" className="mt-8 w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-[var(--lux-gold)] transition-all">Select Property</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const LoginPage = ({ hotelName, hotelId, onBack, onLogin }: { hotelName: string, hotelId: string, onBack: () => void, onLogin: (token: string) => void }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('hotel_token', data.token);
        onLogin(data.token);
      } else {
        toast.error(data.message || 'Access Denied');
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md space-y-8 bg-zinc-900/40 p-12 rounded-[3rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--lux-gold)]"></div>
        <button type="button" onClick={onBack} className="text-[10px] font-black uppercase text-[var(--lux-muted)] hover:text-white flex items-center gap-2 mb-8">
           <ChevronRight size={12} className="rotate-180" /> Back to Selection
        </button>
        <div className="space-y-2">
           <h2 className="text-4xl font-display font-bold tracking-tight">Access <span className="text-[var(--lux-gold)]">Portal</span></h2>
           <p className="text-[11px] font-medium text-[var(--lux-muted)] uppercase tracking-widest">Property: {hotelName}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-[0.2em] ml-2">Console Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-2xl py-5 px-6 text-sm font-bold focus:border-[var(--lux-gold)] outline-none transition-all shadow-inner" 
                placeholder="••••••••"
              />
           </div>
           <button 
             type="submit" 
             disabled={loading}
             className="w-full py-5 bg-[var(--lux-gold)] text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-[var(--lux-gold)]/10 hover:scale-[1.02] active:scale-95 transition-all"
           >
             {loading ? 'Authenticating...' : 'Enter Console'}
           </button>
        </form>
      </motion.div>
    </div>
  );
};
