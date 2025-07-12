import { useState, useEffect } from "react";
import MsgCard from "../../components/common/MsgCard";
import { useVideo } from "../../hooks/PageData/useVideo";

const LikeButton = ({ initialLiked, videoId, initialTotalLikes }) => {
	const [isLiked, setIsLiked] = useState(initialLiked);
	const [totalLikes, setTotalLikes] = useState(
		initialTotalLikes != null ? initialTotalLikes : 0
	);
	const [isLoading, setIsLoading] = useState(false);
	const [msg, setMsg] = useState<{
		type: "error" | "success";
		message: string;
		key: number;
	} | null>(null);

	const { likeMovie } = useVideo();

	// update like state when initialLiked changes
	useEffect(() => {
		setIsLiked(initialLiked);
	}, [initialLiked]);

	useEffect(() => {
		if (initialTotalLikes != null) {
			setTotalLikes(initialTotalLikes);
		}
	}, [initialTotalLikes]);

	const handleLikeClick = async () => {
		if (isLoading || !videoId) return;

		setIsLoading(true);
		try {
			const response = await likeMovie(videoId);
			setIsLiked(response.liked);
			setTotalLikes(response.totalLikes);
		} catch (err: any) {
			setMsg({
				type: "error",
				message: err.message,
				key: Date.now(),
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{msg && (
				<MsgCard
					key={msg.key}
					type={msg.type}
					message={msg.message}
					onClose={() => setMsg(null)}
				/>
			)}
			<div className="flex items-center gap-3 mb-4">
				<button
					onClick={handleLikeClick}
					disabled={isLoading}
					className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg p-0.5 font-medium focus:outline-none focus:ring-4 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-300 disabled:hover:text-gray-300 transition-all duration-200
						${
							isLiked
								? "bg-gradient-to-br from-red-500 to-pink-500 text-white hover:bg-gradient-to-bl"
								: "bg-gradient-to-br from-purple-500 to-pink-500 text-gray-900 hover:text-white"
						}`}
				>
					<span
						className={`flex items-center gap-2 rounded-md px-5 py-2.5 transition-all duration-75 ease-in ${
							isLiked
								? "bg-transparent"
								: "bg-white group-hover:bg-opacity-0"
						}`}
					>
						<span
							className={`${
								isLiked ? "fa fa-heart" : "fa-regular fa-heart"
							}`}
						/>
						{totalLikes}
					</span>
				</button>
			</div>
		</>
	);
};

export default LikeButton;
