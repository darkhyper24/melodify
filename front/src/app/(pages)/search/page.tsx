"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchResults from "@/components/SearchResults";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";  
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Update search query when URL parameter changes
  useEffect(() => {
    const currentQuery = searchParams.get("q") ?? "";
    if (currentQuery !== searchQuery) {
      setSearchQuery(currentQuery);
    }
  }, [searchParams, searchQuery]);

  return (
    <div className="bg-gradient-to-b from-[#121212] to-[#0a0a0a] min-h-screen pb-24">
      <div className="container mx-auto px-4 pt-8">
        <SearchResults query={searchQuery} showTopResult={true} />
      </div>
    </div>
  );
}
