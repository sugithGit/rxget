"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language = "dart",
  title,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the code is still selectable */
    }
  };

  return (
    <figure
      className={cn(
        "not-prose my-6 overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      <figcaption className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          {title ?? language}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className={`language-${language} font-mono`}>{children}</code>
      </pre>
    </figure>
  );
}
