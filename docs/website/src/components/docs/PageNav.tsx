import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavLink {
  title: string;
  href: string;
}

export function PageNav({ prev, next }: { prev?: NavLink; next?: NavLink }) {
  return (
    <nav className="not-prose mt-16 flex items-stretch justify-between gap-4 border-t border-border pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-1 flex-col rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="h-3 w-3" /> Previous
          </span>
          <span className="mt-1 text-sm font-medium text-foreground group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-1 flex-col items-end rounded-lg border border-border px-4 py-3 text-right transition-colors hover:border-primary/50 hover:bg-muted/40"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            Next <ArrowRight className="h-3 w-3" />
          </span>
          <span className="mt-1 text-sm font-medium text-foreground group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
