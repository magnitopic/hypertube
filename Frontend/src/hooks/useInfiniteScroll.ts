import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollProps<T> {
	fetchPage: (page: number) => Promise<T[]>;
	initialPage?: number;
	enabled?: boolean;
}

export function useInfiniteScroll<T>({
	fetchPage,
	initialPage = 1,
	enabled = true,
}: UseInfiniteScrollProps<T>) {
	const [items, setItems] = useState<T[]>([]);
	const [page, setPage] = useState(initialPage);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [initialLoad, setInitialLoad] = useState(true);
	const loadingRef = useRef<HTMLDivElement | null>(null);
	const [error, setError] = useState<string | null>(null);

	const resetItems = useCallback(() => {
		setItems([]);
		setPage(initialPage);
		setHasMore(true);
		setError(null);
		setInitialLoad(true);
	}, [initialPage]);

	const loadMore = useCallback(async () => {
		if (loading || !hasMore || !enabled || error != null) return;
		setLoading(true);

		try {
			const data = await fetchPage(page);
			if (data.length > 0) {
				setItems((prev) => [...prev, ...data]);
				setPage((prev) => prev + 1);
			} else {
				setHasMore(false);
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Request failed";
			setError(errorMessage);
			setHasMore(false);
		} finally {
			setLoading(false);
			if (initialLoad) setInitialLoad(false);
		}
	}, [loading, hasMore, page, fetchPage, enabled, initialLoad, error]);

	// Set up IntersectionObserver
	useEffect(() => {
		if (
			!loadingRef.current ||
			!hasMore ||
			!enabled ||
			loading ||
			initialLoad
		)
			return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					loadMore();
				}
			},
			{
				root: null,
				rootMargin: "100px",
				threshold: 0.1,
			}
		);

		observer.observe(loadingRef.current);

		return () => {
			if (loadingRef.current) {
				observer.unobserve(loadingRef.current);
			}
			observer.disconnect();
		};
	}, [loadingRef, hasMore, enabled, loadMore, loading, initialLoad]);

	// Initial load
	useEffect(() => {
		if (initialLoad) {
			loadMore();
		}
	}, [loadMore, initialLoad]);

	return {
		items,
		loading,
		error,
		hasMore,
		loadingRef,
		initialLoad,
		resetItems,
	};
}
