import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Favorites from "@/pages/favorites";
import Profile from "@/pages/profile";
import Header from "./components/header";
import Footer from "./components/footer";
import MobileNavigation from "./components/mobile-navigation";
import { MovieProvider } from "./lib/movie-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MovieProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow container mx-auto px-4 pt-32 pb-8">
            <Router />
          </main>
          <Footer />
          <MobileNavigation />
        </div>
        <Toaster />
      </MovieProvider>
    </QueryClientProvider>
  );
}

export default App;
