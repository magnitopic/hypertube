import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { usePublicProfile } from "../../hooks/PageData/usePublicProfile";
import { useProfile } from "../../hooks/PageData/useProfile";
import { useUsers } from "../../hooks/PageData/useUsers";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/common/Spinner";
import ProfileHeader from "./ProfileHeader";
import Info from "../../components/profile/Info";

const index = () => {
	const { username } = useParams<{ username: string }>();
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const {
		profile,
		loading: profileLoading,
		error: profileError,
		notFound,
	} = usePublicProfile(username || "");
	const { profile: currentUserProfile, loading: currentUserLoading } =
		useProfile(user?.id);
	const { getUserDistance } = useUsers();

	const [userProfile, setUserProfile] = useState(profile);

	useEffect(() => {
		setUserProfile(profile);
	}, [profile]);


	const handleProfileUpdate = (updatedData) => {
		setUserProfile((prev) => ({ ...prev, ...updatedData }));
	};

	if (authLoading) {
		return <Spinner />;
	}

	// If this is the current user's profile, redirect to /profile
	if (user?.username === username) {
		return <Navigate to="/profile" replace />;
	}

	// Only check profile loading states after auth is complete
	const isLoading = profileLoading || (isAuthenticated && currentUserLoading);

	if (isLoading) return <Spinner />;
	if (notFound) return <Navigate to="/404" replace />;
	if (profileError) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>Error: {profileError}</div>
			</main>
		);
	}
	if (!userProfile) return null;

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="w-full bg-gradient-to-br from-red-200 to-purple-200 flex flex-col items-center gap-12">
				<ProfileHeader
					user={userProfile}
					onProfileUpdate={handleProfileUpdate}
				/>
			</section>
			<Info user={userProfile} />
			<TagSection tags={userProfile.tags} />
		</main>
	);
};

export default index;
