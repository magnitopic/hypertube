import React, { useState } from "react";
import capitalizeLetters from "../../utils/capitalizeLetters";

interface MainInformationProps {
	user: {
		profile_picture: string;
		username: string;
		age: number;
		first_name: string;
		last_name: string;
		distance?: string;
	};
}

const MainInformation: React.FC<MainInformationProps> = ({ user }) => {
	const [imageKey, setImageKey] = useState(Date.now()); // Add state for cache busting

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="relative">
				<img
					src={`${user.profile_picture}?v=${imageKey}`}
					alt="UserProfile"
					className="w-36 rounded-full border shadow-lg h-36 object-cover"
				/>
			</div>

			<div className="flex flex-col gap-1">
				<p className="text-2xl font-semibold">{user.username}</p>

				<div className="flex gap-1 flex-wrap justify-center font-light text-gray-500">
					<p>
						{capitalizeLetters(user.first_name) +
							" " +
							capitalizeLetters(user.last_name)}
					</p>
				</div>
			</div>
		</div>
	);
};

export default MainInformation;
