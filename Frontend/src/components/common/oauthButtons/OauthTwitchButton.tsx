import React from "react";

interface OauthTwitchButtonProps {
	action: string;
	disabled?: boolean;
}

const OauthTwitchButton: React.FC<OauthTwitchButtonProps> = ({
	action,
	disabled = false,
}) => {
	const handleRedirect = () => {
		window.location.href = import.meta.env.VITE_OAUTH_TWITCH_URL;
	};

	return (
		<button
			onClick={handleRedirect}
			type="button"
			disabled={disabled}
			className={`bg-white hover:bg-[#e8e8e8] border focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center ${
				disabled ? "opacity-50 cursor-not-allowed" : ""
			}`}
		>
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/d/d3/Twitch_Glitch_Logo_Purple.svg"
				alt="Twitch Logo"
				className="w-5 h-5"
			/>
			<span className="ms-2 h-fit">{action} with Twitch</span>
		</button>
	);
};

export default OauthTwitchButton;
