"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const docsConfig: SidebarSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Counter App", href: "/docs/counter-app" },
      { title: "Cheat Sheet", href: "/docs/cheat-sheet" },
    ],
  },
  {
    title: "Philosophy",
    items: [
      { title: "Design Principles", href: "/docs/philosophy" },
      { title: "Derived from GetX", href: "/docs/from-getx" },
      { title: "Architecture Rules", href: "/docs/architecture-rules" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "State Management", href: "/docs/state-management" },
      { title: "Reactive Types", href: "/docs/reactive-types" },
      { title: "Controllers & State", href: "/docs/controllers" },
      { title: "Lifecycle", href: "/docs/lifecycle" },
      { title: "Dependency Injection", href: "/docs/dependency-injection" },
      { title: "Workers", href: "/docs/workers" },
      { title: "Async Status", href: "/docs/async-status" },
    ],
  },
  {
    title: "Widgets",
    items: [
      { title: "Choosing a Widget", href: "/docs/widgets" },
      { title: "Obx, ObxValue, Observer", href: "/docs/widgets/obx" },
      { title: "Obl (Effects)", href: "/docs/widgets/obl" },
      { title: "GetBuilder & Bind", href: "/docs/widgets/get-builder" },
      { title: "GetX Widget", href: "/docs/widgets/getx" },
      { title: "GetView & GetWidget", href: "/docs/widgets/get-view" },
      { title: "ValueBuilder & MixinBuilder", href: "/docs/widgets/value-builder" },
      { title: "GetIn Widget", href: "/docs/get-in-widget" },
      { title: "Ticker Providers", href: "/docs/widgets/tickers" },
    ],
  },
  {
    title: "Tooling",
    items: [
      { title: "Code Generation", href: "/docs/codegen" },
      { title: "Lint Rules", href: "/docs/lint" },
      { title: "Hooks", href: "/docs/hooks" },
    ],
  },
  {
    title: "Under the Hood",
    items: [
      { title: "The Reactivity Engine", href: "/docs/internals/reactivity" },
      { title: "ListNotifier", href: "/docs/internals/list-notifier" },
      { title: "Memory Management", href: "/docs/internals/memory" },
      { title: "Performance Metrics", href: "/docs/performance" },
    ],
  },
  {
    title: "Comparisons",
    items: [
      { title: "vs GetX", href: "/docs/compare/getx" },
      { title: "vs Bloc", href: "/docs/compare/bloc" },
      { title: "vs Riverpod", href: "/docs/compare/riverpod" },
    ],
  },
  {
    title: "Migration",
    items: [
      { title: "Migrating from GetX", href: "/docs/migration" },
      { title: "Breaking Changes", href: "/docs/breaking-changes" },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "API Reference", href: "/docs/api-reference" },
      { title: "FAQ", href: "/docs/faq" },
      { title: "Community", href: "/docs/community" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="pb-10">
        {docsConfig.map((section) => (
          <div key={section.title} className="pb-5">
            <h4 className="mb-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
              {section.title}
            </h4>
            <div className="grid grid-flow-row auto-rows-max gap-0.5 text-sm">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:bg-muted/50 hover:text-foreground",
                    pathname === item.href
                      ? "bg-primary/5 font-medium text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
