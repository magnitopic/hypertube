import { useState } from "react";
import { videoApi } from "../../services/api/video";

export const useVideo = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getVideoInfo = async (id: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.getVideoInfo(id);
			return data.msg;
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to fetch movie info";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const getComments = async (id: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.getComments(id);
			return data.msg;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch comments";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const addComment = async (id: string, comment: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.addComment(id, comment);
			return data.msg;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to add comment";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return { getVideoInfo, getComments, addComment, loading, error };
};
