import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useUnifiedBookings } from '../hooks/useHotelData';

export const GuestsPage = ({ activeHotelId }: { activeHotelId: string }) => {
  const { data: bookings = [], isLoading } = useUnifiedBookings(activeHotelId);
  const [searchTerm, setSearchTerm] = useState('');

  const guestDirectory = useMemo(() => {
    const directory: Record<string, any> = {};
    
    bookings.forEach((b: any) => {
      const phone = b.guestDetails?.phone;
      if (!phone) return;
      
      if (!directory[phone]) {
        directory[phone] = {
          name: b.guestDetails?.name,
          phone: phone,
          email: b.guestDetails?.email || 'N/A',
          totalVisits: 0,
          totalSpent: 0,
          lastVisit: b.checkin,
          history: []
        };
      }
      
      directory[phone].totalVisits += 1;
      directory[phone].totalSpent += Number(b.paidAmount) || 0;
      if (new Date(b.checkin) > new Date(directory[phone].lastVisit)) {
        directory[phone].lastVisit = b.checkin;
      }
      directory[phone].history.push(b);
    });
    
    return Object.values(directory).filter((g: any) => 
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.phone?.includes(searchTerm)
    );
  }, [bookings, searchTerm]);

  if (isLoading) return <div className="p-20 text-center text-[var(--lux-gold)] font-bold animate-pulse">SYNCHRONIZING DIRECTORY...</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold italic tracking-tighter">Guest <span className="text-[var(--lux-gold)]">Directory</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--lux-muted)] mt-2">Centralized Intelligence & Loyalty Ledger</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lux-muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name or Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl w-full md:w-[350px] text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all"
            />
          </div>
          <button className="w-14 h-14 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl flex items-center justify-center text-[var(--lux-muted)] hover:text-white transition-all">
             <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {guestDirectory.map((guest: any, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className="p-6 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-3xl group hover:border-[var(--lux-gold)]/30 transition-all cursor-pointer relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                <Users size={80} />
             </div>

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-2xl bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)] font-display font-bold text-2xl border border-[var(--lux-gold)]/20 shadow-inner">
                      {guest.name?.[0]}
                   </div>
                   <div>
                      <h4 className="text-xl font-bold tracking-tight mb-1">{guest.name}</h4>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--lux-muted)] uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Phone size={12} className="text-[var(--lux-gold)]" /> {guest.phone}</span>
                         <span className="flex items-center gap-1.5"><Mail size={12} className="text-[var(--lux-gold)]" /> {guest.email}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-8 border-l border-[var(--lux-border)] md:pl-8">
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] mb-1">Visits</p>
                      <p className="text-lg font-bold">{guest.totalVisits}</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] mb-1">Lifetime</p>
                      <p className="text-lg font-bold text-green-500">₹{guest.totalSpent}</p>
                   </div>
                   <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-[var(--lux-gold)] hover:text-black transition-all">
                      <ChevronRight size={18} />
                   </button>
                </div>
             </div>
          </motion.div>
        ))}

        {guestDirectory.length === 0 && (
          <div className="p-20 bg-[var(--lux-card)] border border-[var(--lux-border)] border-dashed rounded-[3rem] text-center">
             <p className="text-[var(--lux-muted)] font-bold italic opacity-40">No guest records found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
