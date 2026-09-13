import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Dependency Injection — rxget",
  description:
    "The complete Get container API: put, lazyPut, putAsync, create, spawn, find, delete, replace, reload, tags, permanence and SmartManagement.",
};

export default function DependencyInjectionPage() {
  return (
    <>
      <h1>Dependency Injection</h1>
      <p className="lead">
        rxget has a global service locator reached through <code>Get</code>. It
        needs no <code>BuildContext</code>, resolves by type, and disposes what
        it created.
      </p>

      <Callout variant="tip" title="Prefer scoped registration">
        <p>
          Everything on this page is the low-level container. For screen-scoped
          dependencies — which is most of them — use{" "}
          <a href="/docs/get-in-widget">GetInWidget</a>, which wraps this API
          and ties lifetime to the widget tree.
        </p>
      </Callout>

      <h2>Registering</h2>

      <h3>Get.put — eager</h3>
      <p>
        Creates the instance now, registers it, starts its lifecycle, and
        returns it.
      </p>

      <CodeBlock>{`final controller = Get.put(CounterController());

Get.put(ApiService(), permanent: true);        // survives smart management
Get.put(CartController(), tag: 'wishlist');    // a second instance of one type`}</CodeBlock>

      <h3>Get.lazyPut — on first use</h3>
      <p>
        Registers a factory. Nothing is constructed until the first{" "}
        <code>Get.find</code>.
      </p>

      <CodeBlock>{`Get.lazyPut<AuthController>(() => AuthController());

// fenix: rebuild the instance if it was disposed and is needed again
Get.lazyPut<CartController>(() => CartController(), fenix: true);`}</CodeBlock>

      <Callout variant="note" title="fenix">
        <p>
          Without <code>fenix</code>, a disposed lazy dependency is gone and a
          later <code>Get.find</code> throws. With{" "}
          <code>fenix: true</code> the factory is kept, so the instance is
          rebuilt on demand. It is the per-dependency version of{" "}
          <code>SmartManagement.keepFactory</code>.
        </p>
      </Callout>

      <h3>Get.putAsync — async construction</h3>

      <CodeBlock>{`await Get.putAsync<Database>(() async {
  final db = Database();
  await db.open();
  return db;
});`}</CodeBlock>

      <h3>Get.create — a new instance per request</h3>
      <p>
        Where <code>put</code> and <code>lazyPut</code> are singletons,{" "}
        <code>create</code> runs its builder on every <code>Get.find</code> —
        useful when each instance of a repeated component needs its own
        controller.
      </p>

      <CodeBlock>{`Get.create<RowController>(() => RowController());

Get.find<RowController>();   // instance A
Get.find<RowController>();   // instance B — a different object`}</CodeBlock>

      <h3>Get.spawn — an independent instance</h3>

      <CodeBlock>{`Get.spawn<CartController>(() => CartController(), permanent: false);`}</CodeBlock>

      <h2>Resolving</h2>

      <CodeBlock>{`final controller = Get.find<CounterController>();
final wishlist  = Get.find<CartController>(tag: 'wishlist');

// Check before resolving
if (Get.isRegistered<AuthController>()) { ... }

// Registered as a lazy factory but not yet constructed?
if (Get.isPrepared<AuthController>()) { ... }

// Full detail
final info = Get.getInstanceInfo<AuthController>();
info.isRegistered;
info.isPermanent;
info.isSingleton;
info.isInit;`}</CodeBlock>

      <p>
        <code>Get.find</code> throws if the type is not registered. It also
        starts the lifecycle on first resolution, so <code>onInit</code> runs
        the first time anything asks for the instance.
      </p>

      <h2>Removing</h2>

      <CodeBlock>{`Get.delete<CounterController>();
Get.delete<CartController>(tag: 'wishlist');
Get.delete<ApiService>(force: true);   // delete even if permanent

Get.deleteAll();                       // everything non-permanent
Get.deleteAll(force: true);            // everything

Get.reload<AuthController>();          // dispose and rebuild from the factory
Get.reloadAll();

Get.reset();                           // clear the entire container`}</CodeBlock>

      <h2>Replacing</h2>
      <p>
        Swap an implementation while keeping the registration&apos;s tag and
        permanence. This is the hook for tests and for feature flags.
      </p>

      <CodeBlock>{`// Eager swap
Get.replace<ApiService>(MockApiService());

// Lazy swap
Get.lazyReplace<ApiService>(() => MockApiService());`}</CodeBlock>

      <CodeBlock title="in a test">{`setUp(() {
  Get.put<ApiService>(FakeApi());
});

tearDown(() {
  Get.reset();     // no state leaks between tests
});`}</CodeBlock>

      <h2>Tags</h2>
      <p>
        A tag distinguishes several instances of one type. Every API that
        registers or resolves takes one.
      </p>

      <CodeBlock>{`Get.put(ListController(), tag: 'inbox');
Get.put(ListController(), tag: 'archive');

Get.find<ListController>(tag: 'inbox');
Get.delete<ListController>(tag: 'archive');`}</CodeBlock>

      <h2>Permanence and SmartManagement</h2>
      <p>
        <code>Get.smartManagement</code> controls what the container is allowed
        to dispose automatically.
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Mode</th>
              <th className="py-2 font-semibold">Behaviour</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                full
              </td>
              <td className="py-2">
                Default. Disposes anything unused and not permanent.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                onlyBuilder
              </td>
              <td className="py-2">
                Only disposes what was started by a builder&apos;s{" "}
                <code>init:</code> or by <code>lazyPut</code>. Anything from{" "}
                <code>Get.put</code> is left alone.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                keepFactory
              </td>
              <td className="py-2">
                Disposes instances but keeps their factories, so they can be
                rebuilt on demand.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeBlock>{`void main() {
  Get.smartManagement = SmartManagement.keepFactory;
  runApp(const MyApp());
}`}</CodeBlock>

      <p>
        <code>permanent: true</code> opts a single dependency out of automatic
        disposal regardless of the mode — the right setting for an app-lifetime
        service.
      </p>

      <h2>Dependencies that need other dependencies</h2>
      <p>
        Resolution order is registration order, so a factory can{" "}
        <code>Get.find</code> anything registered before it.
      </p>

      <CodeBlock>{`Get.put(ApiService());
Get.put(AuthRepository(Get.find<ApiService>()));
Get.lazyPut(() => ProfileController(Get.find<AuthRepository>()));`}</CodeBlock>

      <p>With scoped registration the same ordering applies:</p>

      <CodeBlock>{`GetInWidget(
  dependencies: [
    GetIn<ApiService>(() => ApiService()),
    GetIn<ProfileController>(
      () => ProfileController(Get.find<ApiService>()),
    ),
  ],
  child: const ProfileView(),
)`}</CodeBlock>

      <Callout variant="warning" title="Lazy registration defers the lookup">
        <p>
          With <code>lazy: true</code> — the default for <code>GetIn</code> —
          the builder runs on first <code>Get.find</code>, not at registration.
          That makes the ordering above safe even when the dependency it needs
          is registered later in the same list.
        </p>
      </Callout>

      <h2>Logging</h2>

      <CodeBlock>{`Get.isLogEnable = false;                    // silence the container

Get.log = (String text, {bool isError = false}) {
  myLogger.log(text, error: isError);       // route it somewhere else
};`}</CodeBlock>

      <h2>Scheduling helpers</h2>
      <p>
        Two small utilities for deferring work past the current frame — used
        internally when a controller must be disposed after a build completes.
      </p>

      <CodeBlock>{`await Get.toEnd(() => doSomething());          // run after the current event loop turn
await Get.asap(() => doSomething());           // run now if the condition holds
await Get.asap(() => cleanUp(), condition: () => isSafe);`}</CodeBlock>

      <PageNav
        prev={{ title: "Lifecycle", href: "/docs/lifecycle" }}
        next={{ title: "Workers", href: "/docs/workers" }}
      />
    </>
  );
}
