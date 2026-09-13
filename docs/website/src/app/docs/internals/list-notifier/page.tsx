import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "ListNotifier — rxget",
  description:
    "The notifier every Rx and controller is built on: single listeners, id groups, the allocation-free notify path, and the lifecycle debug traces.",
};

export default function ListNotifierPage() {
  return (
    <>
      <h1>ListNotifier</h1>
      <p className="lead">
        Every reactive object in rxget — every <code>Rx</code>, every{" "}
        <code>GetxController</code> — is a <code>ListNotifier</code>. It is
        Flutter&apos;s <code>ChangeNotifier</code> idea with two additions: a
        disposer returned from <code>addListener</code>, and listeners grouped
        by id.
      </p>

      <h2>The type hierarchy</h2>

      <CodeBlock>{`Listenable
  └── ListNotifier                     with Single + Group mixins
        ├── ListNotifierSingle         single listeners only
        ├── ListNotifierGroup          id-keyed listeners only
        ├── GetListenable<T>           adds a value and a stream
        │     └── _RxImpl<T>  →  Rx<T>, RxInt, RxString, RxList, ...
        └── GetxController<T>          adds state + update()`}</CodeBlock>

      <h2>ListNotifierSingleMixin</h2>
      <p>The flat listener list. This is what <code>Obx</code> subscribes to.</p>

      <CodeBlock>{`Disposer addListener(GetStateUpdate listener);   // returns an unsubscribe fn
void     removeListener(VoidCallback listener);
bool     containsListener(GetStateUpdate listener);
int   get listenersLength;
bool  get isDisposed;
void     refresh();       // notify everyone
void     dispose();
String?  debugLabel;`}</CodeBlock>

      <p>
        <code>addListener</code> returning a <code>Disposer</code> is the main
        departure from <code>ChangeNotifier</code>. It means a caller never has
        to keep a reference to the exact closure it registered:
      </p>

      <CodeBlock>{`final remove = controller.addListener(() => print('changed'));
remove();   // no need to hold onto the closure`}</CodeBlock>

      <h3>The notify path</h3>
      <p>
        Notification runs on every single write, so the common cases are kept
        allocation-free.
      </p>

      <CodeBlock title="list_notifier.dart">{`void _notifyUpdate() {
  final updaters = _updaters;
  if (updaters == null) return;

  final length = updaters.length;
  // A reactive variable is notified on every write, so the two common cases
  // — nothing is observing it, and exactly one widget is — are worth keeping
  // allocation-free. Copying only matters when a listener can add or remove
  // listeners while the list is being walked.
  if (length == 0) return;
  if (length == 1) {
    updaters[0]();
    return;
  }
  for (final element in List<GetStateUpdate>.of(updaters, growable: false)) {
    element();
  }
}`}</CodeBlock>

      <p>
        Zero listeners and one listener — between them the overwhelming majority
        of writes — allocate nothing. Only the multi-listener case copies, and
        it copies because a listener is allowed to add or remove listeners while
        being notified.
      </p>

      <h2>ListNotifierGroupMixin</h2>
      <p>
        Listeners keyed by id, which is how{" "}
        <code>update([&apos;header&apos;])</code> reaches only the{" "}
        <code>GetBuilder</code> with <code>id: &apos;header&apos;</code>.
      </p>

      <CodeBlock>{`Disposer addListenerId(Object? key, GetStateUpdate listener);
void     removeListenerId(Object id, VoidCallback listener);
bool     containsId(Object id);
void     refreshGroup(Object id);
void     disposeId(Object id);`}</CodeBlock>

      <p>
        Each id owns its own <code>ListNotifierSingle</code>, so groups notify
        independently.
      </p>

      <h3>The map is allocated on demand</h3>

      <CodeBlock title="list_notifier.dart">{`/// Allocated on first use. Most controllers only ever call \`update()\` with
/// no ids, and every [ListNotifier] mixes this in, so an eagerly created
/// [HashMap] is a per-controller allocation that usually stays empty.
HashMap<Object?, ListNotifierSingleMixin>? _updatersGroupIds;

HashMap<Object?, ListNotifierSingleMixin> get _groupIds =>
    _updatersGroupIds ??= HashMap<Object?, ListNotifierSingleMixin>();`}</CodeBlock>

      <p>
        Because <code>ListNotifier</code> mixes in both the single and group
        behaviour, every controller and every <code>Rx</code> used to carry an
        empty <code>HashMap</code>. Creating it lazily is a meaningful part of
        why controller construction got faster — see{" "}
        <a href="/docs/performance">Performance Metrics</a>.
      </p>

      <Callout variant="note" title="Disposal is tracked separately">
        <p>
          A null map used to mean &ldquo;disposed&rdquo;. Now it means
          &ldquo;no group has been used yet&rdquo;, so disposal is tracked by a
          separate <code>_groupDisposed</code> flag.
        </p>
      </Callout>

      <h2>Lifecycle debugging</h2>
      <p>
        A reactive variable is rarely used where it was declared or closed, so
        each one records both locations in debug builds. The &ldquo;used after
        close&rdquo; error then prints a pair of clickable source lines instead
        of just the line that happened to touch it.
      </p>

      <CodeBlock language="text" title="debug output">{`The RxInt "CounterState.a" was used after being closed.

RxInt.value was called after close(). A closed reactive variable can no
longer be observed, written to or listened to.

The RxInt was declared at:
  package:my_app/counter_controller.dart 12:24
and closed at:
  package:my_app/counter_controller.dart 21:12`}</CodeBlock>

      <p>
        The traces are stripped of rxget, Flutter and SDK frames, so the first
        line shown is your code.
      </p>

      <h3>RxLifecycleDebug</h3>

      <CodeBlock>{`// Capturing a stack trace per reactive object costs time and memory.
// Turn it off for a debug-mode benchmark.
RxLifecycleDebug.captureStackTraces = false;

// How many frames the error prints.
RxLifecycleDebug.stackFrameCount = 16;`}</CodeBlock>

      <p>
        Capture happens only when assertions are enabled — profile and release
        builds never pay for it.
      </p>

      <h3>debugLabel</h3>
      <p>
        A stack trace points at a line; a label names the variable. Useful when
        several are declared on one line or built in a loop.
      </p>

      <CodeBlock>{`final _a = 8.obs..debugLabel = 'CounterState.a';`}</CodeBlock>

      <h3>One trace per object, not two</h3>
      <p>
        <code>ListNotifier</code> mixes in both notifier mixins. Each used to
        capture its own creation trace, so every controller paid for two{" "}
        <code>StackTrace.current</code> calls. The group mixin now borrows the
        single mixin&apos;s:
      </p>

      <CodeBlock title="list_notifier.dart">{`/// Where this object was created, borrowed from [ListNotifierSingleMixin]
/// when it is present. Capturing a second trace here would double the cost
/// of creating a [ListNotifier] in debug mode for the same information.
StackTrace? get _debugGroupCreationStack {
  final Object self = this;
  if (self is ListNotifierSingleMixin) {
    return self._debugCreationStack;
  }
  return null;
}`}</CodeBlock>

      <h2>GetListenable&lt;T&gt;</h2>
      <p>
        A <code>ListNotifierSingle</code> that holds a value and can expose it
        as a stream. This is the direct superclass of every <code>Rx</code>.
      </p>

      <CodeBlock>{`T value;                       // get reports a read, set notifies
Stream<T> get stream;          // lazily created broadcast stream
StreamController<T> get subject;
StreamSubscription<T> listen(void Function(T) onData, {...});
void close();                  // removes the stream listener, closes, disposes`}</CodeBlock>

      <Callout variant="tip" title="The stream is opt-in">
        <p>
          The <code>StreamController</code> is only created when something
          touches <code>.stream</code>, <code>.subject</code>,{" "}
          <code>listen()</code> or attaches a worker. An <code>Rx</code> read
          only by <code>Obx</code> never allocates one — which is why{" "}
          <code>Obx</code> is cheaper than a <code>StreamBuilder</code>.
        </p>
      </Callout>

      <h2>Using it directly</h2>
      <p>
        <code>ListNotifier</code> is exported, so it can back a custom
        observable type.
      </p>

      <CodeBlock>{`class Stopwatch extends ListNotifier {
  Duration _elapsed = Duration.zero;

  Duration get elapsed {
    reportRead();          // makes it observable by Obx
    return _elapsed;
  }

  void tick(Duration d) {
    _elapsed += d;
    refresh();             // notify observers
  }
}

// works with Obx like any Rx
Obx(() => Text('\${stopwatch.elapsed.inSeconds}s'))`}</CodeBlock>

      <PageNav
        prev={{ title: "The Reactivity Engine", href: "/docs/internals/reactivity" }}
        next={{ title: "Memory Management", href: "/docs/internals/memory" }}
      />
    </>
  );
}
