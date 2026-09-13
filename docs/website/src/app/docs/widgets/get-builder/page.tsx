import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "GetBuilder & Bind — rxget",
  description:
    "GetBuilder, id-scoped rebuilds, filters, the init/global/autoRemove options, and the Bind/Binder/Binds family underneath.",
};

export default function GetBuilderPage() {
  return (
    <>
      <h1>GetBuilder &amp; Bind</h1>
      <p className="lead">
        <code>GetBuilder</code> rebuilds when a controller calls{" "}
        <code>update()</code>. Nothing is observed and nothing is tracked — it
        is one listener on the controller and an explicit signal.
      </p>

      <h2>Basic use</h2>

      <CodeBlock>{`GetBuilder<CounterController>(
  builder: (controller) => Text('\${controller.state.count}'),
)`}</CodeBlock>

      <p>
        The controller is resolved with <code>Get.find</code>. Call{" "}
        <code>update()</code> to rebuild:
      </p>

      <CodeBlock>{`class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() {
    state.count++;     // a plain field — no .obs needed
    update();
  }
}`}</CodeBlock>

      <h2>Creating the controller inline</h2>

      <CodeBlock>{`GetBuilder<CounterController>(
  init: CounterController(),   // created and registered here
  builder: (controller) => Text('\${controller.state.count}'),
)`}</CodeBlock>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Parameter</th>
              <th className="py-2 pr-4 font-semibold">Default</th>
              <th className="py-2 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                init
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">
                Controller to create if none is registered.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                global
              </td>
              <td className="py-2 pr-4 font-mono text-xs">true</td>
              <td className="py-2">
                Register in the shared container. False keeps it private to this
                widget.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                autoRemove
              </td>
              <td className="py-2 pr-4 font-mono text-xs">true</td>
              <td className="py-2">
                Delete the controller when this widget unmounts.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                id
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">
                Only rebuild on update() calls naming this id.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                tag
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">Resolve a tagged instance.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                filter
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">
                Rebuild only when the derived value changes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Id-scoped rebuilds</h2>
      <p>
        Give a builder an <code>id</code> and it only responds to{" "}
        <code>update()</code> calls that name it.
      </p>

      <CodeBlock>{`// controller
void updateHeader(String title) {
  state.title = title;
  update(['header']);
}

void updateAll() => update();   // no ids → every builder rebuilds

// view
GetBuilder<PageController>(
  id: 'header',
  builder: (c) => Text(c.state.title),
)

GetBuilder<PageController>(
  id: 'body',            // ignores update(['header'])
  builder: (c) => Body(items: c.state.items),
)`}</CodeBlock>

      <Callout variant="note" title="Id groups are allocated on demand">
        <p>
          A controller with no id-scoped builders allocates no group map at all.
          The map appears the first time something calls{" "}
          <code>addListenerId</code>, so <code>update()</code> with ids costs
          nothing until you use it.
        </p>
      </Callout>

      <h3>Conditional updates</h3>

      <CodeBlock>{`update(['header'], state.title.isNotEmpty);   // skipped when false`}</CodeBlock>

      <h2>Filters</h2>
      <p>
        A filter derives a value from the controller. The builder rebuilds only
        when that derived value changes, even if <code>update()</code> is called
        constantly.
      </p>

      <CodeBlock>{`GetBuilder<CartController>(
  filter: (controller) => controller.state.itemCount,
  builder: (controller) => Badge(count: controller.state.itemCount),
)`}</CodeBlock>

      <p>
        Changing an item&apos;s quantity calls <code>update()</code>, but the
        badge only rebuilds when the <em>count</em> changes.
      </p>

      <h2>Lifecycle callbacks</h2>

      <CodeBlock>{`GetBuilder<FeedController>(
  init: FeedController(),
  initState: (state) => state.controller.loadFirstPage(),
  dispose: (state) => analytics.log('feed_closed'),
  didChangeDependencies: (state) => {},
  didUpdateWidget: (oldWidget, state) => {},
  builder: (controller) => FeedList(items: controller.state.items),
)`}</CodeBlock>

      <h2>The Bind family</h2>
      <p>
        <code>GetBuilder</code> is a thin wrapper over{" "}
        <code>Binder</code>, an <code>InheritedWidget</code> whose{" "}
        <code>BindElement</code> owns the controller and its subscription. The
        family is exposed for cases where you want the dependency without the
        builder.
      </p>

      <h3>Bind</h3>

      <CodeBlock>{`Bind<AuthController>(
  init: () => AuthController(),
  child: const LoginForm(),
)`}</CodeBlock>

      <h3>Binds — several at once</h3>

      <CodeBlock>{`Binds(
  binds: [
    Bind<AuthController>(init: () => AuthController()),
    Bind<ThemeController>(init: () => ThemeController()),
  ],
  child: const AppShell(),
)`}</CodeBlock>

      <p>
        The list folds outward-in, so later binds can resolve earlier ones.
      </p>

      <Callout variant="tip" title="Prefer GetInWidget for scoping">
        <p>
          <code>Bind</code> and <code>Binds</code> come from GetX and are kept
          for compatibility. For new code,{" "}
          <a href="/docs/get-in-widget">GetInWidget</a> is the scoping tool —
          it has the registration guard that prevents a nested scope from
          deleting a parent&apos;s dependency.
        </p>
      </Callout>

      <h2>GetBuilder or Obx?</h2>

      <CodeBlock>{`// Many fields change together → GetBuilder, one rebuild
void applyFilters(Filters f) {
  state..category = f.category
       ..minPrice = f.minPrice
       ..sortBy   = f.sortBy;
  update();
}

// One field changes on its own, often → Obx, minimal scope
Obx(() => Text('\${controller.state.unreadCount}'))`}</CodeBlock>

      <p>
        <code>GetBuilder</code> has lower fixed cost — no per-variable tracking
        — but rebuilds everything it wraps. <code>Obx</code> costs a little
        bookkeeping per variable and rebuilds only what actually changed. For a
        screen-sized section driven by a form submit, <code>GetBuilder</code>{" "}
        wins. For a badge that ticks, <code>Obx</code> wins.
      </p>

      <PageNav
        prev={{ title: "Obl (Effects)", href: "/docs/widgets/obl" }}
        next={{ title: "GetX Widget", href: "/docs/widgets/getx" }}
      />
    </>
  );
}
