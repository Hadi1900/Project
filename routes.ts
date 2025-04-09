import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFavoriteSchema } from "@shared/schema";
import fetch from "node-fetch";

// The Movie Database API base URL and endpoints
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";

// Map moods to genre IDs and keywords for TMDB API
const moodToGenreMap = {
  happy: { 
    genres: [35, 10751, 16], // Comedy, Family, Animation
    keywords: "happy,fun,uplifting,comedy,joy" 
  },
  sad: { 
    genres: [18, 10749], // Drama, Romance
    keywords: "sad,emotional,tearjerker,melancholy" 
  },
  excited: { 
    genres: [28, 12, 878], // Action, Adventure, Science Fiction
    keywords: "action,adventure,thrilling,exciting" 
  },
  relaxed: { 
    genres: [99, 36, 10770], // Documentary, History, TV Movie
    keywords: "relax,calm,soothing,peaceful" 
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get movie recommendations based on mood
  app.get("/api/movies/:mood", async (req: Request, res: Response) => {
    try {
      const mood = req.params.mood;
      
      if (!["happy", "sad", "excited", "relaxed"].includes(mood)) {
        return res.status(400).json({ message: "Invalid mood parameter" });
      }
      
      // Get genre and keyword parameters for the mood
      const { genres, keywords } = moodToGenreMap[mood as keyof typeof moodToGenreMap];
      
      // Get additional query parameters
      const page = req.query.page ? Number(req.query.page) : 1;
      const year = req.query.year as string;
      const genreFilter = req.query.genre as string;
      const rating = req.query.rating ? Number(req.query.rating) : 0;
      const sortBy = req.query.sortBy as string || "popularity.desc";
      const debug = req.query.debug === "true";
      
      // Fetch multiple pages to ensure we have enough movies after filtering
      const pagesToFetch = 5; // Fetch more pages for a much larger selection
      let allResults: any[] = [];
      
      // Fetch movies from multiple endpoints to get a diverse selection
      // For each endpoint, fetch multiple pages
      const baseEndpoints = [
        `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US`,
        `${TMDB_API_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`,
        `${TMDB_API_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US`,
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc`,
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc`,
        // Add classic movies (older but highly rated films)
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&primary_release_date.lte=2000-12-31`,
        // Add popular movies from specific genres (action, comedy, drama)
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=28&sort_by=popularity.desc`,  // Action
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=35&sort_by=popularity.desc`,  // Comedy
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=18&sort_by=popularity.desc`   // Drama
      ];
      
      const endpoints = [];
      for (const baseEndpoint of baseEndpoints) {
        for (let i = 1; i <= pagesToFetch; i++) {
          endpoints.push(`${baseEndpoint}&page=${i}`);
        }
      };
      
      for (const endpoint of endpoints) {
        console.log(`Making API request to: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching from ${endpoint}: ${response.status} ${errorText}`);
          continue;
        }
        
        const data = await response.json();
        allResults = [...allResults, ...data.results];
      }
      
      // Remove duplicates based on movie ID
      const uniqueMovies = Array.from(
        new Map(allResults.map(movie => [movie.id, movie])).values()
      );
      
      const data = { 
        results: uniqueMovies,
        page: 1,  
        total_pages: 1,
        total_results: uniqueMovies.length
      };
      
      // Get genre list to map IDs to genre names
      const genresResponse = await fetch(`${TMDB_API_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
      const genresData = await genresResponse.json();
      const genreMap = new Map();
      genresData.genres.forEach((genre: any) => {
        genreMap.set(genre.id, genre.name);
      });
      
      // Get mood-specific genres
      const { genres: moodGenres } = moodToGenreMap[mood as keyof typeof moodToGenreMap];
      
      // Filter movies based on mood, genre, year, and rating
      let filteredMovies = data.results;
      
      // Apply genre filter
      if (genreFilter) {
        filteredMovies = filteredMovies.filter((movie: any) => 
          movie.genre_ids.includes(parseInt(genreFilter, 10))
        );
      } else {
        // Filter by mood genres - match any of the mood genres
        filteredMovies = filteredMovies.filter((movie: any) => 
          movie.genre_ids.some((id: number) => moodGenres.includes(id))
        );
      }
      
      // Apply year filter
      if (year && year !== "any") {
        const yearValue = parseInt(year, 10);
        filteredMovies = filteredMovies.filter((movie: any) => {
          const movieYear = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
          return movieYear === yearValue;
        });
      }
      
      // Apply rating filter
      if (rating > 0) {
        filteredMovies = filteredMovies.filter((movie: any) => movie.vote_average >= rating);
      }
      
      // Format the filtered movies
      const formattedMovies = filteredMovies.map((movie: any) => {
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genres: movie.genre_ids.map((id: number) => genreMap.get(id) || "Unknown"),
          vote_average: movie.vote_average,
          year: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
        };
      });
      
      // Update the metadata to reflect our filtered results
      // Show as many movies as possible per page
      const MOVIES_PER_PAGE = 500; // Massive number of movies per page
      const startIndex = (page - 1) * MOVIES_PER_PAGE;
      const paginatedMovies = formattedMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE);
      
      res.json({
        page: data.page,
        total_pages: Math.ceil(formattedMovies.length / MOVIES_PER_PAGE),
        total_results: formattedMovies.length,
        results: paginatedMovies
      });
    } catch (error) {
      console.error("Error in mood recommendations:", error);
      res.status(500).json({ message: "Failed to fetch movie recommendations", error: (error as Error).message });
    }
  });
  
  // Get movie details
  app.get("/api/movie/:id", async (req: Request, res: Response) => {
    try {
      const movieId = req.params.id;
      
      // Get movie details
      const response = await fetch(`${TMDB_API_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error fetching movie details: ${response.status} ${errorText}`);
      }
      
      const movieData = await response.json();
      
      // Get similar movies
      const similarResponse = await fetch(`${TMDB_API_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      const similarData = await similarResponse.json();
      
      // Get movie credits
      const creditsResponse = await fetch(`${TMDB_API_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`);
      const creditsData = await creditsResponse.json();
      
      const formattedMovie = {
        ...movieData,
        similar: similarData.results.slice(0, 4),
        director: creditsData.crew.find((person: any) => person.job === "Director")?.name || "Unknown",
        cast: creditsData.cast.slice(0, 5).map((person: any) => person.name)
      };
      
      res.json(formattedMovie);
    } catch (error) {
      console.error("Error in movie details:", error);
      res.status(500).json({ message: "Failed to fetch movie details", error: (error as Error).message });
    }
  });
  
  // Get favorite movies
  app.get("/api/favorites", async (req: Request, res: Response) => {
    try {
      // Mock user ID for demonstration (in a real app, this would come from authentication)
      const userId = 1;
      
      const favorites = await storage.getFavorites(userId);
      const formattedFavorites = favorites.map(favorite => JSON.parse(favorite.movieData));
      
      res.json(formattedFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorite movies", error: (error as Error).message });
    }
  });
  
  // Add a movie to favorites
  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      // Mock user ID for demonstration (in a real app, this would come from authentication)
      const userId = 1;
      
      const validationResult = insertFavoriteSchema.safeParse({
        userId,
        movieId: req.body.movieId,
        movieData: JSON.stringify(req.body.movie)
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: validationResult.error });
      }
      
      const favorite = await storage.addFavorite(validationResult.data);
      
      res.status(201).json({ message: "Movie added to favorites", favoriteId: favorite.id });
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add movie to favorites", error: (error as Error).message });
    }
  });
  
  // Remove a movie from favorites
  app.delete("/api/favorites/:movieId", async (req: Request, res: Response) => {
    try {
      // Mock user ID for demonstration (in a real app, this would come from authentication)
      const userId = 1;
      const movieId = parseInt(req.params.movieId, 10);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const removed = await storage.removeFavorite(userId, movieId);
      
      if (removed) {
        res.json({ message: "Movie removed from favorites" });
      } else {
        res.status(404).json({ message: "Movie not found in favorites" });
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove movie from favorites", error: (error as Error).message });
    }
  });
  
  // Check if a movie is in favorites
  app.get("/api/favorites/:movieId", async (req: Request, res: Response) => {
    try {
      // Mock user ID for demonstration (in a real app, this would come from authentication)
      const userId = 1;
      const movieId = parseInt(req.params.movieId, 10);
      
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      
      const isFavorite = await storage.isFavorite(userId, movieId);
      
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status", error: (error as Error).message });
    }
  });
  
  // Watch Later API endpoints
  app.get("/api/watchlater", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Hardcoded for now
      const watchLaterItems = await storage.getWatchLater(userId);
      
      // Parse the movie data from JSON strings to objects
      const movies = watchLaterItems.map(item => ({
        ...item,
        movieData: JSON.parse(item.movieData)
      }));
      
      res.json(movies);
    } catch (error) {
      console.error("Error fetching watch later list:", error);
      res.status(500).json({ error: "Failed to fetch watch later list" });
    }
  });
  
  app.post("/api/watchlater", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Hardcoded for now
      const { movieId, movieData } = req.body;
      
      if (!movieId || !movieData) {
        return res.status(400).json({ error: "Missing movieId or movieData" });
      }
      
      // Store movie data as JSON string
      const watchLaterItem = await storage.addToWatchLater(
        userId, 
        parseInt(movieId), 
        JSON.stringify(movieData)
      );
      
      res.status(201).json({
        ...watchLaterItem,
        movieData: JSON.parse(watchLaterItem.movieData)
      });
    } catch (error) {
      console.error("Error adding to watch later:", error);
      res.status(500).json({ error: "Failed to add to watch later" });
    }
  });
  
  app.delete("/api/watchlater/:movieId", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Hardcoded for now
      const movieId = parseInt(req.params.movieId);
      
      const success = await storage.removeFromWatchLater(userId, movieId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Movie not in watch later list" });
      }
    } catch (error) {
      console.error("Error removing from watch later:", error);
      res.status(500).json({ error: "Failed to remove from watch later" });
    }
  });
  
  app.get("/api/watchlater/:movieId", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Hardcoded for now
      const movieId = parseInt(req.params.movieId);
      
      const isInWatchLater = await storage.isInWatchLater(userId, movieId);
      res.json({ isInWatchLater });
    } catch (error) {
      console.error("Error checking watch later status:", error);
      res.status(500).json({ error: "Failed to check watch later status" });
    }
  });
  
  // Get a random "Surprise Me" movie recommendation
  app.get("/api/surprise", async (req: Request, res: Response) => {
    try {
      // Get optional mood parameter, if not provided, choose a random mood
      const moods = ["happy", "sad", "excited", "relaxed"];
      let mood = req.query.mood as string;
      
      if (!mood || !moods.includes(mood)) {
        // Select a random mood if not specified or invalid
        mood = moods[Math.floor(Math.random() * moods.length)];
      }
      
      // Get genre and keyword parameters for the mood
      const { genres } = moodToGenreMap[mood as keyof typeof moodToGenreMap];
      
      // Combine popular, top-rated, and trending movies for a better selection
      const endpoints = [
        `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
        `${TMDB_API_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
        `${TMDB_API_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
        `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genres.join(',')}&sort_by=popularity.desc&page=1`
      ];
      
      let allResults: any[] = [];
      
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        allResults = [...allResults, ...data.results];
      }
      
      // Remove duplicates based on movie ID
      const uniqueMovies = Array.from(
        new Map(allResults.map(movie => [movie.id, movie])).values()
      );
      
      // Get genre list to map IDs to genre names
      const genresResponse = await fetch(`${TMDB_API_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
      const genresData = await genresResponse.json();
      const genreMap = new Map();
      genresData.genres.forEach((genre: any) => {
        genreMap.set(genre.id, genre.name);
      });
      
      // Filter movies to only include those with complete data
      const validMovies = uniqueMovies.filter(movie => 
        movie.id && 
        movie.title && 
        movie.overview && 
        movie.poster_path && 
        movie.release_date
      );
      
      if (validMovies.length === 0) {
        return res.status(404).json({ message: "No valid movies found" });
      }
      
      // Select a random movie from the filtered list
      const randomMovie = validMovies[Math.floor(Math.random() * validMovies.length)];
      
      // Format the movie data
      const formattedMovie = {
        id: randomMovie.id,
        title: randomMovie.title,
        overview: randomMovie.overview,
        poster_path: randomMovie.poster_path,
        release_date: randomMovie.release_date,
        genres: randomMovie.genre_ids.map((id: number) => genreMap.get(id) || "Unknown"),
        vote_average: randomMovie.vote_average,
        year: randomMovie.release_date ? randomMovie.release_date.split("-")[0] : "Unknown",
        selectedMood: mood // Include the mood that was used
      };
      
      res.json(formattedMovie);
    } catch (error) {
      console.error("Error getting surprise movie:", error);
      res.status(500).json({ message: "Failed to get a surprise movie recommendation", error: (error as Error).message });
    }
  });
  
  // Search for movies
  app.get("/api/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }
      
      // Search for movies using TMDB search endpoint
      const response = await fetch(
        `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error searching movies: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      // Get genre list to map IDs to genre names
      const genresResponse = await fetch(`${TMDB_API_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
      const genresData = await genresResponse.json();
      const genreMap = new Map();
      genresData.genres.forEach((genre: any) => {
        genreMap.set(genre.id, genre.name);
      });
      
      // Format the search results
      const formattedMovies = data.results.map((movie: any) => {
        return {
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          genres: movie.genre_ids.map((id: number) => genreMap.get(id) || "Unknown"),
          vote_average: movie.vote_average,
          year: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
        };
      });
      
      res.json({
        page: data.page,
        total_pages: data.total_pages,
        total_results: data.total_results,
        results: formattedMovies
      });
    } catch (error) {
      console.error("Error in movie search:", error);
      res.status(500).json({ message: "Failed to search movies", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
