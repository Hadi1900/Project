import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MovieRecommendation } from "@shared/schema";
import MovieDetail from "../components/movie-detail";
import MovieCard from "../components/movie-card";
import { Link } from "wouter";
import { MaterialIcon } from "../components/ui/material-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Favorites() {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieRecommendation | null>(null);

  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['/api/favorites'],
  });

  const handleMovieClick = (movie: MovieRecommendation) => {
    setSelectedMovie(movie);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <MaterialIcon name="error" className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">Error Loading Favorites</h1>
          </div>
          <p className="text-gray-400 mb-4">
            We couldn't load your favorite movies. Please try again later.
          </p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-montserrat font-bold mb-8">Your Favorite Movies</h2>
      
      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {favorites.map((movie: MovieRecommendation) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onClick={() => handleMovieClick(movie)} 
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gray-900/50 p-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MaterialIcon name="movie_filter" className="text-6xl text-gray-700 mb-4" />
            <h3 className="text-xl font-medium text-center mb-2">No favorites yet</h3>
            <p className="text-gray-400 text-center mb-6">
              Start adding movies to your favorites to see them here.
            </p>
            <Button asChild>
              <Link href="/">Explore Movies</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {showDetail && selectedMovie && (
        <MovieDetail 
          movieId={selectedMovie.id} 
          isOpen={showDetail} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
}
