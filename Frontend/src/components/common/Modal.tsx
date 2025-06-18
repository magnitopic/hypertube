import { ReactNode, useEffect } from "react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			onClick={onClose}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4"
		>
			<div
				className="relative w-full max-w-3xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="relative bg-white rounded-xl shadow-lg">
					{children}
				</div>
			</div>
		</div>
	);
};

export default Modal;
