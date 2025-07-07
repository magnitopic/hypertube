import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Comment } from "../../services/api/video";
import { timeAgo } from "../../hooks/timeAgo";
import UserBubbles from "../../components/common/UserBubbles";

const CommentBubble: React.FC<any> = ({ comment }) => {
	const username = comment.username || "Anonymous";
	const [imageKey, setImageKey] = useState(Date.now()); // Add state for cache busting

	return (
		<div className="flex gap-4 border border-secondary pb-4 bg-white rounded-lg p-4">
			<div className="w-14 h-14 rounded-full flex-shrink-0">
				<UserBubbles user={comment} />
			</div>
			<div className="flex flex-col gap-2 flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap">
					{comment.username ? (
						<Link
							to={`/profile/view/${comment.username}`}
							className="text-lg underline text-primary hover:text-primary-monochromatic transition-colors"
						>
							{username}
						</Link>
					) : (
						<span className="text-lg text-gray-600">
							{username}
						</span>
					)}
					<span className="text-sm text-gray-500">
						{timeAgo(comment.created_at)}
					</span>
				</div>
				<p className="text-gray-700 break-words">{comment.content}</p>
			</div>
		</div>
	);
};

export default CommentBubble;
