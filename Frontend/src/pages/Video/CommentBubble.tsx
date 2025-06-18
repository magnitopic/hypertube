import React from "react";
import { Link } from "react-router-dom";
import UserBubbles from "../../components/common/UserBubbles";

const CommentBubble: React.FC = ({ comment }) => {
	return (
		<div className="flex gap-4 border border-secondary pb-4 bg-white rounded-lg p-4">
			<div className="w-14 h-14 rounded-full">
				<UserBubbles user={comment} />
			</div>
			<div className="flex flex-col gap-2">
				<Link to={`/profile/view/${comment.username}`}>
					<h3 className="text-lg underline">{comment.username}</h3>
				</Link>

				<p>{comment.comment}</p>
			</div>
		</div>
	);
};

export default CommentBubble;
