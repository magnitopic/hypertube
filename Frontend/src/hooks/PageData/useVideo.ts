import { useState } from "react";
import { videoApi } from "../../services/api/video";

export const useVideo = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getVideoInfo = async (id: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.getVideoInfo(id);
			return data.msg;
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to fetch movie info";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const getComments = async (id: string): Promise<Comment[]> => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.getComments(id);
			return data.msg;
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to fetch comments";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const addComment = async (
		id: string,
		comment: string
	): Promise<Comment> => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.addComment(id, comment);
			return data.comment;
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to add comment";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const likeMovie = async (id: string): Promise => {
		setLoading(true);
		setError(null);
		try {
			const data = await videoApi.likeMovie(id);
			return data;
		} catch (err: any) {
			const errorMessage = err?.message || "Failed to like movie";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return { getVideoInfo, getComments, addComment, likeMovie, loading, error };
};
