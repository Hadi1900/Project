import { createContext, useState, ReactNode } from "react";
import { MovieRecommendation, Mood } from "@shared/schema";

type MovieContextType = {
  selectedMovie: MovieRecommendation | null;
  showDetail: boolean;
  selectedMood: Mood;
  handleMovieClick: (movie: MovieRecommendation) => void;
  handleCloseDetail: () => void;
  setSelectedMood: (mood: Mood) => void;
};

export const MovieContext = createContext<MovieContextType>({
  selectedMovie: null,
  showDetail: false,
  selectedMood: "happy",
  handleMovieClick: () => {},
  handleCloseDetail: () => {},
  setSelectedMood: () => {},
});

interface MovieProviderProps {
  children: ReactNode;
}

export function MovieProvider({ children }: MovieProviderProps) {
  const [selectedMovie, setSelectedMovie] = useState<MovieRecommendation | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMood, setSelectedMood] = useState<Mood>("happy");

  const handleMovieClick = (movie: MovieRecommendation) => {
    setSelectedMovie(movie);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  return (
    <MovieContext.Provider
      value={{
        selectedMovie,
        showDetail,
        selectedMood,
        handleMovieClick,
        handleCloseDetail,
        setSelectedMood,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}