import { Mood } from "@shared/schema";

interface MoodInfo {
  color: string;
  icon: string;
  title: string;
  description: string;
  genres: string[];
}

// Information about each mood for UI display and movie recommendations
export const moodMapping: Record<Mood, MoodInfo> = {
  happy: {
    color: "#FFD54F",
    icon: "sentiment_very_satisfied",
    title: "Happy",
    description: "Looking for uplifting, fun movies to match your mood",
    genres: ["Comedy", "Family", "Animation"]
  },
  sad: {
    color: "#64B5F6",
    icon: "sentiment_very_dissatisfied",
    title: "Sad",
    description: "Emotional, reflective films for when you're feeling down",
    genres: ["Drama", "Romance"]
  },
  excited: {
    color: "#FF7043",
    icon: "mood",
    title: "Excited",
    description: "Action-packed, thrilling entertainment for your high energy",
    genres: ["Action", "Adventure", "Science Fiction"]
  },
  relaxed: {
    color: "#81C784",
    icon: "self_improvement",
    title: "Relaxed",
    description: "Calm, soothing films to maintain your peaceful state",
    genres: ["Documentary", "History"]
  }
};

// Get recommendations message based on mood
export function getMoodMessage(mood: Mood): string {
  switch (mood) {
    case "happy":
      return "These uplifting movies will keep your spirits high!";
    case "sad":
      return "These emotional films might help you process your feelings.";
    case "excited":
      return "These thrilling films will match your high energy!";
    case "relaxed":
      return "These calming movies will help maintain your peaceful mood.";
    default:
      return "Movies tailored to your current mood.";
  }
}
