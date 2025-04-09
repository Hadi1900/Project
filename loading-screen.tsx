import { useState, useEffect } from 'react';
import { MaterialIcon } from "./ui/material-icon";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          
          // After reaching 100%, wait a bit and then fade out
          setTimeout(() => {
            setIsVisible(false);
          }, 500);
          
          return 100;
        }
        return prevProgress + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        progress === 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mb-6 animate-pulse">
        <MaterialIcon name="movie_filter" className="text-primary text-5xl mb-2" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          MoodFlix
        </h1>
      </div>
      
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-sm text-gray-400">
        Finding the perfect movies for your mood...
      </div>
    </div>
  );
}