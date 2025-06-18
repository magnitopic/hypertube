import apiRequest from "./config";

export const usersApi = {
	getAllUsers: async () => {
		const response = await apiRequest(`users`);
		return response;
	},
	getPublicProfile: async (username: string) => {
		const response = await apiRequest(`users/${username}`);
		return response;
	},

	reportUser: async (userId: number) => {
		const response = await apiRequest(`users/report/${userId}`, {
			method: "POST",
		});
		return response;
	},

	blockUser: async (userId: number) => {
		const response = await apiRequest(`users/block/${userId}`, {
			method: "POST",
		});
		return response;
	},

	unblockUser: async (userId: number) => {
		const response = await apiRequest(`users/block/${userId}`, {
			method: "DELETE",
		});
		return response;
	},

	likeUser: async (userId: number) => {
		const response = await apiRequest(`likes/${userId}`, {
			method: "PUT",
		});
		return response;
	},

	getMatches: async () => {
		const response = await apiRequest(`matches`);
		return response;
	},

	getBrowseUsers: async () => {
		const response = await apiRequest(`browser`);
		return response;
	},
};
