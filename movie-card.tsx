import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MovieRecommendation } from "@shared/schema";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./ui/material-icon";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  movie: MovieRecommendation;
  onClick: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if movie is in favorites
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/favorites/${movie.id}`],
  });
  
  const isFavorite = favoriteData?.isFavorite;
  
  // Add to favorites mutation
  const addToFavorites = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/favorites', {
        movieId: movie.id,
        movie
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movie.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to favorites",
        description: `"${movie.title}" has been added to your favorites.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add "${movie.title}" to favorites.`,
        variant: "destructive",
      });
    },
  });
  
  // Remove from favorites mutation
  const removeFromFavorites = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/favorites/${movie.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${movie.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: `"${movie.title}" has been removed from your favorites.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove "${movie.title}" from favorites.`,
        variant: "destructive",
      });
    },
  });
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFromFavorites.mutate();
    } else {
      addToFavorites.mutate();
    }
  };
  
  const isPending = addToFavorites.isPending || removeFromFavorites.isPending;
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";
  
  return (
    <div 
      className="movie-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:translate-y-[-5px] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={posterUrl} 
          alt={movie.title} 
          className="w-full aspect-[2/3] object-cover" 
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-dark/70 rounded-full p-1">
          <MaterialIcon name="star" className="text-[#FFD54F]" />
        </div>
        <button 
          className={cn(
            "absolute bottom-2 right-2 rounded-full p-1.5 transition",
            isFavorite 
              ? "bg-secondary/90" 
              : "bg-dark/70 hover:bg-secondary/90"
          )}
          onClick={handleFavoriteClick}
          disabled={isPending}
        >
          <MaterialIcon 
            name={isPending ? "hourglass_empty" : (isFavorite ? "favorite" : "favorite_border")} 
            className={cn(
              "text-white text-lg",
              isPending && "animate-spin"
            )} 
          />
        </button>
      </div>
      <div className="p-2">
        <h3 className="font-montserrat font-semibold truncate text-sm">{movie.title}</h3>
        <div className="flex items-center text-xs text-gray-300">
          <span>{movie.year}</span>
          <span className="mx-1">•</span>
          <span className="truncate">{movie.genres[0] || "Unknown"}</span>
          <span className="ml-1 flex items-center">
            <MaterialIcon name="star" className="text-xs text-[#FFD54F]" />
            <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
