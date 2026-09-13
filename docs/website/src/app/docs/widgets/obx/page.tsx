import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Obx — rxget",
  description:
    "The reactive rebuild widget: how dependency tracking works, the ObxError, and every pattern for using it well.",
};

export default function ObxPage() {
  return (
    <>
      <h1>Obx</h1>
      <p className="lead">
        A builder with no arguments that rebuilds when any reactive value read
        inside it changes. It is the widget you will use most.
      </p>

      <CodeBlock>{`Obx(() => Text('\${controller.state.count}'))`}</CodeBlock>

      <p>
        There is no controller parameter and no type argument, because{" "}
        <code>Obx</code> does not care where the value came from. It can observe
        several controllers at once:
      </p>

      <CodeBlock>{`Obx(() => Text(
  '\${cartController.state.itemCount} items · '
  '\${userController.state.name}',
))`}</CodeBlock>

      <h3>Where does <code>controller</code> come from?</h3>
      <p>
        <code>Get.find</code> takes no <code>BuildContext</code>, so there is
        never a <code>Builder</code> or a <code>Consumer</code> to wrap things
        in. Call it right where you need it:
      </p>

      <CodeBlock>{`// Shortest — resolve inline
Obx(() => Text('\${Get.find<CounterController>().state.count}'))

// Resolve once when the builder is more than one line
Obx(() {
  final c = Get.find<CounterController>();
  return Text('\${c.state.count} of \${c.state.total}');
})

// For a whole screen, resolve once at the top of build
class CounterView extends StatelessWidget {
  const CounterView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<CounterController>();
    return Obx(() => Text('\${c.state.count}'));
  }
}`}</CodeBlock>

      <Callout variant="tip" title="No context plumbing">
        <p>
          Resolving inside the builder costs a map lookup per rebuild, not a
          construction — the instance is built once, on first resolution. The
          examples below write a bare <code>controller</code> for brevity;
          assume it came from one of the three forms above.
        </p>
      </Callout>

      <h3>How the dependency is registered</h3>
      <p>
        Reading <code>.value</code> calls <code>reportRead()</code>, which tells
        the currently building <code>Obx</code> to subscribe. That means a read
        must happen <em>inside</em> the builder, during the build.
      </p>

      <CodeBlock>{`// BAD — read happens before the builder runs
final count = controller.state.count;
Obx(() => Text('\$count'));

// BAD — the read happens inside CounterText's build, not this one
Obx(() => CounterText(controller: controller));

// GOOD
Obx(() => Text('\${controller.state.count}'));

// GOOD — read here, pass the plain value down
Obx(() => CounterText(count: controller.state.count));`}</CodeBlock>

      <Callout variant="warning" title="ObxError">
        <p>
          If a builder finishes without reading any observable, rxget throws{" "}
          <code>ObxError</code>. It is deliberately loud: the alternative is a
          widget that silently never updates. If you genuinely want a static
          subtree, do not wrap it in <code>Obx</code>.
        </p>
      </Callout>

      <h3>Dependencies are recalculated every build</h3>
      <p>
        rxget diffs the reads of each build against the previous one and
        releases what is no longer read.
      </p>

      <CodeBlock>{`Obx(() {
  if (!controller.state.isExpanded) {
    return const SizedBox.shrink();   // only isExpanded is a dependency
  }
  return Text(controller.state.body); // body is a dependency only while open
})`}</CodeBlock>

      <p>
        Collapse the panel and the subscription to <code>body</code> is
        dropped, so writes to it stop costing anything. GetX keeps that
        subscription for the life of the widget — see{" "}
        <a href="/docs/internals/memory">Memory Management</a>.
      </p>

      <h3>Rebuilds are coalesced</h3>

      <CodeBlock>{`// A hundred writes in one turn produce one rebuild
for (var i = 0; i < 100; i++) {
  controller.state._count.value = i;
}`}</CodeBlock>

      <p>
        The rebuild is scheduled on a microtask, so it runs after the current
        synchronous work finishes and before the next frame. Writing to three
        different variables an <code>Obx</code> watches also produces one
        rebuild, not three.
      </p>

      <h2>Needing the BuildContext</h2>
      <p>
        <code>Obx</code> passes no context to its builder, but it is an
        ordinary widget — the surrounding <code>build</code> already has one.
      </p>

      <CodeBlock>{`@override
Widget build(BuildContext context) {
  final c = Get.find<CounterController>();
  return Obx(() => Text(
    '\${c.state.count}',
    style: Theme.of(context).textTheme.headlineMedium,
  ));
}`}</CodeBlock>

      <h2>Patterns</h2>

      <h3>Lists</h3>
      <p>
        Put the <code>Obx</code> around the list when the collection changes,
        and around each row when the rows change independently.
      </p>

      <CodeBlock>{`// The collection changes
Obx(() => ListView.builder(
  itemCount: controller.state.items.length,
  itemBuilder: (_, i) => ItemTile(item: controller.state.items[i]),
))

// Each row owns a value that changes on its own
ListView.builder(
  itemCount: items.length,
  itemBuilder: (_, i) => Obx(() => ItemTile(
    item: items[i],
    isSelected: controller.state.selectedIds.contains(items[i].id),
  )),
)`}</CodeBlock>

      <h3>Derived values</h3>
      <p>
        Compute in the state class, not in the builder, so the derivation is
        testable and reused.
      </p>

      <CodeBlock>{`class _CartState extends GetxState {
  final _items = <CartItem>[].obs;

  List<CartItem> get items => _items.value;
  double get total => _items.fold(0, (s, i) => s + i.price);
  bool get isEmpty => _items.isEmpty;

  @override
  void onClose() => _items.close();
}

Obx(() => Text('Total: \${controller.state.total}'))`}</CodeBlock>

      <h3>Conditional subtrees</h3>

      <CodeBlock>{`Obx(() => switch (controller.state.phase) {
  Phase.loading => const Spinner(),
  Phase.error   => ErrorView(message: controller.state.error),
  Phase.ready   => ContentView(data: controller.state.data),
})`}</CodeBlock>

      <h2>Common mistakes</h2>

      <CodeBlock>{`// 1. Reading .value in the view — couples the widget to the reactive type
Obx(() => Text('\${c.state.count.value}'));   // BAD, and lint-flagged
Obx(() => Text('\${c.state.count}'));         // GOOD

// 2. Wrapping too much
Obx(() => Scaffold(...));                    // BAD — rebuilds the screen
Scaffold(body: Obx(() => Text(...)));        // GOOD

// 3. Mutating an object field and expecting a rebuild
c.state.user.name = 'Bea';                   // BAD — the Rx saw no write
c.state.updateName('Bea');                   // GOOD — controller writes .value

// 4. Creating the Rx inside the builder
Obx(() => Text('\${0.obs.value}'));           // BAD — new variable each build`}</CodeBlock>

      <PageNav
        prev={{ title: "Choosing a Widget", href: "/docs/widgets" }}
        next={{ title: "Obl (Effects)", href: "/docs/widgets/obl" }}
      />
    </>
  );
}
