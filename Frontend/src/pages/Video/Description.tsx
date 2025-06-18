import React from "react";

const Description: React.FC = ({ writers, stars }) => {
	return (
		<div className="w-full bg-background-secondary p-4 rounded-lg mb-7 flex flex-col-reverse md:flex-row gap-4">
			<div className="w-full md:w-1/4 flex items-center justify-center">
				<img
					src="https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_QL75_UX380_CR0,0,380,562_.jpg"
					alt="Movie Poster"
					className="rounded-lg h-fit max-h-80"
				/>
			</div>
			<div className="flex flex-col gap-4 w-full md:w-3/4">
				<div className="flex justify-between items-start">
					<div className="w-3/4 pr-4">
						<h2 className="text-2xl font-semibold break-words">
							{"Oppenheimer"}
							<span> | </span>
							<span className="text-xl text-gray-400">
								{"2023"}
							</span>
						</h2>
						<p>Length: {"3h"}</p>
					</div>
					<div className="flex items-center flex-col px-2">
						<p className="text-sm">TMDb rating</p>
						<p>
							<span className="text-yellow-400 mr-1">★</span>
							<span>{"8.3"}</span>
							<span className="text-gray-400">/{"10"}</span>
						</p>
					</div>
				</div>
				<div>
					<div className="flex gap-4 flex-wrap items-center">
						<label htmlFor="" className="text-lg underline">
							Director
						</label>
						<p>{"Christopher Nolan"}</p>
					</div>
					<div className="flex gap-4 flex-wrap items-center">
						<label htmlFor="" className="text-lg underline">
							Writer{writers.length > 1 && "s"}
						</label>
						<p>
							{writers.map((writer, index) => (
								<span key={index}>
									{writer}
									{index < writers.length - 1 && (
										<span>, </span>
									)}
								</span>
							))}
						</p>
					</div>
					<div className="flex gap-4 flex-wrap items-center">
						<label htmlFor="" className="text-lg underline">
							Star{stars.length > 1 && "s"}
						</label>
						<p>
							{stars.map((star, index) => (
								<span key={index}>
									{star}
									{index < stars.length - 1 && (
										<span>, </span>
									)}
								</span>
							))}
						</p>
					</div>
				</div>
				<div>
					<label htmlFor="" className="text-lg underline">
						Summary
					</label>
					<p>
						{
							"A dramatization of the life story of J. Robert Oppenheimer, the physicist who had a large hand in the development of the atomic bombs that brought an end to World War II."
						}
					</p>
				</div>
			</div>
		</div>
	);
};

export default Description;
