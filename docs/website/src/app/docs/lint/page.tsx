import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Lint Rules — rxget",
  description:
    "rxget_lint: getx_state_must_be_private, avoid_public_rx_declaration and avoid_rx_outside_getx_state — what each catches and how to configure them.",
};

export default function LintPage() {
  return (
    <>
      <h1>Lint Rules</h1>
      <p className="lead">
        <code>rxget_lint</code> is an analyzer plugin that enforces rxget&apos;s
        architecture rules in the editor. Three rules, one with a quick fix.
      </p>

      <h2>Setup</h2>

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
        Restart the analysis server after adding the plugin. In VS Code:{" "}
        <em>Dart: Restart Analysis Server</em>.
      </p>

      <h2>getx_state_must_be_private</h2>
      <p>
        A class extending <code>GetxState</code> must be private. This mirrors
        the runtime assertion in <code>GetxController</code>, but reports at
        analysis time instead of on first run.
      </p>

      <CodeBlock>{`// LINT: Classes extending GetxState must be private (prefixed with "_").
class CounterState extends GetxState {
  final _count = 0.obs;

  @override
  void onClose() => _count.close();
}

// OK
class _CounterState extends GetxState {
  final _count = 0.obs;

  @override
  void onClose() => _count.close();
}`}</CodeBlock>

      <p>
        <strong>Why:</strong> a public state class can be imported by a view,
        which can then construct or mutate state without going through the
        controller.
      </p>

      <h2>avoid_public_rx_declaration</h2>
      <p>
        Inside a <code>GetxState</code>, every <code>Rx</code> field must be
        private. This rule ships a quick fix that renames the field.
      </p>

      <CodeBlock>{`class _CounterState extends GetxState {
  // LINT: Rx variables must be declared as private inside GetxState.
  final count = 0.obs;
  final name = Rx<String>('');

  @override
  void onClose() {
    count.close();
    name.close();
  }
}

// OK — private field, public getter
class _CounterState extends GetxState {
  final _count = 0.obs;
  final _name = Rx<String>('');

  int get count => _count.value;
  String get name => _name.value;

  @override
  void onClose() {
    _count.close();
    _name.close();
  }
}`}</CodeBlock>

      <p>
        <strong>Why:</strong> a public <code>Rx</code> lets a widget write to
        state the controller is supposed to own, and couples the widget to the
        reactive type. With a getter, swapping <code>_count</code> for a
        computed value touches no widget.
      </p>

      <Callout variant="tip" title="Quick fix">
        <p>
          The rule registers <code>MakeRxVariablePrivate</code>, so the editor
          offers &ldquo;Make Rx variable private&rdquo; on the diagnostic.
        </p>
      </Callout>

      <h2>avoid_rx_outside_getx_state</h2>
      <p>
        Reactive variables should be declared inside a <code>GetxState</code>{" "}
        subclass, where <code>onClose()</code> gives them a disposal path. This
        rule reports as a warning by default.
      </p>

      <CodeBlock>{`// LINT: Rx variables should only be declared inside a GetxState subclass.
class ProfileController extends GetxController<_ProfileState> {
  final scrollOffset = 0.0.obs;    // nothing closes this
}

class SomeService {
  final cache = <String, User>{}.obs;   // nor this
}

// OK
class _ProfileState extends GetxState {
  final _scrollOffset = 0.0.obs;

  double get scrollOffset => _scrollOffset.value;

  @override
  void onClose() => _scrollOffset.close();
}`}</CodeBlock>

      <p>
        <strong>Why:</strong> this is the most common leak in GetX code — a
        reactive variable whose disposal nobody owns. It survives its screen,
        keeps its listeners alive, and never shows up as an error.
      </p>

      <p>
        Static fields are skipped, and fields already inside a{" "}
        <code>GetxState</code> are left to{" "}
        <code>avoid_public_rx_declaration</code>.
      </p>

      <h3>How a variable is recognised as reactive</h3>
      <p>The checker tries three things, in order:</p>
      <ol>
        <li>The resolved type is an <code>Rx</code> subtype.</li>
        <li>
          The initializer calls <code>.obs</code> or an <code>Rx</code>{" "}
          constructor.
        </li>
        <li>The explicit type annotation is an <code>Rx</code> type.</li>
      </ol>
      <p>
        The three together catch both <code>final x = 0.obs;</code> and{" "}
        <code>final RxInt x = someFactory();</code>.
      </p>

      <h2>Severity</h2>

      <CodeBlock language="yaml">{`diagnostics:
  getx_state_must_be_private: error     # break the build
  avoid_public_rx_declaration: error
  avoid_rx_outside_getx_state: info     # advisory while migrating`}</CodeBlock>

      <p>
        Valid severities are <code>error</code>, <code>warning</code>,{" "}
        <code>info</code> and <code>ignore</code>.
      </p>

      <h3>Suppressing one occurrence</h3>

      <CodeBlock>{`// ignore: avoid_rx_outside_getx_state
final _legacyFlag = false.obs;

// ignore_for_file: avoid_public_rx_declaration`}</CodeBlock>

      <Callout variant="warning" title="Suppression is a note to yourself">
        <p>
          Each ignore is a place the ownership rules do not hold. That is
          sometimes the right call during a migration — but an ignore on{" "}
          <code>avoid_rx_outside_getx_state</code> is, specifically, a variable
          nothing will close.
        </p>
      </Callout>

      <h2>Adopting on an existing codebase</h2>
      <ol>
        <li>Add the plugin with all three rules at <code>info</code>.</li>
        <li>
          Run <code>dart analyze</code> to see the size of the problem.
        </li>
        <li>
          Convert controllers to the typed state shape —{" "}
          <code>GetxController&lt;_State&gt;</code> — one feature at a time.
          This is forced anyway by the runtime assertion.
        </li>
        <li>
          Apply the quick fix for <code>avoid_public_rx_declaration</code> and
          add the public getters.
        </li>
        <li>
          Move stray <code>.obs</code> fields into their state classes.
        </li>
        <li>Raise the severities to <code>error</code>.</li>
      </ol>

      <PageNav
        prev={{ title: "Code Generation", href: "/docs/codegen" }}
        next={{ title: "Hooks", href: "/docs/hooks" }}
      />
    </>
  );
}
