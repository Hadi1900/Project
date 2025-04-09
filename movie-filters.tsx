import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "./ui/material-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type MovieFilters = {
  genre: string;
  year: string;
  rating: number;
  sortBy: string;
};

interface MovieFiltersProps {
  filters: MovieFilters;
  onFilterChange: (filters: Partial<MovieFilters>) => void;
}

const genres = [
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentary" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Family" },
  { id: "14", name: "Fantasy" },
  { id: "36", name: "History" },
  { id: "27", name: "Horror" },
  { id: "10402", name: "Music" },
  { id: "9648", name: "Mystery" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Science Fiction" },
  { id: "10770", name: "TV Movie" },
  { id: "53", name: "Thriller" },
  { id: "10752", name: "War" },
  { id: "37", name: "Western" }
];

export default function MovieFilters({ filters, onFilterChange }: MovieFiltersProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const handleGenreClick = (genreId: string) => {
    onFilterChange({ genre: filters.genre === genreId ? "" : genreId });
  };
  
  return (
    <div className="mb-8 bg-gray-900/50 rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-montserrat font-semibold flex items-center">
          <MaterialIcon name="movie_filter" className="mr-2 text-primary" />
          Recommendations for your mood
        </h3>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            onClick={toggleFilterPanel}
            variant="outline"
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center",
              showFilterPanel ? "bg-primary text-white" : "bg-primary/20 hover:bg-primary/30"
            )}
            aria-expanded={showFilterPanel}
            aria-controls="filter-panel"
          >
            <MaterialIcon name={showFilterPanel ? "filter_list_off" : "filter_list"} className="text-sm mr-1" />
            {showFilterPanel ? "Hide Filters" : "Show Filters"}
          </Button>
          
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="bg-gray-800 border border-gray-700 rounded-full px-3 py-1.5 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity.desc">Most Popular</SelectItem>
              <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
              <SelectItem value="release_date.desc">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div 
        id="filter-panel" 
        className={cn(
          "mt-4 transition-all duration-300 overflow-hidden",
          showFilterPanel ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-gray-800/50 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium flex items-center">
              <MaterialIcon name="category" className="mr-1 text-primary" />
              Genre
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 9).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre.id)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full cursor-pointer transition-colors",
                    filters.genre === genre.id ? "bg-primary text-white" : "bg-gray-700 hover:bg-primary/80 text-white"
                  )}
                >
                  {genre.name}
                </button>
              ))}
              {filters.genre && (
                <button
                  onClick={() => onFilterChange({ genre: "" })}
                  className="px-3 py-1 text-xs rounded-full cursor-pointer transition-colors bg-red-500/80 hover:bg-red-500 text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium flex items-center">
              <MaterialIcon name="date_range" className="mr-1 text-primary" />
              Release Year
            </label>
            <div className="px-2">
              <Select
                value={filters.year}
                onValueChange={(value) => onFilterChange({ year: value })}
              >
                <SelectTrigger className="bg-gray-800 border border-gray-700">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Year</SelectItem>
                  {Array.from({ length: 41 }, (_, i) => (2024 - i).toString()).map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium flex items-center">
              <MaterialIcon name="star" className="mr-1 text-primary" />
              Rating
            </label>
            <div className="px-2">
              <Slider
                defaultValue={[filters.rating]}
                min={0}
                max={10}
                step={1}
                onValueChange={(values) => onFilterChange({ rating: values[0] })}
                className="my-6"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <MaterialIcon
                      key={index}
                      name={index < Math.ceil(filters.rating / 2) ? "star" : "star_border"}
                      className={index < Math.ceil(filters.rating / 2) ? "text-[#FFD54F]" : "text-gray-600"}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm">{filters.rating > 0 ? `${filters.rating}+ Rating` : "Any Rating"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Filters */}
      {(filters.genre || filters.year !== "any" || filters.rating > 0) && (
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400">Active filters:</span>
          {filters.genre && (
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center">
              {genres.find(g => g.id === filters.genre)?.name}
              <button 
                onClick={() => onFilterChange({ genre: "" })}
                className="ml-1.5"
                aria-label="Remove genre filter"
              >
                <MaterialIcon name="close" className="text-xs" />
              </button>
            </div>
          )}
          {filters.year !== "any" && (
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center">
              Year: {filters.year}
              <button 
                onClick={() => onFilterChange({ year: "any" })}
                className="ml-1.5"
                aria-label="Remove year filter"
              >
                <MaterialIcon name="close" className="text-xs" />
              </button>
            </div>
          )}
          {filters.rating > 0 && (
            <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center">
              {filters.rating}+ Rating
              <button 
                onClick={() => onFilterChange({ rating: 0 })}
                className="ml-1.5"
                aria-label="Remove rating filter"
              >
                <MaterialIcon name="close" className="text-xs" />
              </button>
            </div>
          )}
          <button
            onClick={() => onFilterChange({ genre: "", year: "any", rating: 0 })}
            className="bg-gray-800 px-3 py-1 rounded-full text-xs hover:bg-gray-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
