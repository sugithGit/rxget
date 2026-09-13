import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "GetIn Widget — rxget",
  description:
    "Scoped dependency injection: GetIn, GetInBase and GetInWidget, the registration guard, and the double-pop bug it prevents.",
};

export default function GetInWidgetPage() {
  return (
    <>
      <h1>GetIn Widget</h1>
      <p className="lead">
        <code>GetInWidget</code> ties a dependency&apos;s lifetime to a subtree.
        Dependencies are registered when the widget mounts and deleted when it
        unmounts — but only the ones this scope actually registered.
      </p>

      <Callout variant="note" title="New in rxget">
        <p>
          GetX scopes dependencies to <em>routes</em>, through{" "}
          <code>Bindings</code> and <code>GetPage</code>. rxget has no router,
          so it scopes to the widget tree instead — which works with any
          navigation library, or none.
        </p>
      </Callout>

      <h2>Basic use</h2>

      <CodeBlock>{`GetInWidget(
  dependencies: [
    GetIn<ProfileController>(() => ProfileController()),
  ],
  child: const ProfileView(),
)`}</CodeBlock>

      <p>
        Anything inside <code>child</code> can now{" "}
        <code>Get.find&lt;ProfileController&gt;()</code>. When{" "}
        <code>GetInWidget</code> leaves the tree the controller is deleted, its{" "}
        <code>onClose()</code> runs, and its state disposes.
      </p>

      <h2>GetIn</h2>

      <CodeBlock>{`GetIn<T>(
  T Function() builder, {
  bool lazy = true,
  String? tag,
})`}</CodeBlock>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Parameter</th>
              <th className="py-2 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                builder
              </td>
              <td className="py-2">
                Factory for the instance. Must be a function, not a value.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                lazy
              </td>
              <td className="py-2">
                Default <code>true</code> — built on first{" "}
                <code>Get.find</code>. <code>false</code> builds it at mount.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                tag
              </td>
              <td className="py-2">
                Distinguishes several instances of one type.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeBlock>{`GetIn<AuthController>(() => AuthController()),                 // lazy
GetIn<Database>(() => Database(), lazy: false),                // eager
GetIn<ListController>(() => ListController(), tag: 'inbox'),   // tagged`}</CodeBlock>

      <Callout variant="danger" title="Always pass a factory">
        <p>
          <code>GetIn(MyController())</code> does not compile —{" "}
          <code>GetIn</code> takes <code>T Function()</code>. The function is
          what allows the instance to be built lazily and rebuilt after a
          scope is torn down.
        </p>
      </Callout>

      <h2>Several dependencies</h2>
      <p>
        Registration is in list order, and because registration is lazy by
        default, a later entry can resolve an earlier one.
      </p>

      <CodeBlock>{`GetInWidget(
  dependencies: [
    GetIn<ApiService>(() => ApiService()),
    GetIn<AuthRepository>(
      () => AuthRepository(Get.find<ApiService>()),
    ),
    GetIn<ProfileController>(
      () => ProfileController(Get.find<AuthRepository>()),
    ),
  ],
  child: const ProfileView(),
)`}</CodeBlock>

      <Callout variant="warning" title="Typing the list">
        <p>
          Write <code>List&lt;GetInBase&gt;</code> if you annotate the list
          explicitly. Writing <code>List&lt;GetIn&gt;</code> infers{" "}
          <code>GetIn&lt;dynamic&gt;</code>, which <code>GetIn</code> asserts
          against with a message telling you exactly this.
        </p>
      </Callout>

      <h2>The registration guard</h2>
      <p>
        This is the part of <code>GetIn</code> that does not exist in GetX, and
        the reason it was written.
      </p>

      <p>
        Consider Page A, which scopes <code>CartController</code>, pushing Page
        B, which scopes the same controller:
      </p>

      <CodeBlock language="text">{`Page A mounts    → registers CartController      (A owns it)
Page B pushed    → CartController already there  (B does NOT own it)
Page B popped    → B must NOT delete it
Back on Page A   → Get.find<CartController>() still works`}</CodeBlock>

      <p>
        Without the guard, Page B&apos;s unmount would delete the controller
        that Page A still depends on, and the next <code>Get.find</code> on Page
        A would throw. <code>GetIn</code> records whether{" "}
        <em>this</em> instance performed the registration:
      </p>

      <CodeBlock title="get_in.dart">{`void _registerLogic() {
  if (Get.isRegistered<T>(tag: tag)) {
    // Another scope owns it — leave it completely alone.
    _isRegistered = false;
    return;
  }

  if (lazy) {
    Get.lazyPut<T>(_builder, tag: tag, fenix: false);
  } else {
    Get.put<T>(_builder(), tag: tag);
  }

  _isRegistered = true;   // we own it, so we clean it up
}

void _disposeLogic() {
  if (_isRegistered) {
    Get.delete<T>(tag: tag);
  }
}`}</CodeBlock>

      <p>
        The rule is simply: delete only what you registered. A nested scope that
        found the dependency already present never touches it.
      </p>

      <h2>Where to put it</h2>

      <h3>Per screen — the common case</h3>

      <CodeBlock>{`class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return GetInWidget(
      dependencies: [GetIn<ProfileController>(() => ProfileController())],
      child: const ProfileView(),
    );
  }
}`}</CodeBlock>

      <h3>Per feature — shared by several screens</h3>

      <CodeBlock>{`GetInWidget(
  dependencies: [
    GetIn<CheckoutController>(() => CheckoutController()),
    GetIn<PaymentController>(() => PaymentController()),
  ],
  child: const CheckoutFlow(),   // several routes live inside
)`}</CodeBlock>

      <h3>App-wide services</h3>

      <CodeBlock>{`void main() {
  runApp(
    GetInWidget(
      dependencies: [
        GetIn<ApiService>(() => ApiService(), lazy: false),
        GetIn<AuthService>(() => AuthService()),
      ],
      child: const MyApp(),
    ),
  );
}`}</CodeBlock>

      <h2>Reading the dependency</h2>
      <p>
        <code>Get.find</code> needs no <code>BuildContext</code>, so there is
        nothing to wrap. Call it wherever you need the controller — including
        straight inside an <code>Obx</code>.
      </p>

      <CodeBlock>{`GetInWidget(
  dependencies: [GetIn<CounterController>(() => CounterController())],
  child: Obx(() => Text('\${Get.find<CounterController>().state.count}')),
)`}</CodeBlock>

      <p>
        For anything longer than one line, resolve once at the top of the
        builder:
      </p>

      <CodeBlock>{`child: Obx(() {
  final c = Get.find<CounterController>();
  return Text('\${c.state.count} of \${c.state.total}');
}),`}</CodeBlock>

      <p>
        For a whole screen, resolve once at the top of <code>build</code>:
      </p>

      <CodeBlock>{`GetInWidget(
  dependencies: [GetIn<CounterController>(() => CounterController())],
  child: const CounterView(),
)

class CounterView extends StatelessWidget {
  const CounterView({super.key});

  @override
  Widget build(BuildContext context) {
    final c = Get.find<CounterController>();
    return Column(children: [
      Obx(() => Text('\${c.state.count}')),
      ElevatedButton(onPressed: c.increment, child: const Text('+')),
    ]);
  }
}`}</CodeBlock>

      <Callout variant="note" title="Resolving on every rebuild is fine">
        <p>
          <code>Get.find</code> inside a builder runs on each rebuild, but it is
          a hash lookup in a map — not a construction. The instance is created
          once, on the first resolution.
        </p>
      </Callout>

      <h2>Using GetIn without the widget</h2>
      <p>
        <code>GetIn</code> implements <code>GetInBase</code>, which is just{" "}
        <code>register()</code> and <code>dispose()</code>. Anything that has a
        lifecycle can drive it.
      </p>

      <CodeBlock>{`class _MyPageState extends State<MyPage> {
  final _dep = GetIn<PageController>(() => PageController());

  @override
  void initState() {
    super.initState();
    _dep.register();
  }

  @override
  void dispose() {
    _dep.dispose();
    super.dispose();
  }
}`}</CodeBlock>

      <p>
        This is exactly what{" "}
        <a href="/docs/hooks">
          <code>useGetIn</code>
        </a>{" "}
        does for <code>flutter_hooks</code>.
      </p>

      <h2>GetInWidget or Get.put?</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">GetInWidget</th>
              <th className="py-2 font-semibold">Get.put</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Lifetime</td>
              <td className="py-2 pr-4">The subtree</td>
              <td className="py-2">Until deleted by hand</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Cleanup</td>
              <td className="py-2 pr-4">Automatic</td>
              <td className="py-2">Yours to remember</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Nested scopes</td>
              <td className="py-2 pr-4">Guarded</td>
              <td className="py-2">Last delete wins</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Best for</td>
              <td className="py-2 pr-4">Screens and features</td>
              <td className="py-2">App-lifetime services</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PageNav
        prev={{ title: "GetBuilder", href: "/docs/widgets/get-builder" }}
        next={{ title: "Code Generation", href: "/docs/codegen" }}
      />
    </>
  );
}
