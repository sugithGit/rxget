import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Derived from GetX — rxget",
  description:
    "Exactly what rxget kept from GetX, what it removed, what it tightened, and what it added — with the reasoning behind each decision.",
};

function Row({
  feature,
  getx,
  rxget,
  note,
}: {
  feature: string;
  getx: boolean;
  rxget: boolean | "changed";
  note: string;
}) {
  const mark = (v: boolean | "changed") =>
    v === "changed" ? (
      <span className="text-amber-500">changed</span>
    ) : v ? (
      <span className="text-primary">yes</span>
    ) : (
      <span className="text-muted-foreground/50">no</span>
    );
  return (
    <tr className="border-b border-border/50 align-top">
      <td className="py-2 pr-4 font-mono text-xs text-foreground">{feature}</td>
      <td className="py-2 pr-4 text-xs">{mark(getx)}</td>
      <td className="py-2 pr-4 text-xs">{mark(rxget)}</td>
      <td className="py-2 text-xs text-muted-foreground">{note}</td>
    </tr>
  );
}

export default function FromGetXPage() {
  return (
    <>
      <h1>Derived from GetX</h1>
      <p className="lead">
        rxget is a fork of GetX that keeps two of its five pillars — reactivity
        and dependency injection — and rebuilds the parts of those two that did
        not hold up at scale.
      </p>

      <p>
        If you know GetX, you already know most of rxget. <code>.obs</code>,{" "}
        <code>Obx</code>, <code>Get.put</code>, <code>Get.find</code>,{" "}
        <code>GetBuilder</code>, <code>ever</code>/<code>debounce</code> and the
        controller lifecycle all behave the way you expect. This page is about
        the differences.
      </p>

      <h2>The inheritance, feature by feature</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Feature</th>
              <th className="py-2 pr-4 font-semibold">GetX</th>
              <th className="py-2 pr-4 font-semibold">rxget</th>
              <th className="py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <Row
              feature=".obs / Rx types"
              getx
              rxget
              note="Identical. RxInt, RxString, RxList, RxMap, RxSet, Rx<T>, Rxn<T>."
            />
            <Row
              feature="Obx / ObxValue"
              getx
              rxget
              note="Same API. Dependency tracking underneath was rewritten."
            />
            <Row
              feature="GetBuilder / update()"
              getx
              rxget
              note="Same API, including id-scoped rebuilds."
            />
            <Row
              feature="GetX widget"
              getx
              rxget
              note="Same API."
            />
            <Row feature="GetView / GetWidget" getx rxget note="Same API." />
            <Row
              feature="Workers"
              getx
              rxget
              note="ever, everAll, once, debounce, interval — unchanged."
            />
            <Row
              feature="Get.put / find / lazyPut"
              getx
              rxget
              note="Same API, plus spawn, replace, lazyReplace, reload."
            />
            <Row
              feature="SmartManagement"
              getx
              rxget
              note="full, onlyBuilder, keepFactory — unchanged."
            />
            <Row
              feature="Controller lifecycle"
              getx
              rxget
              note="onInit, onReady, onClose, onStart, onDelete — unchanged."
            />
            <Row
              feature="GetxController"
              getx
              rxget="changed"
              note="Now generic: GetxController<T extends GetxState>. State is mandatory and private."
            />
            <Row
              feature="Where Rx may be declared"
              getx
              rxget="changed"
              note="GetX: anywhere. rxget: only inside a GetxState, enforced by lint."
            />
            <Row
              feature="Scoped DI"
              getx={false}
              rxget
              note="New: GetIn / GetInWidget with automatic, scope-correct disposal."
            />
            <Row
              feature="Effect widget"
              getx={false}
              rxget
              note="New: Obl runs a side effect on reactive change without rebuilding."
            />
            <Row
              feature="Code generation"
              getx={false}
              rxget
              note="New: rxget_generator writes the state class and its onClose()."
            />
            <Row
              feature="Lint rules"
              getx={false}
              rxget
              note="New: rxget_lint enforces the architecture rules as you type."
            />
            <Row
              feature="Routing / GetMaterialApp"
              getx
              rxget={false}
              note="Removed. Use Navigator or go_router."
            />
            <Row
              feature="Bindings / GetPage / middleware"
              getx
              rxget={false}
              note="Removed with routing. GetInWidget covers per-screen DI."
            />
            <Row
              feature="Get.snackbar / dialog / bottomSheet"
              getx
              rxget={false}
              note="Removed. Context-free UI hides the element tree from you."
            />
            <Row
              feature="GetConnect (HTTP)"
              getx
              rxget={false}
              note="Removed. Use dio, http, or your own client."
            />
            <Row
              feature="Translations / theming"
              getx
              rxget={false}
              note="Removed. Not a state-management concern."
            />
            <Row
              feature="GetUtils / context extensions"
              getx
              rxget={false}
              note="Removed. Only Get.asap and Get.toEnd remain."
            />
          </tbody>
        </table>
      </div>

      <h2>What changed, and why</h2>

      <h3>GetxController became generic over its state</h3>
      <p>
        In GetX a controller is a bag of fields. Reactive variables, plain
        fields, and methods all live together, and nothing distinguishes state
        from behaviour.
      </p>

      <CodeBlock title="GetX">{`class CounterController extends GetxController {
  var count = 0.obs;        // state
  var name = ''.obs;        // state
  bool isLoading = false;   // also state, but not reactive

  void increment() => count++;   // behaviour
}`}</CodeBlock>

      <p>
        rxget splits the two. The controller holds behaviour; a{" "}
        <code>GetxState</code> object holds data. The type parameter makes the
        pairing explicit and lets the generator target the state class.
      </p>

      <CodeBlock title="rxget">{`class _CounterState extends GetxState {
  final _count = 0.obs;
  final _name = ''.obs;
  bool isLoading = false;

  int get count => _count.value;
  String get name => _name.value;

  @override
  void onClose() {
    _count.close();
    _name.close();
  }
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}`}</CodeBlock>

      <p>
        The payoff is that <code>onClose()</code> on the controller calls{" "}
        <code>state.onClose()</code> automatically, and{" "}
        <code>GetxState.onClose()</code> is abstract — a state class that
        forgets to dispose does not compile.
      </p>

      <h3>Reactive variables became private</h3>
      <p>
        GetX encourages <code>controller.count.value</code> in the view. That
        couples every widget to the reactive type and lets any widget write to
        state that the controller is supposed to own.
      </p>
      <p>
        rxget makes the <code>Rx</code> private and exposes a plain getter, so
        the view reads an <code>int</code>. <code>avoid_public_rx_declaration</code>{" "}
        flags the alternative.
      </p>

      <h3>Dependency scoping stopped being a routing concern</h3>
      <p>
        GetX ties dependency lifetime to routes through <code>Bindings</code>{" "}
        and <code>GetPage</code>. Remove GetX&apos;s router and that mechanism
        goes with it. rxget ties dependency lifetime to the widget tree instead:
      </p>

      <CodeBlock title="scoped to a subtree, not a route">{`GetInWidget(
  dependencies: [
    GetIn<ProfileController>(() => ProfileController()),
    GetIn<SettingsController>(
      () => SettingsController(Get.find<ProfileController>()),
    ),
  ],
  child: const ProfileView(),
)`}</CodeBlock>

      <p>
        When the subtree unmounts, the dependencies are deleted — but only the
        ones that <em>this</em> scope registered. See{" "}
        <a href="/docs/get-in-widget">GetIn Widget</a> for the double-pop bug
        this guard exists to prevent.
      </p>

      <h3>The reactivity engine was rewritten underneath</h3>
      <p>
        The public API of <code>Obx</code> is unchanged, but what happens
        between a write and a rebuild is not. In GetX, an <code>Obx</code>{" "}
        subscribes to every reactive variable it has ever read and only
        unsubscribes when it leaves the tree. rxget diffs the dependencies of
        each build and releases the ones that are no longer read.
      </p>
      <p>
        That is covered in detail in{" "}
        <a href="/docs/internals/reactivity">The Reactivity Engine</a> and{" "}
        <a href="/docs/internals/memory">Memory Management</a>.
      </p>

      <Callout variant="warning" title="rxget is a fork, not a drop-in replacement">
        <p>
          Code that only uses <code>.obs</code>, <code>Obx</code> and{" "}
          <code>Get.find</code> will usually move across untouched. Code that
          uses GetX routing, bindings, or context-free dialogs will not. See{" "}
          <a href="/docs/migration">Migrating from GetX</a> for the mechanical
          steps.
        </p>
      </Callout>

      <h2>Why fork rather than contribute?</h2>
      <p>
        The changes rxget makes are breaking by construction. Requiring a
        private state class, forbidding public <code>Rx</code> fields, and
        deleting routing are not features that can be added to GetX behind a
        flag — they are constraints, and constraints only work when they are
        unconditional. A fork was the honest way to make them.
      </p>

      <PageNav
        prev={{ title: "Design Principles", href: "/docs/philosophy" }}
        next={{ title: "Architecture Rules", href: "/docs/architecture-rules" }}
      />
    </>
  );
}
