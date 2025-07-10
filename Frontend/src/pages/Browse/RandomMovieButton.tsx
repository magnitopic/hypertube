import React from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../../hooks/PageData/useLibrary";
import Spinner from "../../components/common/Spinner";

interface RandomMovieButtonProps {
	loading: boolean;
	setLoading: (loading: boolean) => void;
}

const RandomMovieButton: React.FC<RandomMovieButtonProps> = ({ loading, setLoading }) => {
	const { getRandomMovie } = useLibrary();
	const navigate = useNavigate();

	const handlePlayRandomMovie = async () => {
		setLoading(true);
		try {
			const randomMovie = await getRandomMovie();
			if (randomMovie && randomMovie.id) {
				navigate(`/video/${randomMovie.id}`);
			}
		} catch (error) {
			console.error("Failed to get random movie:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mt-6 mb-8">
			<button
				onClick={handlePlayRandomMovie}
				disabled={loading}
				className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
						   text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-300 
						   ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
						   flex items-center space-x-2"
			>
				{loading ? (
					<>
						<Spinner />
						<span>Finding Random Movie...</span>
					</>
				) : (
					<>
						<i className="fa fa-dice text-xl" />
						<span>Play Random Movie</span>
					</>
				)}
			</button>
		</div>
	);
};

export default RandomMovieButton;
