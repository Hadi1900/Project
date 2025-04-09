import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "./ui/material-icon";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MovieDetailProps {
  movieId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MovieDetail({ movieId, isOpen, onClose }: MovieDetailProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: movie, isLoading, error } = useQuery({
    queryKey: [`/api/movie/${movieId}`],
  });
  
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/favorites/${movieId}`],
  });
  
  const isFavorite = favoriteData?.isFavorite;
  
  // Add to favorites mutation
  const addToFavorites = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/favorites', {
        movieId: movie.id,
        movie: {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genres: movie.genres.map((g: { name: string }) => g.name),
          vote_average: movie.vote_average,
          year: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movieId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: `"${movie.title}" has been added to your favorites.`,
      });
    }
  });
  
  // Remove from favorites mutation
  const removeFromFavorites = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/favorites/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movieId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: `"${movie.title}" has been removed from your favorites.`,
      });
    }
  });
  
  // Watch Later functionality removed

  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFromFavorites.mutate();
    } else {
      addToFavorites.mutate();
    }
  };
  
  const isPending = addToFavorites.isPending || removeFromFavorites.isPending;

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const posterUrl = movie?.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-gray-900 max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-16">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <MaterialIcon name="error_outline" className="text-4xl text-red-500 mb-2" />
            <h3 className="text-xl font-semibold">Failed to load movie details</h3>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        ) : (
          <>
            <DialogTitle className="sr-only">{movie.title}</DialogTitle>
            <DialogDescription className="sr-only">
              Details about {movie.title} movie released in {movie.release_date ? movie.release_date.split("-")[0] : "Unknown"}. 
              Movie rated {movie.vote_average.toFixed(1)} out of 10 stars.
              {movie.runtime ? ` Runtime: ${formatRuntime(movie.runtime)}.` : ''}
              {movie.genres ? ` Genres: ${movie.genres.map((g: { name: string }) => g.name).join(', ')}.` : ''}
            </DialogDescription>
            <Button
              variant="ghost"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 rounded-full p-2 z-10"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <MaterialIcon name="close" className="text-white" />
            </Button>
            
            <div className="md:flex">
              <div className="md:w-1/3">
                <img 
                  src={posterUrl} 
                  alt={movie.title} 
                  className="w-full aspect-[2/3] object-cover" 
                />
              </div>
              <div className="p-6 md:w-2/3">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-montserrat font-bold">{movie.title}</h2>
                  <Button
                    variant="ghost"
                    className={cn(
                      "ml-3 p-2 rounded-full flex-shrink-0",
                      isFavorite ? "bg-secondary/90" : "bg-gray-800"
                    )}
                    onClick={handleFavoriteClick}
                    disabled={isPending}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFavorite}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <MaterialIcon 
                      name={isPending ? "hourglass_empty" : (isFavorite ? "favorite" : "favorite_border")} 
                      className={cn(
                        "text-white",
                        isPending && "animate-spin"
                      )} 
                    />
                  </Button>
                </div>
                
                <div className="flex items-center mt-2 text-gray-300">
                  <span>{movie.release_date ? movie.release_date.split("-")[0] : "Unknown"}</span>
                  {movie.runtime && (
                    <>
                      <span className="mx-1.5">•</span>
                      <span>{formatRuntime(movie.runtime)}</span>
                    </>
                  )}
                  <span className="mx-1.5">•</span>
                  <span>{movie.adult ? "R" : "PG-13"}</span>
                </div>
                
                <div className="flex items-center mt-3">
                  <div className="flex items-center bg-[#FFD54F]/20 px-3 py-1 rounded-full">
                    <MaterialIcon name="star" className="text-sm text-[#FFD54F] mr-1" />
                    <span className="font-medium">{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                  {movie.vote_count && (
                    <div className="ml-3 flex items-center bg-gray-800 px-3 py-1 rounded-full">
                      <MaterialIcon name="groups" className="text-sm mr-1" />
                      <span>{movie.vote_count.toLocaleString()} votes</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.map((genre: { id: number, name: string }) => (
                    <span key={genre.id} className="px-3 py-1 bg-gray-800 text-sm rounded-full">
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                <p className="mt-6 text-gray-300">{movie.overview}</p>
                
                {movie.director && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Director</h3>
                    <p>{movie.director}</p>
                  </div>
                )}
                
                {movie.cast && movie.cast.length > 0 && (
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">Cast</h3>
                    <p>{movie.cast.join(', ')}</p>
                  </div>
                )}
                
                <div className="mt-8 flex flex-wrap gap-3">
                  {movie.videos?.results?.find((v: any) => v.type === "Trailer") && (
                    <Button className="px-5 py-2 bg-primary hover:bg-primary/80 rounded-full text-white font-medium transition flex items-center">
                      <MaterialIcon name="play_arrow" className="mr-1" />
                      Watch Trailer
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-medium transition flex items-center"
                  >
                    <MaterialIcon name="share" className="mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
            
            {movie.similar && movie.similar.length > 0 && (
              <div className="p-6 bg-gray-900/50">
                <h3 className="text-xl font-montserrat font-semibold mb-4">More like this</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.similar.map((similarMovie: any) => (
                    <button
                      key={similarMovie.id}
                      className="movie-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 focus:outline-primary focus:ring-2 focus:ring-primary"
                      onClick={() => {
                        // Close current dialog and fetch this movie instead
                        onClose();
                        // Format the similar movie to match MovieRecommendation type
                        const formattedMovie = {
                          id: similarMovie.id,
                          title: similarMovie.title,
                          overview: similarMovie.overview,
                          poster_path: similarMovie.poster_path,
                          release_date: similarMovie.release_date,
                          genres: similarMovie.genre_ids?.map(() => "") || [],
                          vote_average: similarMovie.vote_average,
                          year: similarMovie.release_date ? similarMovie.release_date.split("-")[0] : "Unknown"
                        };
                        // Wait a bit before opening new dialog to avoid UI issues
                        setTimeout(() => {
                          addToFavorites.reset();
                          removeFromFavorites.reset();
                          // Re-open dialog with new movie ID
                          window.history.replaceState(null, '', `?movie=${similarMovie.id}`);
                          window.location.reload();
                        }, 300);
                      }}
                      aria-label={`View details for ${similarMovie.title}`}
                    >
                      <img 
                        src={similarMovie.poster_path ? `https://image.tmdb.org/t/p/w200${similarMovie.poster_path}` : "https://via.placeholder.com/200x300?text=No+Poster"} 
                        alt={similarMovie.title} 
                        className="w-full aspect-[2/3] object-cover" 
                        loading="lazy"
                      />
                      <div className="p-2 text-center text-sm truncate">{similarMovie.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
