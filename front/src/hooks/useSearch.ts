import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { debounce } from '@/lib/utils';

// Search hook for handling query state and navigation
export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  // Create a debounced navigation function
  const debouncedNavigate = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        if (isSearchPage) {
          router.replace(`/search?q=${encodeURIComponent(query)}`);
        } else {
          router.push(`/search?q=${encodeURIComponent(query)}`);
        }
      }
    }, 300),
    [router, isSearchPage]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedNavigate(query);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    handleSearchSubmit,
    isSearchPage
  };
};
