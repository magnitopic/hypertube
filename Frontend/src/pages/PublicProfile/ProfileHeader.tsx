import React, { useState } from "react";
import MainInformation from "../../components/profile/MainInformation";
import OptionsMenu from "./OptionsMenu";
import { useUsers } from "../../hooks/PageData/useUsers";
import MsgCard from "../../components/common/MsgCard";

const ProfileHeader = ({ user: initialUser, onProfileUpdate, distance }) => {
	const { blockUser, unblockUser, reportUser } = useUsers();
	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	const onBlock = async () => {
		try {
			if (initialUser.blocked) {
				await unblockUser(initialUser.id);
				onProfileUpdate({ blocked: false });
				setMsg({
					type: "success",
					message: "User unblocked",
					key: Date.now(),
				});
			} else {
				await blockUser(initialUser.id);
				onProfileUpdate({ blocked: true, liked: false });
				setMsg({
					type: "success",
					message: "User blocked",
					key: Date.now(),
				});
			}
		} catch (err) {
			setMsg({
				type: "error",
				message: err.message,
				key: Date.now(),
			});
		}
	};

	const onReport = async () => {
		try {
			await reportUser(initialUser.id);
			setMsg({
				type: "success",
				message: "User reported successfully",
				key: Date.now(),
			});
		} catch (err) {
			setMsg({
				type: "error",
				message: err.message,
				key: Date.now(),
			});
		}
	};

	return (
		<>
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			{initialUser.blocked && (
				<div className="bg-red-400 text-white p-2 text-center w-full absolute">
					<p>
						<i className="fa fa-ban pr-2" />
						You have blocked this user
					</p>
				</div>
			)}
			<section className="container max-w-4xl text-center mt-20 px-3 relative">
				<OptionsMenu
					user={initialUser}
					onBlock={onBlock}
					onReport={onReport}
				/>
				<MainInformation user={initialUser} distance={distance} />
			</section>
		</>
	);
};

export default ProfileHeader;
