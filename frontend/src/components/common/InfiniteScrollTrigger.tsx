import { useEffect, useState } from "react";

/**
 * A reusable component that triggers a callback when it becomes visible in the viewport.
 * Useful for implementing infinite scroll.
 */
export function InfiniteScrollTrigger({
  hasMore,
  loading,
  onLoad,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoad: () => void;
}) {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!observerTarget || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoad();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [observerTarget, hasMore, loading, onLoad]);

  if (!hasMore) return null;

  return (
    <div ref={setObserverTarget} className="flex justify-center py-6 w-full">
      {loading ? (
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase tracking-widest animate-pulse">
          <div className="size-1.5 rounded-full bg-indigo-500 animate-bounce" />
          Loading more…
        </div>
      ) : (
        <div className="h-4" /> // Invisible trigger
      )}
    </div>
  );
}
