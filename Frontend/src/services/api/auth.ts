import apiRequest from "./config";

interface RegisterData {
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
}

interface LoginData {
	username: string;
	password: string;
}

// Basic user info from auth status
interface BasicUser {
	id: string;
	username: string;
	oauth: boolean;
	iat: number;
	exp: number;
}

interface AuthResponse {
	success: boolean;
	message: string;
	user?: BasicUser;
}

export type { BasicUser, RegisterData, LoginData, AuthResponse };

// Authentication service methods
export const authApi = {
	register: async (userData: RegisterData): Promise<AuthResponse> => {
		try {
			const response = await apiRequest("auth/register", {
				method: "POST",
				body: JSON.stringify(userData),
			});
			return {
				success: true,
				message: "Registration successful",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Registration failed",
			};
		}
	},

	login: async (userData: LoginData): Promise<AuthResponse> => {
		try {
			await apiRequest("auth/login", {
				method: "POST",
				body: JSON.stringify(userData),
			});
			// After successful login, fetch the user status
			const status = await authApi.checkAuth();
			return {
				success: true,
				message: "Login successful",
				user: status.user,
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Login failed",
			};
		}
	},

	logout: async (): Promise<AuthResponse> => {
		try {
			await apiRequest("auth/logout", { method: "POST" });
			return {
				success: true,
				message: "Logout successful",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Logout failed",
			};
		}
	},

	checkAuth: async () => {
		try {
			const response = await apiRequest("auth/status");
			return {
				success: true,
				user: response.msg as BasicUser,
			};
		} catch {
			return {
				success: false,
				user: null,
			};
		}
	},

	oauth: async (code: string, provider: string): Promise<AuthResponse> => {
		try {
			await apiRequest(`auth/oauth/${provider}`, {
				method: "POST",
				body: JSON.stringify({ code }),
			});
			const status = await authApi.checkAuth();
			return {
				success: true,
				message: "OAuth login successful",
				user: status.user,
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "OAuth login failed",
			};
		}
	},

	confirmEmail: async (code: string): Promise<AuthResponse> => {
		try {
			await apiRequest(`auth/confirm?token=${code}`);
			return {
				success: true,
				message: "Email confirmed",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Email confirmation failed",
			};
		}
	},

	resetPassword: async (
		code: string,
		new_password: string
	): Promise<AuthResponse> => {
		try {
			await apiRequest(`auth/password/reset?token=${code}`, {
				method: "POST",
				body: JSON.stringify({ new_password }),
			});
			return {
				success: true,
				message: "Password reset successful",
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Password reset failed",
			};
		}
	},
};

export default authApi;
