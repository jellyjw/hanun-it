import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ReleaseNotesResponse } from '@/types/releaseNotes';

interface UseGetReleaseNotesParams {
  page?: number;
  limit?: number;
  includeUnpublished?: boolean;
}

export function useGetReleaseNotes({ page = 1, limit = 10, includeUnpublished = false }: UseGetReleaseNotesParams = {}) {
  return useQuery<ReleaseNotesResponse>({
    queryKey: ['releaseNotes', page, limit, includeUnpublished],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (includeUnpublished) params.append('includeUnpublished', 'true');

      const response = await fetch(`/api/release-notes?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch release notes');
      }
      return response.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
