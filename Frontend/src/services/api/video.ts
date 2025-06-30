import apiRequest from "./config";

export const videoApi = {
	getVideoInfo: async (id: string): Promise<any> => {
		const response = await apiRequest(`movies/${id}`);
		return response;
	},
};
