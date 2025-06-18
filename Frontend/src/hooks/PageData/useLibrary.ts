import { useState } from "react";
import { libraryApi } from "../../services/api/library";

export const useLibrary = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getLibrary = async (page: number, queryParams = {}) => {
		setLoading(true);
		setError(null);
		try {
			const data = await libraryApi.getLibrary(page, queryParams);
			return data.msg;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch library";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const searchLibrary = async (page: number, searchParams = {}) => {
		setLoading(true);
		setError(null);
		try {
			const data = await libraryApi.searchLibrary(page, searchParams);
			return data.msg;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to search library";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const getGenres = async () => {
		setError(null);
		try {
			const data = await libraryApi.getGenres();
			return data;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch genres";
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	};

	return { getLibrary, searchLibrary, getGenres, loading, error };
};
