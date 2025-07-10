import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Description from "./Description";
import { useVideo } from "../../hooks/PageData/useVideo";
import CommentSection from "./CommentSection";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const index: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	type SubtitleTrack = {
		url: string;
		lang: string;
		label: string;
	};

	const [comments, setComments] = useState([]);
	const { getVideoInfo, getComments, addComment } = useVideo();
	const [videoInfo, setVideoInfo] = useState(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
	const [loadingSubtitles, setLoadingSubtitles] = useState(true);
	const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
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

	// comments
	useEffect(() => {
		if (!id) return;

		const fetchComments = async () => {
			try {
				const commentsData = await getComments(id);
				setComments(Array.isArray(commentsData) ? commentsData : []);
			} catch (err) {
				console.error("Error fetching comments:", err);
				setError("Failed to load comments");
			}
		};

		fetchComments();
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
					headers: { Accept: "application/json" },
				});

				if (!res.ok)
					throw new Error(`HTTP error! status: ${res.status}`);
				const data = await res.json();

				if (Array.isArray(data.subtitles)) {
					setSubtitleTracks(data.subtitles);

					// manual fetch .vtt
					const blobs: Record<string, string> = {};
					await Promise.all(
						data.subtitles.map(async (sub) => {
							const fileRes = await fetch(
								`${API_URL}${sub.url}`,
								{
									credentials: "include",
								}
							);
							const text = await fileRes.text();
							const blob = new Blob([text], { type: "text/vtt" });
							blobs[sub.lang] = URL.createObjectURL(blob);
						})
					);
					setBlobUrls(blobs);
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

	const handleNewComment = async (e: {
		preventDefault: () => void;
		target: { value: string }[];
	}) => {
		e.preventDefault();
		if (!e.target[0].value.trim()) {
			e.target[0].value = "";
			return;
		}

		try {
			const newComment = await addComment(id, e.target[0].value);
			setComments([newComment, ...comments]);
		} catch (error) {
			console.error("Error adding comment:", error);
		}

		e.target[0].value = "";
	};

	const handleMarkAsWatched = async () => {
		if (!id) return;

		try {
			await fetch(`${API_URL}/movies/${id}/watched`, {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
			});
			console.log("Movie marked as watched");
		} catch (err) {
			console.error("Error setting movie as watched: ", err);
		}
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
						<video
							className="w-full rounded-lg bg-black"
							controls
							autoPlay
							onPlay={handleMarkAsWatched} // Set movie as watched
						>
							<source
								src={videoUrl}
								type={getMimeType(videoUrl)}
							/>
							{loadingSubtitles ? (
								<track
									kind="subtitles"
									label="Loading subtitles..."
								/>
							) : subtitleTracks.length === 0 ? (
								<track
									kind="subtitles"
									label="No subtitles available"
								/>
							) : (
								subtitleTracks.map((sub) => (
									<track
										key={sub.lang}
										kind="subtitles"
										src={blobUrls[sub.lang]} // Blob-safe local URL
										srcLang={sub.lang}
										label={sub.label}
										default={sub.lang === activeSubtitle}
									/>
								))
							)}
							Your browser does not support HTML5 video.
						</video>
						{subtitleError && (
							<p className="text-red-500 text-sm">
								{subtitleError}
							</p>
						)}
					</div>
				)}
			</section>
			<section className="container max-w-4xl mx-auto pt-4 px-4">
				<Description videoInfo={videoInfo} />
			</section>
			<section className="container max-w-4xl mx-auto pt-12 px-4 flex flex-col gap-6">
				<CommentSection
					comments={comments}
					handleNewComment={handleNewComment}
				/>
			</section>
		</main>
	);
};

export default index;
