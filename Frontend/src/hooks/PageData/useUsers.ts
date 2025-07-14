import { useState } from "react";
import { usersApi } from "../../services/api/users";

export const useUsers = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const getMe = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await usersApi.getMe();
			return response.msg;
		} catch (err) {
			const errorMessage = err.message
				? err.message
				: "Failed to get user data";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};


	return {
		getMe,
		loading,
		error,
	};
};
