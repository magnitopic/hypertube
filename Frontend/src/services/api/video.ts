import apiRequest from "./config";

export const videoApi = {
	getVideoInfo: async (id: string): Promise => {
		const response = await apiRequest(`movies/${id}`);
		return response;
	},
	getComments: async (id: string): Promise => {
		const response = await apiRequest(`movies/${id}/comments`);
		return response;
	},
	addComment: async (id: string, comment: string): Promise => {
		const response = await apiRequest(`movies/${id}/comments`, {
			method: "POST",
			body: JSON.stringify({ comment }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response;
	},
	likeMovie: async (
		id: string
	): Promise<{ liked: boolean; totalLikes: number; msg: string }> => {
		const response = await apiRequest(`movies/${id}/like`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response;
	},
};
