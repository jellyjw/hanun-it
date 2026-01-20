import { useQuery } from '@tanstack/react-query';
import { ReleaseNoteResponse } from '@/types/releaseNotes';

export function useGetReleaseNote(id: string | null) {
  return useQuery<ReleaseNoteResponse>({
    queryKey: ['releaseNote', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Release note ID is required');
      }

      const response = await fetch(`/api/release-notes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch release note');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
