import React, { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../../components/common/FormInput";
import Images from "./Images";
import { EditProfileData } from "../../services/api/profile";
import { useAuth } from "../../context/AuthContext";
import MsgCard from "../../components/common/MsgCard";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";

interface FaceProps {
	user: EditProfileData;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => void;
	onImagesUpdate: (images: string[]) => void;
}

const Face = ({ user, onChange, onImagesUpdate, oauth }: FaceProps) => {
	const { user: authUser } = useAuth();
	const { uploadProfilePicture } = useEditProfile();
	const [isUploading, setIsUploading] = useState(false);
	const [imageKey, setImageKey] = useState(Date.now()); // Add state for cache busting

	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	const handleProfilePictureUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!e.target.files || !authUser?.id) return;
		setIsUploading(true);
		try {
			const files = e.target.files[0];
			const response = await uploadProfilePicture(authUser.id, files);

			if (response && response.msg) {
				setImageKey(Date.now()); // Update the key to force a re-fetch
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error.message ||
					"Failed to update profile picture, please try again",
				key: Date.now(),
			});
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<section className="container max-w-4xl mt-20 px-3 relative text-font-main">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<div className="m-auto w-fit">
				<div className="text-sm flex mb-7">
					<Link to="/profile" title="Back to profile">
						<span className="fa fa-arrow-left mr-1" />
						Back to profile
					</Link>
				</div>
				<div className="flex flex-col lg:flex-row lg:items-start items-center gap-10">
					<div className="flex flex-col justify-center items-center">
						<div className="relative w-fit">
							<img
								src={`${user.profile_picture}?v=${imageKey}`}
								alt="UserProfile"
								className="w-36 rounded-full border shadow-lg h-36 object-cover"
							/>
							<div className="absolute bottom-0 right-0 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 group w-10 h-10 flex justify-center items-center">
								<label className="cursor-pointer text-center">
									<input
										type="file"
										accept="image/*"
										onChange={handleProfilePictureUpload}
										className="hidden"
										disabled={isUploading}
										multiple={false}
									/>
									<i className="fa fa-pencil text-xl text-gray-600 group-hover:text-gray-900 transition-colors"></i>
								</label>
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex gap-2 lg:gap-5 flex-wrap">
							<div className="w-full lg:w-auto">
								<label htmlFor="first_name">First Name</label>
								<FormInput
									name="first_name"
									value={user.first_name}
									onChange={onChange}
								/>
							</div>
							<div className="w-full lg:w-auto">
								<label htmlFor="last_name">Last Name</label>
								<FormInput
									name="last_name"
									value={user.last_name}
									onChange={onChange}
								/>
							</div>
						</div>
						{!oauth ? (
							<div>
								<label htmlFor="email">Email</label>
								<FormInput
									type="email"
									name="email"
									value={user.email}
									onChange={onChange}
								/>
							</div>
						) : (
							""
						)}
						<div>
							<label htmlFor="bio">Biography</label>
							<div className="w-full">
								<textarea
									id="biography"
									name="biography"
									value={user.biography || ""}
									onChange={onChange}
									placeholder="Bio"
									className="rounded-md w-full p-3 my-1"
									rows={4}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Face;
