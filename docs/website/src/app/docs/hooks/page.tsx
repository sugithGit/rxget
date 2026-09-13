import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Hooks — rxget",
  description:
    "hooks_rxget and useGetIn: scoping a rxget dependency to a HookWidget instead of a GetInWidget.",
};

export default function HooksPage() {
  return (
    <>
      <h1>Hooks</h1>
      <p className="lead">
        <code>hooks_rxget</code> bridges rxget and{" "}
        <code>flutter_hooks</code>. It is one hook —{" "}
        <code>useGetIn</code> — which scopes a dependency to a{" "}
        <code>HookWidget</code> instead of to a <code>GetInWidget</code>.
      </p>

      <h2>Setup</h2>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dependencies:
  rxget: ^0.1.3
  flutter_hooks: ^0.21.3
  hooks_rxget: ^0.0.1`}</CodeBlock>

      <h2>useGetIn</h2>

      <CodeBlock>{`import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_rxget/hooks_rxget.dart';
import 'package:rxget/rxget.dart';

class ProfileView extends HookWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = useGetIn(
      GetIn<ProfileController>(() => ProfileController()),
    );

    return Obx(() => Text(controller.state.name));
  }
}`}</CodeBlock>

      <p>
        The hook registers the dependency when the widget first builds, returns
        the resolved instance, and disposes it when the widget is removed — the
        same contract as <code>GetInWidget</code>, expressed as a hook.
      </p>

      <h2>How it works</h2>
      <p>
        <code>GetIn</code> implements <code>GetInBase</code>, whose entire
        surface is <code>register()</code> and <code>dispose()</code>. The hook
        calls one in <code>initHook</code> and the other in{" "}
        <code>dispose</code>:
      </p>

      <CodeBlock title="use_get_in.dart">{`class _UseGetInState<T> extends HookState<T, _UseGetIn<T>> {
  late final GetIn<T> _getIn;

  @override
  void initHook() {
    _getIn = hook.getIn;
    _getIn.register();
    super.initHook();
  }

  @override
  T build(BuildContext context) => Get.find<T>(tag: _getIn.tag);

  @override
  void dispose() {
    _getIn.dispose();
    super.dispose();
  }
}`}</CodeBlock>

      <p>
        That means the registration guard applies here too: if a parent scope
        already registered the type, this hook uses it and does not delete it.
      </p>

      <h2>Several dependencies</h2>

      <CodeBlock>{`class CheckoutView extends HookWidget {
  const CheckoutView({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = useGetIn(GetIn<CartController>(() => CartController()));
    final payment = useGetIn(
      GetIn<PaymentController>(() => PaymentController(cart)),
    );

    return Obx(() => CheckoutBody(
      items: cart.state.items,
      method: payment.state.method,
    ));
  }
}`}</CodeBlock>

      <p>
        Hooks run in order, so a later <code>useGetIn</code> can take an earlier
        one&apos;s instance directly as a constructor argument.
      </p>

      <Callout variant="warning" title="Hook rules apply">
        <p>
          <code>useGetIn</code> must be called unconditionally, at the top level
          of <code>build</code> — never inside an <code>if</code> or a loop. The
          hook order has to be identical on every build.
        </p>
      </Callout>

      <CodeBlock>{`// BAD
if (isLoggedIn) {
  final c = useGetIn(GetIn<ProfileController>(() => ProfileController()));
}

// GOOD — register unconditionally, branch on the result
final c = useGetIn(GetIn<ProfileController>(() => ProfileController()));
if (!isLoggedIn) return const LoginPrompt();`}</CodeBlock>

      <h2>Tagged instances</h2>

      <CodeBlock>{`final inbox = useGetIn(
  GetIn<ListController>(() => ListController(), tag: 'inbox'),
);
final archive = useGetIn(
  GetIn<ListController>(() => ListController(), tag: 'archive'),
);`}</CodeBlock>

      <h2>useGetIn or GetInWidget?</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">useGetIn</th>
              <th className="py-2 font-semibold">GetInWidget</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Requires</td>
              <td className="py-2 pr-4">HookWidget</td>
              <td className="py-2">Any widget</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Scope</td>
              <td className="py-2 pr-4">This widget</td>
              <td className="py-2">The whole subtree</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">
                Returns the instance
              </td>
              <td className="py-2 pr-4">Yes, directly</td>
              <td className="py-2">No — use Get.find</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Best for</td>
              <td className="py-2 pr-4">Hook-based codebases</td>
              <td className="py-2">Feature and screen scoping</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        If your app already uses <code>flutter_hooks</code>,{" "}
        <code>useGetIn</code> keeps dependency scoping in the same place as
        every other hook. If it does not, <code>GetInWidget</code> covers the
        same ground without adding a dependency.
      </p>

      <PageNav
        prev={{ title: "Lint Rules", href: "/docs/lint" }}
        next={{ title: "The Reactivity Engine", href: "/docs/internals/reactivity" }}
      />
    </>
  );
}
