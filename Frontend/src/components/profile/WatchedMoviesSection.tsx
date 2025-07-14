import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../../services/api/users";

interface Movie {
	id: string;
	title: string;
	year: number;
	thumbnail: string;
	rating: number;
	watched_at: string;
}

interface WatchedMoviesSectionProps {
	userId: string;
	isOwnProfile?: boolean;
}

const WatchedMoviesSection: React.FC<WatchedMoviesSectionProps> = ({ 
	userId, 
	isOwnProfile = false 
}) => {
	const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchWatchedMovies = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await usersApi.getLatestWatchedMovies(userId, 5);
				// The API returns data in the 'msg' property
				const movies = response.msg || [];
				setWatchedMovies(Array.isArray(movies) ? movies : []);
			} catch (err: any) {
				console.error("Error fetching watched movies:", err);
				setError(err.message || "Failed to load watched movies");
				setWatchedMovies([]);
			} finally {
				setLoading(false);
			}
		};

		if (userId) {
			fetchWatchedMovies();
		}
	}, [userId]);

	const handleMovieClick = (movieId: string) => {
		navigate(`/video/${movieId}`);
	};

	if (loading) {
		return (
			<div className="flex justify-center py-4">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-4 text-red-500">
				{error}
			</div>
		);
	}

	if (watchedMovies.length === 0) {
		return (
			<div className="text-center py-4 text-gray-500">
				{isOwnProfile ? "You haven't watched any movies yet." : "This user hasn't watched any movies yet."}
			</div>
		);
	}

	return (
		<div className="w-full">
			<h3 className="text-lg font-semibold text-font-main mb-4">
				{isOwnProfile ? "Recently Watched" : "Recently Watched Movies"}
			</h3>
			<div className="flex gap-4 overflow-x-auto pb-2">
				{Array.isArray(watchedMovies) && watchedMovies.map((movie) => (
					<div
						key={movie.id}
						onClick={() => handleMovieClick(movie.id)}
						className="flex-shrink-0 cursor-pointer group"
					>
						<div className="w-32 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
							<img
								src={movie.thumbnail}
								alt={movie.title}
								className="w-full h-48 object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.src = "/placeholder-movie.png"; // You might want to add a placeholder image
								}}
							/>
							<div className="p-2">
								<h4 className="text-sm font-medium text-gray-900 truncate">
									{movie.title}
								</h4>
								{movie.year && (
									<p className="text-xs text-gray-500">
										{movie.year}
									</p>
								)}
								{movie.rating > 0 && (
									<div className="flex items-center mt-1">
										<i className="fa fa-star text-yellow-400 text-xs mr-1" />
										<span className="text-xs text-gray-600">
											{Math.round(movie.rating * 10) / 10}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default WatchedMoviesSection;
