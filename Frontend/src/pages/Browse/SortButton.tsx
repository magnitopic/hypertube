import React from "react";

const SortButton = ({
	sortMovies,
	criteria,
	icon,
	label,
	sortBy,
	sortOrder,
}) => {
	const handleClick = () => {
		if (sortBy === criteria) {
			sortMovies(criteria, sortOrder === "ASC" ? "DESC" : "ASC");
		} else {
			sortMovies(criteria, "ASC");
		}
	};

	return (
		<button
			onClick={handleClick}
			className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-300 
		${sortBy === criteria ? "bg-pink-100 text-pink-800" : "hover:bg-gray-100"}`}
		>
			{icon}
			<span>{label}</span>
			{sortBy === criteria && (
				<span className="ml-1">{sortOrder === "ASC" ? "↑" : "↓"}</span>
			)}
		</button>
	);
};

export default SortButton;
