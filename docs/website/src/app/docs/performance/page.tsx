import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Performance Metrics — rxget",
  description:
    "Measured benchmarks for rxget's reactive paths, an honest account of what the recent optimisations did and did not change, and the levers that actually matter in an app.",
};

function Bench({
  label,
  old: oldV,
  now,
  unit = "ms",
}: {
  label: string;
  old: string;
  now: string;
  unit?: string;
}) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-4 text-xs text-foreground">{label}</td>
      <td className="py-2 pr-4 font-mono text-xs">
        {oldV} {unit}
      </td>
      <td className="py-2 pr-4 font-mono text-xs">
        {now} {unit}
      </td>
      <td className="py-2 text-xs text-muted-foreground">within noise</td>
    </tr>
  );
}

export default function PerformancePage() {
  return (
    <>
      <h1>Performance Metrics</h1>
      <p className="lead">
        Numbers from the benchmarks in the repository, plus an honest account of
        what the recent reactivity work changed — which was memory behaviour,
        not throughput.
      </p>

      <Callout variant="warning" title="How to read benchmarks, including these">
        <p>
          Every figure here is debug-mode JIT on one machine. Release AOT is a
          different execution model, and a microbenchmark of a notify loop is
          not a frame budget. Use these to understand relative costs, not to
          predict your app.
        </p>
      </Callout>

      <h2>Methodology</h2>
      <ul>
        <li>Apple M4, Flutter 3.41.6 stable, debug JIT, assertions enabled.</li>
        <li>
          200,000 writes per round for notify; 10,000 constructions for
          controllers.
        </li>
        <li>
          25 rounds, the first 5 discarded as warm-up. Minimum and median of
          the remainder.
        </li>
      </ul>

      <Callout variant="note" title="Why warm-up matters">
        <p>
          A single-shot measurement of a JIT runtime mostly measures
          compilation. An earlier version of this page quoted improvements of
          38–48% taken from cold runs. Once the benchmark was warmed and
          repeated, those differences disappeared. The table below is the
          corrected version.
        </p>
      </Callout>

      <h2>Notify and construction</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Benchmark (median)</th>
              <th className="py-2 pr-4 font-semibold">Before</th>
              <th className="py-2 pr-4 font-semibold">After</th>
              <th className="py-2 font-semibold">Verdict</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <Bench label="200k writes, 0 listeners" old="2.54" now="2.50" />
            <Bench label="200k writes, 1 listener" old="3.08" now="2.85" />
            <Bench label="200k writes, 5 listeners" old="7.80" now="8.08" />
            <Bench label="10k controllers constructed" old="14.33" now="13.64" />
          </tbody>
        </table>
      </div>

      <p>
        The honest summary: <strong>throughput is unchanged</strong>. The
        allocation removals are real — a write with zero or one listener no
        longer copies the listener list, and a controller no longer allocates an
        empty <code>HashMap</code> — but at these volumes they do not move the
        wall clock out of noise. The value of that work was{" "}
        <a href="/docs/internals/memory">memory and correctness</a>, not speed.
      </p>

      <Callout variant="tip" title="A measurement that changed the code">
        <p>
          The five-listener path was briefly written as{" "}
          <code>List.of(updaters, growable: false)</code>, on the assumption
          that a fixed-length copy beats a growable one. Benchmarked directly,
          it was about 3.7× slower than <code>toList()</code> in the Dart VM
          (17.1 ms vs 4.6 ms for 200k copies of a 5-element list). The code was
          reverted to <code>toList()</code>.
        </p>
      </Callout>

      <h2>Reactive value vs ValueNotifier</h2>
      <p>
        From <code>test/benchmarks/benckmark_test.dart</code>, notifying 30,000
        listeners:
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Implementation</th>
              <th className="py-2 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground font-mono text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">rxget Value</td>
              <td className="py-2">~6,648 ms</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">
                Flutter ValueNotifier
              </td>
              <td className="py-2">~6,386 ms</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Effectively a tie — rxget is a few percent behind at this scale. rxget
        does not claim to beat <code>ValueNotifier</code> on raw notification
        throughput, and at 30,000 listeners on one value you have an
        architectural problem rather than a library problem.
      </p>

      <h2>Reactive values vs Streams</h2>
      <p>
        The library used to ship <code>MiniStream</code>, a hand-rolled
        synchronous stream, and benchmarked it against{" "}
        <code>dart:async</code>. It was removed along with the other unused
        GetX carry-overs, so that comparison is gone — but the reason it was
        lopsided still matters.
      </p>
      <p>
        A <code>Stream</code> delivers asynchronously: every event is a
        microtask, with the zone machinery that implies. A reactive
        notification is a direct synchronous call through a listener list. That
        is why <code>Obx</code> beats <code>StreamBuilder</code> for UI state,
        and it is why an <code>Rx</code> only allocates a{" "}
        <code>StreamController</code> if something actually asks for{" "}
        <code>.stream</code> or attaches a worker. Observed only by{" "}
        <code>Obx</code>, no stream exists at all.
      </p>

      <h2>What actually costs you frames</h2>
      <p>
        In a real app, none of the above is the bottleneck. These are, in
        rough order of impact:
      </p>

      <h3>1. Rebuild scope</h3>

      <CodeBlock>{`// BAD — one counter tick rebuilds the entire screen
Obx(() => Scaffold(
  appBar: AppBar(title: Text(c.state.title)),
  body: ExpensiveList(items: c.state.items),
))

// GOOD — the tick rebuilds a Text
Scaffold(
  appBar: AppBar(title: Obx(() => Text(c.state.title))),
  body: Obx(() => ExpensiveList(items: c.state.items)),
)`}</CodeBlock>

      <p>
        This is worth more than every micro-optimisation on this page combined.
      </p>

      <h3>2. const subtrees</h3>

      <CodeBlock>{`Obx(() => Column(children: [
  Text('\${c.state.count}'),
  const ExpensiveStaticFooter(),   // const → not rebuilt
]))`}</CodeBlock>

      <h3>3. Batch writes</h3>

      <CodeBlock>{`// Three writes, one rebuild — rxget coalesces on a microtask
c.state.._a.value = 1
       .._b.value = 2
       .._c.value = 3;`}</CodeBlock>

      <h3>4. GetBuilder for grouped changes</h3>
      <p>
        When ten fields change together, one <code>update()</code> and one{" "}
        <code>GetBuilder</code> costs less than ten tracked variables and ten
        subscriptions.
      </p>

      <h3>5. Derive in the state, not the builder</h3>

      <CodeBlock>{`// BAD — the fold runs on every rebuild of this Obx
Obx(() => Text('\${c.state.items.fold(0, (s, i) => s + i.price)}'))

// GOOD — a getter on the state, reused and testable
double get total => _items.fold(0, (s, i) => s + i.price);
Obx(() => Text('\${c.state.total}'))`}</CodeBlock>

      <h2>Debug-mode overhead</h2>
      <p>
        Every reactive object captures a creation stack trace in debug builds,
        so its &ldquo;used after close&rdquo; error can name where it was
        declared. That costs time and memory, and it is why you should never
        benchmark rxget in debug mode without turning it off:
      </p>

      <CodeBlock>{`void main() {
  RxLifecycleDebug.captureStackTraces = false;
  runApp(const MyApp());
}`}</CodeBlock>

      <p>
        Profile and release builds never capture these traces — the whole
        mechanism is behind an <code>assert</code>.
      </p>

      <h2>Running the benchmarks yourself</h2>

      <CodeBlock language="bash">{`cd packages/rxget
flutter test test/benchmarks/benckmark_test.dart`}</CodeBlock>

      <p>
        For anything you intend to act on, measure in profile mode on a real
        device with Flutter DevTools, not in a unit test.
      </p>

      <PageNav
        prev={{ title: "Memory Management", href: "/docs/internals/memory" }}
        next={{ title: "vs GetX", href: "/docs/compare/getx" }}
      />
    </>
  );
}
