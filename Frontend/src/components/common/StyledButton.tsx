import React from "react";

interface StyledButtonProps {
	value: string;
	disabled?: boolean;
}

const StyledButton: React.FC<StyledButtonProps> = ({
	value,
	disabled = false,
}) => {
	return (
		<button
			type="button"
			title={value}
			disabled={disabled}
			className={`text-white bg-gradient-to-br from-primary to-tertiary hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 font-bold rounded-lg text-sm px-14 py-5 text-center ${
				disabled ? "opacity-50 cursor-not-allowed" : ""
			}`}
		>
			{value}
		</button>
	);
};

export default StyledButton;
