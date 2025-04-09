import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/material-icon';
import { useToast } from '@/hooks/use-toast';
import type { MovieRecommendation, Mood } from '@shared/schema';

interface SurpriseMeProps {
  onMovieClick: (movie: MovieRecommendation) => void;
  currentMood?: Mood;
}

export default function SurpriseMe({ onMovieClick, currentMood }: SurpriseMeProps) {
  const { toast } = useToast();
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Use current mood if provided, otherwise API will pick a random mood
  const queryString = currentMood ? `?mood=${currentMood}` : '';
  
  const { 
    data: movie, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['/api/surprise', currentMood],
    enabled: false, // Don't fetch on mount, wait for user action
    retry: 2, // Limit retries for better user experience
    staleTime: 0, // Always get a fresh result
    retryDelay: 1000, // Wait a second between retries
    refetchOnWindowFocus: false
  });

  const handleSurpriseClick = async () => {
    setIsRevealed(true);
    
    try {
      const result = await refetch();
      
      if (result.error || !result.data) {
        toast({
          title: "Surprise Failed",
          description: "We couldn't find a surprise movie for you. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Surprise Me error:", err);
      toast({
        title: "Surprise Failed",
        description: "We couldn't find a surprise movie for you. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTryAgain = () => {
    refetch();
  };

  const handleOpenMovie = () => {
    if (movie) {
      onMovieClick(movie as unknown as MovieRecommendation);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-md">
      <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/20 to-blue-900/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-primary/20 p-2 rounded-full mr-3">
              <MaterialIcon name="auto_awesome" className="text-lg text-primary" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Surprise Me</h3>
              <p className="text-gray-400 text-sm">
                Discover something unexpected{currentMood ? ` for your ${currentMood} mood` : ''}
              </p>
            </div>
          </div>
          
          {!isRevealed && (
            <Button 
              onClick={handleSurpriseClick} 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-5"
            >
              <MaterialIcon name="shuffle" className="mr-2" />
              Surprise Me
            </Button>
          )}
          
          {isRevealed && !movie && !isLoading && !error && (
            <Button 
              onClick={handleSurpriseClick} 
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-5"
            >
              <MaterialIcon name="shuffle" className="mr-2" />
              Get a Surprise Movie
            </Button>
          )}
        </div>
        
        {isRevealed && (
          <div className="mt-4">
            {isLoading || isRefetching ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-400 bg-gray-800/50 rounded-lg p-6">
                <div className="w-12 h-12 border-4 border-gray-700 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-center">Finding the perfect surprise for you...</p>
                <p className="text-center text-sm text-gray-500 mt-2">This might take a moment</p>
              </div>
            ) : error ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-gray-400 bg-gray-800/50 rounded-lg p-6">
                <MaterialIcon name="error_outline" className="text-red-500 text-4xl mb-3" />
                <h3 className="text-xl font-semibold mb-2">Couldn't Find a Surprise</h3>
                <p className="mb-4 text-center">Sorry, we couldn't find a surprise movie for you right now.</p>
                <Button 
                  onClick={handleTryAgain} 
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <MaterialIcon name="refresh" className="mr-2" />
                  Try Again
                </Button>
              </div>
            ) : movie ? (
              <div className="mt-4 sm:flex items-stretch bg-gray-800/50 rounded-lg overflow-hidden">
                <div className="sm:w-1/4 max-w-xs">
                  <img 
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "https://via.placeholder.com/300x450?text=No+Poster"} 
                    alt={movie.title}
                    className="w-full h-full object-cover aspect-[2/3]"
                  />
                </div>
                <div className="p-4 sm:p-6 flex flex-col sm:w-3/4">
                  <h4 className="text-xl font-bold mb-1">{movie.title}</h4>
                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <span>{movie.year}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <MaterialIcon name="star" className="text-yellow-400 text-sm mr-1" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-gray-300 line-clamp-3 mb-4 flex-grow">
                    {movie.overview}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movie.genres.slice(0, 3).map((genre, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-700 text-xs rounded-full">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Button 
                      onClick={handleOpenMovie} 
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <MaterialIcon name="visibility" className="mr-2" />
                      View Details
                    </Button>
                    <Button 
                      onClick={handleTryAgain} 
                      variant="outline" 
                      className="bg-gray-700 hover:bg-gray-600"
                    >
                      <MaterialIcon name="refresh" className="mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                <p>Click the button to get a surprise movie recommendation</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}