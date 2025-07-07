import CommentBubble from "./CommentBubble";

const CommentSection: React.FC = ({ comments, handleNewComment }) => {
	return (
		<div className="flex flex-col gap-4 w-full bg-background-secondary p-4 mb-8 rounded-lg">
			<h2 className="underline text-2xl">Comments</h2>
			<form className="flex flex-row h-16" onSubmit={handleNewComment}>
				<input
					type="text"
					className="w-full p-4 rounded-l-lg bg-background-primary"
					placeholder="Add a comment"
				/>
				<button
					type="submit"
					className="bg-primary text-white rounded-r-lg w-14 h-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<i className="fa fa-paper-plane" />
				</button>
			</form>
			<div className="flex flex-col gap-4">
				{comments.length === 0 ? (
					<p className="text-gray-500">No comments yet.</p>
				) : (
					comments.map((comment, index) => {
						return <CommentBubble comment={comment} key={index} />;
					})
				)}
			</div>
		</div>
	);
};

export default CommentSection;
