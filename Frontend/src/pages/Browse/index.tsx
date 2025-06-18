import React, { useState, useEffect } from "react";
import { useProfile } from "../../hooks/PageData/useProfile";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../hooks/PageData/useLibrary";
import Spinner from "../../components/common/Spinner";
import SortSection from "./SortSection";
import Search from "./Search";
import calculateAge from "../../utils/calculateAge";
import ThumbnailBox from "./ThumbnailBox";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import MsgCard from "../../components/common/MsgCard";
import ISO6391 from "iso-639-1";

const index = () => {
	const { user } = useAuth();
	const { profile } = useProfile(user?.id || "");
	const { getLibrary, searchLibrary, getGenres } = useLibrary();

	const [searchType, setSearchType] = useState("title");
	const [searchValue, setSearchValue] = useState("");
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [availableGenres, setAvailableGenres] = useState<string[]>([]);
	const [loadingGenres, setLoadingGenres] = useState(false);
	const [orderBy, setOrderBy] = useState("title");
	const [orderType, setOrderType] = useState("ASC");
	const [isSearchMode, setIsSearchMode] = useState(false);
	const [currentSearchParams, setCurrentSearchParams] = useState({});

	useEffect(() => {
		if (searchType === "genres" && availableGenres.length === 0) {
			loadGenres();
		}
	}, [searchType]);

	const loadGenres = async () => {
		setLoadingGenres(true);
		try {
			const response = await getGenres();
			let genres: string[] = [];

			if (
				response &&
				typeof response === "object" &&
				!Array.isArray(response)
			) {
				genres = Object.values(response);
			} else {
				genres = [];
			}
			setAvailableGenres(genres);
		} catch (error) {
			console.error("Failed to load genres:", error);
			setAvailableGenres([]);
		} finally {
			setLoadingGenres(false);
		}
	};

	const createFetchFunction = (searchParams = {}) => {
		const paramsToUse = isSearchMode
			? {
					...searchParams,
					orderedBy: orderBy,
					orderType: orderType,
			  }
			: searchParams;

		if (!isSearchMode && Object.keys(searchParams).length === 0) {
			return getLibrary;
		}

		return (page: number) => searchLibrary(page, paramsToUse);
	};

	const {
		items: movies,
		loading,
		error,
		hasMore,
		loadingRef,
		initialLoad,
		resetItems,
	} = useInfiniteScroll({
		fetchPage: createFetchFunction(currentSearchParams),
		initialPage: 1,
	});

	if (movies.length > 0) {
		movies[0] = { ...movies[0], isWatched: true, isLiked: true };
	}

	const searchTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newSearchType = e.target.value;
		setSearchType(newSearchType);

		// Clear search data when changing search type
		setSearchValue("");
		setSelectedGenres([]);

		if (isSearchMode) {
			setIsSearchMode(false);
			setCurrentSearchParams({});
			resetItems();
		}
	};

	const searchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(e.target.value);
	};

	const handleGenresChange = (genres: string[]) => {
		setSelectedGenres(genres);
	};

	const handleSearchSubmit = (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		const hasSearchCriteria =
			searchType === "genres"
				? selectedGenres.length > 0
				: searchValue.trim();

		if (!hasSearchCriteria) {
			setIsSearchMode(false);
			setCurrentSearchParams({});
			resetItems();
			return;
		}

		let searchParams: any = {};

		if (searchType === "genres") {
			searchParams = { "genres[]": selectedGenres };
		} else if (searchType === "language") {
			const isoCode = ISO6391.getCode(searchValue);
			if (isoCode) {
				searchParams.language = isoCode;
			} else {
				searchParams.language = searchValue;
			}
		} else {
			searchParams[searchType] = searchValue;
		}

		setIsSearchMode(true);
		setCurrentSearchParams(searchParams);
		resetItems();
	};

	const handleSort = (sortBy: string, sortOrder: string) => {
		setOrderBy(sortBy);
		setOrderType(sortOrder);

		if (isSearchMode) {
			resetItems();
		}
	};

	useEffect(() => {
		if (isSearchMode && (movies.length > 0 || !initialLoad)) {
			resetItems();
		}
	}, [orderBy, orderType]);

	useEffect(() => {
		if (isSearchMode && Object.keys(currentSearchParams).length > 0) {
			resetItems();
		}
	}, [currentSearchParams, isSearchMode]);

	return (
		<main className="flex flex-1 justify-center items-center flex-col w-full my-10">
			{error && (
				<MsgCard
					title="Error loading library"
					message={error}
					type="error"
				/>
			)}

			<h1 className="text-4xl font-bold">Library</h1>
			<section className="container max-w-7xl px-4 flex flex-col w-full items-center xl:items-start gap-6">
				<Search
					searchType={searchType}
					searchValue={searchValue}
					selectedGenres={selectedGenres}
					availableGenres={availableGenres}
					searchTypeChange={searchTypeChange}
					searchValueChange={searchValueChange}
					onGenresChange={handleGenresChange}
					onSearchSubmit={handleSearchSubmit}
					loadingGenres={loadingGenres}
				/>
				{isSearchMode && (
					<SortSection
						onSort={handleSort}
						sortBy={orderBy}
						sortOrder={orderType}
					/>
				)}
			</section>
			<section className="container max-w-7xl pt-10 px-4 flex flex-row justify-between w-full items-center flex-grow">
				<div className="flex flex-wrap md:justify-start justify-center gap-x-8 gap-y-10 w-full">
					{/* No movies to load */}
					{movies.length === 0 && !loading && (
						<h2 className="col-span-full text-center text-xl font-bold w-full">
							{isSearchMode
								? "No movies found matching your search. Try different criteria."
								: "There are no movies to show. Try changing your filters."}
						</h2>
					)}
					{/* Loaded movies and infinite scroll */}
					{Array.isArray(movies) &&
						movies.map((movie, index) => (
							<ThumbnailBox
								key={`${movie.id}-${index}`}
								movie={movie}
							/>
						))}
					{hasMore && !initialLoad && (
						<div
							ref={loadingRef}
							className="w-full flex justify-center py-8"
						>
							{loading && <Spinner />}
						</div>
					)}
				</div>
			</section>
		</main>
	);
};

export default index;
