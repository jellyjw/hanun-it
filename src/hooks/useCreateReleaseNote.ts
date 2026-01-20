import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateReleaseNoteRequest, ReleaseNoteResponse } from '@/types/releaseNotes';

export function useCreateReleaseNote() {
  const queryClient = useQueryClient();

  return useMutation<ReleaseNoteResponse, Error, CreateReleaseNoteRequest>({
    mutationFn: async (data: CreateReleaseNoteRequest) => {
      const response = await fetch('/api/release-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '릴리즈 노트 작성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 릴리즈 노트 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['releaseNotes'],
      });
    },
  });
}
