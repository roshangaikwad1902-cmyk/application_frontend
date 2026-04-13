import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/content`;

export const useHotelsList = () => {
    return useQuery({
        queryKey: ['hotels'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/hotels`);
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        }
    });
};
