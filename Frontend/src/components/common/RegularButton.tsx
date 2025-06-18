interface RegularButtonProps {
	value: string;
	callback?: () => void;
	disabled?: boolean;
	type?: "button" | "submit";
	icon?: string;
}

const RegularButton = ({
	value,
	callback,
	disabled = false,
	type = "submit",
	icon,
}: RegularButtonProps) => {
	return (
		<button
			type={type}
			title={value}
			disabled={disabled}
			className={`w-fit duration-200 font-bold rounded-full bg-primary text-white border-primary border-solid border hover:bg-white hover:text-primary px-5 py-3 ${
				disabled
					? "opacity-50 cursor-not-allowed hover:bg-primary hover:text-white"
					: ""
			}`}
			onClick={callback}
		>
			{icon && <i className={`${value ? "pr-2" : null} ${icon}`} />}
			{value ? value : null}
		</button>
	);
};

export default RegularButton;
