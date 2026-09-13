import { CodeBlock } from "@/components/docs/CodeBlock";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "FAQ — rxget",
  description: "Common questions and the errors people actually hit.",
};

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="my-8">
      <h3 className="mb-2">{q}</h3>
      {children}
    </div>
  );
}

export default function FaqPage() {
  return (
    <>
      <h1>FAQ</h1>

      <h2>Getting started</h2>

      <Q q="Why must the state class be private?">
        <p>
          A private class cannot be imported by a view, so a widget cannot reach
          past the controller and mutate state directly. It makes the controller
          the only writer, which is what keeps state changes traceable.{" "}
          <code>GetxController</code> asserts it at construction.
        </p>
      </Q>

      <Q q="Do I have to use the code generator?">
        <p>
          No. It writes the private state class, the getters and{" "}
          <code>onClose()</code> from a schema — useful on states with many
          fields, unnecessary on small ones.
        </p>
      </Q>

      <Q q="Can I use rxget alongside GetX?">
        <p>
          Not in the same file. Both export <code>Get</code>, <code>Obx</code>{" "}
          and <code>GetxController</code>, so the imports collide. Migrate a
          feature at a time with a hard boundary — see{" "}
          <a href="/docs/migration">Migrating from GetX</a>.
        </p>
      </Q>

      <Q q="Does rxget work with go_router / auto_route?">
        <p>
          Yes, with any router. rxget has no routing of its own and no opinion
          about yours. Wrap a route&apos;s screen in{" "}
          <code>GetInWidget</code> to scope its controllers.
        </p>
      </Q>

      <h2>Errors</h2>

      <Q q="ObxError: the improper use of a GetX has been detected">
        <p>
          The <code>Obx</code> builder finished without reading any observable,
          so it can never rebuild. Usually the value was read outside the
          builder:
        </p>
        <CodeBlock>{`// BAD
final count = controller.state.count;
Obx(() => Text('\$count'));

// GOOD
Obx(() => Text('\${controller.state.count}'));`}</CodeBlock>
        <p>
          It also fires when the read happens inside a child widget&apos;s
          build rather than this builder&apos;s.
        </p>
      </Q>

      <Q q='"State class for X must be private (start with _)"'>
        <p>
          Rename the state class to <code>_XState</code>. The assertion is in{" "}
          <code>GetxController</code>&apos;s constructor.
        </p>
      </Q>

      <Q q='"A RxInt was used after being closed"'>
        <p>
          Something touched a reactive variable after <code>close()</code>. The
          error prints where the variable was declared and where it was closed —
          usually a controller disposed while something still holds a reference.
          Add a <code>debugLabel</code> if you need to identify which variable.
        </p>
      </Q>

      <Q q='"Class X is not registered"'>
        <p>
          <code>Get.find&lt;X&gt;()</code> ran before anything registered X.
          Check that the <code>GetInWidget</code> is an ancestor of the widget
          calling <code>find</code>, and that tags match on both sides.
        </p>
      </Q>

      <Q q="My Obx does not rebuild">
        <p>Three usual causes:</p>
        <ul>
          <li>The value is read outside the builder.</li>
          <li>
            An object field was mutated rather than <code>.value</code> being
            assigned — call <code>refresh()</code>.
          </li>
          <li>
            The written value is <code>==</code> the current one, so nothing was
            notified — use <code>trigger()</code>.
          </li>
        </ul>
      </Q>

      <h2>Patterns</h2>

      <Q q="How do I share state between two screens?">
        <p>
          Register the controller in a <code>GetInWidget</code> above both, or
          make it permanent if it really is app-lifetime.
        </p>
        <CodeBlock>{`GetInWidget(
  dependencies: [GetIn<CartController>(() => CartController())],
  child: const ShopFlow(),   // both screens live inside
)`}</CodeBlock>
      </Q>

      <Q q="How do I pass arguments to a controller?">
        <CodeBlock>{`class C extends GetxController<_S> {
  C({required this.userId}) : state = _S();
  final String userId;
  @override final _S state;
}

GetIn<C>(() => C(userId: id));`}</CodeBlock>
      </Q>

      <Q q="Obx or GetBuilder?">
        <p>
          <code>Obx</code> when one value changes often and a small widget shows
          it. <code>GetBuilder</code> when many fields change together and a
          whole section shows them. Both in one controller is normal.
        </p>
      </Q>

      <Q q="How do I test a controller?">
        <CodeBlock>{`void main() {
  setUp(() => Get.put<Api>(FakeApi()));
  tearDown(Get.reset);        // no leakage between tests

  test('increment', () {
    final c = CounterController()..onStart();
    c.increment();
    expect(c.state.count, 1);
    c.onDelete();
  });
}`}</CodeBlock>
        <p>
          Call <code>onStart()</code> to run <code>onInit</code>, and{" "}
          <code>onDelete()</code> to run <code>onClose</code>.
        </p>
      </Q>

      <Q q="Can I use rxget without Flutter?">
        <p>
          No. rxget depends on the Flutter SDK — its widgets, and{" "}
          <code>foundation</code> for <code>Listenable</code>,{" "}
          <code>kDebugMode</code> and the diagnostics used in error messages.
        </p>
      </Q>

      <Q q="Where should derived state live?">
        <p>
          As a getter on the state class, not in the builder. It stays testable
          and reusable, and the <code>Obx</code> still tracks the underlying
          variables it reads.
        </p>
        <CodeBlock>{`double get total => _items.fold(0, (s, i) => s + i.price);`}</CodeBlock>
      </Q>

      <h2>Performance</h2>

      <Q q="Is rxget faster than Bloc or Riverpod?">
        <p>
          Not meaningfully, and any library claiming otherwise is selling a
          microbenchmark. rxget rebuilds at per-variable granularity by default,
          which usually matters more than notification throughput. See{" "}
          <a href="/docs/performance">Performance Metrics</a> for measured
          numbers, including the ones where rxget is behind.
        </p>
      </Q>

      <Q q="Does Obx leak if I read different variables each build?">
        <p>
          No. rxget diffs each build&apos;s reads and releases what is no longer
          read. This is a behavioural difference from GetX, which keeps every
          subscription until unmount — see{" "}
          <a href="/docs/internals/memory">Memory Management</a>.
        </p>
      </Q>

      <Q q="Why is my debug build slow?">
        <p>
          Every reactive object captures a stack trace at creation so the
          &ldquo;used after close&rdquo; error can name it. Turn it off when
          measuring:
        </p>
        <CodeBlock>{`RxLifecycleDebug.captureStackTraces = false;`}</CodeBlock>
        <p>Release builds never capture them.</p>
      </Q>

      <PageNav
        prev={{ title: "API Reference", href: "/docs/api-reference" }}
        next={{ title: "Community", href: "/docs/community" }}
      />
    </>
  );
}
