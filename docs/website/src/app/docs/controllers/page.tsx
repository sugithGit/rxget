import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Controllers & State — rxget",
  description:
    "GetxState, GetxController, RxController, StateController, SuperController, FullLifeCycleController and ScrollMixin — what each one is for.",
};

export default function ControllersPage() {
  return (
    <>
      <h1>Controllers &amp; State</h1>
      <p className="lead">
        A controller holds behaviour. A <code>GetxState</code> holds data. The
        split is enforced by the type system, and it is what makes disposal
        automatic.
      </p>

      <h2>GetxState</h2>
      <p>
        The base class for every state object. It declares exactly one member:
      </p>

      <CodeBlock>{`abstract class GetxState {
  void onClose();
}`}</CodeBlock>

      <p>
        <code>onClose()</code> is abstract, so a state class cannot exist
        without deciding what it disposes. If nothing needs closing, an empty
        body is a deliberate statement.
      </p>

      <CodeBlock>{`class _SettingsState extends GetxState {
  final _darkMode = false.obs;
  final _fontScale = 1.0.obs;

  // The view reads plain values
  bool get darkMode => _darkMode.value;
  double get fontScale => _fontScale.value;

  @override
  void onClose() {
    _darkMode.close();
    _fontScale.close();
  }
}`}</CodeBlock>

      <h2>GetxController&lt;T&gt;</h2>
      <p>
        The main controller class. It is generic over its state, mixes in the
        lifecycle, and extends <code>ListNotifier</code> so{" "}
        <code>GetBuilder</code> can listen to it.
      </p>

      <CodeBlock>{`class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}`}</CodeBlock>

      <h3>Members you get</h3>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Member</th>
              <th className="py-2 font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                T get state
              </td>
              <td className="py-2">
                Abstract. You must override it with a concrete state instance.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                update([ids], condition)
              </td>
              <td className="py-2">
                Rebuild every GetBuilder, or only those with matching ids.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                refresh()
              </td>
              <td className="py-2">Notify all listeners directly.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                onInit / onReady / onClose
              </td>
              <td className="py-2">
                Lifecycle hooks — see <a href="/docs/lifecycle">Lifecycle</a>.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                initialized / isClosed
              </td>
              <td className="py-2">Lifecycle state flags.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs text-foreground">
                addListenerId(id, cb)
              </td>
              <td className="py-2">
                Subscribe to one id group. Returns a disposer.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="note" title="onClose() chains automatically">
        <p>
          <code>GetxController.onClose()</code> is{" "}
          <code>@mustCallSuper</code> and calls <code>state.onClose()</code>{" "}
          first. If you override it, call <code>super.onClose()</code> or your
          state never disposes.
        </p>
      </Callout>

      <CodeBlock>{`@override
void onClose() {
  _timer?.cancel();     // your own cleanup
  super.onClose();      // disposes state
}`}</CodeBlock>

      <h3>Passing constructor arguments</h3>

      <CodeBlock>{`class CounterController extends GetxController<_CounterState> {
  CounterController({int initialCount = 0})
      : state = _CounterState(count: initialCount);

  @override
  final _CounterState state;
}

// Register with the argument
GetIn<CounterController>(() => CounterController(initialCount: 10));`}</CodeBlock>

      <h2>The other controller classes</h2>

      <h3>RxController</h3>
      <p>
        Lifecycle only, with no listener machinery. Use it when a class needs{" "}
        <code>onInit</code>/<code>onClose</code> but nothing ever rebuilds from
        it — a service, a repository, a socket wrapper.
      </p>

      <CodeBlock>{`abstract class RxController with GetLifeCycleMixin {}

class SocketService extends RxController {
  late final WebSocket _socket;

  @override
  void onInit() {
    super.onInit();
    _socket = WebSocket.connect(url);
  }

  @override
  void onClose() {
    _socket.close();
    super.onClose();
  }
}`}</CodeBlock>

      <h3>StateController&lt;T&gt;, SuperController&lt;T&gt; and
      FullLifeCycleController</h3>

      <Callout variant="danger" title="These three do not currently work">
        <p>
          All three extend the bare <code>GetxController</code>, which resolves
          to <code>GetxController&lt;GetxState&gt;</code>. The private-state
          assertion then checks whether <code>&quot;GetxState&quot;</code>{" "}
          starts with an underscore, which it does not — so constructing any of
          them throws in debug builds:
        </p>
        <p className="font-mono text-xs">
          State class for MyController must be private (start with
          &quot;_&quot;)
        </p>
        <p>
          Asserts are stripped in release, so these classes appear to work in a
          release build and fail in development. Use the mixin form below
          instead.
        </p>
      </Callout>

      <p>
        Everything the three convenience classes offer is available by mixing
        the same mixins into a correctly typed controller. This form works:
      </p>

      <CodeBlock title="instead of StateController<User>">{`class _UserState extends GetxState {
  @override
  void onClose() {}
}

class UserController extends GetxController<_UserState>
    with StateMixin<User> {
  @override
  final state = _UserState();

  Future<void> load() => futurize(() => api.fetchUser());
}`}</CodeBlock>

      <CodeBlock title="instead of FullLifeCycleController / SuperController">{`class AnalyticsController extends GetxController<_AnalyticsState>
    with WidgetsBindingObserver, StateMixin<Report> {
  @override
  final state = _AnalyticsState();

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _refresh();
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    super.onClose();
  }
}`}</CodeBlock>

      <h3>ScrollMixin</h3>
      <p>
        Infinite scroll without writing the listener. Mix it into any class that
        has the lifecycle.
      </p>

      <CodeBlock>{`class FeedController extends GetxController<_FeedState> with ScrollMixin {
  @override
  final state = _FeedState();

  @override
  Future<void> onEndScroll() async {
    state._posts.addAll(await api.nextPage());
  }

  @override
  Future<void> onTopScroll() async {}
}

// in the view
ListView(controller: controller.scroll, children: [...])`}</CodeBlock>

      <p>
        The mixin owns the <code>ScrollController</code>, attaches its listener
        in <code>onInit</code>, disposes it in <code>onClose</code>, and guards
        against overlapping fetches while one is in flight.
      </p>

      <h2>Which one to extend</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">You need</th>
              <th className="py-2 font-semibold">Extend</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">State a widget rebuilds from</td>
              <td className="py-2 font-mono text-xs">
                GetxController&lt;_State&gt;
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">
                Lifecycle only — a service or repository
              </td>
              <td className="py-2 font-mono text-xs">RxController</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">A load / error / success cycle</td>
              <td className="py-2 font-mono text-xs">
                GetxController&lt;_State&gt; with StateMixin&lt;T&gt;
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4">App foreground / background events</td>
              <td className="py-2 font-mono text-xs">
                GetxController&lt;_State&gt; with WidgetsBindingObserver
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <PageNav
        prev={{ title: "Reactive Types", href: "/docs/reactive-types" }}
        next={{ title: "Lifecycle", href: "/docs/lifecycle" }}
      />
    </>
  );
}
