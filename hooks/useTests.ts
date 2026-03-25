import { useQuery } from '@tanstack/react-query';

export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const res = await fetch('/api/tests');
      if (!res.ok) throw new Error('Failed to fetch tests');
      const data = await res.json();
      return data.ok ? data.data : data;
    },
    staleTime: 1000 * 60 * 30, // 30분
  });
}
