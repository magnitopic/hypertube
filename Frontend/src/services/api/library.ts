import apiRequest from "./config";

export const libraryApi = {
	getLibrary: async (page: number): Promise<any> => {
		const response = await apiRequest(`movies/library/${page}`);
		return response;
	},

	searchLibrary: async (page: number, params = {}): Promise<any> => {
		console.log("____________________");
		console.log("params", params);

		const paramsString = new URLSearchParams(params).toString();
		const queryString = paramsString ? `?${paramsString}` : "";

		const response = await apiRequest(
			`movies/search/${page}${queryString}`
		);
		return response;
	},

	getGenres: async (): Promise<string[]> => {
		const response = await apiRequest("movies/genres");
		return response.msg;
	},
};
