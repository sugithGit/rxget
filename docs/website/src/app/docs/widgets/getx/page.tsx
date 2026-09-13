import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "GetX Widget — rxget",
  description:
    "The GetX widget: reactive rebuilds plus controller creation, resolution and disposal in a single widget.",
};

export default function GetXWidgetPage() {
  return (
    <>
      <h1>GetX Widget</h1>
      <p className="lead">
        <code>GetX&lt;T&gt;</code> is <code>Obx</code> and controller management
        in one widget: it resolves or creates the controller, hands it to the
        builder, observes whatever the builder reads, and disposes it on
        unmount.
      </p>

      <Callout variant="note" title="Not the same as the GetX package">
        <p>
          Confusingly, <code>GetX</code> is both the name of the upstream
          package and the name of this widget. Here it means the widget.
        </p>
      </Callout>

      <h2>Basic use</h2>

      <CodeBlock>{`GetX<CounterController>(
  init: CounterController(),
  builder: (controller) => Text('\${controller.state.count}'),
)`}</CodeBlock>

      <p>
        The builder is reactive: any <code>Rx</code> read inside it is tracked,
        exactly as in <code>Obx</code>. Unlike <code>Obx</code>, the controller
        is passed in rather than captured from scope.
      </p>

      <h2>Parameters</h2>

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
                builder
              </td>
              <td className="py-2 pr-4 font-mono text-xs">required</td>
              <td className="py-2">Receives the controller, returns a widget.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                init
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">Controller to use if none is registered.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                global
              </td>
              <td className="py-2 pr-4 font-mono text-xs">true</td>
              <td className="py-2">
                Register in the shared container, or keep it local.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                autoRemove
              </td>
              <td className="py-2 pr-4 font-mono text-xs">true</td>
              <td className="py-2">Delete the controller on unmount.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                tag
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">Resolve a tagged instance.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                assignId
              </td>
              <td className="py-2 pr-4 font-mono text-xs">false</td>
              <td className="py-2">Force deletion even when not the creator.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                initState / dispose
              </td>
              <td className="py-2 pr-4 font-mono text-xs">null</td>
              <td className="py-2">
                Hooks receiving the <code>GetXState</code>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Local controllers</h2>
      <p>
        With <code>global: false</code> the controller is never registered in
        the container, so other widgets cannot find it and each{" "}
        <code>GetX</code> gets its own.
      </p>

      <CodeBlock>{`GetX<RowController>(
  init: RowController(item: item),
  global: false,
  builder: (controller) => RowTile(
    title: controller.state.title,
    isExpanded: controller.state.isExpanded,
  ),
)`}</CodeBlock>

      <p>
        This is the shape for list rows where every row needs its own state and
        nothing outside the row should reach it.
      </p>

      <h2>Lifecycle hooks</h2>

      <CodeBlock>{`GetX<FeedController>(
  init: FeedController(),
  initState: (state) => state.controller!.loadFirstPage(),
  dispose: (state) => analytics.log('feed_closed'),
  builder: (controller) => FeedList(items: controller.state.items),
)`}</CodeBlock>

      <h2>Rebuilds are coalesced</h2>
      <p>
        Like <code>Obx</code>, a burst of writes produces one rebuild, and the
        rebuild is skipped entirely if the widget has been unmounted in the
        meantime.
      </p>

      <CodeBlock>{`// One setState, not three
controller.state
  .._a.value = 1
  .._b.value = 2
  .._c.value = 3;`}</CodeBlock>

      <h2>GetX or Obx?</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">Obx</th>
              <th className="py-2 font-semibold">GetX</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Creates a controller</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2">Yes, via init</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Disposes it</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2">Yes, if autoRemove</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">
                Observes several controllers
              </td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">Only one is passed in</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Widget type</td>
              <td className="py-2 pr-4">Stateless</td>
              <td className="py-2">Stateful</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="tip" title="Which to reach for">
        <p>
          For most screens, scope dependencies with{" "}
          <a href="/docs/get-in-widget">GetInWidget</a> and observe with{" "}
          <code>Obx</code>. That keeps creation in one place and keeps rebuild
          scopes small. <code>GetX</code> earns its place for self-contained
          components — a list row, a reusable card — where the controller has no
          life outside the widget.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "GetBuilder & Bind", href: "/docs/widgets/get-builder" }}
        next={{ title: "GetView & GetWidget", href: "/docs/widgets/get-view" }}
      />
    </>
  );
}
