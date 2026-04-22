const ReceptionConsole = ({ activeHotelId, onHotelChange }: { activeHotelId: string, onHotelChange: (id: string) => void }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'form'>('dashboard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: hotels = [], isLoading: loadingHotels } = useHotelsList();
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  const activeHotel = hotels.find((h: any) => h.id === activeHotelId);
  const { data: unifiedBookings = [] } = useActiveBookings(activeHotelId);
  const { data: physicalStatuses = [] } = useRoomStatus(activeHotelId);

  const rooms = useMemo(() => {
    if (!activeHotel) return [];
    const generated: any[] = [];
    activeHotel.rooms.forEach((roomType: any, idx: number) => {
      const count = Number(roomType.total_rooms) || 0;
      const startNum = (idx + 1) * 100 + 1;
      
      let numbers = roomType.numbers && roomType.numbers.length > 0 ? [...roomType.numbers] : [];
      if (numbers.length > count) numbers = numbers.slice(0, count);
      while (numbers.length < count) {
        const nextNum = (startNum + numbers.length).toString();
        if (!numbers.includes(nextNum)) numbers.push(nextNum);
        else {
          let offset = 1;
          while(numbers.includes((startNum + numbers.length + offset).toString())) offset++;
          numbers.push((startNum + numbers.length + offset).toString());
        }
      }

      numbers.forEach((num: string) => {
        const booking = unifiedBookings.find((b: any) => b.roomNumber === num);
        const manualStatus = physicalStatuses.find((s: any) => s.roomNumber === num);
        generated.push({
          number: num,
          type: roomType.type,
          price: roomType.price,
          status: manualStatus?.status || (booking ? 'Booked' : 'Available')
        });
      });
    });
    return generated;
  }, [activeHotel, unifiedBookings, physicalStatuses]);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', guests: 1,
    roomNumber: '', roomType: '', hotelName: '',
    checkin: new Date().toISOString().split('T')[0],
    checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalAmount: 0, cashPaid: 0, upiPaid: 0, onlinePaid: 0, paymentMethod: 'Partial'
  });

  const handleWalkInSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        guestDetails: { name: formData.name, phone: formData.phone, email: formData.email, guests: formData.guests },
        stayDetails: { 
          hotel_id: activeHotelId, 
          roomNumber: formData.roomNumber, 
          checkin: formData.checkin, 
          checkout: formData.checkout, 
          guests: formData.guests 
        },
        paymentDetails: { 
          totalAmount: formData.totalAmount, 
          paidAmount: formData.cashPaid + formData.upiPaid + formData.onlinePaid, 
          cashPaid: formData.cashPaid, 
          upiPaid: formData.upiPaid, 
          onlinePaid: formData.onlinePaid,
          paymentMethod: 'Partial'
        }
      };

      const res = await fetch(\`\${API_BASE_URL}/api/content/bookings/walk-in\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success("Walk-in booking created successfully!");
        setActiveView('dashboard');
        queryClient.invalidateQueries({ queryKey: ['active-bookings'] });
      } else {
        const data = await res.json();
        throw new Error(data.message || "Booking failed");
      }
    } catch (err: any) { 
      toast.error(err.message); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  useEffect(() => {
    if (formData.checkin && formData.checkout && formData.roomType && activeHotel) {
        const start = new Date(formData.checkin);
        const end = new Date(formData.checkout);
        const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const room = activeHotel.rooms.find((r: any) => r.type === formData.roomType);
        if (room) {
           const total = nights * room.price;
           setFormData(prev => ({ ...prev, totalAmount: total }));
        }
    }
  }, [formData.checkin, formData.checkout, formData.roomType, activeHotel]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center gap-6 pb-6 border-b border-[var(--lux-border)]">
        <div>
           <h1 className="text-3xl font-display font-bold">Reception <span className="text-[var(--lux-gold)]">Console</span></h1>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-[var(--lux-border)] shadow-sm">
          {['dashboard', 'form'].map((v) => (
            <button key={v} onClick={() => setActiveView(v as any)} className={\`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all \${activeView === v ? 'bg-[var(--lux-gold)] text-white' : 'text-[var(--lux-muted)] hover:bg-[var(--lux-bg)]'}\`}>
              {v === 'dashboard' ? 'Ledger' : 'Check-in'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="normal-card !p-0 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-[var(--lux-bg)] border-b border-[var(--lux-border)] text-[10px] uppercase text-[var(--lux-muted)] font-black">
                   <tr>
                      <th className="p-4">Guest</th>
                      <th className="p-4">Room</th>
                      <th className="p-4">Balance</th>
                      <th className="p-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lux-border)]">
                   {unifiedBookings.map((b: any) => (
                      <tr key={b._id} className="text-[11px] hover:bg-[var(--lux-bg)]">
                         <td className="p-4"><b>{b.guestDetails?.name}</b><br/>{b.guestDetails?.phone}</td>
                         <td className="p-4 font-bold text-[var(--lux-gold)]">{b.roomNumber}</td>
                         <td className="p-4 font-bold text-red-500">₹{b.balanceAmount}</td>
                         <td className="p-4 text-right"><button onClick={() => { setSelectedBooking(b); setShowDrawer(true); }}><Eye size={16} /></button></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6 normal-card">
             <div className="grid grid-cols-2 gap-6">
                <NormalInput label="Full Name" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} required />
                <NormalInput label="Phone" value={formData.phone} onChange={(v:any) => setFormData({...formData, phone: v})} required />
                <NormalSelect label="Room Type" value={formData.roomType} onChange={(v:any) => setFormData({...formData, roomType: v})} options={activeHotel?.rooms.map((r: any) => ({ value: r.type, label: r.type }))} />
                <NormalSelect label="Room No" value={formData.roomNumber} onChange={(v:any) => setFormData({...formData, roomNumber: v})} options={rooms.filter(r => r.type === formData.roomType).map(r => ({ value: r.number, label: r.number }))} />
                <NormalInput label="Check-in" type="date" value={formData.checkin} onChange={(v:any) => setFormData({...formData, checkin: v})} />
                <NormalInput label="Check-out" type="date" value={formData.checkout} onChange={(v:any) => setFormData({...formData, checkout: v})} />
                <div className="col-span-2 grid grid-cols-3 gap-4 border-t pt-4">
                   <NormalInput label="Cash Amount (₹)" type="number" value={formData.cashPaid} onChange={(v:any) => setFormData({...formData, cashPaid: parseInt(v) || 0})} />
                   <NormalInput label="UPI Amount (₹)" type="number" value={formData.upiPaid} onChange={(v:any) => setFormData({...formData, upiPaid: parseInt(v) || 0})} />
                   <NormalInput label="Online Amount (₹)" type="number" value={formData.onlinePaid} onChange={(v:any) => setFormData({...formData, onlinePaid: parseInt(v) || 0})} />
                </div>
                <button onClick={handleWalkInSubmit} disabled={isSubmitting} className="col-span-2 w-full py-4 bg-[var(--lux-gold)] text-white rounded-xl font-black uppercase tracking-widest text-[12px]">
                   {isSubmitting ? 'Confirming...' : 'Confirm Check-in'}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingDetailsDrawer booking={selectedBooking} isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </div>
  );
};

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
        cashPaid: booking.cashPaid || 0,
        upiPaid: booking.upiPaid || 0,
        onlinePaid: booking.onlinePaid || 0
      });
    }
  }, [booking]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/content/bookings/admin/\${booking._id}\`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('hotel_token')}\`
        },
        body: JSON.stringify({
          guestDetails: { name: formData.name, phone: formData.phone, email: formData.email },
          stayDetails: { checkin: formData.checkin, checkout: formData.checkout, roomNumber: formData.roomNumber },
          paymentDetails: { 
            totalAmount: formData.totalAmount, 
            paidAmount: (Number(formData.cashPaid) || 0) + (Number(formData.upiPaid) || 0) + (Number(formData.onlinePaid) || 0),
            cashPaid: Number(formData.cashPaid) || 0,
            upiPaid: Number(formData.upiPaid) || 0,
            onlinePaid: Number(formData.onlinePaid) || 0
          }
        })
      });
      if (res.ok) {
        toast.success("RECORDS UPDATED");
        onUpdate();
        onClose();
      } else throw new Error("Update failed");
    } catch (err: any) { toast.error(err.message); } finally { setIsSaving(false); }
  };

  if (!formData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250]" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 w-full max-w-md h-full bg-[var(--lux-card)] border-l border-[var(--lux-border)] z-[251] p-8 overflow-y-auto">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-display font-bold uppercase tracking-tight italic">Edit <span className="text-[var(--lux-gold)]">Record</span></h2>
                <button onClick={onClose} className="w-10 h-10 bg-[var(--lux-glass)] rounded-xl flex items-center justify-center hover:bg-red-500 transition-all text-white"><ArrowRight size={18} /></button>
             </div>
             <form onSubmit={handleSave} className="space-y-6 pb-20">
                <NormalInput label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
                <div className="grid grid-cols-2 gap-4">
                  <NormalInput label="Phone" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} required />
                  <NormalInput label="Email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <NormalInput label="Check-in" type="date" value={formData.checkin} onChange={(v: string) => setFormData({...formData, checkin: v})} required />
                  <NormalInput label="Check-out" type="date" value={formData.checkout} onChange={(v: string) => setFormData({...formData, checkout: v})} required />
                </div>
                <NormalInput label="Room No" value={formData.roomNumber} onChange={(v: string) => setFormData({...formData, roomNumber: v})} />
                <div className="space-y-4 pt-4 border-t border-white/5">
                   <NormalInput label="Total Amount (₹)" type="number" value={formData.totalAmount} onChange={(v: string) => setFormData({...formData, totalAmount: Number(v)})} required />
                   <div className="grid grid-cols-3 gap-3">
                      <NormalInput label="Cash" type="number" value={formData.cashPaid} onChange={(v: any) => setFormData({...formData, cashPaid: Number(v)})} />
                      <NormalInput label="UPI" type="number" value={formData.upiPaid} onChange={(v: any) => setFormData({...formData, upiPaid: Number(v)})} />
                      <NormalInput label="Bank" type="number" value={formData.onlinePaid} onChange={(v: any) => setFormData({...formData, onlinePaid: Number(v)})} />
                   </div>
                   <div className="p-4 bg-[var(--lux-bg)] rounded-xl border border-[var(--lux-border)] flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-[var(--lux-muted)] tracking-widest">Balance</span>
                      <span className={\`text-lg font-bold \${formData.totalAmount - (formData.cashPaid + formData.upiPaid + formData.onlinePaid) > 0 ? 'text-red-500' : 'text-green-500'}\`}>₹{formData.totalAmount - (formData.cashPaid + formData.upiPaid + formData.onlinePaid)}</span>
                   </div>
                </div>
                <button disabled={isSaving} className="w-full py-4 bg-[var(--lux-gold)] text-black rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--lux-gold)]/20 active:scale-95 transition-all">
                   {isSaving ? 'Saving...' : 'Settle Records'}
                </button>
             </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

