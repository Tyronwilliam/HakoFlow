"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  onLoadMore: () => void;
  direction?: "bottom" | "top";
}

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  isError,
  onLoadMore,
  direction = "bottom",
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage && !isError) {
          if (direction === "top" && containerRef.current) {
            prevScrollHeightRef.current = containerRef.current.scrollHeight;
          }
          onLoadMore();
        }
      },
      { root: containerRef.current },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isError, onLoadMore, direction]);

  // Restaure la position de scroll après chargement en haut (évite le jump)
  useLayoutEffect(() => {
    if (
      direction === "top" &&
      !isFetchingNextPage &&
      prevScrollHeightRef.current > 0 &&
      containerRef.current
    ) {
      containerRef.current.scrollTop +=
        containerRef.current.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    }
  }, [isFetchingNextPage, direction]);

  return { containerRef, sentinelRef };
}
