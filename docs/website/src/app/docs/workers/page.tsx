import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Workers — rxget",
  description:
    "ever, everAll, once, debounce and interval: reacting to a reactive variable with logic instead of a rebuild.",
};

export default function WorkersPage() {
  return (
    <>
      <h1>Workers</h1>
      <p className="lead">
        A worker runs a callback when a reactive variable changes. Where{" "}
        <code>Obx</code> rebuilds a widget, a worker runs logic — a network
        call, a log, a write to disk.
      </p>

      <h2>The five workers</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Worker</th>
              <th className="py-2 pr-4 font-semibold">Fires</th>
              <th className="py-2 font-semibold">Typical use</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                ever
              </td>
              <td className="py-2 pr-4">Every change</td>
              <td className="py-2">Persist a setting, log a transition</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                everAll
              </td>
              <td className="py-2 pr-4">Any of several change</td>
              <td className="py-2">Revalidate a form</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                once
              </td>
              <td className="py-2 pr-4">The first change only</td>
              <td className="py-2">One-time setup after first load</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                debounce
              </td>
              <td className="py-2 pr-4">After changes stop</td>
              <td className="py-2">Search-as-you-type</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                interval
              </td>
              <td className="py-2 pr-4">At most once per window</td>
              <td className="py-2">Rate-limit a rapid stream</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>ever</h2>

      <CodeBlock>{`@override
void onInit() {
  super.onInit();

  ever(state._isDarkMode, (bool value) {
    preferences.setBool('dark_mode', value);
  });
}`}</CodeBlock>

      <p>The callback can be skipped with a condition:</p>

      <CodeBlock>{`ever(
  state._count,
  (int v) => analytics.log('count_milestone', v),
  condition: () => state.count % 10 == 0,
);`}</CodeBlock>

      <h2>everAll</h2>
      <p>
        Watches a list of reactive variables and fires when any of them changes.
        The callback receives the value that changed.
      </p>

      <CodeBlock>{`everAll([state._email, state._password, state._name], (_) {
  state._isValid.value = _validateForm();
});`}</CodeBlock>

      <h2>once</h2>

      <CodeBlock>{`once(state._user, (User u) {
  analytics.identify(u.id);     // runs on the first user, never again
});`}</CodeBlock>

      <h2>debounce</h2>
      <p>
        Waits until writes stop for the given duration, then fires with the last
        value. Defaults to 800 ms.
      </p>

      <CodeBlock>{`debounce(
  state._query,
  (String q) => _search(q),
  time: const Duration(milliseconds: 400),
);`}</CodeBlock>

      <p>
        Typing <code>&quot;flutter&quot;</code> writes seven times; the search
        runs once, 400 ms after the last keystroke.
      </p>

      <h2>interval</h2>
      <p>
        The opposite trade: fires immediately, then ignores writes for the
        window. Defaults to one second.
      </p>

      <CodeBlock>{`interval(
  state._scrollOffset,
  (double offset) => analytics.log('scroll', offset),
  time: const Duration(seconds: 2),
);`}</CodeBlock>

      <Callout variant="tip" title="debounce vs interval">
        <p>
          <code>debounce</code> answers &ldquo;tell me when they have stopped
          typing&rdquo;. <code>interval</code> answers &ldquo;tell me at most
          once every N seconds while this keeps changing&rdquo;. Search uses
          debounce; scroll analytics uses interval.
        </p>
      </Callout>

      <h2>Disposing workers</h2>
      <p>
        Every worker returns a <code>Worker</code> handle. A worker holds a
        stream subscription on the variable, so it must be disposed.
      </p>

      <CodeBlock>{`class FeedController extends GetxController<_FeedState> {
  @override
  final state = _FeedState();

  late final Worker _searchWorker;

  @override
  void onInit() {
    super.onInit();
    _searchWorker = debounce(state._query, _search);
  }

  @override
  void onClose() {
    _searchWorker.dispose();
    super.onClose();
  }
}`}</CodeBlock>

      <p>
        <code>Worker</code> is also callable, so <code>_searchWorker()</code> is
        shorthand for <code>dispose()</code>.
      </p>

      <h3>Disposing several at once</h3>

      <CodeBlock>{`final _workers = Workers([
  ever(state._a, _onA),
  debounce(state._b, _onB),
  interval(state._c, _onC),
]);

@override
void onClose() {
  _workers.dispose();     // disposes all three
  super.onClose();
}`}</CodeBlock>

      <Callout variant="warning" title="Workers allocate a stream">
        <p>
          Attaching a worker creates the variable&apos;s{" "}
          <code>StreamController</code>, which an <code>Rx</code> observed only
          by <code>Obx</code> never needs. Use workers for logic, not to drive
          rebuilds.
        </p>
      </Callout>

      <h2>Shared options</h2>
      <p>All five accept the same stream parameters:</p>

      <CodeBlock>{`ever(
  state._value,
  _onChange,
  condition: () => state.isEnabled,   // skip the callback when false
  onError: (Object e) => log(e),
  onDone: () => log('stream closed'),
  cancelOnError: false,
);`}</CodeBlock>

      <h2>Workers and equal values</h2>
      <p>
        Writing a value equal to the current one does not notify, so no worker
        fires. Use <code>trigger()</code> when you need the event regardless.
      </p>

      <CodeBlock>{`final _retry = 0.obs;
ever(_retry, (_) => _attemptConnection());

_retry.value = 0;    // nothing happens — same value
_retry.trigger(0);   // fires the worker`}</CodeBlock>

      <h2>Worker or Obx?</h2>

      <CodeBlock>{`// Rebuild a widget → Obx
Obx(() => Text('\${controller.state.count}'))

// Run logic → worker
ever(state._count, (int c) => analytics.log('count', c));

// Both, on the same variable — this is fine
`}</CodeBlock>

      <PageNav
        prev={{ title: "Dependency Injection", href: "/docs/dependency-injection" }}
        next={{ title: "Async Status", href: "/docs/async-status" }}
      />
    </>
  );
}
