import { useState, useMemo } from 'react';

export interface UsePaginationProps {
  /** 총 아이템 개수 */
  totalItems: number;
  /** 페이지당 아이템 수 (기본값: 10) */
  itemsPerPage?: number;
  /** 초기 페이지 (기본값: 1) */
  initialPage?: number;
  /** 페이지 변경 시 호출할 콜백 함수 */
  onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  /** 현재 페이지 */
  currentPage: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 페이지당 아이템 수 */
  itemsPerPage: number;
  /** 이전 페이지로 이동 */
  goToPrevious: () => void;
  /** 다음 페이지로 이동 */
  goToNext: () => void;
  /** 특정 페이지로 이동 */
  goToPage: (page: number) => void;
  /** 첫 페이지로 이동 */
  goToFirst: () => void;
  /** 마지막 페이지로 이동 */
  goToLast: () => void;
  /** 이전 페이지가 있는지 여부 */
  hasPrevious: boolean;
  /** 다음 페이지가 있는지 여부 */
  hasNext: boolean;
  /** 현재 페이지의 시작 인덱스 (0부터 시작) */
  startIndex: number;
  /** 현재 페이지의 종료 인덱스 (0부터 시작) */
  endIndex: number;
  /** 페이지 번호 배열 (페이지네이션 UI용) */
  pageNumbers: number[];
}

export const usePagination = ({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
  onPageChange,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);
  const goToFirst = () => goToPage(1);
  const goToLast = () => goToPage(totalPages);

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

  // 페이지 번호 배열 생성 (최대 7개의 페이지 번호 표시)
  const pageNumbers = useMemo(() => {
    const delta = 2; // 현재 페이지 기준 양쪽으로 보여줄 페이지 수
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1); // -1은 ellipsis를 의미
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages); // -1은 ellipsis를 의미
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // 중복 제거
    return [...new Set(rangeWithDots)];
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    goToPrevious,
    goToNext,
    goToPage,
    goToFirst,
    goToLast,
    hasPrevious,
    hasNext,
    startIndex,
    endIndex,
    pageNumbers,
  };
};
