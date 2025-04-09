export default function Footer() {
  return (
    <footer className="mt-auto py-6 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-sm text-center text-gray-500">
          <p>© {new Date().getFullYear()} MoodFlix. All movie data is provided by TMDB API.</p>
          <p className="mt-1">Mood-based movie recommendations to match how you feel.</p>
        </div>
      </div>
    </footer>
  );
}
