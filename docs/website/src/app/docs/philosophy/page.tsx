import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Design Principles — rxget",
  description:
    "The five principles behind rxget: state is owned, reactivity is encapsulated, disposal is structural, the framework is not a framework, and correctness is enforced by tooling.",
};

export default function PhilosophyPage() {
  return (
    <>
      <h1>Design Principles</h1>
      <p className="lead">
        rxget keeps GetX&apos;s reactivity and dependency injection, and throws
        out everything else — including some of GetX&apos;s freedoms. What
        remains is deliberately narrower than what it came from.
      </p>

      <p>
        Most state-management libraries are judged on what they let you do.
        rxget is designed around what it stops you from doing. Every rule below
        exists because the unrestricted version of it produced a class of bug
        that was hard to find in a large app.
      </p>

      <h2>1. State is owned, never free-floating</h2>
      <p>
        In GetX, a reactive variable can live anywhere — a controller field, a
        global, a local inside a widget. That flexibility is what makes GetX
        quick to start with and hard to audit later: nothing tells you who is
        responsible for closing a given variable.
      </p>
      <p>
        rxget requires every reactive variable to live inside a{" "}
        <code>GetxState</code> subclass, and requires that class to be private
        to its controller&apos;s library. The controller owns the state object;
        the state object owns the variables; disposal follows ownership.
      </p>

      <CodeBlock title="the shape rxget requires">{`// counter_controller.dart
class _CounterState extends GetxState {
  final _count = 0.obs;          // private, owned by this state

  int get count => _count.value; // the view sees a plain int

  @override
  void onClose() {
    _count.close();              // ownership implies disposal
  }
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}`}</CodeBlock>

      <p>
        The privacy is not a convention. <code>GetxController</code> asserts it
        in its constructor:
      </p>

      <CodeBlock title="packages/rxget/lib/src/get_state_manager/src/simple/get_controllers.dart">{`GetxController() {
  assert(
    T.toString().startsWith('_'),
    'State class for $runtimeType must be private (start with "_")',
  );
}`}</CodeBlock>

      <Callout variant="note" title="Why private, specifically?">
        <p>
          A private state class cannot be imported by a view. That makes it
          structurally impossible for a widget to reach past the controller and
          mutate <code>_count.value</code> directly. The controller becomes the
          only writer, which is the property that makes state changes
          traceable.
        </p>
      </Callout>

      <h2>2. Reactivity is an implementation detail</h2>
      <p>
        A view should not know whether <code>count</code> is backed by an{" "}
        <code>Rx&lt;int&gt;</code>, a plain field, or a computed value. In rxget
        the state class exposes plain getters and keeps the <code>Rx</code>{" "}
        objects private, so the widget reads <code>state.count</code> — an{" "}
        <code>int</code> — and the reactivity happens underneath.
      </p>

      <CodeBlock title="the view never sees an Rx">{`// GOOD — the widget reads a plain int
Obx(() => Text('\${controller.state.count}'))

// BAD — the widget is now coupled to the reactive type
Obx(() => Text('\${controller.state.count.value}'))`}</CodeBlock>

      <p>
        This is what lets you change <code>count</code> from an{" "}
        <code>RxInt</code> to a value derived from two other variables without
        touching a single widget.
      </p>

      <h2>3. Disposal is structural, not remembered</h2>
      <p>
        The most common GetX bug in production is a reactive variable that is
        never closed, or a controller deleted while a widget is still observing
        it. rxget attacks this from three directions at once:
      </p>
      <ul>
        <li>
          <code>GetxController.onClose()</code> calls{" "}
          <code>state.onClose()</code> automatically, so closing the controller
          closes its state.
        </li>
        <li>
          <code>GetxState.onClose()</code> is <strong>abstract</strong> — you
          cannot define a state class without deciding what to close.
        </li>
        <li>
          The code generator writes <code>onClose()</code> for you, so the
          disposal list cannot drift out of sync with the field list.
        </li>
      </ul>
      <p>
        And when a reactive object <em>is</em> used after being closed, the
        error names the variable, the line it was declared on, and the line that
        closed it — rather than the line that happened to touch it.
      </p>

      <h2>4. A library, not a micro-framework</h2>
      <p>
        GetX grew to own routing, localization, snackbars, dialogs, theming,
        storage and HTTP. Each addition is individually reasonable and
        collectively makes GetX something you adopt rather than something you
        use. Upgrading GetX means upgrading your navigation stack.
      </p>
      <p>
        rxget ships reactivity and dependency injection. It has no opinion about
        your navigator, your HTTP client, your theming, or your app shell. You
        can drop it into an existing app one screen at a time, and you can take
        it out the same way.
      </p>

      <h2>5. Correctness is enforced by tooling, not documentation</h2>
      <p>
        A rule that lives only in a style guide is a rule that gets broken.
        rxget&apos;s architecture rules are enforced by three mechanisms that
        run without anyone remembering them:
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Mechanism</th>
              <th className="py-2 pr-4 font-semibold">Enforces</th>
              <th className="py-2 font-semibold">When it fires</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">assert</td>
              <td className="py-2 pr-4">State class must be private</td>
              <td className="py-2">Debug run</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">rxget_lint</td>
              <td className="py-2 pr-4">
                Rx fields private, Rx only inside GetxState
              </td>
              <td className="py-2">As you type</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">rxget_generator</td>
              <td className="py-2 pr-4">Disposal matches declaration</td>
              <td className="py-2">build_runner</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="tip" title="The trade this makes">
        <p>
          rxget is more ceremony than GetX for a five-line demo, and less
          ceremony than GetX for a fifty-screen app. If your app is the former,
          GetX is genuinely the faster tool. The rules here only start paying
          for themselves once more than one person is writing controllers.
        </p>
      </Callout>

      <h2>What rxget deliberately does not do</h2>
      <ul>
        <li>
          <strong>No routing.</strong> Use <code>Navigator</code>,{" "}
          <code>go_router</code>, or anything else.
        </li>
        <li>
          <strong>No context-free UI.</strong> No <code>Get.snackbar</code>,{" "}
          <code>Get.dialog</code>, <code>Get.bottomSheet</code>.
        </li>
        <li>
          <strong>No localization, theming, or storage.</strong>
        </li>
        <li>
          <strong>No HTTP client or connectivity helpers.</strong>
        </li>
        <li>
          <strong>No global state by convention.</strong> Prefer{" "}
          <code>GetIn</code> scoping over app-lifetime singletons.
        </li>
      </ul>

      <PageNav
        prev={{ title: "Cheat Sheet", href: "/docs/cheat-sheet" }}
        next={{ title: "Derived from GetX", href: "/docs/from-getx" }}
      />
    </>
  );
}
