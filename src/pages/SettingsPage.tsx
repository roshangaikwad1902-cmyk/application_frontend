import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Edit, GripHorizontal, Building, Server, ChevronRight, X, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/constants';
import { useHotelsList } from '../hooks/useHotelData';

export const SettingsPage = ({ activeHotelId }: { activeHotelId: string }) => {
  const queryClient = useQueryClient();
  const { data: allHotels = [], isLoading } = useHotelsList();
  
  const [editingRoom, setEditingRoom] = useState<{ oldNumber: string, roomCategoryId: string, open: boolean } | null>(null);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeHotel = useMemo(() => allHotels.find((h: any) => h.id === activeHotelId), [allHotels, activeHotelId]);

  const roomsData = useMemo(() => {
    if (!activeHotel) return [];
    const generated: any[] = [];
    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      const count = (roomType.total_rooms !== undefined) ? roomType.total_rooms : (roomType.capacity || 5);
      const startNum = (idx + 1) * 100 + 1;
      const numbers = roomType.numbers && roomType.numbers.length > 0 ? roomType.numbers : Array.from({ length: count }, (_, i) => (startNum + i).toString());

      numbers.forEach((num: string) => {
        generated.push({
          number: num,
          type: roomType.type,
          categoryId: roomType.id
        });
      });
    });
    return generated;
  }, [activeHotel]);

  const handleOpenEdit = (number: string, categoryId: string) => {
    setEditingRoom({ oldNumber: number, roomCategoryId: categoryId, open: true });
    setNewRoomNumber(number);
  };

  const handleCloseEdit = () => {
    setEditingRoom(null);
    setNewRoomNumber('');
  };

  const handleSaveRoomNumber = async () => {
    if (!editingRoom || !newRoomNumber.trim()) return;
    if (newRoomNumber === editingRoom.oldNumber) {
        handleCloseEdit();
        return;
    }

    const dup = roomsData.find(r => r.number === newRoomNumber);
    if (dup) {
        toast.error(`Room number ${newRoomNumber} already exists in this hotel!`);
        return;
    }

    setIsSubmitting(true);
    const tid = toast.loading(`Reassigning Room ${editingRoom.oldNumber} to ${newRoomNumber}...`);
    try {
        const res = await fetch(`${API_BASE_URL}/api/content/hotels/${activeHotelId}/rooms/reassign`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`
            },
            body: JSON.stringify({
                oldNumber: editingRoom.oldNumber,
                newNumber: newRoomNumber,
                roomCategoryId: editingRoom.roomCategoryId
            })
        });

        const data = await res.json();
        if (res.ok) {
            toast.success(data.message || "Room Number Updated Successfully", { id: tid });
            queryClient.invalidateQueries({ queryKey: ['hotels-list'] });
            queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['unified-bookings'] });
            queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
            queryClient.invalidateQueries({ queryKey: ['room-status'] });
            handleCloseEdit();
        } else {
            throw new Error(data.message || "Failed to reassign room.");
        }
    } catch (err: any) {
        toast.error(err.message, { id: tid });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><p className="text-[10px] font-black tracking-widest text-[var(--lux-muted)] uppercase animate-pulse">Initializing Data Core...</p></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-[var(--lux-card)] p-8 rounded-[2.5rem] border border-[var(--lux-border)] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Settings size={120} />
         </div>
         <div className="relative z-10 w-full">
            <div className="flex items-center gap-3 mb-2">
               <div className="px-3 py-1 rounded bg-[var(--lux-gold)]/20 text-[var(--lux-gold)] text-[8px] font-black uppercase tracking-[0.3em]">
                  Admin Hub
               </div>
               <p className="text-[11px] font-black tracking-widest text-[var(--lux-muted)] uppercase">System Configuration</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-none mb-4">
               Room <span className="text-[var(--lux-gold)]">Settings</span>
            </h1>
         </div>
      </div>

      <div className="p-8 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[2.5rem]">
         <div className="flex items-center justify-between mb-8">
             <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
                 <Server size={20} className="text-[var(--lux-gold)]" />
                 Room Configuration Matrix
             </h2>
             <p className="text-[9px] uppercase tracking-widest font-black text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl">Advanced Control</p>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {roomsData.map((room, idx) => (
                 <div key={idx} className="p-6 bg-[var(--lux-bg)] rounded-3xl border border-[var(--lux-border)] group hover:border-[var(--lux-gold)]/40 hover:-translate-y-1 transition-all">
                     <div className="flex justify-between items-start mb-4">
                         <div>
                             <p className="text-[9px] uppercase font-black text-[var(--lux-muted)] tracking-widest">Room No.</p>
                             <h3 className="text-3xl font-display font-bold mt-1 group-hover:text-[var(--lux-gold)] transition-colors">{room.number}</h3>
                         </div>
                         <div className="text-right">
                             <p className="text-[7px] uppercase font-black text-[var(--lux-muted)] tracking-widest">ID</p>
                             <p className="text-[10px] font-bold opacity-50">#{room.categoryId}</p>
                         </div>
                     </div>
                     <p className="text-[11px] font-bold opacity-70 truncate mb-4">{room.type}</p>

                     <button 
                         onClick={() => handleOpenEdit(room.number, room.categoryId)}
                         className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-[var(--lux-gold)] hover:text-black transition-all rounded-xl text-[10px] uppercase font-black tracking-widest"
                     >
                         <Edit size={14} /> Change Number
                     </button>
                 </div>
             ))}
         </div>
      </div>

      <AnimatePresence>
          {editingRoom?.open && (
             <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseEdit} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500]" />
                <div className="fixed inset-0 z-[501] flex items-center justify-center pointer-events-none p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="w-full max-w-md bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar pointer-events-auto">
                        <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold uppercase tracking-widest">Reassign Room</h3>
                        <button onClick={handleCloseEdit} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-all"><X size={16} /></button>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                        <div className="p-4 bg-[var(--lux-bg)] rounded-2xl border border-[var(--lux-border)] text-center">
                            <p className="text-[10px] font-black uppercase text-[var(--lux-muted)] tracking-widest mb-1">Current Room Number</p>
                            <p className="text-3xl font-display font-bold line-through opacity-50">{editingRoom.oldNumber}</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[var(--lux-gold)] tracking-widest ml-1">New Room Number</label>
                            <input 
                                autoFocus
                                type="text"
                                value={newRoomNumber}
                                onChange={(e) => setNewRoomNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRoomNumber()}
                                className="w-full h-14 bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-2xl px-6 font-display font-bold text-xl text-center focus:border-[var(--lux-gold)] outline-none"
                            />
                        </div>

                        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-500">
                            <p className="text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">⚠️ Consequence Mapping Flow</p>
                            <ul className="text-[10px] font-medium leading-relaxed list-disc list-inside opacity-80 mt-2 space-y-1">
                                <li>Redirects all future & active bookings</li>
                                <li>Updates housekeeping and statuses seamlessly</li>
                                <li>Realigns financial ledgers under the new identity</li>
                                <li>Internal database relationships dynamically patched</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleCloseEdit} className="w-1/3 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all">Cancel</button>
                            <button 
                                onClick={handleSaveRoomNumber}
                                disabled={isSubmitting || newRoomNumber.trim() === '' || newRoomNumber === editingRoom.oldNumber}
                                className="w-2/3 h-14 rounded-2xl bg-[var(--lux-gold)] text-black font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[var(--lux-gold)]/20 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? 'Modifying...' : 'SaaS Reassign'}
                            </button>
                        </div>
                    </div>
                    </motion.div>
                </div>
             </>
          )}
      </AnimatePresence>
    </motion.div>
  );
};
