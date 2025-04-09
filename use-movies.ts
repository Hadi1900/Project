import { useQuery } from "@tanstack/react-query";
import { Mood } from "@shared/schema";

interface UseMoviesOptions {
  mood: Mood;
  genre?: string;
  year?: string;
  rating?: number;
  sortBy?: string;
  page?: number;
}

export function useMovies({
  mood,
  genre,
  year,
  rating,
  sortBy = "popularity.desc",
  page = 1
}: UseMoviesOptions) {
  const queryParams = new URLSearchParams();
  if (genre) queryParams.append("genre", genre);
  if (year) queryParams.append("year", year);
  if (rating && rating > 0) queryParams.append("rating", rating.toString());
  queryParams.append("sortBy", sortBy);
  queryParams.append("page", page.toString());
  
  return useQuery({
    queryKey: [`/api/movies/${mood}?${queryParams.toString()}`],
  });
}
