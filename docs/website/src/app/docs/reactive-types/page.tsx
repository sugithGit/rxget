import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Reactive Types — rxget",
  description:
    "Every Rx type in rxget: RxInt, RxString, RxBool, RxDouble, RxNum, RxList, RxMap, RxSet, Rx<T>, Rxn<T>, their operators, and the nullable variants.",
};

export default function ReactiveTypesPage() {
  return (
    <>
      <h1>Reactive Types</h1>
      <p className="lead">
        Every reactive value in rxget is an <code>Rx</code>. This page covers
        all of them — the primitives, the collections, the generic wrapper, and
        the nullable variants.
      </p>

      <h2>Creating one</h2>
      <p>There are two equivalent forms.</p>

      <CodeBlock>{`// .obs extension — the usual way
final _count = 0.obs;          // RxInt
final _name  = 'John'.obs;     // RxString
final _ok    = true.obs;       // RxBool
final _price = 9.99.obs;       // RxDouble
final _items = <String>[].obs; // RxList<String>

// Explicit constructor — needed for custom types and nullables
final _count = RxInt(0);
final _user  = Rx<User>(User.empty());
final _maybe = Rxn<User>();    // starts as null`}</CodeBlock>

      <Callout variant="note" title="Rx<T>() vs .obs<T>()">
        <p>
          On a custom type, <code>myObject.obs</code> infers{" "}
          <code>Rx&lt;MyType&gt;</code> through the{" "}
          <code>RxT&lt;T extends Object&gt;</code> extension. If inference picks
          the wrong type — common with subclasses — use{" "}
          <code>Rx&lt;Base&gt;(value)</code> or the newer{" "}
          <code>value.obs&lt;Base&gt;()</code> form, which takes the type from
          context rather than the receiver.
        </p>
      </Callout>

      <h2>The type table</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Type</th>
              <th className="py-2 pr-4 font-semibold">Wraps</th>
              <th className="py-2 pr-4 font-semibold">Nullable form</th>
              <th className="py-2 font-semibold">Created by</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground font-mono text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxInt</td>
              <td className="py-2 pr-4">int</td>
              <td className="py-2 pr-4">RxnInt</td>
              <td className="py-2">0.obs</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxDouble</td>
              <td className="py-2 pr-4">double</td>
              <td className="py-2 pr-4">RxnDouble</td>
              <td className="py-2">0.0.obs</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxNum</td>
              <td className="py-2 pr-4">num</td>
              <td className="py-2 pr-4">RxnNum</td>
              <td className="py-2">RxNum(0)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxString</td>
              <td className="py-2 pr-4">String</td>
              <td className="py-2 pr-4">RxnString</td>
              <td className="py-2">&apos;&apos;.obs</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxBool</td>
              <td className="py-2 pr-4">bool</td>
              <td className="py-2 pr-4">RxnBool</td>
              <td className="py-2">false.obs</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxList&lt;E&gt;</td>
              <td className="py-2 pr-4">List&lt;E&gt;</td>
              <td className="py-2 pr-4">—</td>
              <td className="py-2">&lt;E&gt;[].obs</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxMap&lt;K,V&gt;</td>
              <td className="py-2 pr-4">Map&lt;K,V&gt;</td>
              <td className="py-2 pr-4">—</td>
              <td className="py-2">&lt;K,V&gt;&#123;&#125;.obs</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">RxSet&lt;E&gt;</td>
              <td className="py-2 pr-4">Set&lt;E&gt;</td>
              <td className="py-2 pr-4">—</td>
              <td className="py-2">&lt;E&gt;&#123;&#125;.obs</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Rx&lt;T&gt;</td>
              <td className="py-2 pr-4">any T</td>
              <td className="py-2 pr-4">Rxn&lt;T&gt;</td>
              <td className="py-2">obj.obs</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Reading and writing</h2>

      <CodeBlock>{`final _count = 0.obs;

_count.value;          // read  — registers a dependency inside Obx
_count.value = 5;      // write — notifies listeners
_count.value++;        // read-modify-write

_count(7);             // call syntax: writes 7 and returns it
_count();              // call with no argument: reads

_count.string;         // '7' — same as value.toString()
'\$_count';             // '7' — toString() delegates to value`}</CodeBlock>

      <Callout variant="warning" title="Writing the same value does nothing">
        <p>
          <code>Rx</code> compares before notifying: assigning a value equal to
          the current one does not rebuild anything. For mutable objects whose
          identity did not change, that means <code>==</code> may report equal
          even though the contents changed. Use <code>refresh()</code> or{" "}
          <code>trigger()</code> — see below.
        </p>
      </Callout>

      <h2>Primitive operators</h2>
      <p>
        Numeric and string <code>Rx</code> types forward the usual operators to
        their value, so they read naturally in expressions.
      </p>

      <CodeBlock>{`final _n = 10.obs;

_n + 5;        // 15
_n - 5;        // 5
_n * 2;        // 20
_n / 4;        // 2.5
_n ~/ 3;       // 3
_n % 3;        // 1
_n > 5;        // true
_n.isEven;     // true  (RxInt)
_n.abs();      // 10
_n.round();    // 10

final _flag = false.obs;
_flag.toggle();   // flips the value
_flag.isTrue;     // false
_flag.isFalse;    // true
_flag & true;     // logical and
_flag | true;     // logical or

final _s = 'hello'.obs;
_s + ' world';    // 'hello world'
_s.isEmpty;       // false
_s.contains('ell');`}</CodeBlock>

      <h2>Collections</h2>
      <p>
        <code>RxList</code>, <code>RxMap</code> and <code>RxSet</code> implement
        their Dart interfaces, so mutating methods work directly and notify
        automatically.
      </p>

      <CodeBlock>{`final _items = <String>[].obs;

_items.add('a');
_items.addAll(['b', 'c']);
_items.remove('a');
_items.removeWhere((e) => e.startsWith('b'));
_items.insert(0, 'z');
_items.sort();
_items.clear();

// read like a normal list
_items.length;
_items.first;
_items[0];
_items.where((e) => e.isNotEmpty);`}</CodeBlock>

      <h3>Conditional and bulk helpers</h3>

      <CodeBlock>{`_items.addIf(user.isAdmin, 'admin-panel');
_items.addAllIf(isLoggedIn, ['profile', 'settings']);
_items.addNonNull(maybeValue);      // skips null

_items.assign('only');              // clear, then add one
_items.assignAll(['a', 'b', 'c']);  // clear, then add many`}</CodeBlock>

      <Callout variant="tip" title="assignAll vs value =">
        <p>
          <code>assignAll</code> replaces the contents of the existing list and
          notifies once. Assigning <code>_items.value = [...]</code> swaps the
          underlying list, which also notifies — but only if the new list is{" "}
          <code>!=</code> the old one. For lists that compare by identity, both
          work; <code>assignAll</code> is the clearer intent.
        </p>
      </Callout>

      <h2>Custom types</h2>

      <CodeBlock>{`class User {
  User(this.name, this.age);
  String name;
  int age;
}

final _user = Rx<User>(User('Ana', 30));

// Reading a field is fine
_user.value.name;

// Mutating a field does NOT notify — the Rx never saw a write
_user.value.name = 'Bea';          // nothing rebuilds
_user.refresh();                   // force listeners to fire

// Or replace the whole value
_user.value = User('Bea', 30);     // notifies if != previous

// update() gives you the current value to mutate, then notifies
_user.update((u) {
  u!.name = 'Bea';
});`}</CodeBlock>

      <h3>refresh() vs trigger()</h3>
      <p>
        Both force a notification. <code>refresh()</code> notifies widget
        listeners. <code>trigger(value)</code> additionally pushes the value
        onto the stream even when it is unchanged, which matters for{" "}
        <a href="/docs/workers">workers</a>:
      </p>

      <CodeBlock>{`final _seconds = 2.obs;
ever(_seconds, (v) => print('got \$v'));

_seconds.value = 2;    // no output — same value
_seconds.trigger(2);   // prints 'got 2' — forced through the stream
_seconds.refresh();    // rebuilds widgets, does not re-emit to the stream`}</CodeBlock>

      <h2>Nullable values</h2>

      <CodeBlock>{`final _user = Rxn<User>();       // Rx<User?> starting at null

_user.value;                     // User?
_user.value = User('Ana', 30);
_user.value = null;              // back to null

final _count = RxnInt();         // int?
_count.value ??= 0;`}</CodeBlock>

      <Callout variant="note" title="Why Rxn exists">
        <p>
          <code>Rx&lt;T&gt;.call()</code> ignores a <code>null</code> argument,
          so <code>rx(null)</code> cannot clear a value.{" "}
          <code>Rxn&lt;T&gt;</code> is <code>Rx&lt;T?&gt;</code> with that in
          mind — assign <code>null</code> through <code>.value</code> directly.
        </p>
      </Callout>

      <h2>Streams</h2>
      <p>
        Every <code>Rx</code> exposes a broadcast stream, which is what{" "}
        <a href="/docs/workers">workers</a> are built on.
      </p>

      <CodeBlock>{`final sub = _count.listen((v) => print('now \$v'));
await sub.cancel();

// listenAndPump fires immediately with the current value first
_count.listenAndPump((v) => print('now \$v'));

// bind an external stream into the Rx
_count.bindStream(socket.counterStream);

_count.stream;      // Stream<int>
_count.subject;     // the underlying StreamController`}</CodeBlock>

      <Callout variant="warning" title="The stream is created lazily">
        <p>
          Touching <code>.stream</code>, <code>.subject</code>,{" "}
          <code>listen()</code> or a worker allocates a{" "}
          <code>StreamController</code> for that variable. An <code>Rx</code>{" "}
          only ever read by <code>Obx</code> never allocates one.
        </p>
      </Callout>

      <h2>Closing</h2>
      <p>
        Every <code>Rx</code> must be closed exactly once, in the{" "}
        <code>onClose()</code> of the <code>GetxState</code> that owns it.
      </p>

      <CodeBlock>{`@override
void onClose() {
  _count.close();
  _items.close();
}`}</CodeBlock>

      <p>
        Using one after closing throws an error that names the variable, where
        it was declared, and where it was closed:
      </p>

      <CodeBlock language="text" title="debug output">{`The RxInt "CounterState.count" was used after being closed.

RxInt.value was called after close(). A closed reactive variable can no
longer be observed, written to or listened to.

The RxInt was declared at:
  package:my_app/counter_controller.dart 12:24
and closed at:
  package:my_app/counter_controller.dart 21:12`}</CodeBlock>

      <p>
        Set a <code>debugLabel</code> when several variables share a line, and
        turn the capture off with{" "}
        <code>RxLifecycleDebug.captureStackTraces = false</code> when
        benchmarking in debug mode.
      </p>

      <CodeBlock>{`final _a = 8.obs..debugLabel = 'CounterState.a';`}</CodeBlock>

      <PageNav
        prev={{ title: "State Management", href: "/docs/state-management" }}
        next={{ title: "Controllers & State", href: "/docs/controllers" }}
      />
    </>
  );
}
