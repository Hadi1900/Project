import { useQuery } from "@tanstack/react-query";
import { Mood, MovieRecommendation } from "@shared/schema";
import MovieCard from "./movie-card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "./ui/material-icon";
import { useState } from "react";

interface MovieRecommendationsProps {
  mood: Mood;
  filters: {
    genre: string;
    year: string;
    rating: number;
    sortBy: string;
    _timestamp?: number; // For forced refresh
  };
  onMovieClick: (movie: MovieRecommendation) => void;
}

export default function MovieRecommendations({ 
  mood, 
  filters, 
  onMovieClick 
}: MovieRecommendationsProps) {
  const [page, setPage] = useState(1);
  // Track all loaded movies across pages
  const [allMovies, setAllMovies] = useState<MovieRecommendation[]>([]);
  
  const queryParams = new URLSearchParams();
  if (filters.genre) queryParams.append("genre", filters.genre);
  if (filters.year && filters.year !== "any") queryParams.append("year", filters.year);
  if (filters.rating > 0) queryParams.append("rating", filters.rating.toString());
  if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);
  queryParams.append("page", page.toString());
  
  const queryKey = [`/api/movies/${mood}?${queryParams.toString()}`, filters._timestamp];
  
  const { data, isLoading, error } = useQuery({
    queryKey,
    // Include a callback reference instead of an inline function to avoid TS errors
    onSuccess: (newData: any) => {
      if (newData && newData.results) {
        if (page === 1) {
          // First page, reset the all movies array
          setAllMovies(newData.results);
        } else {
          // Additional page, append to existing movies
          setAllMovies(prev => [...prev, ...newData.results]);
        }
      }
    }
  });
  
  // Reset page when mood or filters change
  const moodFiltersKey = JSON.stringify({ mood, filters: { ...filters, _timestamp: undefined } });
  const [prevMoodFiltersKey, setPrevMoodFiltersKey] = useState(moodFiltersKey);
  
  if (prevMoodFiltersKey !== moodFiltersKey) {
    setPrevMoodFiltersKey(moodFiltersKey);
    setPage(1);
    setAllMovies([]);
  }
  
  const handleLoadMore = () => {
    if (data && data.page < data.total_pages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <MaterialIcon name="error_outline" className="text-4xl text-red-500 mb-2" />
        <h3 className="text-xl font-semibold mb-2">Error loading recommendations</h3>
        <p className="text-gray-400 mb-4">
          There was a problem fetching movie recommendations. Please try again.
        </p>
      </div>
    );
  }

  // Use allMovies for rendering (this includes all pages loaded so far)
  const hasMore = data?.page < data?.total_pages;
  const displayMovies = allMovies.length > 0 ? allMovies : (data?.results || []);
  
  if (displayMovies.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <MaterialIcon name="movie_filter" className="text-4xl text-gray-600 mb-2" />
        <h3 className="text-xl font-semibold mb-2">No movies found</h3>
        <p className="text-gray-400">
          Try adjusting your filters to see more recommendations.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {displayMovies.map((movie: MovieRecommendation) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={() => onMovieClick(movie)} 
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-full text-white font-medium transition flex items-center"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            <span>Load more</span>
            <MaterialIcon name="expand_more" className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
