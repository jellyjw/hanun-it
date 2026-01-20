import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteReleaseNoteResponse {
  success: boolean;
  message: string;
}

export function useDeleteReleaseNote() {
  const queryClient = useQueryClient();

  return useMutation<DeleteReleaseNoteResponse, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/release-notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '릴리즈 노트 삭제에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: (data, id) => {
      // 릴리즈 노트 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ['releaseNotes'],
      });

      // 개별 릴리즈 노트 캐시 제거
      queryClient.removeQueries({
        queryKey: ['releaseNote', id],
      });
    },
  });
}
