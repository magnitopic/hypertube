import apiRequest from "./config";

export interface ChatPreview {
	chatId: string;
	receiverId: string;
	receiverUsername: string;
	receiverProfilePicture: string;
	createdAt: string;
	updatedAt: string;
}

export interface Message {
	senderId: string;
	message: string;
	createdAt: string;
	type: string;
}

export interface ChatDetails {
	chatId: string;
	senderId: string;
	receiverId: string;
	chatMessages: Message[];
}

export const chatApi = {
	getAllChats: async (): Promise<{ msg: ChatPreview[] }> => {
		const response = await apiRequest(`chat`);
		return response;
	},

	getChat: async (chatId: string): Promise<{ msg: ChatDetails }> => {
		const response = await apiRequest(`chat/${chatId}`);
		return response;
	},
};
