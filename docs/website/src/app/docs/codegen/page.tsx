import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Code Generation — rxget",
  description:
    "rxget_annotation and rxget_generator: @getxState and @update, the build_runner setup, exactly what is generated, and how to read the output.",
};

export default function CodegenPage() {
  return (
    <>
      <h1>Code Generation</h1>
      <p className="lead">
        Writing a state class by hand means writing the same four things per
        field: the <code>Rx</code>, the getter, the setter, and the{" "}
        <code>close()</code>. The generator derives all four from a plain
        schema class.
      </p>

      <h2>Setup</h2>

      <CodeBlock language="yaml" title="pubspec.yaml">{`dependencies:
  rxget: ^0.1.3
  rxget_annotation: ^0.0.2

dev_dependencies:
  build_runner: ^2.15.0
  rxget_generator: ^1.0.2`}</CodeBlock>

      <CodeBlock language="bash">{`# one-off
dart run build_runner build --delete-conflicting-outputs

# rebuild as you edit
dart run build_runner watch --delete-conflicting-outputs`}</CodeBlock>

      <h2>Writing a schema</h2>
      <p>
        Annotate a plain class with <code>@getxState</code>. Its fields describe
        the state you want; the generator writes the real class.
      </p>

      <CodeBlock title="counter_controller.dart">{`import 'package:rxget/rxget.dart';
import 'package:rxget_annotation/rxget_annotation.dart';

part 'counter_controller.g.dart';

@getxState
class CounterState {
  CounterState({
    this.count = 0,
    this.title = 'Counter',
    this.isEditing = false,
  });

  int count;
  String title;

  @update
  bool isEditing;      // plain field — not reactive
}`}</CodeBlock>

      <h3>What comes out</h3>

      <CodeBlock title="counter_controller.g.dart (generated)">{`class _CounterState extends GetxState {
  _CounterState({
    int count = 0,
    String title = 'Counter',
    bool isEditing = false,
  }) : _count = Rx<int>(count),
       _title = Rx<String>(title),
       _isEditing = isEditing;

  // --- Reactive fields ---

  final Rx<int> _count;
  int get count => _count.value;
  set count(int value) => _count.value = value;

  final Rx<String> _title;
  String get title => _title.value;
  set title(String value) => _title.value = value;

  // --- Update fields (non-reactive) ---

  bool _isEditing;
  bool get isEditing => _isEditing;
  set isEditing(bool value) => _isEditing = value;

  // --- Lifecycle ---

  @override
  void onClose() {
    _count.close();
    _title.close();
  }
}`}</CodeBlock>

      <p>Note what the generator gets right automatically:</p>
      <ul>
        <li>
          The class is named <code>_CounterState</code> — private, satisfying
          the architecture rule.
        </li>
        <li>
          Reactive fields are private <code>Rx</code>, exposed as plain getters.
        </li>
        <li>
          <code>onClose()</code> closes every reactive field and skips the{" "}
          <code>@update</code> ones.
        </li>
        <li>
          Constructor defaults carry across from the schema.
        </li>
      </ul>

      <h2>Using it</h2>

      <CodeBlock>{`class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;

  void toggleEditing() {
    state.isEditing = !state.isEditing;   // plain field
    update();                             // rebuild GetBuilders
  }
}`}</CodeBlock>

      <p>
        The controller can reach <code>state._count</code> because the generated
        class is a <code>part</code> of the same library. Views outside it see
        only <code>state.count</code>.
      </p>

      <h2>@update — opting out of reactivity</h2>
      <p>
        A field marked <code>@update</code> becomes a plain field: no{" "}
        <code>Rx</code>, no entry in <code>onClose()</code>, no per-write
        notification. Rebuild it with <code>update()</code> and a{" "}
        <code>GetBuilder</code>.
      </p>

      <CodeBlock>{`@getxState
class FormState {
  FormState({this.email = '', this.isDirty = false});

  String email;        // → Rx<String>, reactive

  @update
  bool isDirty;        // → plain bool
}`}</CodeBlock>

      <p>
        Use it for fields that change together with others, or that no widget
        watches on its own.
      </p>

      <h2>Nullable fields</h2>
      <p>
        A nullable field generates an <code>Rxn&lt;T&gt;</code> rather than{" "}
        <code>Rx&lt;T&gt;</code>, so it can hold <code>null</code>.
      </p>

      <CodeBlock>{`@getxState
class ProfileState {
  ProfileState({this.name = '', this.avatarUrl});

  String name;
  String? avatarUrl;   // → Rxn<String>
}`}</CodeBlock>

      <CodeBlock title="generated">{`final Rxn<String> _avatarUrl;
String? get avatarUrl => _avatarUrl.value;
set avatarUrl(String? value) => _avatarUrl.value = value;`}</CodeBlock>

      <h2>Splitting schema and controller</h2>
      <p>
        For larger states, keep the schema in its own file as a{" "}
        <code>part</code> of the controller library.
      </p>

      <CodeBlock title="counter_controller.dart">{`import 'package:rxget/rxget.dart';
import 'package:rxget_annotation/rxget_annotation.dart';

part 'counter_controller.g.dart';
part 'counter_state.dart';

class CounterController extends GetxController<_CounterState> {
  CounterController({int initialCount = 0})
      : state = _CounterState(count: initialCount);

  @override
  final _CounterState state;

  void increment() => state._count.value++;
}`}</CodeBlock>

      <CodeBlock title="counter_state.dart">{`part of 'counter_controller.dart';

@getxState
class CounterState {
  CounterState({this.count = 0, this.title = 'Counter'});

  int count;
  String title;
}`}</CodeBlock>

      <h2>Build configuration</h2>
      <p>
        The builder is applied automatically to any package that depends on{" "}
        <code>rxget_generator</code>:
      </p>

      <CodeBlock language="yaml" title="rxget_generator/build.yaml">{`builders:
  rxget_state:
    import: "package:rxget_generator/builder.dart"
    builder_factories: ["rxgetStateBuilder"]
    build_extensions: {".dart": [".rxget.g.part"]}
    auto_apply: dependents
    build_to: cache
    applies_builders: ["source_gen|combining_builder"]`}</CodeBlock>

      <p>To restrict generation to certain files:</p>

      <CodeBlock language="yaml" title="build.yaml (your app)">{`targets:
  $default:
    builders:
      rxget_generator|rxget_state:
        generate_for:
          - lib/features/**/*_controller.dart`}</CodeBlock>

      <h2>Troubleshooting</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Symptom</th>
              <th className="py-2 font-semibold">Cause</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                <code>_CounterState</code> is undefined
              </td>
              <td className="py-2">
                Missing <code>part &apos;x.g.dart&apos;;</code>, or the build has
                not run.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Nothing is generated</td>
              <td className="py-2">
                <code>rxget_generator</code> is not in{" "}
                <code>dev_dependencies</code>.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Conflicting outputs</td>
              <td className="py-2">
                Run with <code>--delete-conflicting-outputs</code>.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Fields are not reactive</td>
              <td className="py-2">
                They are marked <code>@update</code>.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4">
                Stale output after renaming a field
              </td>
              <td className="py-2">
                Delete <code>.dart_tool/build</code> and rebuild.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="tip" title="Generation is optional">
        <p>
          Nothing in rxget requires the generator. It removes repetitive code
          and guarantees <code>onClose()</code> matches the field list — which
          matters most on states with many fields. Small states are perfectly
          fine written by hand.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "GetIn Widget", href: "/docs/get-in-widget" }}
        next={{ title: "Lint Rules", href: "/docs/lint" }}
      />
    </>
  );
}
