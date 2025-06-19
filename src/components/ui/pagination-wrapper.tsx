import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import { usePagination, UsePaginationProps } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';

// 순수한 프레젠테이션 컴포넌트
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  goToPrevious: () => void;
  goToNext: () => void;
  goToPage: (page: number) => void;
  goToFirst: () => void;
  goToLast: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  className?: string;
  showFirstLast?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageNumbers,
  goToPrevious,
  goToNext,
  goToPage,
  goToFirst,
  goToLast,
  hasPrevious,
  hasNext,
  className,
  showFirstLast = false,
  size = 'default',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* 첫 페이지 버튼 (옵션) */}
        {showFirstLast && hasPrevious && (
          <PaginationItem>
            <PaginationLink onClick={() => goToFirst()} size={size} className="cursor-pointer">
              ««
            </PaginationLink>
          </PaginationItem>
        )}

        {/* 이전 페이지 버튼 */}
        <PaginationItem>
          <PaginationPrevious
            onClick={hasPrevious ? () => goToPrevious() : undefined}
            className={cn('cursor-pointer', !hasPrevious && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>

        {/* 페이지 번호들 */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === -1 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => goToPage(page)}
                isActive={currentPage === page}
                size={size}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* 다음 페이지 버튼 */}
        <PaginationItem>
          <PaginationNext
            onClick={hasNext ? () => goToNext() : undefined}
            className={cn('cursor-pointer', !hasNext && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>

        {/* 마지막 페이지 버튼 (옵션) */}
        {showFirstLast && hasNext && (
          <PaginationItem>
            <PaginationLink onClick={() => goToLast()} size={size} className="cursor-pointer">
              »»
            </PaginationLink>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

PaginationControls.displayName = 'PaginationControls';

// Hook을 사용하는 래퍼 컴포넌트
interface PaginationWrapperProps extends UsePaginationProps {
  className?: string;
  showFirstLast?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const PaginationWrapper: React.FC<PaginationWrapperProps> = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  onPageChange,
  className,
  showFirstLast = false,
  size = 'default',
}) => {
  const paginationData = usePagination({
    totalItems,
    itemsPerPage,
    initialPage,
    onPageChange,
  });

  return <PaginationControls {...paginationData} className={className} showFirstLast={showFirstLast} size={size} />;
};

PaginationWrapper.displayName = 'PaginationWrapper';

// 페이지 정보를 표시하는 컴포넌트
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  className?: string;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  className,
}) => {
  const displayStart = totalItems > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(endIndex + 1, totalItems);

  return (
    <div className={cn('text-muted-foreground text-sm', className)}>
      {totalItems > 0 ? (
        <>
          총 {totalItems.toLocaleString()}개 중 {displayStart.toLocaleString()}-{displayEnd.toLocaleString()}개 표시
          <span className="ml-2">
            ({currentPage}/{totalPages} 페이지)
          </span>
        </>
      ) : (
        '데이터가 없습니다'
      )}
    </div>
  );
};

PaginationInfo.displayName = 'PaginationInfo';

// 완전한 페이지네이션 컨테이너 (정보 + 컨트롤)
interface CompletePaginationProps extends PaginationWrapperProps {
  showInfo?: boolean;
  infoPosition?: 'top' | 'bottom' | 'both';
  containerClassName?: string;
}

export const CompletePagination: React.FC<CompletePaginationProps> = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  onPageChange,
  className,
  showFirstLast = false,
  size = 'default',
  showInfo = true,
  infoPosition = 'bottom',
  containerClassName,
}) => {
  // 한 번만 hook을 사용
  const paginationData = usePagination({
    totalItems,
    itemsPerPage,
    initialPage,
    onPageChange,
  });

  const { currentPage, totalPages, startIndex, endIndex } = paginationData;

  const paginationInfo = showInfo && (
    <PaginationInfo
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      startIndex={startIndex}
      endIndex={endIndex}
    />
  );

  const paginationControls = (
    <PaginationControls {...paginationData} className={className} showFirstLast={showFirstLast} size={size} />
  );

  return (
    <div className={cn('space-y-4', containerClassName)}>
      {(infoPosition === 'top' || infoPosition === 'both') && paginationInfo}
      {paginationControls}
      {(infoPosition === 'bottom' || infoPosition === 'both') && paginationInfo}
    </div>
  );
};

CompletePagination.displayName = 'CompletePagination';
