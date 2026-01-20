'use client';

import { useState } from 'react';
import { ReleaseNote } from '@/types/releaseNotes';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { processArticleContent } from '@/utils/markdown';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteReleaseNote } from '@/hooks/useDeleteReleaseNote';
import { useToast } from '@/hooks/use-toast';

interface ReleaseNoteItemProps {
  releaseNote: ReleaseNote;
  onEdit?: (releaseNote: ReleaseNote) => void;
}

export function ReleaseNoteItem({ releaseNote, onEdit }: ReleaseNoteItemProps) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const deleteMutation = useDeleteReleaseNote();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('정말 이 릴리즈 노트를 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(releaseNote.id);
      toast({
        title: '✅ 릴리즈 노트가 삭제되었습니다.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: '❌ 삭제 실패',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(releaseNote.released_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const processedContent = processArticleContent(releaseNote.content);

  return (
    <AccordionItem value={releaseNote.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex flex-col items-start gap-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                {releaseNote.version}
              </span>
              {!releaseNote.is_published && (
                <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                  비공개
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base">{releaseNote.title}</h3>
            {releaseNote.description && (
              <p className="text-sm text-muted-foreground">{releaseNote.description}</p>
            )}
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
          {isAdmin && onEdit && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(releaseNote);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
