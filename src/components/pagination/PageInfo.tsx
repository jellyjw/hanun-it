"use client";

interface PageInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function PageInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
}: PageInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between text-sm text-gray-700">
      <div>
        총 <span className="font-medium">{totalItems.toLocaleString()}</span>개
        중 <span className="font-medium">{startItem.toLocaleString()}</span>-
        <span className="font-medium">{endItem.toLocaleString()}</span>개 표시
      </div>
      <div>
        <span className="font-medium">{currentPage}</span> /{" "}
        <span className="font-medium">{totalPages}</span> 페이지
      </div>
    </div>
  );
}
