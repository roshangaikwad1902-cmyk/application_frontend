import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/constants';

export const useHotelsList = () => useQuery({
  queryKey: ['hotels-list'],
  queryFn: async () => {
    const res = await fetch(`${API_BASE_URL}/api/content/hotels`);
    return res.json();
  }
});

export const useActiveBookings = (hotelId: string) => useQuery({
  queryKey: ['active-bookings', hotelId],
  queryFn: async () => {
    const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/all`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
    });
    const data = await res.json();
    return data.filter((b: any) => String(b.hotel_id) === String(hotelId) && b.status !== 'completed');
  },
  enabled: !!hotelId,
  refetchInterval: 15000, // Sync every 15 seconds
});

export const useRoomStatus = (hotelId: string) => useQuery({
  queryKey: ['room-status', hotelId],
  queryFn: async () => {
    const res = await fetch(`${API_BASE_URL}/api/content/room-status/${hotelId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
    });
    return res.json();
  },
  enabled: !!hotelId,
  refetchInterval: 15000 // Sync every 15 seconds
});

export const useRoomAvailabilityMap = (hotelId: string, checkin: string, checkout: string) => useQuery({
  queryKey: ['availability', hotelId, checkin, checkout],
  queryFn: async () => {
    const res = await fetch(`${API_BASE_URL}/api/content/rooms/availability?hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}`);
    return res.json();
  },
  enabled: !!hotelId && !!checkin && !!checkout,
  refetchInterval: 15000 // Sync every 15 seconds
});

export const useUnifiedBookings = (activeHotelId: string) => useQuery({
    queryKey: ['unified-bookings', activeHotelId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/content/bookings/admin/all`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hotel_token')}` }
      });
      const data = await res.json();
      return data.filter((b: any) => String(b.hotel_id) === String(activeHotelId));
    },
    enabled: !!activeHotelId,
    refetchInterval: 15000 // Sync every 15 seconds
  });
