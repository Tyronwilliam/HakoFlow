"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  isError,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
          onLoadMore();
        }
      },
      { root: containerRef.current },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, onLoadMore]);

  return { containerRef, sentinelRef };
}
