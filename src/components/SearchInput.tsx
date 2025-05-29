"use client";

import { useForm } from "react-hook-form";
import { Search, Loader2, X } from "lucide-react";
import { SearchFormData } from "@/types/search";
import { useEffect } from "react";

interface SearchInputProps {
  onSearch: (searchValue: string) => void;
  isSearching?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchInput({
  onSearch,
  isSearching = false,
  placeholder = "아티클 제목, 내용, 출처를 검색하세요...",
  initialValue = "",
}: SearchInputProps) {
  const { register, watch, setValue, reset } = useForm<SearchFormData>({
    defaultValues: { query: initialValue },
  });

  const query = watch("query");

  // query 값이 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    onSearch(query || "");
  }, [query, onSearch]);

  const handleClear = () => {
    reset();
    onSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          {...register("query")}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all duration-200 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4 animate-spin" />
        )}
      </div>
    </div>
  );
}
