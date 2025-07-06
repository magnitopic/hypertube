import apiRequest from "./config";

export const videoApi = {
	getVideoInfo: async (id: string): Promise<any> => {
		const response = await apiRequest(`movies/${id}`);
		return response;
	},
	getComments: async (id: string): Promise<any> => {
		const response = await apiRequest(`movies/${id}/comments`);
		return response;
	},
	addComment: async (id: string, comment: string): Promise<any> => {
		const response = await apiRequest(`movies/${id}/comments`, {
			method: "POST",
			body: JSON.stringify({ comment }),
			headers: {
				"Content-Type": "application/json",
			},
		});
		return response;
	},
};
