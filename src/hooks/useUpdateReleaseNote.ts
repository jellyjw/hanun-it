import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateReleaseNoteRequest, ReleaseNoteResponse } from '@/types/releaseNotes';

interface UpdateReleaseNoteMutationParams {
  id: string;
  data: UpdateReleaseNoteRequest;
}

export function useUpdateReleaseNote() {
  const queryClient = useQueryClient();

  return useMutation<ReleaseNoteResponse, Error, UpdateReleaseNoteMutationParams>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/release-notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '릴리즈 노트 수정에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // 릴리즈 노트 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['releaseNotes'],
      });

      // 개별 릴리즈 노트 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['releaseNote', variables.id],
      });
    },
  });
}
