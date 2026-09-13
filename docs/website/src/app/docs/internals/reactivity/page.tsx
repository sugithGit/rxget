import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "The Reactivity Engine — rxget",
  description:
    "How a read becomes a subscription: Notifier, NotifyData, RxObserverScope, the dependency diff, and why the tracking set uses identity.",
};

export default function ReactivityPage() {
  return (
    <>
      <h1>The Reactivity Engine</h1>
      <p className="lead">
        <code>Obx(() =&gt; Text(&apos;$&#123;c.state.count&#125;&apos;))</code>{" "}
        has no subscription in it, yet it rebuilds when <code>count</code>{" "}
        changes. This page is what happens in between.
      </p>

      <h2>The idea</h2>
      <p>
        rxget uses <strong>automatic dependency tracking</strong>. Rather than
        declaring what a widget depends on, the framework watches which reactive
        values are read while the widget builds, and subscribes to exactly
        those.
      </p>

      <p>Four things cooperate:</p>

      <div className="not-prose my-6 space-y-2">
        {[
          ["Notifier", "A singleton holding the reactive scope that is currently building."],
          ["NotifyData", "The scope itself: an updater callback, a disposer list, and the set of objects read so far."],
          ["RxObserverScope", "Per-widget state: what it observed last build, and the diff logic."],
          ["ListNotifierSingleMixin", "The listener list every Rx carries."],
        ].map(([name, desc]) => (
          <div key={name} className="rounded-lg border border-border p-4">
            <p className="m-0 font-mono text-sm font-semibold text-primary">
              {name}
            </p>
            <p className="m-0 mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <h2>Step by step</h2>

      <h3>1. The build opens a scope</h3>
      <p>
        <code>Obx</code> is a <code>StatelessWidget</code> with a custom element,{" "}
        <code>ObxElement</code>. Its <code>build()</code> does not call the
        builder directly — it runs it inside a scope.
      </p>

      <CodeBlock title="simple_builder.dart">{`@override
Widget build() {
  return (_scope ??= RxObserverScope(getUpdate)).run(super.build);
}`}</CodeBlock>

      <p>
        <code>RxObserverScope.run</code> installs a fresh{" "}
        <code>NotifyData</code> as the current scope, then calls the builder.
      </p>

      <CodeBlock title="list_notifier.dart">{`T run<T>(T Function() body, {bool throwException = true}) {
  if (_closed) return body();

  final previous = _observed;
  final current = LinkedHashSet<ListNotifierSingleMixin>.identity();
  _observed = current;

  try {
    return Notifier.instance.append(
      NotifyData(
        updater: updater,
        disposers: disposers,
        observed: current,
        throwException: throwException,
      ),
      body,
    );
  } finally {
    for (final notifier in previous) {
      if (!current.contains(notifier) && !notifier.isDisposed) {
        notifier.removeListener(updater);
      }
    }
  }
}`}</CodeBlock>

      <h3>2. Reading a value reports itself</h3>
      <p>
        Every <code>Rx</code> getter calls <code>reportRead()</code> before
        returning.
      </p>

      <CodeBlock title="rx_notifier.dart">{`@override
T get value {
  reportRead();
  return _value;
}`}</CodeBlock>

      <CodeBlock title="list_notifier.dart">{`@protected
void reportRead() {
  Notifier.instance.read(this);
}`}</CodeBlock>

      <h3>3. The scope records the dependency</h3>

      <CodeBlock title="list_notifier.dart">{`void read(ListNotifierSingleMixin updaters) {
  final data = _notifyData;
  if (data == null) return;          // read outside any scope — ignore

  // Recording the read first makes every repeat read of the same variable
  // within one pass a single hash lookup, instead of a linear scan of that
  // variable's listener list.
  if (!data.observed.add(updaters)) return;

  final listener = data.updater;
  if (!updaters.containsListener(listener)) {
    updaters.addListener(listener);
  }
}`}</CodeBlock>

      <p>
        The <code>observed.add</code> returning <code>false</code> is the fast
        path: an <code>Obx</code> that reads <code>count</code> five times in
        one build does one hash insert and four hash lookups, not five scans of
        the listener list.
      </p>

      <Callout variant="note" title="Reads outside a build are free">
        <p>
          When <code>_notifyData</code> is null — reading from a controller
          method, a test, a worker callback — <code>read</code> returns
          immediately. Tracking only costs anything inside a reactive build.
        </p>
      </Callout>

      <h3>4. The diff releases what is no longer read</h3>
      <p>
        The <code>finally</code> block in <code>run</code> compares this
        build&apos;s reads against the previous build&apos;s and unsubscribes
        the difference. This is what makes a conditional dependency actually
        conditional:
      </p>

      <CodeBlock>{`Obx(() {
  if (!c.state.isExpanded) return const SizedBox.shrink();
  return Text(c.state.body);
})

// build 1, expanded:  observed = {isExpanded, body}
// build 2, collapsed: observed = {isExpanded}
//                     → body.removeListener(updater)`}</CodeBlock>

      <h3>5. A write notifies</h3>

      <CodeBlock title="the write path">{`_count.value = 5;
  → RxObjectMixin.value=      // bails if unchanged or disposed
  → GetListenable.value=
  → refresh()
  → _notifyUpdate()           // calls each registered updater
  → ObxElement.getUpdate()`}</CodeBlock>

      <h3>6. The rebuild is coalesced</h3>

      <CodeBlock title="simple_builder.dart">{`void getUpdate() {
  final scope = _scope;
  if (scope == null || scope.isClosed || _rebuildScheduled) return;

  _rebuildScheduled = true;
  scheduleMicrotask(() {
    _rebuildScheduled = false;
    if (_scope == null || _scope!.isClosed || !mounted) return;
    markNeedsBuild();
  });
}`}</CodeBlock>

      <p>
        A hundred writes in one turn schedule one microtask. The{" "}
        <code>mounted</code> check inside the microtask covers the case where
        the widget is removed between the write and the microtask running.
      </p>

      <h2>Why the tracking set uses identity</h2>
      <p>
        <code>observed</code> is a{" "}
        <code>LinkedHashSet.identity()</code>, not a plain <code>Set</code>. The
        reason is a genuine trap:
      </p>

      <CodeBlock title="rx_impl.dart">{`@override
int get hashCode => value.hashCode;   // delegates to the value`}</CodeBlock>

      <p>
        Inserting an <code>Rx</code> into a normal <code>Set</code> calls{" "}
        <code>hashCode</code>, which reads <code>value</code>, which calls{" "}
        <code>reportRead()</code>, which inserts into the set — unbounded
        recursion, ending in a <code>StackOverflowError</code> during build.
      </p>

      <p>
        Identity also happens to be the correct semantics: two variables holding
        equal values are still two separate dependencies.
      </p>

      <h2>Why the scope is restored, not cleared</h2>

      <CodeBlock title="list_notifier.dart">{`T append<T>(NotifyData data, T Function() builder) {
  final previous = _notifyData;
  _notifyData = data;
  try {
    final result = builder();
    if (data.observed.isEmpty &&
        data.disposers.isEmpty &&
        data.throwException) {
      throw ObxError();
    }
    return result;
  } finally {
    _notifyData = previous;
  }
}`}</CodeBlock>

      <p>Two things matter here:</p>
      <ul>
        <li>
          <strong>try/finally.</strong> If the builder throws, the scope is
          still torn down. Without it, a failed build leaves{" "}
          <code>_notifyData</code> pointing at a dead scope, and the next read
          anywhere in the app attaches to it.
        </li>
        <li>
          <strong>Restoring <code>previous</code>.</strong> Nested reactive
          scopes hand the outer one back intact rather than clearing it to null.
        </li>
      </ul>

      <h2>ObxError</h2>
      <p>
        If a builder completes having observed nothing and registered no
        disposers, <code>append</code> throws. A reactive widget with no
        dependencies can never rebuild, so it is almost always a bug — usually
        a value read outside the builder and captured.
      </p>

      <h2>disposers vs observed</h2>
      <p>
        A scope tracks two different things, with two different lifetimes:
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">observed</th>
              <th className="py-2 font-semibold">disposers</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Holds</td>
              <td className="py-2 pr-4">Rx objects read this build</td>
              <td className="py-2">Cleanup callbacks</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Filled by</td>
              <td className="py-2 pr-4">reportRead</td>
              <td className="py-2">reportAdd — e.g. bindStream</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Rebuilt each pass</td>
              <td className="py-2 pr-4">Yes, and diffed</td>
              <td className="py-2">No — accumulates</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Released at</td>
              <td className="py-2 pr-4">Next build, or close</td>
              <td className="py-2">close only</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Teardown</h2>

      <CodeBlock title="list_notifier.dart">{`void close() {
  if (_closed) return;
  _closed = true;

  for (final notifier in _observed) {
    // A reactive variable is often closed by its controller before the
    // widget observing it unmounts, and removing a listener from a closed
    // notifier trips its own dispose assertion.
    if (!notifier.isDisposed) {
      notifier.removeListener(updater);
    }
  }
  _observed = LinkedHashSet<ListNotifierSingleMixin>.identity();

  for (final disposer in disposers) {
    disposer();
  }
  disposers.clear();
}`}</CodeBlock>

      <p>
        The <code>isDisposed</code> guard matters in a very ordinary case:
        deleting a controller closes its reactive variables, and the widget
        observing them unmounts a moment later. Without the guard, that
        sequence throws.
      </p>

      <h2>Who uses the scope</h2>
      <p>
        Four widgets share this machinery — <code>Obx</code> and{" "}
        <code>Observer</code> through <code>ObxElement</code>,{" "}
        <code>Obl</code> through <code>OblElement</code>, and{" "}
        <code>GetX</code> through its <code>State</code>. All four get the
        dependency diff, the coalescing and the unmount guards from the same
        implementation.
      </p>

      <PageNav
        prev={{ title: "Hooks", href: "/docs/hooks" }}
        next={{ title: "ListNotifier", href: "/docs/internals/list-notifier" }}
      />
    </>
  );
}
