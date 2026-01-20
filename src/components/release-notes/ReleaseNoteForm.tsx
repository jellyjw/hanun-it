'use client';

import { useState, useEffect } from 'react';
import { ReleaseNote, CreateReleaseNoteRequest, UpdateReleaseNoteRequest } from '@/types/releaseNotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateReleaseNote } from '@/hooks/useCreateReleaseNote';
import { useUpdateReleaseNote } from '@/hooks/useUpdateReleaseNote';
import { useToast } from '@/hooks/use-toast';

interface ReleaseNoteFormProps {
  releaseNote?: ReleaseNote | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReleaseNoteForm({ releaseNote, onSuccess, onCancel }: ReleaseNoteFormProps) {
  const { toast } = useToast();
  const createMutation = useCreateReleaseNote();
  const updateMutation = useUpdateReleaseNote();

  const [formData, setFormData] = useState<CreateReleaseNoteRequest>({
    version: '',
    title: '',
    description: '',
    content: '',
    released_at: new Date().toISOString().split('T')[0],
    is_published: true,
  });

  // 수정 모드일 때 폼 데이터 초기화
  useEffect(() => {
    if (releaseNote) {
      setFormData({
        version: releaseNote.version,
        title: releaseNote.title,
        description: releaseNote.description || '',
        content: releaseNote.content,
        released_at: new Date(releaseNote.released_at).toISOString().split('T')[0],
        is_published: releaseNote.is_published,
      });
    }
  }, [releaseNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.version || !formData.title || !formData.content || !formData.released_at) {
      toast({
        title: '❌ 필수 항목을 입력해주세요.',
        description: 'Version, Title, Content, Released Date는 필수 항목입니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (releaseNote) {
        // 수정 모드
        const updateData: UpdateReleaseNoteRequest = {
          version: formData.version,
          title: formData.title,
          description: formData.description || undefined,
          content: formData.content,
          released_at: formData.released_at,
          is_published: formData.is_published,
        };

        await updateMutation.mutateAsync({
          id: releaseNote.id,
          data: updateData,
        });

        toast({
          title: '✅ 릴리즈 노트가 수정되었습니다.',
          variant: 'default',
        });
      } else {
        // 생성 모드
        await createMutation.mutateAsync(formData);

        toast({
          title: '✅ 릴리즈 노트가 작성되었습니다.',
          variant: 'default',
        });
      }

      onSuccess?.();
    } catch (error) {
      toast({
        title: '❌ 저장 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="version">Version *</Label>
        <Input
          id="version"
          placeholder="v1.0.0"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="릴리즈 노트 제목"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="간단한 설명 (선택사항)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown) *</Label>
        <Textarea
          id="content"
          placeholder="마크다운 형식으로 작성해주세요..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={10}
          className="font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="released_at">Released Date *</Label>
        <Input
          id="released_at"
          type="date"
          value={formData.released_at}
          onChange={(e) => setFormData({ ...formData, released_at: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked as boolean })}
        />
        <Label htmlFor="is_published" className="cursor-pointer">
          공개
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '저장 중...' : releaseNote ? '수정' : '작성'}
        </Button>
      </div>
    </form>
  );
}
