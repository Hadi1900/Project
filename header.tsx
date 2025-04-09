import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "./ui/material-icon";
import SearchBar from "./search-bar";
import { useContext, useState, useEffect } from "react";
import { MovieContext } from "../lib/movie-context";

export default function Header() {
  const [location] = useLocation();
  const { handleMovieClick } = useContext(MovieContext);
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll event listener to hide search on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`bg-dark fixed top-0 left-0 right-0 z-50 shadow-md transition-all duration-300 ${scrolled ? 'py-1' : 'py-2'}`}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center">
        <div className="flex justify-between items-center mb-3 md:mb-0">
          <Link href="/" className="flex items-center">
            <MaterialIcon name="movie_filter" className="text-secondary mr-2" />
            <h1 className="text-2xl font-bold font-montserrat bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MoodFlix
            </h1>
          </Link>
          
          <div className="flex items-center space-x-4 md:hidden">
            <Button
              variant="ghost"
              className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center p-0"
            >
              <MaterialIcon name="person" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-between md:justify-end space-x-4">
          <div className={`w-full md:max-w-md transition-all duration-300 ${scrolled ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <SearchBar onMovieClick={handleMovieClick} className="mb-0" />
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              className={`items-center bg-primary/20 hover:bg-primary/30 rounded-full px-4 py-1.5 ${
                location === "/favorites" ? "bg-primary/40" : ""
              }`}
              asChild
            >
              <Link href="/favorites" className="flex items-center">
                <MaterialIcon name="favorite" className="text-sm mr-1" />
                <span className="text-sm font-medium">Favorites</span>
              </Link>
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                className={`h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center p-0 ${
                  location === "/profile" ? "ring-2 ring-primary" : ""
                }`}
                asChild
              >
                <Link href="/profile">
                  <MaterialIcon name="person" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
