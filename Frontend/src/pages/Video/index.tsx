import React, { useState } from "react";
import Description from "./Description";
import CommentBubble from "./CommentBubble";

const index: React.FC = () => {
	const writers = ["Christopher Nolan", "Kai Bird", "Martin Sherwin"];
	const stars = ["Cillian Murphy", "Emily Blunt", "Matt Damon"];

	const [comments, setComments] = useState([
		{
			username: "user1",
			profilePicture:
				"https://github.com/magnitopic/matcha/blob/main/Frontend/public/person.png?raw=true",
			comment: "This is a great movie",
		},
	]);

	const handleNewComment = (e) => {
		e.preventDefault();
		setComments([
			{
				username: "user2",
				profilePicture:
					"https://github.com/magnitopic/matcha/blob/main/Frontend/public/person2.png?raw=true",
				comment: e.target[0].value,
			},
			...comments,
		]);
		e.target[0].value = "";
	};

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
				<video
					className="w-full rounded-lg bg-black"
					controls
					autoPlay
					src=""
				></video>
			</section>
			<section className="container max-w-4xl mx-auto pt-4 px-4">
				<Description writers={writers} stars={stars} />
			</section>
			<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
				<div className="flex flex-col gap-4 w-full bg-background-secondary p-4 mb-8 rounded-lg">
					<h2 className="underline text-2xl">Comments</h2>
					<form
						className="flex flex-row h-16"
						onSubmit={handleNewComment}
					>
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
						{comments.map((comment, index) => {
							return (
								<CommentBubble comment={comment} key={index} />
							);
						})}
					</div>
				</div>
			</section>
		</main>
	);
};

export default index;
