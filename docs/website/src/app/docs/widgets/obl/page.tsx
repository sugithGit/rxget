import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Obl — rxget",
  description:
    "Obl runs a side effect when reactive state changes, without rebuilding the UI. For navigation, snackbars, analytics and focus.",
};

export default function OblPage() {
  return (
    <>
      <h1>Obl — reactive effects</h1>
      <p className="lead">
        <code>Obl</code> watches reactive values and runs a callback when they
        change — but never rebuilds its child. It is the widget for
        &ldquo;when state reaches X, <em>do</em> something&rdquo;.
      </p>

      <Callout variant="note" title="New in rxget">
        <p>
          <code>Obl</code> has no GetX equivalent. In GetX the same job is done
          with a worker in <code>onInit</code>, which works but puts navigation
          and UI concerns inside the controller.
        </p>
      </Callout>

      <h2>The shape</h2>

      <CodeBlock>{`Obl(
  () {
    // read reactive values to subscribe...
    if (controller.state.currentStep == 3) {
      // ...then act on them
      Navigator.of(context).pushNamed('/summary');
    }
  },
  child: const StepForm(),   // returned as-is, never rebuilt
)`}</CodeBlock>

      <p>
        The effect runs once during build to register its dependencies, and
        again whenever any of them change. <code>child</code> is returned
        untouched — <code>Obl</code> adds no rebuild cost to the subtree it
        wraps.
      </p>

      <h2>Obx vs Obl</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">Obx</th>
              <th className="py-2 font-semibold">Obl</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">On change</td>
              <td className="py-2 pr-4">Rebuilds the builder</td>
              <td className="py-2">Runs the effect</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Child</td>
              <td className="py-2 pr-4">Rebuilt</td>
              <td className="py-2">Untouched</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Returns</td>
              <td className="py-2 pr-4">A widget</td>
              <td className="py-2">void</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Use for</td>
              <td className="py-2 pr-4">Showing state</td>
              <td className="py-2">Reacting to state</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Use cases</h2>

      <h3>Navigate when a flow completes</h3>

      <CodeBlock>{`Obl(
  () {
    if (controller.state.isCheckoutComplete) {
      Navigator.of(context).pushReplacementNamed('/receipt');
    }
  },
  child: const CheckoutForm(),
)`}</CodeBlock>

      <h3>Show a snackbar on error</h3>

      <CodeBlock>{`Obl(
  () {
    final error = controller.state.lastError;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error)),
      );
    }
  },
  child: const OrderList(),
)`}</CodeBlock>

      <h3>Move focus</h3>

      <CodeBlock>{`Obl(
  () {
    if (controller.state.currentField == 2) {
      _otpFocusNode.requestFocus();
    }
  },
  child: const OtpFields(),
)`}</CodeBlock>

      <h3>Analytics</h3>

      <CodeBlock>{`Obl(
  () => analytics.log('step_viewed', controller.state.currentStep),
  child: const Wizard(),
)`}</CodeBlock>

      <h2>Effects are coalesced and asynchronous</h2>
      <p>
        After the first run, the effect is scheduled on a microtask rather than
        running inline. That keeps it out of the build phase — so navigating or
        showing a snackbar from inside it is safe — and collapses a burst of
        writes into a single run.
      </p>

      <CodeBlock>{`// One effect run, not three
controller.state
  .._a.value = 1
  .._b.value = 2
  .._c.value = 3;`}</CodeBlock>

      <Callout variant="warning" title="The effect is not a one-shot">
        <p>
          It runs on <em>every</em> change to anything it read. Guard against
          repeating an action — a navigation that fires twice pushes two routes.
          Use a flag in the state, or a <code>once</code> worker instead.
        </p>
      </Callout>

      <CodeBlock title="guarding a one-time action">{`class _CheckoutState extends GetxState {
  final _isComplete = false.obs;
  bool hasNavigated = false;   // plain field, not reactive

  bool get isComplete => _isComplete.value;

  @override
  void onClose() => _isComplete.close();
}

Obl(
  () {
    if (controller.state.isComplete && !controller.state.hasNavigated) {
      controller.state.hasNavigated = true;
      Navigator.of(context).pushReplacementNamed('/receipt');
    }
  },
  child: const CheckoutForm(),
)`}</CodeBlock>

      <h2>Obl or a worker?</h2>
      <p>Both react to change. The difference is what they can reach.</p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Need</th>
              <th className="py-2 font-semibold">Use</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                BuildContext — navigation, snackbar, theme
              </td>
              <td className="py-2 font-mono text-xs">Obl</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                Effect tied to a screen being on-screen
              </td>
              <td className="py-2 font-mono text-xs">Obl</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Persist to disk, call an API</td>
              <td className="py-2 font-mono text-xs">ever</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Debounce or throttle</td>
              <td className="py-2 font-mono text-xs">debounce / interval</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Run exactly once</td>
              <td className="py-2 font-mono text-xs">once</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        The dividing line is ownership: a worker lives in the controller and
        runs whether or not anything is on screen. <code>Obl</code> lives in the
        tree and stops when the screen is gone — which is what you want for
        anything that touches the UI.
      </p>

      <PageNav
        prev={{ title: "Obx", href: "/docs/widgets/obx" }}
        next={{ title: "GetBuilder", href: "/docs/widgets/get-builder" }}
      />
    </>
  );
}
