import { useState, useEffect } from "react";
import { usersApi } from "../../services/api/users";
import { ProfileData } from "../../services/api/profile";

export const usePublicProfile = (username: string) => {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			setError(null);
			setNotFound(false);

			try {
				const data = await usersApi.getPublicProfile(username);
				setProfile(data.msg);
			} catch (err) {
				if (err.status === 404) {
					setNotFound(true);
				}
				setError(
					err instanceof Error
						? err.message
						: "Failed to fetch profile"
				);
				setProfile(null);
			} finally {
				setLoading(false);
			}
		};

		if (username) {
			fetchProfile();
		}
	}, [username]);

	return { profile, loading, error, notFound };
};
