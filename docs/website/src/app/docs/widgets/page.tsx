import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";
import Link from "next/link";

export const metadata = {
  title: "The Four Widgets — rxget",
  description:
    "rxget ships four widgets: Obx, Obl, GetBuilder and GetInWidget. What each is for, and how to choose between them.",
};

const widgets = [
  {
    name: "Obx",
    href: "/docs/widgets/obx",
    line: "Rebuilds when any reactive value read inside it changes.",
    use: "Showing state. The one you reach for most.",
  },
  {
    name: "Obl",
    href: "/docs/widgets/obl",
    line: "Runs a side effect on change, without rebuilding anything.",
    use: "Navigating or showing a snackbar when state hits a value.",
  },
  {
    name: "GetBuilder",
    href: "/docs/widgets/get-builder",
    line: "Rebuilds when the controller calls update().",
    use: "Many fields changing together; manual control.",
  },
  {
    name: "GetInWidget",
    href: "/docs/get-in-widget",
    line: "Registers dependencies for a subtree and disposes them with it.",
    use: "Scoping controllers to a screen or feature.",
  },
];

export default function WidgetsPage() {
  return (
    <>
      <h1>The Four Widgets</h1>
      <p className="lead">
        rxget ships four widgets. That is the entire widget surface — there is
        no view base class, no provider, no consumer, and nothing to wrap a
        builder in.
      </p>

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

      <h2>Choosing</h2>

      <CodeBlock language="text" title="pick one">{`Registering a controller for a screen? ──────→ GetInWidget

Need a rebuild?
├── No, just a side effect ─────────────────→ Obl
├── Yes, driven by .obs values ─────────────→ Obx
└── Yes, driven by update() calls ──────────→ GetBuilder`}</CodeBlock>

      <h2>All four together</h2>

      <CodeBlock>{`GetInWidget(
  dependencies: [GetIn<CartController>(() => CartController())],
  child: Obl(
    () {
      // side effect: leave when checkout finishes
      if (Get.find<CartController>().state.isComplete) {
        Navigator.of(context).pushReplacementNamed('/receipt');
      }
    },
    child: Column(children: [
      // reactive: one value, small scope
      Obx(() => Text('\${Get.find<CartController>().state.itemCount} items')),

      // manual: several fields that change together
      GetBuilder<CartController>(
        id: 'summary',
        builder: (c) => OrderSummary(order: c.state.order),
      ),
    ]),
  ),
)`}</CodeBlock>

      <h2>Getting the controller</h2>
      <p>
        <code>Get.find</code> takes no <code>BuildContext</code>, so there is
        nothing to wrap it in. Call it where you need it.
      </p>

      <CodeBlock>{`// Inline, when it is used once
Obx(() => Text('\${Get.find<CartController>().state.itemCount}'))

// Resolved once, when the widget uses it more than once
class CartView extends StatelessWidget {
  const CartView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<CartController>();
    return Column(children: [
      Obx(() => Text('\${c.state.itemCount} items')),
      Obx(() => Text('Total: \${c.state.total}')),
      ElevatedButton(onPressed: c.checkout, child: const Text('Checkout')),
    ]);
  }
}`}</CodeBlock>

      <Callout variant="note" title="No view base class">
        <p>
          Earlier versions shipped <code>GetView</code>, <code>GetWidget</code>,{" "}
          <code>GetX</code>, <code>ObxValue</code>, <code>Observer</code>,{" "}
          <code>ValueBuilder</code>, <code>MixinBuilder</code> and the{" "}
          <code>Bind</code> family. All were removed — each was a thin wrapper
          over a plain <code>StatelessWidget</code> plus one of the four above.
          See <a href="/docs/breaking-changes">Breaking Changes</a> for the
          replacement for each.
        </p>
      </Callout>

      <h2>Rebuild scope</h2>
      <p>
        Each of these rebuilds only its own subtree. Keeping that subtree small
        is the single biggest performance lever in rxget.
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
        next={{ title: "Obx", href: "/docs/widgets/obx" }}
      />
    </>
  );
}
