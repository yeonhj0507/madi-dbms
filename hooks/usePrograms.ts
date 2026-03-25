import { useQuery } from '@tanstack/react-query';

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const res = await fetch('/api/programs');
      if (!res.ok) throw new Error('Failed to fetch programs');
      const data = await res.json();
      return data.ok ? data.data : data;
    },
    staleTime: 1000 * 60 * 60, // 1시간
  });
}
