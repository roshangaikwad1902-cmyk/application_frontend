export const getBookingFinancials = (booking: any) => {
  if (!booking) return { total: 0, paid: 0, balance: 0, status: 'UNPAID', paidPercent: 0, roomTotal: 0, extrasTotal: 0, extrasPaid: 0 };
  
  const roomTotal = Number(booking.totalAmount) || 0;
  const extrasTotal = (booking.extraCharges || []).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
  const extrasPaid = (booking.extraCharges || []).filter((e: any) => e.paid).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);
  
  const total = roomTotal + extrasTotal;
  const paid = (Number(booking.paidAmount) || 0) + extrasPaid;
  const balance = Math.max(0, total - paid);
  
  let status = 'UNPAID';
  if (balance <= 0) status = 'PAID';
  else if (paid > 0) status = 'PARTIAL';
  
  const paidPercent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  
  return { total, paid, balance, status, paidPercent, roomTotal, extrasTotal, extrasPaid };
};
