import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "./ui/material-icon";

export default function MobileNavigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: "home" },
    { path: "/favorites", label: "Favorites", icon: "favorite" },
    { path: "/profile", label: "Profile", icon: "person" }
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-2 py-3 z-40">
      <div className="flex justify-around">
        {navItems.map(item => (
          <Link key={item.path} href={item.path} className="flex flex-col items-center w-16">
            <MaterialIcon 
              name={item.icon} 
              className={cn(
                location === item.path ? "text-secondary" : "text-gray-500"
              )}
            />
            <span className={cn(
              "text-xs mt-1",
              location === item.path ? "" : "text-gray-500"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
