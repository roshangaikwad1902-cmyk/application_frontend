import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Wallet, 
  CreditCard, 
  Target,
  User,
  Hash
} from 'lucide-react';

export const RevenueReportView = ({ reportData, hotel }: any) => {
  const { stats, filteredData, timeFilter, customRange } = reportData;
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getRangeText = () => {
    if (timeFilter === 'custom') {
      return `${customRange.start} to ${customRange.end}`;
    }
    const labelMap: any = {
      '1d': 'Today',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '12m': 'Last 12 Months'
    };
    return labelMap[timeFilter] || 'All Time';
  };

  return (
    <div className="a4-page p-[15mm] bg-white text-black font-sans">
      {/* Report Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">{hotel?.name || 'Bhagat Group Hotels'}</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">Revenue Performance Audit</p>
          <div className="mt-6 space-y-1">
            <p className="text-xs"><strong>Report Generated:</strong> {today}</p>
            <p className="text-xs"><strong>Analysis Window:</strong> {getRangeText()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-2xl mb-4 ml-auto">
            <TrendingUp size={32} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest leading-none">Confidential</p>
          <p className="text-[8px] font-bold uppercase opacity-40 mt-1">Enterprise Operations</p>
        </div>
      </div>

      {/* Snapshot Grid */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-[8px] font-black uppercase opacity-60 mb-1">Gross Realized</p>
          <p className="text-xl font-black">₹{stats.totals.revenue.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-[8px] font-black uppercase opacity-60 mb-1">Net Cash</p>
          <p className="text-xl font-black">₹{stats.totals.cash.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-[8px] font-black uppercase opacity-60 mb-1">Online/Digital</p>
          <p className="text-xl font-black">₹{stats.totals.online.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-[8px] font-black uppercase opacity-60 mb-1">Pending/Risk</p>
          <p className="text-xl font-black text-red-600">₹{stats.totals.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-black/10 pb-2">Payment Methods</h4>
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(stats.methodBreakdown).map(([name, val]: any) => (
                <tr key={name} className="border-b border-gray-50">
                  <td className="py-2 text-gray-600">{name}</td>
                  <td className="py-2 text-right font-bold">₹{val.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-black/10 pb-2">Source Contribution</h4>
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(stats.sourceBreakdown).map(([name, val]: any) => (
                <tr key={name} className="border-b border-gray-50">
                  <td className="py-2 text-gray-600">{name}</td>
                  <td className="py-2 text-right font-bold">₹{val.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Block */}
      <div className="p-6 bg-black text-white rounded-2xl mb-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/10 rounded-lg">
            <Target size={20} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase opacity-60">Primary Revenue Driver</p>
            <p className="text-sm font-bold uppercase tracking-widest">{stats.topSource}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase opacity-60">Average Transaction</p>
          <p className="text-xl font-black tracking-tighter">₹{Math.round(stats.avgBookingValue).toLocaleString()}</p>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-black/10 pb-2">Audit Log ({filteredData.length} records)</h4>
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-gray-100 uppercase">
              <th className="p-2 border border-gray-200 text-left">Date</th>
              <th className="p-2 border border-gray-200 text-left">Guest Name</th>
              <th className="p-2 border border-gray-200 text-center">Unit</th>
              <th className="p-2 border border-gray-200 text-left">Method</th>
              <th className="p-2 border border-gray-200 text-right">Paid</th>
              <th className="p-2 border border-gray-200 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((b: any, i: number) => {
              const p = b.paymentDetails || {};
              return (
                <tr key={i}>
                  <td className="p-2 border border-gray-200">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 border border-gray-200 font-bold">{b.guestDetails?.name}</td>
                  <td className="p-2 border border-gray-200 text-center">#{b.roomNumber}</td>
                  <td className="p-2 border border-gray-200">{p.paymentMethod || 'UPI'}</td>
                  <td className="p-2 border border-gray-200 text-right font-bold">₹{b.paidAmount?.toLocaleString()}</td>
                  <td className="p-2 border border-gray-200 text-right">₹{b.balanceAmount?.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end">
        <div>
          <p className="text-[8px] font-black uppercase opacity-40">Bhagat Group Enterprise Operations Control</p>
          <p className="text-[7px] font-bold opacity-30 mt-1">This report is strictly confidential and intended for management use only.</p>
        </div>
        <div className="w-32 h-12 border-b border-black/40 flex items-center justify-center opacity-20">
          <p className="text-[8px] font-black uppercase tracking-widest">Authorized Sign</p>
        </div>
      </div>
    </div>
  );
};
