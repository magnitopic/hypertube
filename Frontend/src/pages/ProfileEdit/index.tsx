import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Face from "./Face";
import Body from "./Body";
import { useProfile } from "../../hooks/PageData/useProfile";
import Spinner from "../../components/common/Spinner";
import RegularButton from "../../components/common/RegularButton";
import MsgCard from "../../components/common/MsgCard";
import { useEditProfile } from "../../hooks/PageData/useEditProfile";
import { EditProfileData } from "../../services/api/profile";
import PasswordChange from "./PasswordChange";

const index = () => {
	const { user } = useAuth();
	const { profile, loading, error } = useProfile(user?.id || "");
	const { updateProfile, loading: isUpdating } = useEditProfile();

	const [formData, setFormData] = useState<EditProfileData | null>(null);
	const [originalData, setOriginalData] = useState<EditProfileData | null>(
		null
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	useEffect(() => {
		if (profile) {
			setFormData(profile);
			setOriginalData(profile);
		}
	}, [profile]);

	// Helper function to detect changes between two values
	const hasValueChanged = (newValue: any, originalValue: any) => {
		if (Array.isArray(newValue) && Array.isArray(originalValue)) {
			if (newValue.length !== originalValue.length) return true;
			return newValue.some(
				(value, index) => value !== originalValue[index]
			);
		}
		if (!newValue && !originalValue) return false;
		if (!newValue || !originalValue) return true;
		return newValue !== originalValue;
	};

	// Get changed fields
	const getChangedFields = () => {
		if (!formData || !originalData) return {};

		const changes: Partial<EditProfileData> = {};

		Object.keys(formData).forEach((key) => {
			const typedKey = key as keyof EditProfileData;

			if (hasValueChanged(formData[typedKey], originalData[typedKey])) {
				changes[typedKey] = formData[typedKey];
			}
		});

		return changes;
	};

	/****  Updating the formData for the different types of inputs ****/
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) =>
			prev
				? {
						...prev,
						[name]: value,
				  }
				: null
		);
	};

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (!formData || !user?.id) return;

		const { name, value } = e.target;
		setFormData((prev) =>
			prev
				? {
						...prev,
						[name]: value,
				  }
				: null
		);
	};

	const handleImagesUpdate = (newImages: string[]) => {
		setFormData((prev) =>
			prev
				? {
						...prev,
						images: newImages,
				  }
				: null
		);
	};
	/*********/

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!formData || !user?.id) return;

		const changedFields = getChangedFields();

		if (Object.keys(changedFields).length === 0) return;

		setIsSubmitting(true);
		try {
			const response = await updateProfile(user.id, changedFields);
			if (response) {
				setMsg({
					type: "success",
					message: "Profile updated successfully",
					key: Date.now(),
				});
				// Update original data to match current state
				setOriginalData(formData);
			}
		} catch (error) {
			setMsg({
				type: "error",
				message:
					error instanceof Error
						? error.message
						: "Failed to update profile",
				key: Date.now(),
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (loading) return <Spinner />;
	if (error) {
		return (
			<main className="flex flex-1 justify-center items-center flex-col">
				<div>Error: {error}</div>
			</main>
		);
	}
	if (!formData) return <div>No profile data</div>;

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<form
				onSubmit={handleSubmit}
				className="flex justify-center items-center flex-col w-full"
			>
				<section className="w-full bg-gradient-to-br from-orange-200 to-purple-200 flex flex-col items-center gap-12 pb-5">
					<Face
						oauth={user.oauth}
						user={formData}
						onImagesUpdate={handleImagesUpdate}
						onChange={handleInputChange}
					/>
				</section>
				<Body
					user={formData}
					onChange={handleInputChange}
					onSelectChange={handleSelectChange}
				/>
				<section className="container max-w-4xl px-3 relative text-font-main mb-10 mt-9">
					<div className="max-w-4xl w-full text-start">
						<RegularButton
							value="Update profile"
							disabled={isSubmitting || isUpdating}
						/>
					</div>
				</section>
			</form>
			{!user.oauth && (
				<section className="container max-w-4xl px-3 relative text-font-main mb-10 flex flex-col gap-5">
					<h2 className="text-font-main text-xl">
						Additional settings
					</h2>
					<PasswordChange />
				</section>
			)}
		</main>
	);
};

export default index;
