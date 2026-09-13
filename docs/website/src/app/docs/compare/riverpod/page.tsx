import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "rxget vs Riverpod — rxget",
  description:
    "Comparing rxget and Riverpod: compile-time safety, provider graphs, auto-disposal and rebuild granularity, with the same feature written both ways.",
};

export default function CompareRiverpodPage() {
  return (
    <>
      <h1>rxget vs Riverpod</h1>
      <p className="lead">
        Riverpod is a compile-time-safe provider graph with declarative
        dependencies. rxget is a runtime service locator with observable fields.
        The trade is safety and composition against directness.
      </p>

      <h2>The same feature, both ways</h2>

      <h3>Riverpod</h3>

      <CodeBlock title="counter_provider.dart">{`@riverpod
class Counter extends _$Counter {
  @override
  int build() => 0;

  void increment() => state++;
  void decrement() => state--;
}

// view
class CounterView extends ConsumerWidget {
  const CounterView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('\$count');
  }
}

ref.read(counterProvider.notifier).increment();`}</CodeBlock>

      <h3>rxget</h3>

      <CodeBlock title="counter_controller.dart">{`class _CounterState extends GetxState {
  final _count = 0.obs;
  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
  void decrement() => state._count.value--;
}

// view
Obx(() => Text('\${controller.state.count}'))

controller.increment();`}</CodeBlock>

      <h2>Side by side</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">Riverpod</th>
              <th className="py-2 font-semibold">rxget</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Missing dependency</td>
              <td className="py-2 pr-4">Compile error</td>
              <td className="py-2">Runtime exception</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Lookup</td>
              <td className="py-2 pr-4">ref, from the widget</td>
              <td className="py-2">Get.find, from anywhere</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Composition</td>
              <td className="py-2 pr-4">
                Providers depend on providers; derived state recomputes
              </td>
              <td className="py-2">Getters on the state class</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Disposal</td>
              <td className="py-2 pr-4">autoDispose when unwatched</td>
              <td className="py-2">GetInWidget scope, or manual</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Async</td>
              <td className="py-2 pr-4">AsyncValue, built in</td>
              <td className="py-2">StateMixin, opt in</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Overrides for tests</td>
              <td className="py-2 pr-4">
                ProviderScope overrides — scoped, no globals
              </td>
              <td className="py-2">Get.replace — global, needs reset</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Code generation</td>
              <td className="py-2 pr-4">Effectively required</td>
              <td className="py-2">Optional</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Rebuild granularity</td>
              <td className="py-2 pr-4">Per provider; select to narrow</td>
              <td className="py-2">Per variable, automatically</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Where Riverpod is genuinely better</h2>

      <h3>Compile-time safety</h3>
      <p>
        This is the headline, and it is real. Forgetting to register a
        dependency in rxget is a runtime exception on the screen that needed it.
        In Riverpod it does not compile.
      </p>

      <CodeBlock>{`// rxget — throws at runtime if nothing registered it
final controller = Get.find<ProfileController>();

// Riverpod — the provider is the declaration; it cannot be missing
final profile = ref.watch(profileProvider);`}</CodeBlock>

      <h3>Derived state that recomputes</h3>
      <p>
        Riverpod providers compose, and a derived provider recomputes when its
        inputs change, with caching.
      </p>

      <CodeBlock>{`@riverpod
List<Todo> filteredTodos(Ref ref) {
  final todos = ref.watch(todosProvider);
  final filter = ref.watch(filterProvider);
  return todos.where(filter.matches).toList();
}`}</CodeBlock>

      <p>
        In rxget the equivalent is a getter, recomputed on every read with no
        caching:
      </p>

      <CodeBlock>{`List<Todo> get filteredTodos =>
    _todos.where(_filter.value.matches).toList();`}</CodeBlock>

      <p>
        For cheap derivations that is fine. For expensive ones you have to cache
        by hand.
      </p>

      <h3>Test isolation</h3>
      <p>
        <code>ProviderScope</code> overrides are scoped to the test. rxget&apos;s
        container is global, so tests need{" "}
        <code>Get.reset()</code> in teardown and cannot easily run in parallel
        against different overrides.
      </p>

      <h3>Automatic disposal</h3>
      <p>
        <code>autoDispose</code> releases a provider when nothing watches it.
        rxget ties disposal to a widget scope, which is coarser — a controller
        lives as long as its <code>GetInWidget</code>, even if nothing is
        currently observing it.
      </p>

      <h2>Where rxget is genuinely better</h2>

      <h3>No context, no ref</h3>
      <p>
        Riverpod state is reached through a <code>ref</code>, which comes from a
        widget or a provider. Reaching it from a notification handler, an
        interceptor, or a background task means plumbing a{" "}
        <code>ProviderContainer</code>. <code>Get.find</code> works anywhere.
      </p>

      <h3>Rebuild granularity without extra work</h3>

      <CodeBlock>{`// Riverpod — rebuilds on any change to the object unless narrowed
final user = ref.watch(userProvider);
Text(user.name);

// narrowed
final name = ref.watch(userProvider.select((u) => u.name));

// rxget — tracks \`name\` because that is what it read
Obx(() => Text(controller.state.name));`}</CodeBlock>

      <h3>No required code generation</h3>
      <p>
        Modern Riverpod is written with <code>@riverpod</code> and{" "}
        <code>build_runner</code>. rxget&apos;s generator is optional — you can
        write every state class by hand.
      </p>

      <h3>Fewer concepts</h3>
      <p>
        Riverpod has providers, notifiers, refs, scopes, families, modifiers and
        AsyncValue. rxget has controllers, state classes and{" "}
        <code>Obx</code>. Less to learn, and less to get subtly wrong.
      </p>

      <h2>Choosing</h2>

      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="m-0 text-sm font-semibold text-foreground">
            Choose Riverpod when
          </h3>
          <ul className="mt-2 mb-0 space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Compile-time safety is worth ceremony</li>
            <li>State composes into a real dependency graph</li>
            <li>You want cached, derived state</li>
            <li>Test isolation matters</li>
            <li>Starting a large greenfield app</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="m-0 text-sm font-semibold text-foreground">
            Choose rxget when
          </h3>
          <ul className="mt-2 mb-0 space-y-1 pl-4 text-sm text-muted-foreground">
            <li>You need state outside the widget tree</li>
            <li>Per-field rebuilds matter</li>
            <li>You want to avoid mandatory codegen</li>
            <li>You are migrating off GetX</li>
            <li>Adoption has to be incremental</li>
          </ul>
        </div>
      </div>

      <Callout variant="warning" title="The honest caveat">
        <p>
          rxget&apos;s global container is its best and worst feature. It makes
          state reachable from anywhere, which is convenient and is also how
          you end up with implicit dependencies and test pollution. The{" "}
          <a href="/docs/architecture-rules">architecture rules</a> exist
          largely to keep that in check — but Riverpod gets the same guarantees
          from the compiler.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "vs Bloc", href: "/docs/compare/bloc" }}
        next={{ title: "Migrating from GetX", href: "/docs/migration" }}
      />
    </>
  );
}
