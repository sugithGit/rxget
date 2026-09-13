import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Breaking Changes — rxget",
  description:
    "Changes between rxget versions, and the API differences from GetX that will break a direct port.",
};

export default function BreakingChangesPage() {
  return (
    <>
      <h1>Breaking Changes</h1>
      <p className="lead">
        rxget is pre-1.0, so the API can still move. This page records what has
        changed and what breaks when porting from GetX.
      </p>

      <h2>Coming from GetX</h2>
      <p>
        These are the differences that stop a direct port. The full migration
        sequence is in{" "}
        <a href="/docs/migration">Migrating from GetX</a>.
      </p>

      <h3>GetxController is generic over its state</h3>

      <CodeBlock>{`// GetX
class CounterController extends GetxController {
  var count = 0.obs;
}

// rxget
class _CounterState extends GetxState {
  final _count = 0.obs;
  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();
}`}</CodeBlock>

      <p>
        The state class must be private — asserted at construction, so it fails
        on the first run rather than silently.
      </p>

      <h3>Views read values, not .value</h3>

      <CodeBlock>{`// GetX
Obx(() => Text('\${controller.count.value}'));

// rxget
Obx(() => Text('\${controller.state.count}'));`}</CodeBlock>

      <h3>Removed entirely</h3>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Removed</th>
              <th className="py-2 font-semibold">Replace with</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">
                GetMaterialApp, Get.to, Get.off, Get.back
              </td>
              <td className="py-2">go_router or Navigator</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Bindings, GetPage, middleware</td>
              <td className="py-2">GetInWidget</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">
                Get.snackbar, Get.dialog, Get.bottomSheet
              </td>
              <td className="py-2">ScaffoldMessenger / showDialog, via Obl</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">GetConnect</td>
              <td className="py-2">dio or http</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Translations, .tr</td>
              <td className="py-2">intl or slang</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono">Get.changeTheme</td>
              <td className="py-2">A ThemeController plus Obx</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">GetUtils, context extensions</td>
              <td className="py-2">MediaQuery and your own helpers</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Unreleased</h2>

      <h3>The widget surface is now four widgets</h3>
      <p>
        rxget ships <code>Obx</code>, <code>Obl</code>,{" "}
        <code>GetBuilder</code> and <code>GetInWidget</code>. Everything else
        was removed — each was a thin wrapper over one of those four, and
        several were unusable.
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Removed</th>
              <th className="py-2 font-semibold">Replace with</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            {[
              ["GetView<T>", "StatelessWidget + Get.find<T>() — it needs no context"],
              ["GetWidget<S>", "a StatelessWidget that resolves its own controller"],
              ["GetX<T>", "GetInWidget for the lifetime, Obx for the rebuild"],
              ["ObxValue<T>", "Obx reading an Rx you hold in a State"],
              ["Observer", "Obx — the enclosing build already has the context"],
              ["ValueBuilder<T>", "StatefulWidget + setState"],
              ["MixinBuilder<T>", "GetBuilder wrapping an Obx"],
              ["Bind, Binds, Bind.of", "GetInWidget"],
              ["GetWidgetCache, WidgetCache", "no replacement — internal to GetWidget"],
              ["StateController<T>", "reactive fields on your own state class"],
              ["SuperController<T>", "GetxController<_S> with WidgetsBindingObserver"],
              ["FullLifeCycleController, FullLifeCycleMixin", "GetxController<_S> with WidgetsBindingObserver"],
              ["ScrollMixin", "a ScrollController you own"],
              ["GetSingleTickerProviderStateMixin, GetTickerProviderStateMixin", "Flutter's own ticker mixins on a State"],
              ["StateMixin<T>, StateMixin.obx()", "a bool and a nullable String on your state"],
              ["GetStatus and Loading/Success/Error/Empty/CustomStatus", "same — plain reactive fields"],
              ["futurize()", "an async method that sets those fields"],
              ["Value<T>, GetNotifier<T>", "GetxController"],
              ["MiniStream, FastList", "no replacement — unused GetX carry-over"],
            ].map(([a, b]) => (
              <tr key={a} className="border-b border-border/50 align-top">
                <td className="py-2 pr-4 font-mono text-foreground">{a}</td>
                <td className="py-2">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout variant="warning" title="Four of these never worked">
        <p>
          <code>StateController</code>, <code>SuperController</code>,{" "}
          <code>FullLifeCycleController</code> and{" "}
          <code>FullLifeCycleMixin</code> all extended the bare{" "}
          <code>GetxController</code>, which resolves to{" "}
          <code>GetxController&lt;GetxState&gt;</code>. The private-state
          assertion then rejected them, so constructing any of them threw in
          every debug build.
        </p>
      </Callout>

      <h3>Reactive widgets release dependencies they stop reading</h3>
      <p>
        An <code>Obx</code>, <code>Obl</code> or <code>GetX</code> now
        unsubscribes from reactive variables its most recent build did not read.
        Previously — and still, in GetX — a reactive widget kept every
        subscription it had ever made.
      </p>

      <Callout variant="note" title="Behavioural, not API">
        <p>
          Nothing needs to change to benefit. A widget whose reads are constant
          behaves identically. A widget whose reads vary now releases what it
          stopped reading, and stops rebuilding on it.
        </p>
      </Callout>

      <p>
        One case does change observably: a widget that relied on being rebuilt
        by a variable it no longer reads will no longer be rebuilt. That was
        always accidental.
      </p>

      <h3>Unmounting after a variable was closed no longer throws</h3>
      <p>
        Disposing a controller before the widget observing it leaves the tree
        used to throw <code>A RxInt was used after being closed</code>. That
        ordering is normal, and is now handled.
      </p>

      <h3>Better lifecycle errors</h3>
      <p>
        The &ldquo;used after close&rdquo; error now names the variable, the
        line it was declared on, and the line that closed it.
      </p>

      <CodeBlock>{`// opt out when benchmarking in debug mode
RxLifecycleDebug.captureStackTraces = false;
RxLifecycleDebug.stackFrameCount = 16;

// name a variable explicitly
final _a = 8.obs..debugLabel = 'CounterState.a';`}</CodeBlock>

      <h2>0.1.3</h2>
      <ul>
        <li>
          <code>GetIn</code> gained the registration guard, so a nested scope no
          longer deletes a dependency a parent scope owns.
        </li>
      </ul>

      <h2>0.1.2</h2>
      <ul>
        <li>
          Introduced <code>GetxState</code> and{" "}
          <code>GetxController&lt;T&gt;</code>. This is the change that makes
          rxget structurally different from GetX.
        </li>
      </ul>

      <Callout variant="warning" title="Pre-1.0">
        <p>
          Pin an exact version if you need stability. Breaking changes are
          recorded here and in <code>CHANGELOG.md</code>, but minor versions can
          still contain them before 1.0.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "Migrating from GetX", href: "/docs/migration" }}
        next={{ title: "API Reference", href: "/docs/api-reference" }}
      />
    </>
  );
}
