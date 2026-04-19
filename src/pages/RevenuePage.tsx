import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Globe, 
  AlertCircle, 
  Download, 
  Search, 
  Calendar, 
  ChevronDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Target,
  Clock,
  User,
  Zap,
  Filter,
  Sparkles,
  LayoutGrid,
  X
} from 'lucide-react';
import { 
  XAxis, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { useUnifiedBookings } from '../hooks/useHotelData';
import { PremiumDatePicker } from '../components/ui/DatePicker';
import { getBookingFinancials } from '../utils/financials';
import { toast } from 'sonner';

const GrowthBadge = ({ current, previous, label }: any) => {
  const diff = current - previous;
  const percent = previous > 0 ? Math.round((diff / previous) * 100) : (current > 0 ? 100 : 0);
  const isUp = percent >= 0;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
       {isUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
       {Math.abs(percent)}% vs {label}
    </div>
  );
};

export const RevenuePage = ({ activeHotelId, onReportClick }: any) => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const { data: bookings = [], isLoading } = useUnifiedBookings(activeHotelId);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Advanced Analytics Engine
  const analysis = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let curRange = { start: startOfToday, end: now };
    let prevRange = { start: new Date(startOfToday.getTime() - 86400000), end: startOfToday };

    const getRange = (days: number) => ({
      cur: { start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000), end: now },
      prev: { start: new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - days * 24 * 60 * 60 * 1000) }
    });

    const getMonthRange = (months: number) => ({
      cur: { start: new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000), end: now },
      prev: { start: new Date(now.getTime() - 2 * months * 30 * 24 * 60 * 60 * 1000), end: new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000) }
    });

    const ranges: any = {
      '1d': getRange(1),
      '3d': getRange(3),
      '7d': getRange(7),
      '14d': getRange(14),
      '30d': getRange(30),
      '12m': getMonthRange(12)
    };

    if (ranges[timeFilter]) {
      curRange = ranges[timeFilter].cur;
      prevRange = ranges[timeFilter].prev;
    } else if (timeFilter === 'custom' && customStart && customEnd) {
      curRange = { start: new Date(customStart), end: new Date(customEnd + 'T23:59:59') };
      const duration = curRange.end.getTime() - curRange.start.getTime();
      prevRange = { start: new Date(curRange.start.getTime() - duration), end: curRange.start };
    }

    const processSet = (data: any[]) => {
      let totals = { revenue: 0, cash: 0, online: 0, ota: 0, pending: 0, partial: 0, count: 0 };
      const sources: any = {};
      const methods: any = {};
      const daily: any = {};
      const roomRev: any = {};
      const pendingItems: any[] = [];

      data.forEach(b => {
        const fin = getBookingFinancials(b);
        
        // Breakdown payment by actual fields
        const bCash = Number(b.offlinePaid || 0) + (fin.extrasPaid || 0);
        const bOnline = Number(b.onlinePaid || 0);
        
        totals.revenue += fin.paid;
        totals.cash += bCash;
        totals.online += bOnline;
        totals.pending += fin.balance;
        totals.count++;

        if (fin.balance > 0) {
          totals.partial++;
          pendingItems.push({ 
            room: b.roomNumber, 
            guest: b.guestDetails?.name, 
            balance: fin.balance, 
            total: fin.total, 
            date: b.createdAt 
          });
        }

        // Method Distribution for the Chart
        if (bCash > 0) {
          methods['Cash'] = (methods['Cash'] || 0) + bCash;
        }
        if (bOnline > 0) {
          // If a specific online method is logged (UPI, Card, Bank), use it. Default to 'UPI'.
          const onlineKey = (b.paymentMethod && b.paymentMethod !== 'Cash') ? b.paymentMethod : 'UPI';
          methods[onlineKey] = (methods[onlineKey] || 0) + bOnline;
        }

        // Financial Integrity: Handle unattributed payments (Total Paid > Offline + Online)
        const remainingPaid = Math.max(0, fin.paid - (bCash + bOnline));
        
        if (remainingPaid > 0) {
          // Attribute remaining to the primary method or source
          const method = b.paymentMethod;
          
          if (method === 'Cash' || (!method && b.bookingSource === 'walk_in')) {
            totals.cash += remainingPaid;
            methods['Cash'] = (methods['Cash'] || 0) + remainingPaid;
          } else {
            // Default to Online for OTA or explicit Digital methods
            totals.online += remainingPaid;
            const onlineKey = (method && method !== 'Cash') ? method : 'UPI';
            methods[onlineKey] = (methods[onlineKey] || 0) + remainingPaid;
          }
        }

        const source = b.bookingSource === 'ota' ? (b.bookingPlatform || 'OTA') : 'Walk-in';
        sources[source] = (sources[source] || 0) + fin.paid;
        if (b.bookingSource === 'ota') totals.ota += fin.paid;

        const day = new Date(b.createdAt).toLocaleDateString('en-CA');
        daily[day] = (daily[day] || 0) + fin.paid;

        if (b.roomNumber) {
          roomRev[b.roomNumber] = (roomRev[b.roomNumber] || 0) + fin.paid;
        }
      });
      const sortedSources = Object.entries(sources).sort((a: any, b: any) => b[1] - a[1]);
      const topSource = sortedSources[0]?.[0] || 'Direct';
      const avgBookingValue = data.length > 0 ? totals.revenue / data.length : 0;

      return { totals, sources, methods, daily, roomRev, pendingItems, topSource, avgBookingValue };
    };

    const currentBookings = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d >= curRange.start && d <= curRange.end;
    });

    const prevBookingsArr = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d >= prevRange.start && d <= prevRange.end;
    });

    const curStats = processSet(currentBookings);
    const prevStats = processSet(prevBookingsArr);



    const roomPerformance = Object.entries(curStats.roomRev).sort((a:any, b:any) => b[1] - a[1]);
    const topRoom = roomPerformance[0]?.[0] || 'N/A';
    const lowRoom = roomPerformance.length > 1 ? roomPerformance[roomPerformance.length - 1][0] : 'N/A';

    // Filter Logic for Table
    const filteredForTable = currentBookings.filter(b => {
      const matchesSearch = b.guestDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.roomNumber?.toString().includes(searchQuery);
      
      // Method Filter with Legacy Fallback
      let method = b.paymentMethod;
      if (!method) {
        if (b.offlinePaid > 0) method = 'Cash';
        else method = 'UPI';
      }
      
      const matchesMethod = methodFilter === 'All' || method === methodFilter || (methodFilter === 'Bank' && method === 'Bank Transfer');
      const matchesSource = sourceFilter === 'All' || b.bookingSource === sourceFilter;
      return matchesSearch && matchesMethod && matchesSource;
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { 
      cur: curStats, 
      prev: prevStats, 
      topRoom, 
      lowRoom, 
      compLabel: timeFilter === '1d' ? 'Yesterday' : `Prev ${timeFilter}`,
      recentActivity: currentBookings.slice(0, 10),
      tableData: filteredForTable
    };
  }, [bookings, timeFilter, customStart, customEnd, searchQuery, methodFilter, sourceFilter]);

  const stats = analysis.cur;

  const handleExport = () => {
    onReportClick({
      stats,
      filteredData: analysis.tableData,
      timeFilter,
      customRange: { start: customStart, end: customEnd }
    });
  };

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-4 border-[var(--lux-gold)] border-t-transparent rounded-full animate-spin shadow-[0_0_20px_var(--lux-gold-light)]"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--lux-gold)] animate-pulse">Syncing Revenue Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-4xl font-display font-black flex items-center gap-4">
            <TrendingUp className="text-[var(--lux-gold)]" size={32} /> Payment <span className="text-[var(--lux-gold)]">Architecture</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#A1A1AA] mt-2">Enterprise Revenue Command Center</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-[var(--lux-soft)] p-2 rounded-2xl border border-[var(--lux-border)] shadow-2xl backdrop-blur-xl">
          {[
            { id: '1d', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '1 Month' },
            { id: '12m', label: '1 Year' },
            { id: 'custom', label: 'Custom' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setTimeFilter(f.id)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${timeFilter === f.id ? 'bg-[var(--lux-gradient-gold)] text-black shadow-lg shadow-[var(--lux-gold)]/20' : 'text-[var(--lux-muted)] hover:text-white hover:bg-white/5'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {timeFilter === 'custom' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-8 p-8 bg-[var(--lux-soft)] rounded-3xl border border-white/5">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Start Date</label>
            <PremiumDatePicker value={customStart} onChange={setCustomStart} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-40">End Date</label>
            <PremiumDatePicker value={customEnd} onChange={setCustomEnd} />
          </div>
        </motion.div>
      )}

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { label: 'Total Revenue', value: stats.totals.revenue, prev: analysis.prev.totals.revenue, icon: DollarSign, color: 'text-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
          { label: 'Cash Flow', value: stats.totals.cash, prev: analysis.prev.totals.cash, icon: Wallet, color: 'text-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
          { label: 'Digital/Online', value: stats.totals.online, prev: analysis.prev.totals.online, icon: Zap, color: 'text-blue-500', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
          { label: 'OTA Secured', value: stats.totals.ota, prev: analysis.prev.totals.ota, icon: Globe, color: 'text-purple-500', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]' },
          { label: 'Partial Settlements', value: stats.totals.partial, prev: analysis.prev.totals.partial, icon: CreditCard, color: 'text-orange-500', isCount: true },
          { label: 'At Risk / Pending', value: stats.totals.pending, prev: analysis.prev.totals.pending, icon: AlertCircle, color: 'text-red-500', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]', clickable: true }
        ].map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => card.clickable && setShowPendingModal(true)}
            className={`bg-[var(--lux-gradient-surface)] p-8 rounded-[2.5rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group transition-all duration-500 ${card.clickable ? 'cursor-pointer hover:border-red-500/30' : 'hover:border-white/10'} ${card.glow || ''}`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B7280] leading-none">{card.label}</p>
              <h3 className={`text-2xl font-display font-black leading-none ${card.color}`}>
                {card.isCount ? card.value : `₹${card.value.toLocaleString()}`}
              </h3>
            </div>
            <GrowthBadge current={card.value} previous={card.prev} label={analysis.compLabel} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Split */}
            <div className="bg-[var(--lux-gradient-surface)] p-10 rounded-[3rem] border border-white/10 space-y-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <PieChart size={18} />
                </div>
                <h4 className="text-[12px] font-black uppercase tracking-widest text-[var(--lux-text)]">Payment Architecture</h4>
              </div>
              <div className="space-y-8">
                {Object.entries(stats.methods).map(([name, val]: any) => {
                  const percent = Math.round((val / (stats.totals.revenue || 1)) * 100);
                  return (
                    <div key={name} className="space-y-3 font-display">
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter">
                        <span>{name}</span>
                        <span>₹{val.toLocaleString()} ({percent}%)</span>
                      </div>
                      <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${percent}%` }} 
                          className={`h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] ${
                             name === 'Cash' ? 'bg-emerald-500' : 
                             name === 'UPI' ? 'bg-blue-500' : 
                             name === 'Card' ? 'bg-amber-500' : 
                             name === 'Bank Transfer' ? 'bg-purple-500' : 'bg-gray-500'
                          }`} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Source Performance */}
            <div className="bg-[var(--lux-gradient-surface)] p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Target size={18} />
                </div>
                <h4 className="text-[12px] font-black uppercase tracking-widest text-[var(--lux-text)]">Source Intelligence</h4>
              </div>
              <div className="space-y-8">
                {Object.entries(stats.sources).map(([name, val]: any) => {
                  const percent = Math.round((val / (stats.totals.revenue || 1)) * 100);
                  const colors: any = { 
                    'GoMMT': 'bg-gradient-to-r from-red-600 to-red-400', 
                    'Booking.com': 'bg-gradient-to-r from-blue-700 to-blue-500', 
                    'Agoda': 'bg-gradient-to-r from-purple-600 to-purple-400', 
                    'OYO': 'bg-gradient-to-r from-red-700 to-red-500', 
                    'Walk-in': 'bg-[var(--lux-gradient-gold)]' 
                  };
                  return (
                    <div key={name} className="space-y-3">
                      <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-tighter">
                        <span>{name}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className={`h-full rounded-full ${colors[name] || 'bg-gray-500'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-[var(--lux-card)] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-[var(--lux-border)] flex flex-col md:flex-row justify-between items-center gap-6 bg-[var(--lux-soft)]/20">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-[var(--lux-gold)]/10 rounded-2xl flex items-center justify-center text-[var(--lux-gold)]">
                      <Clock size={20} />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Transaction Log</h4>
                      <p className="text-[9px] font-bold text-[var(--lux-muted)] mt-1">{analysis.tableData.length} records</p>
                   </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                   <div className="relative group flex-1 md:w-80">
                      <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-colors" />
                      <input 
                        type="text" placeholder="Search guests or room records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full lux-glass border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-[11px] font-bold outline-none focus:border-[var(--lux-gold)] transition-all shadow-xl placeholder:text-white/20 text-white" 
                      />
                   </div>
                    <div className="flex items-center gap-2 p-1.5 bg-[var(--lux-soft)]/50 rounded-2xl border border-[var(--lux-border)]">
                         <button onClick={handleExport} className="p-3 bg-white/5 text-[var(--lux-text)]/40 hover:text-[var(--lux-text)] rounded-xl"><Download size={16} /></button>
                         <button onClick={() => toast.info("Excel Export Started...")} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CreditCard size={16} /></button>
                     </div>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.2em] text-[var(--lux-muted)] border-b border-white/5">
                         <th className="p-8">Entity / Date</th>
                         <th className="p-8">Unit</th>
                         <th className="p-8">Financials</th>
                         <th className="p-8">Method</th>
                         <th className="p-8">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {analysis.tableData.map((b: any) => {
                        const fin = getBookingFinancials(b);
                        return (
                          <tr key={b._id} className="group hover:bg-white/[0.01]">
                             <td className="p-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--lux-muted)]"><User size={16} /></div>
                                   <div>
                                      <p className="font-bold text-[12px]">{b.guestDetails?.name}</p>
                                      <p className="text-[9px] text-[#6B7280] mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <span className="text-[10px] font-black bg-white/5 px-4 py-2 rounded-xl">#{b.roomNumber}</span>
                             </td>
                             <td className="p-8">
                                <p className="text-[12px] font-bold">₹{fin.paid.toLocaleString()}</p>
                                <p className="text-[8px] opacity-30 mt-1">OF ₹{fin.total.toLocaleString()}</p>
                             </td>
                             <td className="p-8">
                                 <div className="flex items-center gap-2">
                                    {/* Refined Method Display: Accounts for the "attribution gap" fallback */}
                                    {(() => {
                                       const fin = getBookingFinancials(b);
                                       const bCash = Number(b.offlinePaid || 0) + (fin.extrasPaid || 0);
                                       const bOnline = Number(b.onlinePaid || 0);
                                       const gap = Math.max(0, fin.paid - (bCash + bOnline));

                                       const hasOffline = bCash > 0 || (gap > 0 && (b.paymentMethod === 'Cash' || (!b.paymentMethod && b.bookingSource === 'walk_in')));
                                       const hasOnline = bOnline > 0 || (gap > 0 && !hasOffline);
                                       
                                       if (hasOffline && hasOnline) {
                                          return (
                                             <>
                                                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"></span>
                                                <span className="text-[10px] font-black uppercase">Split</span>
                                             </>
                                          );
                                       }
                                       
                                       const method = b.paymentMethod || (hasOffline ? 'Cash' : 'UPI');
                                       return (
                                          <>
                                             <span className={`w-2 h-2 rounded-full ${hasOffline ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                             <span className="text-[10px] font-black uppercase">{method}</span>
                                          </>
                                       );
                                    })()}
                                 </div>
                             </td>
                             <td className="p-8">
                                <span className={`px-4 py-2 rounded-full text-[8px] font-black uppercase ${fin.paidPercent === 100 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                   {fin.paidPercent === 100 ? 'Full' : 'Partial'}
                                </span>
                             </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        <div className="space-y-8">
           {/* Filters */}
           <div className="bg-[var(--lux-card)] p-8 rounded-[3rem] border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                 <Filter size={16} className="text-[var(--lux-gold)]" />
                 <h4 className="text-[11px] font-black uppercase tracking-widest">Global Filters</h4>
              </div>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase opacity-30">Channel Filter</label>
                    <div className="flex flex-wrap gap-2">
                       {['All', 'Cash', 'UPI', 'Bank'].map(m => (
                         <button key={m} onClick={() => setMethodFilter(m)} className={`px-4 py-2 rounded-xl text-[9px] font-bold ${methodFilter === m ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-[var(--lux-muted)]'}`}>
                           {m}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* Activity Feed */}
           <div className="bg-[var(--lux-card)] p-8 rounded-[3rem] border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                 <Clock size={16} className="text-amber-500" />
                 <h4 className="text-[11px] font-black uppercase tracking-widest">Recent Activity</h4>
              </div>
              <div className="space-y-4">
                 {analysis.recentActivity.slice(0, 5).map((act: any) => (
                   <div key={act._id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><DollarSign size={14} /></div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-bold truncate">{act.guestDetails?.name}</p>
                         <p className="text-[8px] opacity-30 uppercase tracking-widest">Room {act.roomNumber}</p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">+₹{getBookingFinancials(act).paid}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Insights */}
           <div className="bg-gradient-to-br from-[#121214] to-[#0B0B0C] p-10 rounded-[3rem] border border-[#2A2A2E] space-y-10 relative overflow-hidden group shadow-2xl">
              <Zap size={120} className="absolute top-0 right-0 p-8 opacity-5 text-[#D4AF37]" />
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-[#D4AF37]" />
                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#F5F5F7]">Intelligence</h4>
              </div>
              <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[#A1A1AA] leading-none mb-1">Peak Day</p>
                      <p className="text-[13px] font-bold text-[#F5F5F7]">₹{stats.maxEarning?.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[#A1A1AA] leading-none mb-1">Unit Leaderboard</p>
                      <p className="text-[12px] font-bold text-emerald-400">BEST: #{analysis.topRoom}</p>
                    </div>
                 </div>
                 <div className="p-6 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20 text-center">
                    <p className="text-[9px] font-bold text-[#D4AF37] uppercase leading-relaxed">System performance is optimal window.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Pending Modal */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPendingModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-[#111] rounded-[3rem] border border-red-500/20 shadow-2xl overflow-hidden">
               <div className="p-10 border-b border-white/5 bg-red-500/[0.02]">
                  <div className="flex justify-between items-start">
                     <div className="flex gap-4">
                        <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center"><AlertCircle size={24} /></div>
                        <div><h3 className="text-2xl font-display font-black text-red-500">Risk Assessment</h3><p className="text-[10px] uppercase text-white/30 mt-1">Outstanding Accounts</p></div>
                     </div>
                     <button onClick={() => setShowPendingModal(false)} className="p-3 bg-white/5 rounded-xl text-white/40"><X size={16} /></button>
                  </div>
               </div>
               <div className="p-10 max-h-[60vh] overflow-y-auto space-y-4">
                  {stats.pendingItems.map((item: any, i: number) => (
                    <div key={i} className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 flex justify-between items-center">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-[10px] font-black">#{item.room}</div>
                          <div><p className="text-[13px] font-bold">{item.guest}</p><p className="text-[9px] opacity-20">{new Date(item.date).toLocaleDateString()}</p></div>
                       </div>
                       <div className="text-right"><p className="text-[14px] font-black text-red-500">₹{item.balance.toLocaleString()}</p></div>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
