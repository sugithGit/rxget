import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Migrating from GetX — rxget",
  description:
    "A step-by-step migration from GetX to rxget: what to replace first, the mechanical edits, what has no equivalent, and how to do it incrementally.",
};

export default function MigrationPage() {
  return (
    <>
      <h1>Migrating from GetX</h1>
      <p className="lead">
        The state and DI parts port almost mechanically. Routing, dialogs and
        <code> GetConnect</code> have no equivalent and must be replaced first.
      </p>

      <Callout variant="warning" title="Do the removals before the port">
        <p>
          rxget cannot coexist with GetX in one file — both export{" "}
          <code>Get</code>, <code>Obx</code> and <code>GetxController</code>, so
          the imports collide. Replace GetX&apos;s non-state features while
          still on GetX, then switch the dependency.
        </p>
      </Callout>

      <h2>Step 1 — inventory</h2>

      <CodeBlock language="bash">{`# What of GetX are you actually using?
grep -rn "Get\\.to\\|Get\\.off\\|Get\\.back\\|GetMaterialApp\\|GetPage" lib/
grep -rn "Get\\.snackbar\\|Get\\.dialog\\|Get\\.bottomSheet" lib/
grep -rn "GetConnect\\|Get\\.find\\|Get\\.put\\|Bindings" lib/
grep -rn "Translations\\|\\.tr\\b\\|Get\\.changeTheme" lib/`}</CodeBlock>

      <p>
        The first, second and fourth groups are the work. The third ports
        directly.
      </p>

      <h2>Step 2 — replace routing</h2>
      <p>
        Still on GetX. Swap <code>GetMaterialApp</code> for{" "}
        <code>MaterialApp</code> and GetX navigation for your router of choice.
      </p>

      <CodeBlock>{`// Before
GetMaterialApp(
  getPages: [
    GetPage(name: '/profile', page: () => ProfileView(),
            binding: ProfileBinding()),
  ],
)
Get.toNamed('/profile');
Get.back();

// After — go_router, or plain Navigator
MaterialApp.router(routerConfig: router);
context.push('/profile');
context.pop();`}</CodeBlock>

      <p>
        Bindings become <code>GetInWidget</code> around the screen:
      </p>

      <CodeBlock>{`// Before
class ProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => ProfileController());
  }
}

// After
GoRoute(
  path: '/profile',
  builder: (_, __) => GetInWidget(
    dependencies: [GetIn<ProfileController>(() => ProfileController())],
    child: const ProfileView(),
  ),
)`}</CodeBlock>

      <h2>Step 3 — replace context-free UI</h2>

      <CodeBlock>{`// Before — from a controller
Get.snackbar('Error', message);
Get.dialog(const ConfirmDialog());

// After — surface it as state, act on it in the tree
class _CheckoutState extends GetxState {
  final _error = Rxn<String>();
  String? get error => _error.value;

  @override
  void onClose() => _error.close();
}

Obl(
  () {
    final error = controller.state.error;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error)),
      );
    }
  },
  child: const CheckoutForm(),
)`}</CodeBlock>

      <p>
        <a href="/docs/widgets/obl">Obl</a> exists for exactly this. It is more
        code than <code>Get.snackbar</code>, and it keeps UI in the tree where a
        test can find it.
      </p>

      <h2>Step 4 — replace GetConnect and translations</h2>

      <CodeBlock>{`// Before
class Api extends GetConnect {
  Future<Response> user() => get('/user');
}
Text('hello'.tr);

// After
final dio = Dio();
final response = await dio.get('/user');
Text(AppLocalizations.of(context)!.hello);   // flutter_localizations, intl, slang`}</CodeBlock>

      <h2>Step 5 — switch the dependency</h2>

      <CodeBlock language="yaml">{`dependencies:
-  get: ^4.6.6
+  rxget: ^0.1.3`}</CodeBlock>

      <CodeBlock language="bash">{`# update imports across the project
grep -rl "package:get/get.dart" lib/ \\
  | xargs sed -i '' "s|package:get/get.dart|package:rxget/rxget.dart|g"`}</CodeBlock>

      <h2>Step 6 — port the controllers</h2>
      <p>
        This is the only non-mechanical part.{" "}
        <code>GetxController</code> is now generic over a private{" "}
        <code>GetxState</code>.
      </p>

      <CodeBlock title="before">{`class CounterController extends GetxController {
  var count = 0.obs;
  var name = ''.obs;
  bool isLoading = false;

  void increment() => count++;
  void setName(String v) => name.value = v;
}`}</CodeBlock>

      <CodeBlock title="after">{`class _CounterState extends GetxState {
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
  void setName(String v) => state._name.value = v;
}`}</CodeBlock>

      <p>The four mechanical edits per controller:</p>
      <ol>
        <li>
          Move every field into a new <code>_XState extends GetxState</code>.
        </li>
        <li>
          Prefix each <code>Rx</code> with <code>_</code> and add a public
          getter.
        </li>
        <li>
          Write <code>onClose()</code> closing every <code>Rx</code> — or let
          the <a href="/docs/codegen">generator</a> do it.
        </li>
        <li>
          Make the controller{" "}
          <code>GetxController&lt;_XState&gt;</code> and override{" "}
          <code>state</code>.
        </li>
      </ol>

      <h3>Then fix the views</h3>

      <CodeBlock>{`// Before
Obx(() => Text('\${controller.count.value}'));
Obx(() => Text(controller.name.value));

// After
Obx(() => Text('\${controller.state.count}'));
Obx(() => Text(controller.state.name));`}</CodeBlock>

      <Callout variant="tip" title="Let the generator do step 6">
        <p>
          For a controller with many fields, write the schema class and let{" "}
          <code>rxget_generator</code> produce the private state, the getters
          and <code>onClose()</code>. On a large migration this is the
          difference between an afternoon and a week.
        </p>
      </Callout>

      <h2>Step 7 — scope the dependencies</h2>

      <CodeBlock>{`// Before — registered somewhere, deleted somewhere else
Get.put(ProfileController());

// After — lifetime is the subtree
GetInWidget(
  dependencies: [GetIn<ProfileController>(() => ProfileController())],
  child: const ProfileView(),
)`}</CodeBlock>

      <h2>Step 8 — turn on the lints</h2>

      <CodeBlock language="yaml" title="analysis_options.yaml">{`plugins:
  rxget_lint:
    path: rxget_lint

diagnostics:
  getx_state_must_be_private: error
  avoid_public_rx_declaration: error
  avoid_rx_outside_getx_state: info    # raise once the migration lands`}</CodeBlock>

      <h2>What ports unchanged</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">GetX</th>
              <th className="py-2 font-semibold">rxget</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground font-mono text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">.obs, Rx types</td>
              <td className="py-2">identical</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Obx, ObxValue</td>
              <td className="py-2">identical</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">GetBuilder, update([ids])</td>
              <td className="py-2">identical</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">GetView, GetWidget</td>
              <td className="py-2">identical</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">ever, once, debounce, interval</td>
              <td className="py-2">identical</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Get.put / find / lazyPut / delete</td>
              <td className="py-2">identical</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">onInit / onReady / onClose</td>
              <td className="py-2">identical</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">SmartManagement</td>
              <td className="py-2">identical</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>What has no equivalent</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">GetX</th>
              <th className="py-2 font-semibold">Replace with</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">GetMaterialApp, Get.to</td>
              <td className="py-2">go_router or Navigator</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Bindings, GetPage</td>
              <td className="py-2">GetInWidget</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Get.snackbar, Get.dialog</td>
              <td className="py-2">ScaffoldMessenger, showDialog, via Obl</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">GetConnect</td>
              <td className="py-2">dio or http</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Translations, .tr</td>
              <td className="py-2">intl, slang</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Get.changeTheme</td>
              <td className="py-2">A ThemeController plus Obx</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">context.width, GetUtils</td>
              <td className="py-2">MediaQuery, your own helpers</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Migrating incrementally</h2>
      <p>
        Because the two packages collide on names, a gradual migration has to be
        feature-by-feature with a hard boundary, not file-by-file. The practical
        order:
      </p>
      <ol>
        <li>Remove GetX routing across the whole app in one change.</li>
        <li>Remove context-free UI and GetConnect.</li>
        <li>
          Switch the dependency and update imports — the app should compile with
          old-style controllers, aside from the typed-state change.
        </li>
        <li>Port controllers one feature at a time.</li>
        <li>Raise the lint severities.</li>
      </ol>

      <Callout variant="note" title="Budget honestly">
        <p>
          Steps 1 and 2 are the expensive ones, and they are really
          &ldquo;stop using GetX as a framework&rdquo; rather than
          &ldquo;adopt rxget&rdquo;. If your app leans on GetX routing, weigh
          that cost before starting.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "vs Riverpod", href: "/docs/compare/riverpod" }}
        next={{ title: "Breaking Changes", href: "/docs/breaking-changes" }}
      />
    </>
  );
}
