import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

export const useActiveBookings = (hotelId: string) => {
    return useQuery({
        queryKey: ['bookings', hotelId],
        queryFn: async () => {
            if (!hotelId) return [];
            const res = await fetch(`${API_BASE_URL}/api/content/bookings/active/${hotelId}`);
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
        enabled: !!hotelId,
        refetchInterval: 5000, // Real-time polling every 5 seconds
    });
};
