import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="container-px flex flex-col items-center justify-center py-32 text-center">
      <p className="font-display text-6xl font-extrabold">404</p>
      <h1 className="mt-2 font-display text-xl font-bold uppercase tracking-wide">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
