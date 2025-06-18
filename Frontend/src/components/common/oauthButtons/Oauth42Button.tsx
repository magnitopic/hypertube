import React from "react";

interface Oauth42ButtonProps {
	action: string;
	disabled?: boolean;
}

const Oauth42Button: React.FC<Oauth42ButtonProps> = ({
	action,
	disabled = false,
}) => {
	const handleRedirect = () => {
		window.location.href = import.meta.env.VITE_OAUTH_42_URL;
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
				src="https://upload.wikimedia.org/wikipedia/commons/8/8d/42_Logo.svg"
				alt="42Intra"
				className="w-5 h-5 invert"
			/>
			<span className="ms-2 h-fit">{action} with 42</span>
		</button>
	);
};

export default Oauth42Button;
