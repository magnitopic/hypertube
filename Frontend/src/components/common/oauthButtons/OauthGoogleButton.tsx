import React from "react";

interface OauthGoogleButtonProps {
	action: string;
	disabled?: boolean;
}

const OauthGoogleButton: React.FC<OauthGoogleButtonProps> = ({
	action,
	disabled = false,
}) => {
	const handleRedirect = () => {
		window.location.href = import.meta.env.VITE_OAUTH_GOOGLE_URL;
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
				src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
				alt="Google log"
				className="w-5 h-5"
			/>
			<span className="ms-2 h-fit">{action} with Google</span>
		</button>
	);
};

export default OauthGoogleButton;
