import apiRequest from "./config";

export const usersApi = {
	getMe: async () => {
		const response = await apiRequest(`users/me`);
		return response;
	},

	getPublicProfile: async (username: string) => {
		const response = await apiRequest(`users/profile/${username}`);
		return response;
	},

	getLatestWatchedMovies: async (userId: string, limit: number = 5) => {
		const response = await apiRequest(
			`users/${userId}/watched-movies?limit=${limit}`
		);
		return response;
	},
};
