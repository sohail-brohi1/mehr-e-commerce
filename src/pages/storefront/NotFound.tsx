import { Link } from "react-router-dom";
import { Seo } from "@/components/shared/Seo";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Seo title="Page not found | MEHR" />
      <div className="max-w-md text-center">
        <p className="label-xs text-muted-foreground">404</p>
        <h1 className="font-display mt-5 text-5xl">This page has moved on</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The piece you were looking for may have sold or been renamed.
        </p>
        <Link to="/" className="label-xs mt-8 inline-block border-b border-foreground pb-1">
          Return home
        </Link>
      </div>
    </div>
  );
}
