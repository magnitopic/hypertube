import React, { useState, useRef, useEffect } from "react";
import Tag from "./Tag";

interface GenreTagSectionProps {
	availableGenres: string[];
	selectedGenres: string[];
	onGenresChange: (genres: string[]) => void;
	isLoading?: boolean;
}

const GenreTagSection: React.FC<GenreTagSectionProps> = ({
	availableGenres = [],
	selectedGenres = [],
	onGenresChange,
	isLoading = false,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Ensure availableGenres is an array and filter
	const genresArray = Array.isArray(availableGenres) ? availableGenres : [];
	const filteredAvailableGenres = genresArray.filter((genre) => {
		const isNotSelected = !selectedGenres.includes(genre);
		const matchesSearch = genre
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		return isNotSelected && matchesSearch;
	});

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleAddGenre = (genreToAdd: string) => {
		const newSelectedGenres = [...selectedGenres, genreToAdd];
		onGenresChange(newSelectedGenres);
		setSearchQuery("");
	};

	const handleRemoveGenre = (genreToRemove: string) => {
		const newSelectedGenres = selectedGenres.filter(
			(genre) => genre !== genreToRemove
		);
		onGenresChange(newSelectedGenres);
	};

	const capitalizeGenre = (genre: string) => {
		return genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();
	};

	if (isLoading) {
		return (
			<div className="flex gap-2 flex-wrap p-3 border rounded-md bg-gray-50">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="border rounded-md p-3 bg-white min-h-[42px]">
			<div className="flex flex-wrap gap-2 items-center">
				{/* Selected genres */}
				{selectedGenres.map((genre) => (
					<Tag
						key={genre}
						value={capitalizeGenre(genre)}
						onRemove={() => handleRemoveGenre(genre)}
					/>
				))}

				{/* Add genre dropdown */}
				<div className="relative" ref={dropdownRef}>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							setIsDropdownOpen(!isDropdownOpen);
						}}
						className="inline-flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
					>
						+ Add Genre
					</button>

					{isDropdownOpen && (
						<div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border">
							<div className="p-2">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									placeholder="Search genres..."
									className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									autoFocus
								/>
							</div>

							<div className="max-h-60 overflow-y-auto">
								{filteredAvailableGenres.length > 0 ? (
									<div className="p-2 grid gap-1">
										{filteredAvailableGenres.map(
											(genre) => (
												<button
													type="button"
													key={genre}
													onClick={() =>
														handleAddGenre(genre)
													}
													className="text-left px-3 py-2 w-full text-sm hover:bg-gray-100 rounded-md transition-colors"
												>
													{capitalizeGenre(genre)}
												</button>
											)
										)}
									</div>
								) : (
									<div className="p-4 text-sm text-gray-500 text-center">
										{searchQuery
											? "No matching genres found"
											: "No more genres available"}
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Placeholder text when no genres selected */}
				{selectedGenres.length === 0 && (
					<span className="text-gray-400 text-sm">
						Select genres to search...
					</span>
				)}
			</div>
		</div>
	);
};

export default GenreTagSection;
