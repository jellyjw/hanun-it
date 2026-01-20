'use client';

import { useState } from 'react';
import { Header } from '@/components/header/Header';
import { Accordion } from '@/components/ui/accordion';
import { ReleaseNoteItem } from '@/components/release-notes/ReleaseNoteItem';
import { ReleaseNoteForm } from '@/components/release-notes/ReleaseNoteForm';
import { useGetReleaseNotes } from '@/hooks/useGetReleaseNotes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, FileText } from 'lucide-react';
import { ReleaseNote } from '@/types/releaseNotes';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';

export default function ReleaseNotesPage() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReleaseNote, setEditingReleaseNote] = useState<ReleaseNote | null>(null);

  const { data, isLoading, error } = useGetReleaseNotes({
    page,
    limit: 10,
    includeUnpublished: isAdmin ? true : false,
  });

  const handleCreate = () => {
    setEditingReleaseNote(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (releaseNote: ReleaseNote) => {
    setEditingReleaseNote(releaseNote);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingReleaseNote(null);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingReleaseNote(null);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold">릴리즈 노트</h1>
          </div>
          {isAdmin && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              작성하기
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="mb-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">릴리즈 노트를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        )}

        {!isLoading && !error && data && data.data.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <p className="text-muted-foreground">아직 릴리즈 노트가 없습니다.</p>
            {isAdmin && (
              <Button onClick={handleCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />첫 릴리즈 노트 작성하기
              </Button>
            )}
          </div>
        )}

        {!isLoading && !error && data && data.data.length > 0 && (
          <>
            <Accordion type="single" collapsible className="space-y-2">
              {data.data.map((releaseNote) => (
                <ReleaseNoteItem
                  key={releaseNote.id}
                  releaseNote={releaseNote}
                  onEdit={isAdmin ? handleEdit : undefined}
                />
              ))}
            </Accordion>

            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationWrapper initialPage={page} totalItems={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReleaseNote ? '릴리즈 노트 수정' : '릴리즈 노트 작성'}</DialogTitle>
              <DialogDescription>
                {editingReleaseNote
                  ? '릴리즈 노트를 수정합니다. 마크다운 형식으로 작성해주세요.'
                  : '새로운 릴리즈 노트를 작성합니다. 마크다운 형식으로 작성해주세요.'}
              </DialogDescription>
            </DialogHeader>
            <ReleaseNoteForm releaseNote={editingReleaseNote} onSuccess={handleSuccess} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
