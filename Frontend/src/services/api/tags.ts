import apiRequest from "./config";

export interface TagData {
	id: string;
	value: string;
}

export const tagsApi = {
	getUserTags: async (): Promise<TagData> => {
		const response = await apiRequest(`tags`);
		return response;
	},
};
