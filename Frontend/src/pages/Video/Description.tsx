import React from "react";

const Description: React.FC = ({ videoInfo }) => {
	return (
		<div className="w-full bg-background-secondary p-4 rounded-lg mb-7 flex flex-col-reverse md:flex-row gap-4">
			<div className="w-full md:w-1/4 flex items-center justify-center">
				<img
					src={videoInfo && videoInfo.thumbnail}
					alt="Movie Poster"
					className="rounded-lg h-fit max-h-80"
				/>
			</div>
			<div className="flex flex-col gap-4 w-full md:w-3/4">
				<div className="flex justify-between items-start">
					<div className="w-3/4 pr-4">
						<h2 className="text-2xl font-semibold break-words">
							{videoInfo && videoInfo.title}
							<span> | </span>
							<span className="text-xl text-gray-400">
								{videoInfo && videoInfo.year}
							</span>
						</h2>
						<p>Length: {"3h"}</p>
					</div>
					<div className="flex items-center flex-col px-2">
						<p className="text-sm">TMDb rating</p>
						<p>
							<span className="text-yellow-400 mr-1">★</span>
							<span>
								{videoInfo && videoInfo.rating.toFixed(1)}
							</span>
							<span className="text-gray-400">/{"10"}</span>
						</p>
					</div>
				</div>
				<div>
					<div className="flex gap-4 flex-wrap items-center">
						<label className="text-lg underline">
							Director
						</label>
						<p>
							{videoInfo &&
							videoInfo.directors &&
							videoInfo.directors.length > 0
								? videoInfo.directors[0]
								: "Unknown"}
						</p>
					</div>
					{videoInfo &&
						videoInfo.writers &&
						videoInfo.writers.length > 0 && (
							<div className="flex gap-4 flex-wrap items-center">
								<label className="text-lg underline">
									Writer{videoInfo.writers.length > 1 && "s"}
								</label>
								<p>
									{videoInfo.writers.map((star, index) => (
										<span key={index}>
											{star}
											{index <
												videoInfo.writers.length -
													1 && <span>, </span>}
										</span>
									))}
								</p>
							</div>
						)}
					{videoInfo &&
						videoInfo.stars &&
						videoInfo.stars.length > 0 && (
							<div className="flex gap-4 flex-wrap items-center">
								<label className="text-lg underline">
									Star{videoInfo.stars.length > 1 && "s"}
								</label>
								<p>
									{videoInfo.stars.map((star, index) => (
										<span key={index}>
											{star}
											{index <
												videoInfo.stars.length - 1 && (
												<span>, </span>
											)}
										</span>
									))}
								</p>
							</div>
						)}
				</div>
				<div>
					<label className="text-lg underline">
						Summary
					</label>
					<p>{videoInfo && videoInfo.description}</p>
				</div>
			</div>
		</div>
	);
};

export default Description;
