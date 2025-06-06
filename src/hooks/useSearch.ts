import { useState, useCallback } from 'react';
import { useDebounceValue } from 'usehooks-ts';

export const useSearch = (initialValue: string = '', delay: number = 800) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedSearchValue] = useDebounceValue(searchValue, delay);

  const updateSearchValue = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchValue('');
  }, []);

  return {
    searchValue,
    debouncedSearchValue,
    updateSearchValue,
    clearSearch,
    isSearching: searchValue !== debouncedSearchValue,
  };
};
