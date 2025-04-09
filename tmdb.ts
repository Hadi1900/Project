import { Mood } from "@shared/schema";

// Map moods to genre IDs for TMDB API
export const moodToGenreMap: Record<Mood, { genres: number[], keywords: string }> = {
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

// Map moods to colors for UI
export const moodToColorMap: Record<Mood, string> = {
  happy: "#FFD54F",
  sad: "#64B5F6",
  excited: "#FF7043",
  relaxed: "#81C784"
};

// Map moods to icons
export const moodToIconMap: Record<Mood, string> = {
  happy: "sentiment_very_satisfied",
  sad: "sentiment_very_dissatisfied",
  excited: "mood",
  relaxed: "self_improvement"
};
