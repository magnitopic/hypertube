import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Description from "./Description";
import CommentBubble from "./CommentBubble";
import { useVideo } from "../../hooks/PageData/useVideo";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const index: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	const [comments, setComments] = useState([
		{
			username: "user1",
			profilePicture:
				"https://github.com/magnitopic/matcha/blob/main/Frontend/public/person.png?raw=true",
			comment: "This is a great movie",
		},
	]);

	const { getVideoInfo } = useVideo();
	const [videoInfo, setVideoInfo] = useState(null);
	const [videoUrl, setVideoUrl] = useState("");
	type SubtitleTrack = {
		url: string;
		lang: string;
		label: string;
	};
	const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
	const [loadingSubtitles, setLoadingSubtitles] = useState(true);
	const [subtitleError, setSubtitleError] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

	const getMimeType = (url: string): string => {
		const ext = url.split(".").pop()?.toLowerCase();
		switch (ext) {
			case "mp4":
				return "video/mp4";
			case "webm":
				return "video/webm";
			case "ogg":
			case "ogv":
				return "video/ogg";
			default:
				return "video/mp4";
		}
	};

	useEffect(() => {
		if (!id) return;
		const url = `${API_URL}/movies/stream/${id}`;
		setVideoUrl(url);
		setLoading(false);
	}, [id]);

	// video info
	useEffect(() => {
		if (!id) return;
		const fetchVideoInfo = async () => {
			try {
				const videoInfo = await getVideoInfo(id);
				setVideoInfo(videoInfo);
			} catch (err) {
				console.error("Error fetching video info:", err);
				setError("Failed to load video information");
			} finally {
				setLoading(false);
			}
		};
		fetchVideoInfo();
	}, [id]);

	// subtitles 
	useEffect(() => {
		if (!id) return;

		const fetchSubtitles = async () => {
			setLoadingSubtitles(true);
			setSubtitleError("");
			try {
				const res = await fetch(`${API_URL}/movies/${id}/subtitles`, { 
					credentials: "include",
					headers: {
						'Accept': 'application/json'
					}
				});
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				const data = await res.json();
				if (data && Array.isArray(data.subtitles)) {
					setSubtitleTracks(data.subtitles);
					// Set English as default if available
					const enSub = data.subtitles.find(sub => sub.lang === 'en');
					if (enSub) {
						setActiveSubtitle(enSub.lang);
					}
				} else {
					setSubtitleTracks([]);
					setSubtitleError("No subtitles available");
				}
			} catch (err) {
				console.error("Error fetching subtitles:", err);
				setSubtitleError("Failed to load subtitles");
				setSubtitleTracks([]);
			} finally {
				setLoadingSubtitles(false);
			}
		};

		fetchSubtitles();
	}, [id]);

	const handleSubtitleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		setActiveSubtitle(value === 'none' ? null : value);
	};

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
				{loading ? (
					<p>Loading video...</p>
				) : error ? (
					<p className="text-red-500">{error}</p>
				) : (
					<div className="flex flex-col gap-4">
						<video className="w-full rounded-lg bg-black" controls autoPlay>
							<source src={videoUrl} type={getMimeType(videoUrl)} />
							{loadingSubtitles ? (
								<track kind="subtitles" label="Loading subtitles..." />
							) : subtitleTracks.length === 0 ? (
								<track kind="subtitles" label="No subtitles available" />
							) : (
								subtitleTracks.map((sub) => (
									<track
										key={sub.lang}
										kind="subtitles"
										src={`${API_URL}${sub.url}`}
										srcLang={sub.lang}
										label={sub.label}
										default={sub.lang === activeSubtitle}
									/>
								))
							)}
							Your browser does not support HTML5 video.
						</video>
						{!loadingSubtitles && subtitleTracks.length > 0 && (
							<div className="flex items-center gap-2">
								<label htmlFor="subtitles" className="text-sm font-medium">
									Subtitles:
								</label>
								<select
									id="subtitles"
									value={activeSubtitle || 'none'}
									onChange={handleSubtitleChange}
									className="p-2 rounded bg-background-secondary text-sm"
								>
									<option value="none">None</option>
									{subtitleTracks.map(sub => (
										<option key={sub.lang} value={sub.lang}>
											{sub.label}
										</option>
									))}
								</select>
							</div>
						)}
						{subtitleError && (
							<p className="text-red-500 text-sm">{subtitleError}</p>
						)}
					</div>
				)}
			</section>
			<section className="container max-w-4xl mx-auto pt-4 px-4">
				<Description videoInfo={videoInfo} />
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
