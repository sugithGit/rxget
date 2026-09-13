import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Memory Management — rxget",
  description:
    "How rxget releases subscriptions, the stale-dependency leak it fixes relative to GetX, and the disposal rules for every kind of object.",
};

export default function MemoryPage() {
  return (
    <>
      <h1>Memory Management</h1>
      <p className="lead">
        Three things in rxget can outlive their usefulness: a reactive variable,
        a controller, and a subscription between them. This page covers who
        releases each, and the one that used to leak.
      </p>

      <h2>The ownership chain</h2>

      <CodeBlock language="text">{`GetInWidget unmounts
  └── Get.delete<Controller>()
        └── Controller.onDelete()
              └── Controller.onClose()
                    ├── your cleanup — timers, workers, subscriptions
                    └── super.onClose()
                          └── state.onClose()
                                └── _count.close(), _items.close(), ...`}</CodeBlock>

      <p>
        Each link is automatic except the middle one. You write{" "}
        <code>onClose()</code> in the controller for things the controller
        started; everything else follows from ownership.
      </p>

      <h2>The stale dependency leak</h2>
      <p>
        This is the one real memory bug rxget fixes relative to GetX, and it is
        worth understanding because it is invisible in small apps.
      </p>

      <h3>How GetX behaves</h3>
      <p>
        In GetX, an <code>Obx</code> that reads a reactive variable subscribes
        to it and pushes an unsubscribe closure into a list that is only drained
        when the widget unmounts. Read a variable once and the subscription
        lasts for the life of the widget.
      </p>

      <CodeBlock title="the GetX behaviour">{`void read(ListNotifierSingleMixin updaters) {
  final listener = _notifyData?.updater;
  if (listener != null && !updaters.containsListener(listener)) {
    updaters.addListener(listener);
    add(() => updaters.removeListener(listener));  // drained only at unmount
  }
}`}</CodeBlock>

      <p>
        That closure captures <code>updaters</code> — a strong reference to the{" "}
        <code>Rx</code>. So the widget retains every reactive object it has ever
        read, even ones it has stopped reading.
      </p>

      <CodeBlock title="where it bites">{`// A list row rebound to a different model as the user scrolls
Obx(() => Text(currentItem.title))

// Row reads item 1's title  → subscribes
// Row rebinds to item 2     → subscribes, item 1 still held
// ...
// After 10,000 rows: 10,000 live subscriptions, 10,000 retained objects`}</CodeBlock>

      <p>Two consequences, both bad:</p>
      <ul>
        <li>
          <strong>Memory.</strong> Nothing the widget ever touched can be
          collected.
        </li>
        <li>
          <strong>CPU.</strong> Writing to any of those variables still rebuilds
          the widget, even though its output does not depend on them.
        </li>
      </ul>

      <h3>How rxget behaves</h3>
      <p>
        rxget records what each build actually read and unsubscribes the
        difference.
      </p>

      <CodeBlock title="list_notifier.dart">{`} finally {
  for (final notifier in previous) {
    if (!current.contains(notifier) && !notifier.isDisposed) {
      notifier.removeListener(updater);
    }
  }
}`}</CodeBlock>

      <p>The behaviour, as a test:</p>

      <CodeBlock title="test/state_manager/reactive_scope_test.dart">{`testWidgets('a variable that is no longer read is released', (tester) async {
  final useFirst = true.obs;
  final first = 'a'.obs;
  final second = 'b'.obs;

  await tester.pumpWidget(MaterialApp(
    home: Obx(() => Text(useFirst.value ? first.value : second.value)),
  ));

  expect(first.listenersLength, 1);
  expect(second.listenersLength, 0);

  useFirst.value = false;
  await tester.pump();

  // The branch that read \`first\` is gone, so the widget must no longer
  // hold a subscription to it.
  expect(first.listenersLength, 0);
  expect(second.listenersLength, 1);
});`}</CodeBlock>

      <Callout variant="note" title="This changes behaviour, not API">
        <p>
          No code has to change to benefit. An <code>Obx</code> that always
          reads the same variables behaves identically; one whose reads vary now
          releases what it stopped reading.
        </p>
      </Callout>

      <h2>Closing before unmount</h2>
      <p>
        A controller is frequently deleted while a widget observing it is still
        in the tree — pop a route, and the <code>GetInWidget</code> disposes the
        controller as the subtree unmounts. The order is not guaranteed.
      </p>
      <p>
        Removing a listener from a closed notifier trips its own dispose
        assertion, so teardown checks first:
      </p>

      <CodeBlock>{`for (final notifier in _observed) {
  if (!notifier.isDisposed) {
    notifier.removeListener(updater);
  }
}`}</CodeBlock>

      <h2>Rebuilds after unmount</h2>
      <p>
        A write schedules a rebuild on a microtask. If the widget is removed
        before the microtask runs, calling <code>markNeedsBuild</code> on the
        defunct element asserts — so the callback re-checks.
      </p>

      <CodeBlock>{`scheduleMicrotask(() {
  _rebuildScheduled = false;
  if (_scope == null || _scope!.isClosed || !mounted) return;
  markNeedsBuild();
});`}</CodeBlock>

      <h2>What you still have to release</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Object</th>
              <th className="py-2 pr-4 font-semibold">Released by</th>
              <th className="py-2 font-semibold">Where</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Rx in a GetxState
              </td>
              <td className="py-2 pr-4">You</td>
              <td className="py-2">state.onClose()</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Worker
              </td>
              <td className="py-2 pr-4">You</td>
              <td className="py-2">controller.onClose()</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                StreamSubscription
              </td>
              <td className="py-2 pr-4">You</td>
              <td className="py-2">controller.onClose()</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Timer
              </td>
              <td className="py-2 pr-4">You</td>
              <td className="py-2">controller.onClose()</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                AnimationController
              </td>
              <td className="py-2 pr-4">You</td>
              <td className="py-2">controller.onClose()</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Obx subscriptions
              </td>
              <td className="py-2 pr-4">rxget</td>
              <td className="py-2">Each build, and at unmount</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                state.onClose()
              </td>
              <td className="py-2 pr-4">rxget</td>
              <td className="py-2">GetxController.onClose()</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Scoped controllers
              </td>
              <td className="py-2 pr-4">rxget</td>
              <td className="py-2">GetInWidget unmount</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                ScrollController (ScrollMixin)
              </td>
              <td className="py-2 pr-4">rxget</td>
              <td className="py-2">ScrollMixin.onClose()</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Finding a leak</h2>

      <h3>Count listeners</h3>

      <CodeBlock>{`test('the view releases its subscriptions', () async {
  expect(controller.state.itemsListenerCount, 0);
});

// listenersLength is public on every reactive object
expect(myRx.listenersLength, 1);
expect(myRx.isDisposed, false);`}</CodeBlock>

      <h3>Label your variables</h3>

      <CodeBlock>{`final _count = 0.obs..debugLabel = 'CartState.count';`}</CodeBlock>

      <p>
        When something touches it after close, the error names it — and prints
        where it was declared and where it was closed.
      </p>

      <h3>Watch the container</h3>

      <CodeBlock>{`Get.isRegistered<CartController>();
Get.getInstanceInfo<CartController>();   // isRegistered, isPermanent, isInit`}</CodeBlock>

      <p>
        If a controller is still registered after its screen is gone, something
        registered it outside the scope — usually a bare <code>Get.put</code>{" "}
        that should have been a <code>GetIn</code>.
      </p>

      <h2>Rules of thumb</h2>
      <ul>
        <li>
          Declare reactive variables only in a <code>GetxState</code>, so the
          disposal path exists.
        </li>
        <li>
          Let the generator write <code>onClose()</code>, so it cannot drift
          from the field list.
        </li>
        <li>
          Scope with <code>GetInWidget</code>; reserve{" "}
          <code>permanent: true</code> for things that genuinely live as long as
          the app.
        </li>
        <li>
          Keep <code>Obx</code> scopes small — fewer dependencies, fewer
          rebuilds, less retained.
        </li>
        <li>
          Call <code>Get.reset()</code> in test teardown so nothing crosses test
          boundaries.
        </li>
      </ul>

      <PageNav
        prev={{ title: "ListNotifier", href: "/docs/internals/list-notifier" }}
        next={{ title: "Performance Metrics", href: "/docs/performance" }}
      />
    </>
  );
}
