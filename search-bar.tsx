import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MovieRecommendation } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onMovieClick: (movie: MovieRecommendation) => void;
  className?: string;
}

export default function SearchBar({ onMovieClick, className }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of the search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (search.length > 1) {
        setIsOpen(true);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Search query
  const { data, isLoading } = useQuery({
    queryKey: ['/api/search', debouncedSearch],
    enabled: debouncedSearch.length > 1
  });

  const searchResults = data?.results || [];
  const hasResults = searchResults.length > 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setIsOpen(false);
    }
  };

  const handleMovieClick = (movie: MovieRecommendation) => {
    onMovieClick(movie);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2 bg-gray-800 border-gray-700 rounded-full w-full"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <MaterialIcon name="search" />
        </div>
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-white"
            onClick={() => setSearch("")}
          >
            <MaterialIcon name="close" className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && debouncedSearch.length > 1 && (
        <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-center text-gray-400">
              No movies found
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {searchResults.slice(0, 6).map((movie: MovieRecommendation) => (
                <div
                  key={movie.id}
                  className="flex items-center p-3 hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="flex-shrink-0 h-16 w-12 mr-3">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-800 rounded flex items-center justify-center">
                        <MaterialIcon name="movie" className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{movie.title}</p>
                    <p className="text-xs text-gray-400">{movie.year}</p>
                    <div className="flex items-center mt-1">
                      <MaterialIcon name="star" className="text-[10px] text-yellow-500 mr-1" />
                      <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {searchResults.length > 6 && (
                <div className="p-2 text-center text-gray-400 text-sm">
                  {searchResults.length - 6} more results
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}