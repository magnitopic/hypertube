import apiRequest, { fileUploadRequest } from "./config";

export interface ProfileData {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
	age: number | null;
	biography: string | null;
	profile_picture: string;
	fame: number;
	last_online: number;
	is_online: bool;
	gender: string | null;
	sexual_preference: string | null;
	tags: string[];
	images: string[];
	likes: string[];
	views: string[];
}

export interface EditProfileData {
	id: string;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	age: number | null;
	biography: string | null;
	profile_picture: string;
	fame: number;
	last_online: number;
	is_online: bool;
	gender: string | null;
	sexual_preference: string | null;
	tags: string[];
	images: string[];
	likes: string[];
	views: string[];
}

export const profileApi = {
	getPrivateProfile: async (userId: string): Promise<ProfileData> => {
		const response = await apiRequest(`users/me`);
		return response;
	},

	editProfile: async (
		userId: string,
		userData: EditProfileData
	): Promise<EditProfileData> => {
		const response = await apiRequest(`users/${userId}`, {
			method: "PATCH",
			body: JSON.stringify(userData),
		});
		return response;
	},

	uploadProfilePicture: async (
		userId: string,
		file: File
	): Promise<ProfileData> => {
		const formData = new FormData();
		formData.append("files", file);

		return fileUploadRequest(
			`users/${userId}/profile-picture`,
			formData,
			"PUT"
		);
	},

	uploadImages: async (
		userId: string,
		files: File[]
	): Promise<ProfileData> => {
		const formData = new FormData();
		files.forEach((file) => {
			formData.append("files", file);
		});

		return fileUploadRequest(`users/${userId}/images`, formData, "POST");
	},

	removeImage: async (
		userId: string,
		imageId: string
	): Promise<ProfileData> => {
		const response = await apiRequest(`users/${userId}/images/${imageId}`, {
			method: "DELETE",
		});
		return response;
	},

	changePassword: async (passwords: string) => {
		const response = await apiRequest(`auth/password/change`, {
			method: "POST",
			body: JSON.stringify(passwords),
		});
		return response;
	},

	resetPassword: async (email: string) => {
		const response = await apiRequest(`auth/password/reset`, {
			method: "POST",
			body: JSON.stringify({ email }),
		});
		return response;
	},
};
