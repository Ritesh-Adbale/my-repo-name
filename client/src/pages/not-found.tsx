import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
        <AlertCircle className="h-10 w-10 text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold font-display mb-2 text-center">404</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        Did you get lost? The page you are looking for doesn't exist.
      </p>

      <Link href="/" className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
