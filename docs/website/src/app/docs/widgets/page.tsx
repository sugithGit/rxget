import { CodeBlock } from "@/components/docs/CodeBlock";
import { PageNav } from "@/components/docs/PageNav";
import Link from "next/link";

export const metadata = {
  title: "Choosing a Widget — rxget",
  description:
    "Every reactive widget in rxget side by side: Obx, ObxValue, Observer, Obl, GetBuilder, GetX, GetView, GetWidget, ValueBuilder, MixinBuilder and GetInWidget.",
};

const widgets = [
  {
    name: "Obx",
    href: "/docs/widgets/obx",
    line: "Rebuilds when any Rx read inside it changes.",
    use: "The default choice for reactive state.",
  },
  {
    name: "ObxValue",
    href: "/docs/widgets/obx",
    line: "Obx with a local Rx passed into the builder.",
    use: "A toggle or filter that no controller needs to own.",
  },
  {
    name: "Observer",
    href: "/docs/widgets/obx",
    line: "Obx whose builder receives the BuildContext.",
    use: "When the builder needs Theme.of or MediaQuery.",
  },
  {
    name: "Obl",
    href: "/docs/widgets/obl",
    line: "Runs a side effect on change without rebuilding.",
    use: "Navigate or show a snackbar when state hits a value.",
  },
  {
    name: "GetBuilder",
    href: "/docs/widgets/get-builder",
    line: "Rebuilds when the controller calls update().",
    use: "Manual control; many fields changing together.",
  },
  {
    name: "GetX",
    href: "/docs/widgets/getx",
    line: "Obx plus controller resolution and lifecycle.",
    use: "One widget that both creates and observes a controller.",
  },
  {
    name: "GetView",
    href: "/docs/widgets/get-view",
    line: "StatelessWidget with a typed controller getter.",
    use: "Removing Get.find boilerplate from a screen.",
  },
  {
    name: "GetWidget",
    href: "/docs/widgets/get-view",
    line: "GetView that caches a per-instance controller.",
    use: "List rows that each need their own controller.",
  },
  {
    name: "ValueBuilder",
    href: "/docs/widgets/value-builder",
    line: "Local setState-style state, no Rx involved.",
    use: "A checkbox inside a dialog.",
  },
  {
    name: "MixinBuilder",
    href: "/docs/widgets/value-builder",
    line: "GetBuilder and Obx in one widget.",
    use: "A section driven by update() and by .obs at once.",
  },
  {
    name: "GetInWidget",
    href: "/docs/get-in-widget",
    line: "Registers dependencies for a subtree.",
    use: "Scoping controllers to a screen.",
  },
];

export default function WidgetsPage() {
  return (
    <>
      <h1>Choosing a Widget</h1>
      <p className="lead">
        rxget ships eleven widgets. Most apps use three of them —{" "}
        <code>Obx</code>, <code>GetBuilder</code> and <code>GetInWidget</code>.
        This page is the map.
      </p>

      <h2>The decision</h2>

      <CodeBlock language="text" title="pick one">{`Do you need a rebuild at all?
├── No, just a side effect ─────────────────────→ Obl
└── Yes
    ├── Driven by .obs values
    │   ├── Reads a controller's state ─────────→ Obx
    │   ├── Needs BuildContext in the builder ──→ Observer
    │   ├── Local Rx, no controller ────────────→ ObxValue
    │   └── Also creates the controller ────────→ GetX
    ├── Driven by update() calls ───────────────→ GetBuilder
    ├── Driven by both ─────────────────────────→ MixinBuilder
    └── Local, non-reactive ────────────────────→ ValueBuilder`}</CodeBlock>

      <h2>All eleven</h2>

      <div className="not-prose my-6 space-y-2">
        {widgets.map((w) => (
          <Link
            key={w.name}
            href={w.href}
            className="flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="w-32 shrink-0 font-mono text-sm font-semibold text-primary">
              {w.name}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-foreground">{w.line}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {w.use}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <h2>Rebuild scope</h2>
      <p>
        Every one of these rebuilds only its own subtree. The single biggest
        performance lever in rxget is keeping that subtree small.
      </p>

      <CodeBlock>{`// BAD — one change rebuilds the whole screen
Obx(() => Scaffold(
  appBar: AppBar(title: Text(c.state.title)),
  body: ExpensiveList(items: c.state.items),
  floatingActionButton: FAB(count: c.state.count),
))

// GOOD — three independent, minimal rebuild scopes
Scaffold(
  appBar: AppBar(title: Obx(() => Text(c.state.title))),
  body: Obx(() => ExpensiveList(items: c.state.items)),
  floatingActionButton: Obx(() => FAB(count: c.state.count)),
)`}</CodeBlock>

      <PageNav
        prev={{ title: "Async Status", href: "/docs/async-status" }}
        next={{ title: "Obx, ObxValue, Observer", href: "/docs/widgets/obx" }}
      />
    </>
  );
}
