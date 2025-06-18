import React from "react";

interface OauthGithubButtonProps {
	action: string;
	disabled?: boolean;
}

const OauthGithubButton: React.FC<OauthGithubButtonProps> = ({
	action,
	disabled = false,
}) => {
	const handleRedirect = () => {
		window.location.href = import.meta.env.VITE_OAUTH_GITHUB_URL;
	};

	return (
		<button
			onClick={handleRedirect}
			type="button"
			disabled={disabled}
			className={`text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center ${
				disabled ? "opacity-50 cursor-not-allowed" : ""
			}`}
		>
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/9/95/Font_Awesome_5_brands_github.svg"
				alt="Github Logo"
				className="w-5 h-5 invert"
			/>
			<span className="ms-2 h-fit">{action} with GitHub</span>
		</button>
	);
};

export default OauthGithubButton;
