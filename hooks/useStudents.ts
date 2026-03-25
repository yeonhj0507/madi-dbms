import { useQuery } from '@tanstack/react-query';

export function useStudents(programId?: string) {
  return useQuery({
    queryKey: programId ? ['students', programId] : ['students'],
    queryFn: async () => {
      const url = programId 
        ? `/api/programs/${programId}/students`
        : '/api/students';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      return data.ok ? data.data : data;
    },
    staleTime: 1000 * 60 * 30, // 30분
    enabled: true,
  });
}
