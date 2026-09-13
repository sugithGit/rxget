import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "rxget vs Bloc — rxget",
  description:
    "An even-handed comparison of rxget and flutter_bloc: the same feature in both, where each is stronger, and how to choose.",
};

export default function CompareBlocPage() {
  return (
    <>
      <h1>rxget vs Bloc</h1>
      <p className="lead">
        Bloc models state as a stream of immutable values driven by events.
        rxget models it as mutable observable fields owned by a controller. Both
        work; they optimise for different things.
      </p>

      <h2>The same feature, both ways</h2>

      <h3>Bloc</h3>

      <CodeBlock title="counter_event.dart / counter_state.dart / counter_bloc.dart">{`sealed class CounterEvent {}
class Increment extends CounterEvent {}
class Decrement extends CounterEvent {}

final class CounterState extends Equatable {
  const CounterState({this.count = 0});
  final int count;

  CounterState copyWith({int? count}) =>
      CounterState(count: count ?? this.count);

  @override
  List<Object> get props => [count];
}

class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(const CounterState()) {
    on<Increment>((e, emit) => emit(state.copyWith(count: state.count + 1)));
    on<Decrement>((e, emit) => emit(state.copyWith(count: state.count - 1)));
  }
}

// view
BlocProvider(
  create: (_) => CounterBloc(),
  child: BlocBuilder<CounterBloc, CounterState>(
    builder: (context, state) => Text('\${state.count}'),
  ),
)

context.read<CounterBloc>().add(Increment());`}</CodeBlock>

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
GetInWidget(
  dependencies: [GetIn<CounterController>(() => CounterController())],
  child: Obx(() => Text('\${Get.find<CounterController>().state.count}')),
)

controller.increment();`}</CodeBlock>

      <h2>Side by side</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">Bloc</th>
              <th className="py-2 font-semibold">rxget</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">State model</td>
              <td className="py-2 pr-4">Immutable, replaced wholesale</td>
              <td className="py-2">Mutable observable fields</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Triggering a change</td>
              <td className="py-2 pr-4">Dispatch an event</td>
              <td className="py-2">Call a method</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Rebuild granularity</td>
              <td className="py-2 pr-4">
                Whole state object; narrow with buildWhen or a selector
              </td>
              <td className="py-2">Per variable, automatically</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Files per feature</td>
              <td className="py-2 pr-4">Typically 3–4</td>
              <td className="py-2">1–2</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Lookup</td>
              <td className="py-2 pr-4">BuildContext</td>
              <td className="py-2">Global container, no context</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Time-travel debugging</td>
              <td className="py-2 pr-4">Yes, via BlocObserver</td>
              <td className="py-2">No</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Audit trail</td>
              <td className="py-2 pr-4">
                Every transition is an observable event
              </td>
              <td className="py-2">Method calls; no built-in log</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Learning curve</td>
              <td className="py-2 pr-4">Steeper</td>
              <td className="py-2">Shallower</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Where Bloc is genuinely better</h2>

      <h3>Traceability</h3>
      <p>
        Every state change in Bloc is an event object that passed through a
        single funnel. A <code>BlocObserver</code> can log every transition in
        the app, which makes &ldquo;how did we get into this state&rdquo;
        answerable from a crash report. rxget has no equivalent — a method call
        leaves no trace unless you add one.
      </p>

      <h3>Immutability</h3>
      <p>
        Bloc states are values. They can be compared, stored, replayed, and
        diffed. rxget state is mutable by design, so none of that comes free.
      </p>

      <h3>Team scale</h3>
      <p>
        Bloc&apos;s ceremony is its feature: there is one way to change state
        and it is impossible to shortcut. On a large team with mixed experience,
        that consistency is worth the extra files.
      </p>

      <h3>Complex async orchestration</h3>
      <p>
        Event transformers — <code>droppable</code>, <code>restartable</code>,{" "}
        <code>sequential</code> — give precise control over overlapping async
        work. rxget gives you <code>debounce</code> and{" "}
        <code>interval</code>, and the rest is yours to write.
      </p>

      <h2>Where rxget is genuinely better</h2>

      <h3>Volume of code</h3>
      <p>
        The counter above is roughly 30 lines in Bloc and 12 in rxget. Across a
        hundred features that difference is real, and it is mostly
        mechanical code — events, copyWith, props.
      </p>

      <h3>Rebuild granularity by default</h3>
      <p>
        A Bloc emits one state object, so <code>BlocBuilder</code> rebuilds when
        anything in it changes unless you write <code>buildWhen</code> or a
        selector. An <code>Obx</code> tracks exactly the fields it read, with no
        extra configuration.
      </p>

      <CodeBlock>{`// Bloc — rebuilds on any state change unless narrowed
BlocBuilder<ProfileBloc, ProfileState>(
  buildWhen: (prev, curr) => prev.name != curr.name,
  builder: (context, state) => Text(state.name),
)

// rxget — tracks \`name\` because that is what it read
Obx(() => Text(controller.state.name))`}</CodeBlock>

      <h3>No context plumbing</h3>
      <p>
        Reaching a Bloc from outside the widget tree — a background isolate, a
        notification handler, a service — means passing the instance around.{" "}
        <code>Get.find</code> works anywhere.
      </p>

      <h3>Incremental adoption</h3>
      <p>
        rxget can be added to one screen. Bloc tends to want the whole feature.
      </p>

      <h2>Choosing</h2>

      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="m-0 text-sm font-semibold text-foreground">
            Choose Bloc when
          </h3>
          <ul className="mt-2 mb-0 space-y-1 pl-4 text-sm text-muted-foreground">
            <li>You need an audit trail of state transitions</li>
            <li>The team is large or turnover is high</li>
            <li>Async flows overlap and need transformers</li>
            <li>Immutability and replay matter to you</li>
            <li>The codebase already uses it</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="m-0 text-sm font-semibold text-foreground">
            Choose rxget when
          </h3>
          <ul className="mt-2 mb-0 space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Boilerplate is slowing the team down</li>
            <li>Fine-grained rebuilds matter</li>
            <li>You want state reachable without context</li>
            <li>You are migrating off GetX</li>
            <li>The team is small and knows the codebase</li>
          </ul>
        </div>
      </div>

      <Callout variant="note" title="They coexist">
        <p>
          Nothing stops you using Bloc for a complex checkout flow and rxget for
          settings screens. Both are libraries, not frameworks, and neither owns
          your app shell.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "vs GetX", href: "/docs/compare/getx" }}
        next={{ title: "vs Riverpod", href: "/docs/compare/riverpod" }}
      />
    </>
  );
}
