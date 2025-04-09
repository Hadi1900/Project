import { Mood } from "@shared/schema";
import { MaterialIcon } from "./ui/material-icon";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  selectedMood: Mood;
  onMoodChange: (mood: Mood) => void;
}

type MoodOption = {
  id: Mood;
  icon: string;
  label: string;
  color: string;
};

const moods: MoodOption[] = [
  {
    id: "happy",
    icon: "sentiment_very_satisfied",
    label: "Happy",
    color: "bg-[#FFD54F] text-dark"
  },
  {
    id: "sad",
    icon: "sentiment_very_dissatisfied",
    label: "Sad",
    color: "bg-[#64B5F6] text-dark"
  },
  {
    id: "excited",
    icon: "mood",
    label: "Excited",
    color: "bg-[#FF7043] text-dark"
  },
  {
    id: "relaxed",
    icon: "self_improvement",
    label: "Relaxed",
    color: "bg-[#81C784] text-dark"
  }
];

export default function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-montserrat font-bold text-center mb-8">
        How are you feeling today?
      </h2>
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {moods.map((mood) => (
          <div
            key={mood.id}
            className={cn(
              "flex flex-col items-center cursor-pointer transition-transform duration-200",
              "hover:scale-105 hover:text-primary"
              // Removed persistent selection styling
            )}
            onClick={() => onMoodChange(mood.id)}
          >
            <div className={cn(
              "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-2",
              mood.color,
              "hover:ring-4 hover:ring-primary/30"
              // Removed persistent ring, applying only on hover
            )}>
              <MaterialIcon name={mood.icon} className="text-4xl" />
            </div>
            <span className="font-medium">{mood.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
