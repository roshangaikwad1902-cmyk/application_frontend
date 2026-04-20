import React from 'react';
import { Camera } from 'lucide-react';
import { getBookingFinancials } from '../utils/financials';

export const BookingReportView = ({ bookings, title, hotel }: { bookings: any[], title: string, hotel: any }) => {
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="a4-page p-16 bg-white text-black min-h-screen font-sans border-[20px] border-black/5 mx-auto">
      <div className="border-b-8 border-black pb-10 mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-1">{hotel?.name}</h1>
          <p className="text-xs font-bold uppercase tracking-widest opacity-30 mt-2">Certified Audit & Operations Record</p>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{title}</h2>
          <p className="text-xs opacity-40">{new Date().toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-24">
        {bookings.map((b, idx) => {
          const financials = getBookingFinancials(b);
          return (
            <div key={b._id} className="border-t-2 border-black pt-16 break-inside-avoid">
              <div className="flex justify-between items-start mb-12">
                 <div className="flex items-center gap-8">
                    <span className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-3xl shadow-xl italic">#{idx + 1}</span>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight leading-none mb-1">{b.guestDetails?.name}</h3>
                      <p className="text-sm opacity-60 font-bold">{b.guestDetails?.phone} • {b.guestDetails?.email || 'N/A'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 opacity-60'}`}>
                      {b.status}
                    </span>
                    <p className="text-[9px] mt-3 font-black uppercase opacity-30 tracking-[0.2em]">ID: {b._id}</p>
                 </div>
              </div>              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 {/* LEFT COLUMN: GUEST INFORMATICS */}
                 <div className="space-y-8">
                    <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 h-fit">
                       <p className="text-[10px] font-black uppercase opacity-30 mb-6 tracking-[0.4em]">Resource Allocation</p>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black uppercase opacity-40">Stay Dates</p>
                             <p className="text-sm font-bold">{new Date(b.checkin).toLocaleDateString()} — {new Date(b.checkout).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-[8px] font-black uppercase opacity-40">Configuration</p>
                             <p className="text-sm font-bold font-sans uppercase">Room {b.roomNumber || 'TBD'} • {b.guests || 1} ADULTS</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                       <p className="text-[10px] font-black uppercase opacity-50 mb-6 tracking-[0.4em]">Ledger Balance</p>
                       <div className="space-y-4 relative z-10">
                         <div className="flex justify-between text-xs opacity-60"><span>Stay Value</span><span className="font-bold">₹{financials.roomTotal}</span></div>
                         <div className="flex justify-between text-xs opacity-60"><span>Extra Services</span><span className="font-bold">₹{financials.extrasTotal}</span></div>
                         <div className="h-px bg-white/10 my-2" />
                         <div className="flex justify-between text-3xl font-black italic tracking-tighter">
                           <span>Balance</span>
                           <span className={financials.balance > 0 ? 'text-red-500' : 'text-green-500'}>₹{financials.balance}</span>
                         </div>
                       </div>
                    </div>
                 </div>

                 {/* RIGHT COLUMN: INTEGRATED KYC DOSSIER */}
                 <div className="space-y-6">
                    <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.4em] text-center">Identity Documents (Merged 2x2)</p>
                    <div className="aspect-[3/4] bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner relative group">
                       {b.guestDetails?.mergedKycUrl || (b.guestDetails?.photo || b.guestDetails?.aadharFront) ? (
                         <img 
                           src={b.guestDetails?.mergedKycUrl || b.guestDetails?.photo || b.guestDetails?.aadharFront} 
                           alt="Guest KYC" 
                           className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-700" 
                         />
                       ) : (
                         <div className="flex flex-col items-center gap-4">
                            <Camera size={48} className="opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-20">No KYC Uploaded</p>
                         </div>
                       )}
                       {/* Subtle watermark */}
                       <div className="absolute bottom-6 right-6 opacity-10 font-black text-[8px] uppercase tracking-widest italic pointer-events-none">
                          System Verified Log
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-32 pt-16 border-t-4 border-black text-center">
        <p className="text-xs font-black uppercase tracking-[1em] opacity-20">End of Document Record</p>
        <p className="text-[8px] font-bold opacity-10 mt-2 uppercase tracking-widest italic">{hotel?.name} • Confidential Audit Log</p>
      </div>
    </div>
  );
};
