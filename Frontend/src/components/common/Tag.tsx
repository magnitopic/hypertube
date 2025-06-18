import React from "react";

interface TagProps {
	value: string;
	onRemove?: () => void;
}

const Tag = React.memo(({ value, onRemove }: TagProps) => {
	return (
		<span className="inline-flex items-center px-2 py-1 text-sm bg-white/20 rounded-full backdrop-blur-sm border">
			{value}
			{onRemove && (
				<button
					type="button"
					onClick={onRemove}
					className="inline-flex items-center p-1 ms-2 text-gray-400 hover:text-gray-900 transition-colors"
				>
					<svg
						className="w-2 h-2"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 14 14"
					>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
						/>
					</svg>
					<span className="sr-only">Remove {value}</span>
				</button>
			)}
		</span>
	);
});

Tag.displayName = "Tag";

export default Tag;
