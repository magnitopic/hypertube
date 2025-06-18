import { useState } from "react";
import { usersApi } from "../../services/api/users";

export const useUsers = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getAllUsers = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.getAllUsers();
			return response.msg;
		} catch (err) {
			const errorMessage = err.message ? err.message : "Request failed";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const reportUser = async (userId: number) => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.reportUser(userId);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to report user";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const blockUser = async (userId: number) => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.blockUser(userId);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to block user";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const unblockUser = async (userId: number) => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.unblockUser(userId);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to unblock user";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const likeUser = async (userId: number) => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.likeUser(userId);
			return response;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to like user";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const getMatches = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.getMatches();
			return response.msg;
		} catch (err) {
			const errorMessage = err.message ? err.message : "Request failed";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};


	const getBrowseUsers = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.getBrowseUsers();
			return response.msg;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Could not get users to browse";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return {
		getAllUsers,
		reportUser,
		blockUser,
		unblockUser,
		likeUser,
		getMatches,
		getBrowseUsers,
		loading,
		error,
	};
};
