import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Installation — rxget",
  description:
    "Installing rxget and its optional companion packages: the generator, the lint plugin and the hooks bridge.",
};

export default function InstallationPage() {
  return (
    <>
      <h1>Installation</h1>

      <h2>The core package</h2>

      <CodeBlock language="bash">{`flutter pub add rxget`}</CodeBlock>

      <p>Or by hand:</p>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dependencies:
  rxget: ^0.1.3`}</CodeBlock>

      <h2>Import</h2>

      <CodeBlock>{`import 'package:rxget/rxget.dart';`}</CodeBlock>

      <p>
        One import covers everything — reactive types, widgets, dependency
        injection, workers and the lifecycle.
      </p>

      <Callout variant="warning" title="Not package:get">
        <p>
          rxget is a fork, so older GetX tutorials import{" "}
          <code>package:get/get.dart</code>. The rxget import is{" "}
          <code>package:rxget/rxget.dart</code>. The two cannot be imported into
          the same file — both export <code>Get</code>, <code>Obx</code> and{" "}
          <code>GetxController</code>.
        </p>
      </Callout>

      <h2>Requirements</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Dart SDK
              </td>
              <td className="py-2 font-mono text-xs">&gt;=3.9.0 &lt;4.0.0</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                Flutter
              </td>
              <td className="py-2 font-mono text-xs">&gt;=3.22.0</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Optional packages</h2>
      <p>
        None of these are required. Add them when you want what they do.
      </p>

      <h3>Code generation</h3>
      <p>
        Writes the private state class, its getters and <code>onClose()</code>{" "}
        from a schema. See <a href="/docs/codegen">Code Generation</a>.
      </p>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dependencies:
  rxget_annotation: ^0.0.2

dev_dependencies:
  build_runner: ^2.15.0
  rxget_generator: ^1.0.2`}</CodeBlock>

      <CodeBlock language="bash">{`dart run build_runner build --delete-conflicting-outputs`}</CodeBlock>

      <h3>Lint rules</h3>
      <p>
        Enforces the architecture rules in the editor. See{" "}
        <a href="/docs/lint">Lint Rules</a>.
      </p>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dev_dependencies:
  rxget_lint: ^0.0.1`}</CodeBlock>

      <CodeBlock language="yaml" title="analysis_options.yaml">{`plugins:
  rxget_lint:
    path: rxget_lint

diagnostics:
  getx_state_must_be_private: error
  avoid_public_rx_declaration: error
  avoid_rx_outside_getx_state: warning`}</CodeBlock>

      <p>
        Restart the analysis server afterwards — in VS Code,{" "}
        <em>Dart: Restart Analysis Server</em>.
      </p>

      <h3>Hooks</h3>
      <p>
        For codebases already using <code>flutter_hooks</code>. See{" "}
        <a href="/docs/hooks">Hooks</a>.
      </p>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dependencies:
  flutter_hooks: ^0.21.3
  hooks_rxget: ^0.0.1`}</CodeBlock>

      <h2>Verifying it works</h2>

      <CodeBlock title="lib/main.dart">{`import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';

class _CounterState extends GetxState {
  final _count = 0.obs;

  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: GetInWidget(
        dependencies: [GetIn<CounterController>(() => CounterController())],
        child: const CounterPage(),
      ),
    );
  }
}

class CounterPage extends GetView<CounterController> {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Obx(() => Text('\${controller.state.count}')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}`}</CodeBlock>

      <p>
        Run it. Tapping the button should increment the number — and only the{" "}
        <code>Text</code> rebuilds.
      </p>

      <PageNav
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "Counter App", href: "/docs/counter-app" }}
      />
    </>
  );
}
