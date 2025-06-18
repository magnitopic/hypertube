import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProfileHeader from "./ProfileHeader";
import Info from "../../components/profile/Info";
import Images from "../../components/profile/Images";
import LikesAndViews from "./LikesAndViews";
import TagSection from "../../components/profile/TagSection";
import { useProfile } from "../../hooks/PageData/useProfile";
import Spinner from "../../components/common/Spinner";

interface UserData {
	username: string;
	first_name: string;
	last_name: string;
	age: number;
	biography: string;
	fame: number;
	last_online: number;
	profile_picture: string;
	gender: string;
	sexual_preference: string;
	tags: string[];
	images: string[];
}

const index = () => {
	const { user } = useAuth();
	const { profile, loading, error } = useProfile(user?.id || "");

	if (loading) return <Spinner />;
	if (error) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>Error: {error}</div>
			</main>
		);
	}
	if (!user || !profile) return <div>Error: User not found</div>;

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="w-full bg-gradient-to-br from-orange-200 to-purple-200 flex flex-col items-center gap-12">
				<ProfileHeader user={profile} />
			</section>
			<Info user={profile} />
		</main>
	);
};

export default index;
