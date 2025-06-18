import React from "react";
import SortButton from "./SortButton";

const SortSection: React.FC = ({ onSort, sortBy, sortOrder }) => {
	return (
		<div className="w-full mb-8 flex md:justify-start justify-center">
			<div className="flex space-x-4 justify-center flex-wrap border rounded-lg w-fit shadow-sm bg-background-main">
				<SortButton
					criteria="popularity"
					icon={<span className="mr-2 text-lg">🔥</span>}
					label="Popularity"
					sortBy={sortBy}
					sortOrder={sortOrder}
					sortMovies={onSort}
				/>
				<SortButton
					criteria="title"
					icon={<i className="fa fa-font text-blue-500" />}
					label="Title"
					sortBy={sortBy}
					sortOrder={sortOrder}
					sortMovies={onSort}
				/>
				<SortButton
					criteria="year"
					icon={<i className="fa fa-calendar text-green-500" />}
					label="Year"
					sortBy={sortBy}
					sortOrder={sortOrder}
					sortMovies={onSort}
				/>
				<SortButton
					criteria="rating"
					icon={<i className="fa fa-star text-yellow-500" />}
					label="Rating"
					sortBy={sortBy}
					sortOrder={sortOrder}
					sortMovies={onSort}
				/>
				<SortButton
					criteria="language"
					icon={<i className="fa fa-language text-purple-500" />}
					label="Language"
					sortBy={sortBy}
					sortOrder={sortOrder}
					sortMovies={onSort}
				/>
			</div>
		</div>
	);
};

export default SortSection;
