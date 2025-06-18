import React, { useState, useEffect } from "react";

// Types for the message data
type MessageType = "error" | "success" | "info" | "warning";

interface MessageProps {
	type: MessageType;
	message: string;
	duration?: number;
	onClose?: () => void;
}

const MsgCard: React.FC<MessageProps> = ({
	type,
	message,
	duration = 5000,
	onClose,
}) => {
	const [isVisible, setIsVisible] = useState(true);
	const [fadeOut, setFadeOut] = useState(false);

	const getStyles = (type: MessageType) => {
		const baseStyles =
			"z-50 rounded py-4 px-8 fixed bottom-4 right-4 shadow-lg xl:w-1/4 lg:w-1/3 md:w-1/2 sm:w-3/4 w-fit flex items-center transition-all duration-500";

		const typeStyles = {
			error: "bg-red-50 text-red-700 border-red-200",
			warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
			info: "bg-blue-50 text-blue-700 border-blue-200",
			success: "bg-green-50 text-green-700 border-green-200",
		};

		return `${baseStyles} ${typeStyles[type]} ${
			fadeOut ? "opacity-0 translate-x-full" : "opacity-100"
		}`;
	};

	const handleClose = () => {
		setFadeOut(true);
		setTimeout(() => {
			setIsVisible(false);
			onClose?.();
		}, 500);
	};

	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(handleClose, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, isVisible]);

	if (!isVisible) return null;

	const titles = {
		error: "Error",
		warning: "Warning",
		info: "Info",
		success: "Success",
	};

	return (
		<div className={getStyles(type)}>
			<div className="w-full text-start">
				<h3 className="text-xl font-semibold">{titles[type]}</h3>
				<p className="text-wrap">{message}</p>
			</div>
			<button
				type="button"
				onClick={handleClose}
				className="ml-4 text-xl font-bold cursor-pointer hover:opacity-70"
			>
				&times;
			</button>
		</div>
	);
};

export default MsgCard;
