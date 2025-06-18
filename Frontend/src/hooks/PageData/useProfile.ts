import { useState, useEffect } from "react";
import { profileApi, ProfileData } from "../../services/api/profile";

export const useProfile = (userId: string) => {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await profileApi.getPrivateProfile(userId);
				setProfile(data.msg);
			} catch (err) {
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

		if (userId) fetchProfile();
	}, [userId]);

	return { profile, loading, error };
};
