import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  FileDown, 
  CheckCircle, 
  Clock, 
  Trash2, 
  ChevronRight, 
  Phone, 
  User, 
  Smartphone, 
  TrendingUp, 
  Plus, 
  ShieldCheck, 
  Info,
  ArrowRight,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '../../config/constants';
import { getBookingFinancials } from '../../utils/financials';
import { NormalInput } from '../ui/LayoutGrid';

export const BookingActionsMenu = ({ booking, onAction, onViewDetails, onEdit, onDownload }: any) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('IRREVERSIBLE ACTION: Delete this booking record?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
      });
      if (res.ok) {
        toast.success("RECORD TERMINATED");
        onAction();
        queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
        queryClient.invalidateQueries({ queryKey: ['room-status'] });
      } else throw new Error("Deletion failed");
    } catch (err: any) { toast.error(err.message); }
    finally { setIsDeleting(false); }
  };

  const updateStatus = async (status: string) => {
    const tid = toast.loading(`Transitioning to ${status}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`STATUS: ${status}`, { id: tid });
        onAction();
        queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
        queryClient.invalidateQueries({ queryKey: ['room-status'] });
      } else throw new Error("Status update failed");
    } catch (err: any) { toast.error(err.message, { id: tid }); }
  };

  return (
    <div className="bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl shadow-2xl p-2 w-[220px] overflow-hidden">
       <div className="p-3 border-b border-white/5 bg-white/5 mb-1 rounded-t-xl">
          <p className="text-[7px] font-black uppercase text-[var(--lux-muted)] tracking-widest">Enterprise Actions</p>
       </div>
       <button type="button" onClick={onViewDetails} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase text-[var(--lux-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-all"><Eye size={14} /> Full Dossier</button>
       <button type="button" onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase text-[var(--lux-muted)] hover:text-white hover:bg-white/5 rounded-lg transition-all"><Edit size={14} /> Amend Record</button>
       <button type="button" onClick={onDownload} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase text-[var(--lux-muted)] hover:text-[var(--lux-gold)] hover:bg-white/5 rounded-lg transition-all"><FileDown size={14} /> Export Invoice</button>
       
       <div className="h-px bg-white/5 my-1" />
       
       <button type="button" onClick={() => updateStatus('confirmed')} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase text-green-500 hover:bg-green-500/10 rounded-lg transition-all"><CheckCircle size={14} /> Confirm Stay</button>
       <button type="button" onClick={() => updateStatus('cancelled')} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"><Clock size={14} /> Invalidate</button>
       <button type="button" onClick={handleDelete} disabled={isDeleting} className="w-full flex items-center gap-3 px-4 py-3 text-[9px] font-bold uppercase text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14} /> Terminate</button>
    </div>
  );
};

export const BookingDetailsDrawer = ({ booking, isOpen, onClose, onUpdate, onEditClick, onInvoiceClick }: any) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [cashPayment, setCashPayment] = useState<string>('');
  const [upiPayment, setUpiPayment] = useState<string>('');

  if (!booking) return null;
  const nights = Math.max(1, Math.ceil((new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / (1000 * 60 * 60 * 24)));

  const handleRecordPayment = async () => {
     const totalUpdateAmount = (Number(cashPayment) || 0) + (Number(upiPayment) || 0);
     if (totalUpdateAmount <= 0) return toast.error("Enter payment amount");
     
     setIsSubmitting(true);
     try {
       const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
         body: JSON.stringify({ 
           paymentDetails: { 
             totalAmount: Number(booking.totalAmount) || 0,
             paidAmount: (Number(booking.paidAmount) || 0) + totalUpdateAmount,
             onlinePaid: (Number(booking.onlinePaid) || 0) + (Number(upiPayment) || 0),
             offlinePaid: (Number(booking.offlinePaid) || 0) + (Number(cashPayment) || 0)
           } 
         })
       });
       if (res.ok) {
         toast.success("PAYMENT SUCCESSFULLY RECORDED");
         setCashPayment('');
         setUpiPayment('');
         queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
         queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
         onUpdate && onUpdate();
       } else throw new Error("Update failed");
     } catch (err: any) { toast.error(err.message); }
     finally { setIsSubmitting(false); }
  };

  const handleAddExtraCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraName || !extraPrice) return toast.error("Enter item and price");
    setIsSubmitting(true);
    try {
      const newExtras = [...(booking.extraCharges || []), { name: extraName, price: Number(extraPrice), paid: false }];
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ extraCharges: newExtras })
      });
      if (res.ok) {
        toast.success("Extra Charge Added");
        setExtraName(''); setExtraPrice('');
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
      }
    } catch (err: any) { toast.error(err.message); }
    finally { setIsSubmitting(false); }
  };

  const toggleExtraPaidStatus = async (index: number) => {
    try {
      const newExtras = [...(booking.extraCharges || [])];
      newExtras[index].paid = !newExtras[index].paid;
      await fetch(`${API_BASE_URL}/api/content/bookings/admin/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` },
        body: JSON.stringify({ extraCharges: newExtras })
      });
      queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings-all'] });
    } catch (err) { toast.error("Update failed"); }
  };

  const financials = getBookingFinancials(booking);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 w-full max-w-xl h-full bg-[var(--lux-bg)] border-l border-[var(--lux-border)] z-[501] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[var(--lux-card)]">
               <div>
                  <h2 className="text-3xl font-display font-bold italic tracking-tight">Booking <span className="text-[var(--lux-gold)] shadow-[0_0_20px_rgba(212,175,55,0.2)]">Details</span></h2>
                  <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] tracking-[0.3em] mt-1">ID: {booking._id?.slice(-12).toUpperCase()}</p>
               </div>
               <button type="button" onClick={onClose} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 shadow-xl text-white">
                  <ChevronRight size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
               
              {/* Alert Segment */}
              {booking.status === 'cancelled' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center gap-5">
                   <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                      <Clock size={24} />
                   </div>
                   <div>
                      <h4 className="font-bold text-red-500 uppercase text-[10px] tracking-widest leading-none mb-1">Stay Cancelled</h4>
                      <p className="text-[9px] text-red-500/60 font-medium">This record has been marked as invalid and is no longer active.</p>
                   </div>
                </motion.div>
              )}

              {/* Guest Segment */}
              <div className="p-6 bg-[var(--lux-bg)] rounded-3xl border border-[var(--lux-border)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <User size={60} />
                </div>
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[8px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Guest Profile</p>
                   <div className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${booking.guestDetails?.photo ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      KYC: {booking.guestDetails?.photo ? 'Verified' : 'Pending'}
                   </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)] font-bold text-2xl border border-[var(--lux-gold)]/20">
                    {booking.guestDetails?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold tracking-tight">{booking.guestDetails?.name}</h4>
                    <p className="text-xs text-[var(--lux-muted)] font-bold">{booking.guestDetails?.phone}</p>
                    <p className="text-[9px] text-[var(--lux-gold)] font-black mt-1 uppercase tracking-widest truncate max-w-[200px]">{booking.guestDetails?.email || 'N/A'}</p>
                  </div>
                  <button type="button" className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm">
                     <Phone size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-3 gap-3">
                 <button type="button" className="flex flex-col items-center gap-2 p-3 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl hover:border-[var(--lux-gold)] transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                       <Smartphone size={16} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Message</span>
                 </button>
                 <button type="button" onClick={onEditClick} className="flex flex-col items-center gap-2 p-3 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl hover:border-[var(--lux-gold)] transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                       <Edit size={16} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Edit</span>
                 </button>
                 <button type="button" className="flex flex-col items-center gap-2 p-3 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-2xl hover:border-red-500 transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                       <Trash2 size={16} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--lux-muted)]">Cancel</span>
                 </button>
              </div>

              {/* Room & Stay Details */}
              <div className="p-6 bg-[var(--lux-card)] rounded-[2rem] border border-[var(--lux-border)] space-y-5 shadow-sm">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase text-[var(--lux-muted)]">Assigned Room</p>
                       <p className="text-2xl font-display font-bold">Room <span className="text-[var(--lux-gold)]">{booking.roomNumber || '---'}</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-black uppercase text-[var(--lux-muted)] mb-1">{booking.roomType || 'Classic'}</p>
                       <p className="text-[10px] font-bold flex items-center gap-1.5 justify-end">
                          <Users size={12} className="text-[var(--lux-gold)]" /> {booking.guests || 2} Adults
                       </p>
                    </div>
                 </div>

                 <div className="h-px bg-[var(--lux-border)] opacity-20" />

                 <div className="grid grid-cols-2 gap-6 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--lux-bg)] border border-[var(--lux-border)] rounded-full flex items-center justify-center text-[8px] font-black uppercase text-[var(--lux-gold)] z-10 shadow-sm">
                       {nights}N
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase text-[var(--lux-muted)]">Check-in</p>
                       <p className="text-[10px] font-bold">{new Date(booking.checkin).toDateString()}</p>
                       <p className="text-[8px] font-black uppercase text-[var(--lux-gold)]">02:00 PM</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[8px] font-black uppercase text-[var(--lux-muted)]">Check-out</p>
                       <p className="text-[10px] font-bold">{new Date(booking.checkout).toDateString()}</p>
                       <p className="text-[8px] font-black uppercase text-[var(--lux-gold)]">11:00 AM</p>
                    </div>
                 </div>
              </div>               {/* Extra Services Section */}
               <div className="p-6 bg-[var(--lux-card)] rounded-[2rem] border border-[var(--lux-border)] space-y-6 shadow-sm">
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black uppercase text-[var(--lux-muted)] tracking-widest">Extra Services / Food</p>
                    <p className="text-[12px] font-bold text-[var(--lux-muted)]">₹{financials.extrasTotal}</p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {(booking.extraCharges || []).length > 0 ? (
                      booking.extraCharges.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-[var(--lux-gold)]/20 transition-all">
                          <div className="space-y-1">
                            <p className="text-[12px] font-bold">{item.name}</p>
                            <p className="text-[10px] font-bold text-[var(--lux-muted)] uppercase tracking-widest">₹{item.price}</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => toggleExtraPaidStatus(idx)}
                            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${item.paid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                          >
                            {item.paid ? 'Paid' : 'Unpaid'}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[9px] text-center italic text-[var(--lux-muted)] opacity-50 py-4 font-bold uppercase tracking-widest">No extra services manifested</p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex gap-2">
                    <input 
                      type="text" placeholder="Item (e.g. Lunch)" value={extraName} onChange={e => setExtraName(e.target.value)}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all"
                    />
                    <input 
                      type="number" placeholder="Price" value={extraPrice} onChange={e => setExtraPrice(e.target.value)}
                      className="w-24 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all"
                    />
                    <button type="button" onClick={handleAddExtraCharge} disabled={isSubmitting} className="px-6 bg-[var(--lux-gold)] text-black rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all disabled:opacity-50">
                      Add
                    </button>
                  </div>
               </div>

              {/* Financial Status Summary */}
              <div className="p-8 bg-white/[0.03] rounded-[2.5rem] border border-white/5 space-y-8 relative overflow-hidden backdrop-blur-md shadow-inner">
                 <div className="flex justify-between items-center relative z-10 px-2">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-widest leading-none">Total Amount</p>
                       <h3 className="text-4xl font-display font-bold leading-none tracking-tight">₹{financials.total}</h3>
                    </div>
                    <div className="text-right space-y-2">
                       <p className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-widest leading-none">Balance Due</p>
                       <h3 className="text-4xl font-display font-bold leading-none tracking-tight text-red-500">₹{financials.balance}</h3>
                    </div>
                 </div>

                 <div className="space-y-3 px-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--lux-muted)]">
                       <span>Settlement Progress</span>
                       <span className="text-white">{financials.paidPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${financials.paidPercent}%` }}
                         className="h-full rounded-full bg-[var(--lux-gold)] shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                       />
                    </div>
                 </div>
              </div>

              {/* Settle Balance Section */}
              <div className="p-8 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[2.5rem] space-y-8 shadow-sm">
                 <div className="flex items-center justify-between px-2">
                    <h4 className="text-[12px] font-black uppercase tracking-[0.2em]">Settle Balance</h4>
                    <ShieldCheck size={18} className="text-[var(--lux-muted)] opacity-50" />
                 </div>

                 <div className="grid grid-cols-2 gap-6 px-1">
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-widest pl-1">Offline (Cash)</p>
                       <input 
                         type="number" value={cashPayment} onChange={e => setCashPayment(e.target.value)} placeholder="₹0"
                         className="w-full h-14 bg-black/20 border border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:border-[var(--lux-gold)]"
                       />
                    </div>
                    <div className="space-y-3">
                       <p className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-widest pl-1">Online (UPI)</p>
                       <input 
                         type="number" value={upiPayment} onChange={e => setUpiPayment(e.target.value)} placeholder="₹0"
                         className="w-full h-14 bg-black/20 border border-white/5 rounded-2xl px-6 text-sm font-bold outline-none focus:border-[var(--lux-gold)]"
                       />
                    </div>
                 </div>

                 <button 
                   type="button" onClick={handleRecordPayment} disabled={isSubmitting}
                   className="w-full h-16 bg-[var(--lux-gold)] text-black rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] shadow-xl shadow-[var(--lux-gold)]/10 transition-all disabled:opacity-50"
                 >
                   {isSubmitting ? 'Recording...' : 'Record Payment'}
                 </button>
              </div>

               {/* Restriction Alert / Actions */}
               <div className="space-y-6 pb-12">
                  {financials.balance > 0 ? (
                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-5">
                       <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                          <Info size={16} />
                       </div>
                       <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                          ⚠️ Checkout Restricted. Clear ₹{financials.balance} Balance First.
                       </p>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => onUpdate && onUpdate()}
                      className="w-full h-16 bg-green-500 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:scale-[1.02] shadow-xl shadow-green-500/20 transition-all"
                    >
                       Clear & Checkout Record
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <button type="button" onClick={() => onInvoiceClick(booking)} className="h-14 bg-black border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-900 transition-all shadow-xl">
                        <FileDown size={18} /> Invoice
                     </button>
                     <button type="button" onClick={onEditClick} className="h-14 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all shadow-xl">
                        <Edit size={18} /> Edit
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const EditBookingDrawer = ({ booking, isOpen, onClose, onUpdate }: any) => {
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
        paidAmount: booking.paidAmount || 0,
        offlinePaid: booking.offlinePaid || 0,
        onlinePaid: booking.onlinePaid || 0
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
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`
        },
        body: JSON.stringify({
          guestDetails: { name: formData.name, phone: formData.phone, email: formData.email },
          stayDetails: { checkin: formData.checkin, checkout: formData.checkout, roomNumber: formData.roomNumber },
          paymentDetails: { 
            totalAmount: formData.totalAmount, 
            paidAmount: (Number(formData.offlinePaid) || 0) + (Number(formData.onlinePaid) || 0),
            offlinePaid: Number(formData.offlinePaid) || 0,
            onlinePaid: Number(formData.onlinePaid) || 0
          }
        })
      });
      if (res.ok) {
        toast.success("BOOKING RECORDS UPDATED");
        onUpdate && onUpdate();
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
                <button type="button" onClick={onClose} className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center hover:bg-red-500 transition-all text-white"><ArrowRight size={18} /></button>
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
                      <NormalInput label="Offline Paid (₹)" type="number" value={formData.offlinePaid} onChange={(v: string) => setFormData({...formData, offlinePaid: Number(v)})} required />
                       <NormalInput label="Online Paid (₹)" type="number" value={formData.onlinePaid} onChange={(v: string) => setFormData({...formData, onlinePaid: Number(v)})} required />
                   </div>
                   <div className="p-4 bg-[var(--lux-bg)] rounded-xl border border-[var(--lux-border)]">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold uppercase text-[var(--lux-muted)]">Calculated Balance</span>
                         <span className={`text-lg font-bold ${formData.totalAmount - ((Number(formData.offlinePaid) || 0) + (Number(formData.onlinePaid) || 0)) > 0 ? 'text-red-500' : 'text-green-500'}`}>₹{formData.totalAmount - ((Number(formData.offlinePaid) || 0) + (Number(formData.onlinePaid) || 0))}</span>
                      </div>
                   </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--lux-gold)]/20 active:scale-95 transition-all">
                   {isSaving ? 'Saving Changes...' : 'Save Updated Records'}
                </button>
             </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
