import React from "react";
import FormInput from "../../components/common/FormInput";
import RegularButton from "../../components/common/RegularButton";
import FormSelect from "../../components/common/FormSelect";
import GenreTagSection from "../../components/common/GenreTagSection";

interface SearchProps {
	searchType: string;
	searchValue: string;
	selectedGenres: string[];
	availableGenres: string[];
	searchTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	searchValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onGenresChange: (genres: string[]) => void;
	onSearchSubmit: (e?: React.FormEvent) => void;
	loadingGenres?: boolean;
}

const Search: React.FC<SearchProps> = ({
	searchType,
	searchValue,
	selectedGenres,
	availableGenres,
	searchTypeChange,
	searchValueChange,
	onGenresChange,
	onSearchSubmit,
	loadingGenres = false,
}) => {
	const getPlaceholderText = () => {
		switch (searchType) {
			case "title":
				return "Search by movie title...";
			case "year":
				return "Search by year (e.g., 1945)...";
			case "language":
				return "Search by language (e.g., English)...";
			default:
				return "Search...";
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearchSubmit(e);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && searchType !== "genres") {
			onSearchSubmit();
		}
	};

	const isGenreSearch = searchType === "genres";
	const canSubmit = isGenreSearch
		? selectedGenres.length > 0
		: searchValue.trim();

	return (
		<div className="w-full max-w-3xl mx-auto my-4 space-y-4">
			<form
				onSubmit={handleSubmit}
				className="flex items-center justify-between w-full gap-2"
			>
				<div className="flex">
					<FormSelect
						name="search-type"
						options={[
							{ value: "title", label: "Title" },
							{ value: "year", label: "Year" },
							{ value: "language", label: "Language" },
							{ value: "genres", label: "Genres" },
						]}
						value={searchType}
						onChange={searchTypeChange}
					/>
				</div>

				{!isGenreSearch && (
					<FormInput
						type="text"
						placeholder={getPlaceholderText()}
						name="search"
						value={searchValue}
						onChange={searchValueChange}
						onKeyPress={handleKeyPress}
						error=""
					/>
				)}

				{isGenreSearch && (
					<div className="flex-1">
						<GenreTagSection
							availableGenres={availableGenres}
							selectedGenres={selectedGenres}
							onGenresChange={onGenresChange}
							isLoading={loadingGenres}
						/>
					</div>
				)}

				<RegularButton
					icon="fa fa-search"
					callback={onSearchSubmit}
					type="submit"
					disabled={!canSubmit}
				/>
			</form>
		</div>
	);
};

export default Search;
