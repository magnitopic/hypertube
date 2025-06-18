export const timeAgo = (timestamp: string | number) => {
	const date =
		typeof timestamp === "string"
			? new Date(timestamp).getTime()
			: timestamp;

	const seconds = Math.floor((Date.now() - date) / 1000);

	const intervals = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60,
		second: 1,
	};

	for (const [unit, secondsInUnit] of Object.entries(intervals)) {
		const interval = Math.floor(seconds / secondsInUnit);
		if (interval >= 1) {
			return interval === 1
				? `1 ${unit} ago`
				: `${interval} ${unit}s ago`;
		}
	}

	return "Just now";
};
