import React, { createContext, useState, useContext, useEffect } from "react";
import {
	authApi,
	BasicUser,
	LoginData,
	RegisterData,
	AuthResponse,
} from "../services/api/auth";
import { usersApi } from "../services/api/users";

interface AuthContextType {
	isAuthenticated: boolean;
	user: BasicUser | null;
	loading: boolean;
	register: (data: RegisterData) => Promise<AuthResponse>;
	login: (data: LoginData) => Promise<AuthResponse>;
	logout: () => Promise<AuthResponse>;
	oauth: (token: string, provider: string) => Promise<AuthResponse>;
	confirmEmail: (token: string) => Promise<AuthResponse>;
	resetPassword: (
		token: string,
		new_password: string
	) => Promise<AuthResponse>;
	refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

/**
 * AuthProvider component
 * The token that is provided by the backend is stored in the local storage to
 * keep the user logged in. The token is then used to verify the user's
 * authentication status when accessing protected routes.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [user, setUser] = useState<BasicUser | null>(null);

	const checkAuthStatus = async () => {
		try {
			const { success, user: userData } = await authApi.checkAuth();
			setIsAuthenticated(success);
			setUser(userData);
		} catch {
			setIsAuthenticated(false);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const register = async (data: RegisterData): Promise<AuthResponse> => {
		const response = await authApi.register(data);
		if (response.success) {
			await checkAuthStatus();
		}
		return response;
	};

	const login = async (data: LoginData): Promise<AuthResponse> => {
		const response = await authApi.login(data);
		if (response.success && response.user) {
			setUser(response.user);
			setIsAuthenticated(true);
		}
		return response;
	};

	const logout = async (): Promise<AuthResponse> => {
		const response = await authApi.logout();
		if (response.success) {
			setUser(null);
			setIsAuthenticated(false);
		}
		return response;
	};

	const oauth = async (
		token: string,
		provider: string
	): Promise<AuthResponse> => {
		const response = await authApi.oauth(token, provider);
		if (response.success && response.user) {
			setUser(response.user);
			setIsAuthenticated(true);
		}
		return response;
	};

	const confirmEmail = async (code: string): Promise<AuthResponse> => {
		try {
			await authApi.confirmEmail(code);
			const status = await authApi.checkAuth();
			setUser(status.user);
			setIsAuthenticated(true);
			return {
				success: true,
				message: "Email confirmed",
				user: status.user,
			};
		} catch (error: any) {
			return {
				success: false,
				message: error.message || "Email confirmation failed",
			};
		}
	};

	const resetPassword = async (
		token: string,
		new_password: string
	): Promise<AuthResponse> => {
		return await authApi.resetPassword(token, new_password);
	};

	const refreshUserData = async (): Promise<void> => {
		try {
			// First check if user is still authenticated
			const { success } = await authApi.checkAuth();
			if (success) {
				// Then get the updated user data from the users API
				const response = await usersApi.getMe();
				const userData = response.msg;
				if (userData) {
					// Update user data with the fresh info from getMe
					setUser({
						id: userData.id || user?.id || "",
						username: userData.username,
						oauth: user?.oauth || false,
						iat: user?.iat || 0,
						exp: user?.exp || 0,
					});
					setIsAuthenticated(true);
				}
			} else {
				setUser(null);
				setIsAuthenticated(false);
			}
		} catch (error) {
			console.error("Failed to refresh user data:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				loading,
				register,
				login,
				logout,
				oauth,
				confirmEmail,
				resetPassword,
				refreshUserData,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
