import React from "react";

const ThumbnailBox: React.FC = ({ movie }) => {
	const handleClick = () => {
		console.log("Movie clicked:", movie.id);
	};

	return (
		<div
			onClick={handleClick}
			className="w-72 bg-white rounded-lg shadow-md p-6 overflow-hidden hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 flex flex-col"
		>
			<img
				src={movie.thumbnail}
				alt={movie.title}
				className="w-full h-fit"
			/>
			<h2 className="text-xl font-semibold mt-4 break-words">
				{movie.title}
				{movie.year && (
					<>
						<span> - </span>
						<span className="text-lg text-gray-400">
							{movie.year}
						</span>
					</>
				)}
			</h2>
			<div className="flex mt-2 gap-4 items-center">
				{movie.rating && movie.rating > 0 && (
					<p>
						<i className="fa fa-star font-bold text-sm text-yellow-400 mr-1" />
						<span>{Math.round(movie.rating * 10) / 10}</span>
						<span className="text-gray-400">/{"10"}</span>
					</p>
				)}
				{movie.isWatched && (
					<i className="fa fa-eye font-bold text-blue-400" />
				)}
				{movie.isLiked && (
					<i className="fa fa-heart font-bold text-red-500" />
				)}
			</div>
		</div>
	);
};

export default ThumbnailBox;
