import React from 'react';
import { getBookingFinancials } from '../utils/financials';
import { numberToWords } from '../utils/numberToWords';

export const DetailedInvoice = ({ booking, hotel }: { booking: any, hotel: any }) => {
  if (!booking) return null;
  const isGST = booking.invoiceType === 'gst';
  const financials = getBookingFinancials(booking);
  
  // Custom GST / Non-GST logic (Exclusive GST per User Request)
  const roomBase = financials.roomTotal;
  const grossExtras = financials.extrasTotal;
  const totalTax = isGST ? (booking.gstAmount || (roomBase * 0.05)) : 0;
  
  const sgst = totalTax / 2;
  const cgst = totalTax / 2;
  
  const totalCharges = roomBase + grossExtras + totalTax;

  return (
    <div className="a4-page p-10 bg-white text-black font-sans text-[10px] leading-relaxed relative">
      <div className="grid grid-cols-[176px_1fr_176px] items-center gap-4 mb-4 border-b border-black pb-8">
        <div className="w-44 overflow-hidden">
          <img 
            src="/logo.jpg" 
            alt="Bhagat Group" 
            className="w-full h-auto mix-blend-multiply invert-[1] brightness-90 contrast-125" 
          />
        </div>
        <div className="space-y-1 text-center pt-2">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">{isGST ? 'GST Invoice' : 'Non-GST Bill'}</h2>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tighter leading-tight">{hotel?.name || 'Hotel Samrat'}</h1>
          <p className="font-bold opacity-80 text-[11px]">GSTIN No : 27ABCCS3946C1ZG</p>
          <p className="opacity-70 text-[10px]">near sita gumpha & kalaram temple, Nashik, Maharashtra, 422003, India</p>
          <p className="opacity-70 text-[10px]">Phone : 8888303650; E-mail : vaibhavbhagat53@gmail.com;</p>
        </div>
        <div className="w-44" aria-hidden="true" />
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-1 mb-4">
        <div className="grid grid-cols-[100px_10px_1fr] items-center">
            <span className="font-bold">Folio No.</span><span>:</span><span>{booking._id?.slice(-4).toUpperCase()}</span>
            <span className="font-bold">Invoice No</span><span>:</span><span>{booking._id?.slice(-4).toUpperCase()}</span>
            <span className="font-bold">Guest Name</span><span>:</span><span className="capitalize font-semibold">{booking.guestDetails?.name || 'In-House Guest'}</span>
            <span className="font-bold">Bill To</span><span>:</span><span className="capitalize font-semibold">{booking.guestDetails?.name || 'In-House Guest'}</span>
            <span className="font-bold">Bill To Address</span><span>:</span><span className="max-w-[200px] break-words">{booking.guestDetails?.address || 'N/A'}</span>
            <span className="font-bold">State</span><span>:</span><span>Maharashtra</span>
            <span className="font-bold">TgstTIN No </span><span>:</span><span>{booking.guestDetails?.guestGstNo || ''}</span>
            <span className="font-bold">Source</span><span>:</span><span className="uppercase">{booking.bookingSource === 'ota' ? booking.bookingPlatform : 'Walk In'}</span>
            <span className="font-bold">Source Of Supply</span><span>:</span><span>Nashik</span>
        </div>
        <div className="grid grid-cols-[120px_10px_1fr] items-center">
            <span className="font-bold">G.R. Card No</span><span>:</span><span>{booking._id?.slice(-4).toUpperCase()}</span>
            <span className="font-bold">Date of Invoice</span><span>:</span><span>{new Date().toLocaleString('en-IN')}</span>
            <span className="font-bold">Room</span><span>:</span><span>{booking.roomType} / {booking.roomNumber}</span>
            <span className="font-bold">No of Person</span><span>:</span><span>{booking.guests || 2} (A) / 0 (C)</span>
            <span className="font-bold">Rate Type</span><span>:</span><span>EP</span>
            <span className="font-bold">No of Nights</span><span>:</span><span>{Math.max(1, Math.round((new Date(booking.checkout).getTime() - new Date(booking.checkin).getTime()) / (1000 * 60 * 60 * 24)))}</span>
            <span className="font-bold">Date of Arrival</span><span>:</span><span>{booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(booking.checkin).toLocaleDateString('en-IN')}</span>
            <span className="font-bold">Date of Departure</span><span>:</span><span>{booking.checked_out_at ? new Date(booking.checked_out_at).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date(booking.checkout).toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* Particulars Table */}
      <table className="w-full border-collapse border border-black mb-4">
        <thead>
          <tr className="bg-gray-50 text-[9px] font-bold">
            <th className="border border-black px-2 py-1 w-8 text-center">Sr No</th>
            <th className="border border-black px-2 py-1 text-left">Particular</th>
            <th className="border border-black px-2 py-1 w-16 text-center">HSN/SAC</th>
            <th className="border border-black px-2 py-1 w-10 text-center">Qty</th>
            <th className="border border-black px-2 py-1 w-16 text-right">Rate</th>
            <th className="border border-black px-2 py-1 w-16 text-right">Total</th>
            <th className="border border-black px-2 py-1 w-14 text-right">Discount</th>
            <th className="border border-black px-2 py-1 w-16 text-right">Taxable</th>
            <th className="border border-black px-2 py-1 w-12 text-right">SGST</th>
            <th className="border border-black px-2 py-1 w-12 text-right">CGST</th>
            <th className="border border-black px-2 py-1 w-12 text-right">IGST</th>
            <th className="border border-black px-2 py-1 w-12 text-right">CESS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black px-2 py-2 text-center">1</td>
            <td className="border border-black px-2 py-2">Room Charges</td>
            <td className="border border-black px-2 py-2 text-center">996311</td>
            <td className="border border-black px-2 py-2 text-center">1</td>
            <td className="border border-black px-2 py-2 text-right">{roomBase.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{roomBase.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">0.00</td>
            <td className="border border-black px-2 py-2 text-right">{roomBase.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{isGST ? '2.50%' : '0.00%'}</td>
            <td className="border border-black px-2 py-2 text-right">{isGST ? '2.50%' : '0.00%'}</td>
            <td className="border border-black px-2 py-2 text-right">0.00%</td>
            <td className="border border-black px-2 py-2 text-right">0.00</td>
          </tr>
          {/* Extras as individual rows if needed, or grouped */}
          {(booking.extraCharges || []).map((e: any, i: number) => {
             const eBase = e.price / 1.05;
             return (
               <tr key={i}>
                  <td className="border border-black px-2 py-2 text-center">{i + 2}</td>
                  <td className="border border-black px-2 py-2">{e.name}</td>
                  <td className="border border-black px-2 py-2 text-center"></td>
                  <td className="border border-black px-2 py-2 text-center">1</td>
                  <td className="border border-black px-2 py-2 text-right">{eBase.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{eBase.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">0.00</td>
                  <td className="border border-black px-2 py-2 text-right">{eBase.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{isGST ? '2.50%' : '0.00%'}</td>
                  <td className="border border-black px-2 py-2 text-right">{isGST ? '2.50%' : '0.00%'}</td>
                  <td className="border border-black px-2 py-2 text-right">0.00%</td>
                  <td className="border border-black px-2 py-2 text-right">0.00</td>
               </tr>
             );
          })}
          {/* Empty rows to fill space */}
          {[...Array(Math.max(0, 3 - (booking.extraCharges?.length || 0)))].map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border border-black px-2 py-2 h-6"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
              <td className="border border-black px-2 py-2"></td>
            </tr>
          ))}
        </tbody>
        <tfoot className="font-bold bg-gray-50">
           <tr>
              <td colSpan={5} className="border border-black px-2 py-1 text-right uppercase">Total</td>
              <td className="border border-black px-2 py-1 text-right">{(financials.roomTotal + financials.extrasTotal).toFixed(2)}</td>
              <td className="border border-black px-2 py-1 text-right">0.00</td>
              <td className="border border-black px-2 py-1 text-right">{(financials.roomTotal + financials.extrasTotal).toFixed(2)}</td>
              <td className="border border-black px-2 py-1 text-right">{sgst.toFixed(2)}</td>
              <td className="border border-black px-2 py-1 text-right">{cgst.toFixed(2)}</td>
              <td className="border border-black px-2 py-1 text-right">0.00</td>
              <td className="border border-black px-2 py-1 text-right">0.00</td>
           </tr>
        </tfoot>
      </table>

      {/* Bottom Layout: Left (Payments) & Right (Totals) */}
      <div className="flex gap-4">
        {/* Left Section */}
        <div className="flex-1 space-y-6">
           <div>
              <p className="font-bold mb-1">Total Payable Amount</p>
              <p className="bg-gray-50 p-2 border border-dotted border-gray-400 min-h-[30px] italic">
                {numberToWords(Math.round(totalCharges))}
              </p>
           </div>
           
           <table className="w-full border-collapse border border-black text-[9px]">
             <thead>
               <tr className="bg-gray-50 font-bold uppercase">
                 <th className="border border-black px-2 py-1 text-left">Payment Date</th>
                 <th className="border border-black px-2 py-1 text-left">Description</th>
                 <th className="border border-black px-2 py-1 text-right">Amount</th>
               </tr>
             </thead>
             <tbody>
               {booking.offlinePaid > 0 && (
                 <tr>
                    <td className="border border-black px-2 py-1">{new Date(booking.checkin).toLocaleDateString()}</td>
                    <td className="border border-black px-2 py-1">Cash Payment</td>
                    <td className="border border-black px-2 py-1 text-right">{booking.offlinePaid.toFixed(2)}</td>
                 </tr>
               )}
               {booking.onlinePaid > 0 && (
                 <tr>
                    <td className="border border-black px-2 py-1">{new Date(booking.checkin).toLocaleDateString()}</td>
                    <td className="border border-black px-2 py-1">Online Payment</td>
                    <td className="border border-black px-2 py-1 text-right">{booking.onlinePaid.toFixed(2)}</td>
                 </tr>
               )}
               <tr className="font-bold">
                 <td colSpan={2} className="border border-black px-2 py-1 text-right uppercase">Total</td>
                 <td className="border border-black px-2 py-1 text-right">{financials.paid.toFixed(2)}</td>
               </tr>
             </tbody>
           </table>

           <div className="mt-4">
              <p className="font-bold mb-1 italic opacity-60">Remark :</p>
              <div className="h-10 border-b border-black w-full"></div>
           </div>
        </div>

        {/* Right Section (Totals) */}
        <div className="w-[280px]">
           <table className="w-full border-collapse border border-black font-bold text-right">
             <tbody>
               <tr><td className="border border-black px-2 py-1">Total Charges(Rs) :</td><td className="border border-black px-2 py-1 w-24">{(financials.roomTotal + financials.extrasTotal).toFixed(2)}</td></tr>
               <tr><td className="border border-black px-2 py-1">Total Discount(Rs) :</td><td className="border border-black px-2 py-1">0.00</td></tr>
               <tr><td className="border border-black px-2 py-1">Total SGST(Rs) :</td><td className="border border-black px-2 py-1">{sgst.toFixed(2)}</td></tr>
               <tr><td className="border border-black px-2 py-1">Total CGST(Rs) :</td><td className="border border-black px-2 py-1">{cgst.toFixed(2)}</td></tr>
               <tr><td className="border border-black px-2 py-1">Total IGST(Rs) :</td><td className="border border-black px-2 py-1">0.00</td></tr>
               <tr><td className="border border-black px-2 py-1">Total Other Tax(Rs) :</td><td className="border border-black px-2 py-1">0.00</td></tr>
               <tr><td className="border border-black px-2 py-1">Total Balance Transfer(Rs) :</td><td className="border border-black px-2 py-1">0.00</td></tr>
               <tr className="bg-gray-100"><td className="border border-black px-2 py-1">Total(Rs) :</td><td className="border border-black px-2 py-1">{totalCharges.toFixed(2)}</td></tr>
               <tr><td className="border border-black px-2 py-1">Flat Discount(Rs) :</td><td className="border border-black px-2 py-1">0.00</td></tr>
               <tr><td className="border border-black px-2 py-1">Adjustment(Rs) :</td><td className="border border-black px-2 py-1">0.00</td></tr>
               <tr className="bg-gray-200 text-lg"><td className="border border-black px-2 py-1">Total Payable(Rs) :</td><td className="border border-black px-2 py-1">{totalCharges.toFixed(2)}</td></tr>
               <tr><td className="border border-black px-2 py-1">Total Payment(Rs) :</td><td className="border border-black px-2 py-1">{financials.paid.toFixed(2)}</td></tr>
               <tr className="text-red-500"><td className="border border-black px-2 py-1">Balance(Rs) :</td><td className="border border-black px-2 py-1">{financials.balance.toFixed(2)}</td></tr>
             </tbody>
           </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-black flex justify-between items-end">
         <div className="space-y-1 opacity-80">
            <p><span className="font-bold">This Folio is in</span>: Rs</p>
            <p><span className="font-bold">Reception (C/I)</span>: admin</p>
            <p><span className="font-bold">Cashier (C/O)</span>: admin</p>
            <p><span className="font-bold">Date</span>: {new Date().toLocaleString()}</p>
            <p><span className="font-bold">Page</span>: Page 1 of 1</p>
         </div>
         <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black mb-1"></div>
            <p className="font-bold uppercase">(Guest Signature)</p>
         </div>
      </div>
    </div>
  );
};
