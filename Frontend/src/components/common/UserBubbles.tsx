import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserBubbles = ({ user }) => {
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<div className="relative w-fit h-fit">
			<Link
				to={`/profile/view/${user.username}`}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
			>
				<img
					className="w-14 h-14 rounded-full object-cover hover:scale-110 transition-transform shadow-lg border-2 border-solid border-primary"
					src={user.profilePicture}
					alt="user profile picture"
				/>
				{showTooltip && (
					<div className="absolute z-10 left-1/2 bottom-full mb-2 -translate-x-1/2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg">
						{user.username}
						<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
					</div>
				)}
			</Link>
		</div>
	);
};

export default UserBubbles;
