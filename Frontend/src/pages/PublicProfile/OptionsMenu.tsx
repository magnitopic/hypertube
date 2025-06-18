import { useState } from "react";

const ProfileOptionsMenu = ({ user, onBlock, onReport }) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClick = (action: () => void) => {
		action();
		setIsOpen(false);
	};

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="absolute top-0 right-4 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 group w-10 h-10 flex justify-center items-center"
				aria-label="Profile options"
				title="Profile options"
			>
				<p className="fa fa-ellipsis-v text-xl text-gray-600 group-hover:text-gray-900 transition-colors"></p>
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute right-16 top-0 z-50 bg-white rounded-lg shadow-lg py-1 min-w-[120px]">
						<button
							onClick={() => handleClick(onBlock)}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
						>
							<span className="fa fa-ban text-red-500" />
							{user.blocked ? "Unblock" : "Block"}
						</button>
						<button
							onClick={() => handleClick(onReport)}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
						>
							<span className="fa fa-flag text-yellow-500" />
							Report as fake account
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default ProfileOptionsMenu;
