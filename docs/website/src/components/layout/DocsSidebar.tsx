"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
  items?: SidebarItem[];
}

const docsConfig: SidebarItem[] = [
  {
    title: "Getting Started",
    href: "/docs",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Counter App", href: "/docs/counter-app" },
    ],
  },
  {
    title: "Core Concepts",
    href: "/docs/core-concepts",
    items: [
      { title: "State Management", href: "/docs/state-management" },
      { title: "Dependency Injection", href: "/docs/dependency-injection" },
    ],
  },
  {
    title: "Widgets",
    href: "/docs/widgets",
    items: [
        { title: "GetIn Widget", href: "/docs/get-in-widget" },
    ]
  },
  {
    title: "Resources",
    href: "/docs/resources",
    items: [
      { title: "Breaking Changes", href: "/docs/breaking-changes" },
      { title: "Community", href: "/docs/community" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="pb-4">
        {docsConfig.map((item, index) => (
          <div key={index} className="pb-4">
            <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold text-foreground/90">
              {item.title}
            </h4>
            {item.items?.length && (
              <div className="grid grid-flow-row auto-rows-max text-sm gap-0.5">
                {item.items.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    href={subItem.href}
                    className={cn(
                      "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:bg-muted/50 hover:text-foreground",
                      pathname === subItem.href
                        ? "font-medium text-primary bg-primary/5"
                        : "text-muted-foreground"
                    )}
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
