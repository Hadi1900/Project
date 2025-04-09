import { useState, useContext } from "react";
import MoodSelector from "../components/mood-selector";
import MovieFilters from "../components/movie-filters";
import MovieRecommendations from "../components/movie-recommendations";
import MovieDetail from "../components/movie-detail";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "../components/ui/material-icon";
import { Mood, MovieRecommendation } from "@shared/schema";
import { MovieContext } from "../lib/movie-context";

export default function Home() {
  const [filters, setFilters] = useState({
    genre: "",
    year: "any",
    rating: 0,
    sortBy: "popularity.desc"
  });
  
  // Use the shared movie context
  const {
    selectedMovie,
    showDetail,
    selectedMood,
    setSelectedMood,
    handleMovieClick,
    handleCloseDetail
  } = useContext(MovieContext);

  const handleMoodChange = (mood: Mood) => {
    setSelectedMood(mood);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    // Force a re-fetch of movie recommendations
    setFilters(prev => ({ ...prev, _timestamp: Date.now() }));
  };

  return (
    <>
      <MoodSelector selectedMood={selectedMood} onMoodChange={handleMoodChange} />
      <MovieFilters filters={filters} onFilterChange={handleFilterChange} />
      <MovieRecommendations 
        mood={selectedMood} 
        filters={filters} 
        onMovieClick={handleMovieClick}
      />
      
      {showDetail && selectedMovie && (
        <MovieDetail 
          movieId={selectedMovie.id} 
          isOpen={showDetail} 
          onClose={handleCloseDetail} 
        />
      )}
      
      {/* Floating Action Button */}
      <Button 
        onClick={handleRefresh}
        className="fixed right-6 bottom-20 md:bottom-6 z-30 bg-secondary hover:bg-secondary/90 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all p-0"
      >
        <MaterialIcon name="refresh" className="text-white text-2xl" />
      </Button>
    </>
  );
}
