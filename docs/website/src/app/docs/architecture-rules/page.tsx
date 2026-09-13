import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Architecture Rules — rxget",
  description:
    "The six rules rxget enforces, what enforces each one, the error you get when you break it, and the bug each rule prevents.",
};

function Rule({
  n,
  title,
  enforcedBy,
  children,
}: {
  n: number;
  title: string;
  enforcedBy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="not-prose my-10 rounded-lg border border-border p-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {n}
        </span>
        <h3 className="m-0 text-lg font-semibold text-foreground">{title}</h3>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {enforcedBy}
        </span>
      </div>
      <div className="prose prose-zinc dark:prose-invert max-w-none prose-sm">
        {children}
      </div>
    </section>
  );
}

export default function ArchitectureRulesPage() {
  return (
    <>
      <h1>Architecture Rules</h1>
      <p className="lead">
        rxget enforces six rules. Each one is checked by the compiler, an
        assertion, or a lint — none of them rely on you remembering. This page
        lists every rule, what breaks it, and the bug it exists to prevent.
      </p>

      <Rule
        n={1}
        title="A state class must extend GetxState"
        enforcedBy="compiler"
      >
        <p>
          <code>GetxController&lt;T&gt;</code> constrains{" "}
          <code>T extends GetxState</code>, so anything else fails to compile.{" "}
          <code>GetxState</code> exists for one reason: it declares an abstract{" "}
          <code>onClose()</code>.
        </p>
        <CodeBlock title="the entire GetxState class">{`abstract class GetxState {
  void onClose();
}`}</CodeBlock>
        <p>
          <strong>Prevents:</strong> a state object with no defined disposal
          path.
        </p>
      </Rule>

      <Rule
        n={2}
        title="The state class must be private"
        enforcedBy="assert + lint"
      >
        <p>
          <code>GetxController</code> asserts the type name starts with an
          underscore, and <code>getx_state_must_be_private</code> flags it in
          the editor.
        </p>
        <CodeBlock>{`// BAD
class CounterState extends GetxState { ... }
class CounterController extends GetxController<CounterState> { ... }
// → 'State class for CounterController must be private (start with "_")'

// GOOD
class _CounterState extends GetxState { ... }
class CounterController extends GetxController<_CounterState> { ... }`}</CodeBlock>
        <p>
          <strong>Prevents:</strong> a view importing the state class and
          mutating it directly, bypassing the controller. A private class
          cannot be named outside its own library, so this is structural rather
          than advisory.
        </p>
      </Rule>

      <Rule
        n={3}
        title="Rx fields must be private"
        enforcedBy="rxget_lint"
      >
        <p>
          <code>avoid_public_rx_declaration</code> flags any public{" "}
          <code>Rx</code> field inside a <code>GetxState</code>, and ships a
          quick fix that renames it.
        </p>
        <CodeBlock>{`class _CounterState extends GetxState {
  final count = 0.obs;   // BAD  — public Rx
  final _count = 0.obs;  // GOOD — private, exposed via a getter

  int get count => _count.value;

  @override
  void onClose() => _count.close();
}`}</CodeBlock>
        <p>
          <strong>Prevents:</strong> widgets coupling to the reactive type. With
          a getter, changing <code>_count</code> from an <code>RxInt</code> to a
          value computed from two other variables touches no widget.
        </p>
      </Rule>

      <Rule
        n={4}
        title="Rx variables belong inside a GetxState"
        enforcedBy="rxget_lint"
      >
        <p>
          <code>avoid_rx_outside_getx_state</code> warns when{" "}
          <code>.obs</code> or an <code>Rx</code> constructor appears as a field
          outside a <code>GetxState</code> subclass.
        </p>
        <CodeBlock>{`// BAD — nothing owns this, nothing closes it
class ProfileController extends GetxController<_ProfileState> {
  final scrollOffset = 0.0.obs;
}

// GOOD — owned by the state, closed with it
class _ProfileState extends GetxState {
  final _scrollOffset = 0.0.obs;
  double get scrollOffset => _scrollOffset.value;

  @override
  void onClose() => _scrollOffset.close();
}`}</CodeBlock>
        <p>
          <strong>Prevents:</strong> the most common leak in GetX apps — a
          reactive variable whose disposal nobody owns.
        </p>
      </Rule>

      <Rule
        n={5}
        title="Every Rx must be closed in onClose()"
        enforcedBy="abstract method + generator"
      >
        <p>
          <code>GetxState.onClose()</code> is abstract, so you cannot define a
          state class without writing one.{" "}
          <code>GetxController.onClose()</code> calls it for you:
        </p>
        <CodeBlock title="get_controllers.dart">{`@override
@mustCallSuper
void onClose() {
  state.onClose();
  super.onClose();
}`}</CodeBlock>
        <p>
          Writing that list by hand is where drift creeps in — a field gets
          added, the <code>onClose()</code> does not. The{" "}
          <a href="/docs/codegen">code generator</a> derives the list from the
          fields so the two cannot disagree.
        </p>
        <p>
          <strong>Prevents:</strong> a leaked subscription surviving its
          controller.
        </p>
      </Rule>

      <Rule
        n={6}
        title="Dependencies are scoped to a subtree, not to the app"
        enforcedBy="convention + GetIn"
      >
        <p>
          This is the one rule with no automated check — it is a design
          default. Prefer <code>GetInWidget</code> over a bare{" "}
          <code>Get.put</code> at app start, so a controller dies with the
          screen that needed it.
        </p>
        <CodeBlock>{`// Prefer this — dies with the subtree
GetInWidget(
  dependencies: [GetIn<CartController>(() => CartController())],
  child: const CartView(),
)

// Over this — lives until someone remembers to delete it
Get.put(CartController());`}</CodeBlock>
        <p>
          <strong>Prevents:</strong> an app whose memory only grows, and stale
          controllers serving data from a screen the user left ten minutes ago.
        </p>
      </Rule>

      <h2>Turning on the lints</h2>
      <p>
        The lint rules are a separate package. Add it as a dev dependency and
        enable the plugin:
      </p>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dev_dependencies:
  rxget_lint: ^0.0.1`}</CodeBlock>

      <CodeBlock language="yaml" title="analysis_options.yaml">{`plugins:
  rxget_lint:
    path: rxget_lint

diagnostics:
  getx_state_must_be_private: error
  avoid_public_rx_declaration: error
  avoid_rx_outside_getx_state: warning`}</CodeBlock>

      <Callout variant="tip" title="Adopt the rules incrementally">
        <p>
          On an existing GetX codebase, start every rule at{" "}
          <code>info</code>, fix a package at a time, then raise to{" "}
          <code>warning</code> and <code>error</code>. Rules 1 and 2 are
          compile- and run-time checks and cannot be softened, so migrate
          controllers to the typed state shape first.
        </p>
      </Callout>

      <h2>The rules as one example</h2>
      <p>Everything above, in a single file:</p>

      <CodeBlock title="cart_controller.dart">{`import 'package:rxget/rxget.dart';

// Rules 1-4: private state class, extends GetxState, private Rx fields
class _CartState extends GetxState {
  final _items = <CartItem>[].obs;
  final _isCheckingOut = false.obs;

  List<CartItem> get items => _items.value;
  bool get isCheckingOut => _isCheckingOut.value;
  int get itemCount => _items.length;

  // Rule 5: every Rx closed here
  @override
  void onClose() {
    _items.close();
    _isCheckingOut.close();
  }
}

class CartController extends GetxController<_CartState> {
  @override
  final state = _CartState();

  void add(CartItem item) => state._items.add(item);

  Future<void> checkout() async {
    state._isCheckingOut.value = true;
    try {
      await _api.submit(state.items);
      state._items.clear();
    } finally {
      state._isCheckingOut.value = false;
    }
  }
}`}</CodeBlock>

      <CodeBlock title="cart_view.dart">{`// Rule 6: scoped to this subtree
GetInWidget(
  dependencies: [GetIn<CartController>(() => CartController())],
  // The view reads plain values — never .value
  child: Obx(() => Text('\${Get.find<CartController>().state.itemCount} items')),
)`}</CodeBlock>

      <PageNav
        prev={{ title: "Derived from GetX", href: "/docs/from-getx" }}
        next={{ title: "State Management", href: "/docs/state-management" }}
      />
    </>
  );
}
