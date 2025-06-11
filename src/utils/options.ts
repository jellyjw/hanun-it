export const SELECT_OPTIONS = {
  itemsPerPage: [
    { label: '20개씩 보기', value: '20' },
    { label: '50개씩 보기', value: '50' },
    { label: '100개씩 보기', value: '100' },
  ],
  sortBy: [
    { label: '인기순', value: 'popular' },
    { label: '최신순', value: 'latest' },
    { label: '댓글순', value: 'comments' },
  ],
  categories: [
    // { label: '전체 아티클', value: 'all' },
    { label: '국내 아티클', value: 'domestic' },
    { label: '해외 아티클', value: 'foreign' },
    { label: '주간 인기', value: 'weekly' },
  ],
};
