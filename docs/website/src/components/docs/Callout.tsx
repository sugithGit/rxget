import { AlertTriangle, Ban, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "note" | "tip" | "warning" | "danger";

const styles: Record<
  Variant,
  { icon: typeof Info; ring: string; tint: string; label: string }
> = {
  note: {
    icon: Info,
    ring: "border-l-sky-500",
    tint: "bg-sky-500/5",
    label: "Note",
  },
  tip: {
    icon: Lightbulb,
    ring: "border-l-primary",
    tint: "bg-primary/5",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    ring: "border-l-amber-500",
    tint: "bg-amber-500/5",
    label: "Careful",
  },
  danger: {
    icon: Ban,
    ring: "border-l-red-500",
    tint: "bg-red-500/5",
    label: "Don't",
  },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, ring, tint, label } = styles[variant];
  return (
    <div
      className={cn(
        "my-6 rounded-r-md border-l-4 px-4 py-3 text-sm",
        ring,
        tint
      )}
    >
      <p className="not-prose mb-1 flex items-center gap-2 font-semibold text-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        {title ?? label}
      </p>
      <div className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
