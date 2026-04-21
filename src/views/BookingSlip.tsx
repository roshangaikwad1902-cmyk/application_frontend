import React from 'react';

export const BookingSlip = ({ booking, hotel }: { booking: any, hotel: any }) => {
  if (!booking) return null;

  const checkin = new Date(booking.checkin).toLocaleDateString();
  const checkout = new Date(booking.checkout).toLocaleDateString();

  return (
    <div className="a4-page p-10 bg-white text-black font-sans shadow-none border-none">
      <div className="flex flex-col items-center text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
        <img 
          src="/logo.jpg" 
          alt="Bhagat Group" 
          className="h-64 w-auto mix-blend-multiply invert-[1] brightness-90 contrast-125 mb-4" 
        />
        <h1 className="text-xl font-black uppercase tracking-widest mb-1">{hotel?.name}</h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Official Reservation Manifest</p>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking Reference</p>
          <h2 className="text-xl font-bold">#{booking._id?.slice(-8).toUpperCase() || 'FUTURE-RES'}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
          <div className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-amber-200">
             RESERVED (FUTURE)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-8">
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guest Detail</p>
            <p className="font-bold text-lg">{booking.guestDetails?.name}</p>
            <p className="text-sm text-gray-600">{booking.guestDetails?.phone}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stay Duration</p>
            <p className="font-bold">{checkin} <span className="text-gray-400 font-medium px-2">to</span> {checkout}</p>
          </div>
        </div>
        <div className="space-y-6">
           <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking Source</p>
            <p className="font-bold uppercase">{booking.bookingSource === 'ota' ? booking.bookingPlatform : 'Walk-in'}</p>
            {booking.bookingSource === 'ota' && (
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                Payment: {booking.otaPaymentType === 'paid_online' ? 'PAID ONLINE' : 'PAY AT HOTEL'}
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Unit</p>
            <p className="font-bold text-lg">Room {booking.roomNumber}</p>
            <p className="text-sm text-gray-600">Reserved Manifest</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guest Count</p>
            <p className="font-bold">{booking.guests || 1} Adult(s)</p>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-gray-100 pt-4 mt-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financial Summary</p>
        <div className="space-y-3 bg-gray-50 p-6 rounded-2xl">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Total Tariff</span>
            <span className="font-bold">₹{booking.totalAmount}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-3 text-green-600">
            <span className="font-bold uppercase tracking-widest text-[10px]">Advance Paid</span>
            <span className="font-black">- ₹{booking.paidAmount}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-black uppercase tracking-widest text-[11px]">Balance Due at Check-in</span>
            <span className="text-2xl font-black">₹{booking.balanceAmount}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t-2 border-dashed border-gray-200 text-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Terms & Conditions Apply • Issued via Bhagat Enterprise Console</p>
        <div className="inline-block px-10 py-3 border border-gray-200 rounded-xl text-[8px] font-black uppercase text-gray-400">
          This is a digital manifest and does not require a physical signature
        </div>
      </div>
    </div>
  );
};
