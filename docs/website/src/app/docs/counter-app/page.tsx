import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Counter App — rxget",
  description:
    "A complete counter app in rxget, built step by step: the state class, the controller, scoped injection and the reactive view.",
};

export default function CounterAppPage() {
  return (
    <>
      <h1>Counter App</h1>
      <p className="lead">
        The whole of rxget in one small app — a state class, a controller,
        scoped injection, and a view that rebuilds one <code>Text</code>.
      </p>

      <h2>Step 1 — the state</h2>
      <p>
        State lives in a <code>GetxState</code> subclass. It must be private,
        its reactive fields must be private, and it must say what it closes.
      </p>

      <CodeBlock title="lib/counter_controller.dart">{`import 'package:rxget/rxget.dart';

class _CounterState extends GetxState {
  final _count = 0.obs;

  // The view reads a plain int — it never sees the Rx.
  int get count => _count.value;

  @override
  void onClose() {
    _count.close();
  }
}`}</CodeBlock>

      <Callout variant="note" title="Why all the underscores">
        <p>
          The class is private so no widget can import it. The field is private
          so no widget can write to it. Both are enforced — the first by an
          assertion in <code>GetxController</code>, the second by{" "}
          <a href="/docs/lint">rxget_lint</a>. See{" "}
          <a href="/docs/architecture-rules">Architecture Rules</a>.
        </p>
      </Callout>

      <h2>Step 2 — the controller</h2>
      <p>
        The controller holds behaviour and is generic over its state. It is the
        only thing that writes.
      </p>

      <CodeBlock title="lib/counter_controller.dart">{`class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;

  void decrement() {
    if (state.count > 0) {
      state._count.value--;
    }
  }

  void reset() => state._count.value = 0;
}`}</CodeBlock>

      <p>
        You never write <code>onClose()</code> here for the reactive variables —{" "}
        <code>GetxController.onClose()</code> calls{" "}
        <code>state.onClose()</code> automatically.
      </p>

      <h2>Step 3 — scope the controller</h2>
      <p>
        <code>GetInWidget</code> registers the controller when the widget mounts
        and deletes it when the widget leaves the tree.
      </p>

      <CodeBlock title="lib/main.dart">{`import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';

import 'counter_controller.dart';

void main() => runApp(const CounterApp());

class CounterApp extends StatelessWidget {
  const CounterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'rxget counter',
      theme: ThemeData(colorSchemeSeed: Colors.teal, useMaterial3: true),
      home: GetInWidget(
        dependencies: [GetIn<CounterController>(() => CounterController())],
        child: const CounterPage(),
      ),
    );
  }
}`}</CodeBlock>

      <h2>Step 4 — the view</h2>
      <p>
        <code>Get.find</code> takes no <code>BuildContext</code>, so resolve the
        controller wherever you need it — here, once at the top of{" "}
        <code>build</code>.
      </p>

      <CodeBlock title="lib/main.dart">{`class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<CounterController>();

    return Scaffold(
      appBar: AppBar(title: const Text('rxget counter')),
      body: Center(
        // Only this Text rebuilds when count changes.
        child: Obx(
          () => Text(
            '\${controller.state.count}',
            style: Theme.of(context).textTheme.displayLarge,
          ),
        ),
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: controller.decrement,
            child: const Icon(Icons.remove),
          ),
          const SizedBox(width: 12),
          FloatingActionButton(
            onPressed: controller.increment,
            child: const Icon(Icons.add),
          ),
        ],
      ),
    );
  }
}`}</CodeBlock>

      <Callout variant="tip" title="Note where the Obx is">
        <p>
          It wraps the <code>Text</code>, not the <code>Scaffold</code>. The
          app bar and the buttons are built once. Keeping the reactive scope
          small is the single most useful habit in rxget.
        </p>
      </Callout>

      <h2>The same thing with the generator</h2>
      <p>
        For a two-field state the handwritten version is fine. As states grow,
        the <a href="/docs/codegen">generator</a> removes the repetition and
        keeps <code>onClose()</code> in step with the fields.
      </p>

      <CodeBlock title="lib/counter_controller.dart">{`import 'package:rxget/rxget.dart';
import 'package:rxget_annotation/rxget_annotation.dart';

part 'counter_controller.g.dart';

@getxState
class CounterState {
  CounterState({this.count = 0, this.title = 'Counter', this.isEditing = false});

  int count;            // → Rx<int>
  String title;         // → Rx<String>

  @update
  bool isEditing;       // → plain bool, use update()
}

class CounterController extends GetxController<_CounterState> {
  CounterController({int initialCount = 0})
      : state = _CounterState(count: initialCount);

  @override
  final _CounterState state;

  void increment() => state._count.value++;

  void toggleEditing() {
    state.isEditing = !state.isEditing;
    update();
  }
}`}</CodeBlock>

      <CodeBlock language="bash">{`dart run build_runner build --delete-conflicting-outputs`}</CodeBlock>

      <p>
        <code>_CounterState</code> is written for you — private class, private{" "}
        <code>Rx</code> fields, public getters and setters, and an{" "}
        <code>onClose()</code> that closes exactly the reactive ones.
      </p>

      <h2>Adding a manual rebuild</h2>
      <p>
        <code>isEditing</code> is a plain field, so it rebuilds through{" "}
        <code>update()</code> and a <code>GetBuilder</code> rather than{" "}
        <code>Obx</code>:
      </p>

      <CodeBlock>{`Column(children: [
  // reactive — rebuilds on every count change
  Obx(() => Text('\${controller.state.count}')),

  // manual — rebuilds only when update() is called
  GetBuilder<CounterController>(
    builder: (c) => Switch(
      value: c.state.isEditing,
      onChanged: (_) => c.toggleEditing(),
    ),
  ),
])`}</CodeBlock>

      <p>
        Mixing the two in one controller is normal — see{" "}
        <a href="/docs/state-management">State Management</a>.
      </p>

      <h2>Testing it</h2>

      <CodeBlock title="test/counter_test.dart">{`import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

import 'package:my_app/counter_controller.dart';

void main() {
  tearDown(Get.reset);

  test('increment raises the count', () {
    final c = CounterController()..onStart();

    expect(c.state.count, 0);
    c.increment();
    expect(c.state.count, 1);

    c.onDelete();          // runs onClose, disposes the state
    expect(c.isClosed, isTrue);
  });

  test('decrement stops at zero', () {
    final c = CounterController()..onStart();
    c.decrement();
    expect(c.state.count, 0);
    c.onDelete();
  });
}`}</CodeBlock>

      <p>
        The full example lives in{" "}
        <code>examples/counter_example</code> in the repository.
      </p>

      <PageNav
        prev={{ title: "Installation", href: "/docs/installation" }}
        next={{ title: "Cheat Sheet", href: "/docs/cheat-sheet" }}
      />
    </>
  );
}
