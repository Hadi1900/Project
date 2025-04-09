import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/material-icon';
import { MovieRecommendation } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface WatchLaterListProps {
  onMovieClick: (movie: MovieRecommendation) => void;
}

export default function WatchLaterList({ onMovieClick }: WatchLaterListProps) {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const moviesPerPage = 8;
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/watchlater'],
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });
  
  // Try to process the data safely
  const watchLaterMovies = Array.isArray(data) 
    ? data.map((item: any) => {
        try {
          if (!item || typeof item.movieData !== 'string') {
            return null;
          }
          
          const movieData = JSON.parse(item.movieData);
          if (!movieData || typeof movieData !== 'object') {
            return null;
          }
          
          return {
            ...movieData,
            // Ensure these fields exist
            genres: movieData.genres || [],
            year: movieData.year || (movieData.release_date ? movieData.release_date.split('-')[0] : 'Unknown')
          };
        } catch (e) {
          console.error('Failed to parse movie data', e);
          return null;
        }
      }).filter(Boolean) 
    : [];
  
  const totalMovies = watchLaterMovies.length;
  const totalPages = Math.ceil(totalMovies / moviesPerPage);
  
  const displayMovies = watchLaterMovies.slice(
    (page - 1) * moviesPerPage, 
    page * moviesPerPage
  );
  
  const handlePreviousPage = () => {
    setPage(prev => Math.max(prev - 1, 1));
  };
  
  const handleNextPage = () => {
    setPage(prev => Math.min(prev + 1, totalPages));
  };
  
  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center text-gray-400">
        <MaterialIcon name="error_outline" className="text-red-500 text-4xl mb-4" />
        <h3 className="text-xl font-medium mb-2">Failed to load your Watch Later list</h3>
        <p className="mb-4">There was a problem retrieving your saved movies</p>
        <Button 
          onClick={() => refetch()} 
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <MaterialIcon name="refresh" className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }
  
  if (watchLaterMovies.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center text-gray-400">
        <MaterialIcon name="movie" className="text-4xl mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">Your Watch Later list is empty</h3>
        <p className="mb-4">Start adding movies from the home page</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-primary hover:bg-primary/90"
        >
          <MaterialIcon name="home" className="mr-2" />
          Go to Home
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {displayMovies.map((movie: MovieRecommendation) => (
          <div 
            key={movie.id} 
            className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onMovieClick(movie)}
          >
            <div className="aspect-[2/3] relative group">
              <img 
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "https://via.placeholder.com/300x450?text=No+Poster"} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovieClick(movie);
                  }}
                >
                  <MaterialIcon name="visibility" className="mr-2" />
                  View Details
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold line-clamp-1">{movie.title}</h3>
              <div className="flex items-center text-sm text-gray-400 mt-1">
                <span>{movie.year}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <MaterialIcon name="star" className="text-yellow-400 text-sm mr-1" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <MaterialIcon name="chevron_left" />
            </Button>
            <span className="mx-2 text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="bg-gray-800 hover:bg-gray-700"
            >
              <MaterialIcon name="chevron_right" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}