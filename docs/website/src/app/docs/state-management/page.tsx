import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "State Management — rxget",
  description:
    "The two state-management models in rxget — reactive (.obs + Obx) and simple (update() + GetBuilder) — when to use each, and how to mix them.",
};

export default function StateManagementPage() {
  return (
    <>
      <h1>State Management</h1>
      <p className="lead">
        rxget has two independent ways to rebuild a widget. They can be used in
        the same controller, the same screen, even the same build method.
      </p>

      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="m-0 text-sm font-semibold text-foreground">
            Reactive
          </h3>
          <p className="mt-1 mb-2 font-mono text-xs text-primary">
            .obs + Obx
          </p>
          <p className="m-0 text-sm text-muted-foreground">
            The widget rebuilds automatically when a variable it read changes.
            No manual signalling.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="m-0 text-sm font-semibold text-foreground">Simple</h3>
          <p className="mt-1 mb-2 font-mono text-xs text-primary">
            update() + GetBuilder
          </p>
          <p className="m-0 text-sm text-muted-foreground">
            The widget rebuilds when you say so. No per-variable overhead.
          </p>
        </div>
      </div>

      <h2>Reactive state</h2>
      <p>
        Append <code>.obs</code> to a value and it becomes an observable. Read
        it inside an <code>Obx</code> and that widget subscribes to it.
      </p>

      <CodeBlock title="counter_controller.dart">{`class _CounterState extends GetxState {
  final _count = 0.obs;

  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}`}</CodeBlock>

      <CodeBlock title="counter_view.dart">{`Obx(() => Text('\${controller.state.count}'))`}</CodeBlock>

      <p>
        Nothing registers the dependency explicitly. Reading{" "}
        <code>state.count</code> calls the private <code>_count.value</code>{" "}
        getter, which reports the read to the currently building{" "}
        <code>Obx</code>. When <code>_count</code> changes, that{" "}
        <code>Obx</code> — and only that <code>Obx</code> — rebuilds.
      </p>

      <Callout variant="tip" title="Obx scope is the rebuild scope">
        <p>
          The widget that rebuilds is the <code>Obx</code>, not the screen. Wrap
          the smallest widget that actually depends on the value. Two counters
          on one page should be two <code>Obx</code> widgets, not one around
          both.
        </p>
      </Callout>

      <h3>Reading is what subscribes</h3>
      <p>
        A dependency is created by reading a value during a build, so a value
        read in a branch that did not execute is not a dependency:
      </p>

      <CodeBlock>{`Obx(() {
  // subscribes to isExpanded always,
  // and to body only while isExpanded is true
  if (!controller.state.isExpanded) return const SizedBox.shrink();
  return Text(controller.state.body);
})`}</CodeBlock>

      <p>
        When <code>isExpanded</code> flips to <code>false</code>, rxget releases
        the subscription to <code>body</code> on the next build. Writes to{" "}
        <code>body</code> then cost nothing until the panel is expanded again.
        This is a behavioural difference from GetX, which keeps the
        subscription forever — see{" "}
        <a href="/docs/internals/memory">Memory Management</a>.
      </p>

      <h3>The common mistake</h3>
      <p>
        <code>Obx</code> only tracks reads that happen <em>inside its own
        builder</em>. A value read outside and passed in is not a dependency.
      </p>

      <CodeBlock>{`// BAD — count is read before Obx runs; this never updates
final count = controller.state.count;
return Obx(() => Text('\$count'));

// BAD — the read happens in ChildWidget's build, not this Obx's
return Obx(() => ChildWidget(controller: controller));

// GOOD — the read happens inside the builder
return Obx(() => Text('\${controller.state.count}'));`}</CodeBlock>

      <p>
        If an <code>Obx</code> completes a build without reading any observable,
        rxget throws <code>ObxError</code> rather than leaving you with a widget
        that silently never updates.
      </p>

      <h2>Simple state</h2>
      <p>
        <code>GetBuilder</code> rebuilds when the controller calls{" "}
        <code>update()</code>. Nothing is observable and nothing is tracked, so
        there is no per-variable cost — just a listener on the controller.
      </p>

      <CodeBlock title="controller">{`class _ProfileState extends GetxState {
  String name = '';        // plain field, not reactive
  bool isEditing = false;

  @override
  void onClose() {}        // nothing to close
}

class ProfileController extends GetxController<_ProfileState> {
  @override
  final state = _ProfileState();

  void rename(String value) {
    state.name = value;
    update();              // rebuild every GetBuilder on this controller
  }
}`}</CodeBlock>

      <CodeBlock title="view">{`GetBuilder<ProfileController>(
  builder: (controller) => Text(controller.state.name),
)`}</CodeBlock>

      <h3>Rebuilding only part of the screen</h3>
      <p>
        <code>update()</code> accepts a list of ids. A{" "}
        <code>GetBuilder</code> with a matching <code>id</code> rebuilds; the
        rest do not.
      </p>

      <CodeBlock>{`// controller
void rename(String value) {
  state.name = value;
  update(['header']);       // only the header rebuilds
}

// view
GetBuilder<ProfileController>(
  id: 'header',
  builder: (c) => Text(c.state.name),
)

GetBuilder<ProfileController>(
  id: 'footer',             // untouched by update(['header'])
  builder: (c) => const FooterBar(),
)`}</CodeBlock>

      <p>
        <code>update()</code> also takes a condition, which is convenient for
        guarding a rebuild without an <code>if</code>:
      </p>

      <CodeBlock>{`update(['header'], state.name.isNotEmpty);`}</CodeBlock>

      <h2>Choosing between them</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Situation</th>
              <th className="py-2 font-semibold">Use</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                A value changes often and one small widget shows it
              </td>
              <td className="py-2 font-mono text-xs">Obx</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                Many fields change together, one section shows them
              </td>
              <td className="py-2 font-mono text-xs">GetBuilder</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                A large list where each row watches its own value
              </td>
              <td className="py-2 font-mono text-xs">Obx per row</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                State only ever changes on an explicit user action
              </td>
              <td className="py-2 font-mono text-xs">GetBuilder</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                You need a side effect, not a rebuild
              </td>
              <td className="py-2 font-mono text-xs">Obl</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">
                A loading / error / empty / success cycle
              </td>
              <td className="py-2 font-mono text-xs">
                Reactive fields + Obx
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Mixing both in one controller</h2>
      <p>
        This is normal and often the right shape: reactive for the values that
        change independently, <code>update()</code> for the ones that change as
        a group.
      </p>

      <CodeBlock>{`class _EditorState extends GetxState {
  final _charCount = 0.obs;   // changes on every keystroke → reactive
  bool isDirty = false;       // changes rarely, with other fields → update()
  String lastSavedAt = '';

  int get charCount => _charCount.value;

  @override
  void onClose() => _charCount.close();
}

class EditorController extends GetxController<_EditorState> {
  @override
  final state = _EditorState();

  void onType(String text) {
    state._charCount.value = text.length;   // rebuilds only the counter Obx
  }

  void onSaved(String at) {
    state..isDirty = false
         ..lastSavedAt = at;
    update(['status']);                     // rebuilds only the status bar
  }
}`}</CodeBlock>

      <PageNav
        prev={{ title: "Architecture Rules", href: "/docs/architecture-rules" }}
        next={{ title: "Reactive Types", href: "/docs/reactive-types" }}
      />
    </>
  );
}
