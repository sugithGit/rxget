import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Async Status — rxget",
  description:
    "StateMixin, GetStatus and the .obx() builder: modelling loading, error, empty and success without writing the branches by hand.",
};

export default function AsyncStatusPage() {
  return (
    <>
      <h1>Async Status</h1>
      <p className="lead">
        <code>StateMixin&lt;T&gt;</code> gives a controller a value{" "}
        <em>and</em> a status — loading, success, error, empty or custom — so
        the four branches of an async screen do not have to be hand-rolled every
        time.
      </p>

      <h2>The states</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 pr-4 font-semibold">Set by</th>
              <th className="py-2 font-semibold">Check with</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground font-mono text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">LoadingStatus</td>
              <td className="py-2 pr-4">setLoading()</td>
              <td className="py-2">status.isLoading</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">SuccessStatus</td>
              <td className="py-2 pr-4">setSuccess(data)</td>
              <td className="py-2">status.isSuccess</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">ErrorStatus</td>
              <td className="py-2 pr-4">setError(e)</td>
              <td className="py-2">status.isError</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">EmptyStatus</td>
              <td className="py-2 pr-4">setEmpty()</td>
              <td className="py-2">status.isEmpty</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">CustomStatus</td>
              <td className="py-2 pr-4">change(...)</td>
              <td className="py-2">status.isCustom</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Adding it to a controller</h2>

      <Callout variant="danger" title="Do not use StateController or SuperController">
        <p>
          Both extend the bare <code>GetxController</code>, which resolves to{" "}
          <code>GetxController&lt;GetxState&gt;</code> — and the private-state
          assertion then rejects <code>&quot;GetxState&quot;</code>.
          Constructing either throws in debug builds. Mix{" "}
          <code>StateMixin</code> into a properly typed controller instead, as
          below. See <a href="/docs/controllers">Controllers &amp; State</a>.
        </p>
      </Callout>

      <p>
        <code>StateMixin&lt;T&gt;</code> applies to any{" "}
        <code>GetxController</code>:
      </p>

      <CodeBlock>{`class _UserState extends GetxState {
  @override
  void onClose() {}
}

class UserController extends GetxController<_UserState>
    with StateMixin<User> {
  @override
  final state = _UserState();

  Future<void> load() async {
    setLoading();
    try {
      final user = await api.fetchUser();
      setSuccess(user);
    } catch (e) {
      setError(e);
    }
  }
}`}</CodeBlock>

      <h3>futurize</h3>
      <p>
        The same thing without the try/catch. It sets loading, awaits, then sets
        success, empty or error for you.
      </p>

      <CodeBlock>{`Future<void> load() => futurize(
      () => api.fetchUser(),
      errorMessage: 'Could not load the profile',
      useEmpty: true,      // an empty result becomes EmptyStatus
    );`}</CodeBlock>

      <Callout variant="note" title="What counts as empty">
        <p>
          A value is empty when it is <code>null</code>, an empty{" "}
          <code>Iterable</code>, an empty <code>Map</code>, or a{" "}
          <code>String</code> that is blank after trimming. Anything else —
          including <code>0</code> and <code>false</code> — is success.
        </p>
      </Callout>

      <h2>Rendering with .obx()</h2>
      <p>
        <code>StateMixin</code> gets an <code>obx()</code> extension that
        renders the right branch for the current status.
      </p>

      <CodeBlock>{`controller.obx(
  (state) => UserProfile(user: state),
  onLoading: const Center(child: CircularProgressIndicator()),
  onEmpty: const Text('No profile yet'),
  onError: (error) => Text('Failed: \$error'),
)`}</CodeBlock>

      <p>
        Every parameter but the first is optional. Omitted branches fall back to
        a centred spinner for loading, and an empty box for empty and custom.
      </p>

      <h3>Custom states</h3>

      <CodeBlock>{`class OfflineStatus<T> extends GetStatus<T> {
  @override
  List get props => [];
}

// in the controller
change(OfflineStatus<User>());

// in the view
controller.obx(
  (state) => UserProfile(user: state),
  onCustom: (context) => const OfflineBanner(),
)`}</CodeBlock>

      <h2>Reading status directly</h2>
      <p>
        <code>obx()</code> is a convenience. The status is an ordinary reactive
        value, so you can branch on it yourself.
      </p>

      <CodeBlock>{`Obx(() {
  final status = controller.status;
  if (status.isLoading) return const Spinner();
  if (status.isError)   return ErrorView(message: status.errorMessage);
  if (status.isEmpty)   return const EmptyView();
  return UserProfile(user: controller.getState);
})`}</CodeBlock>

      <h3>Accessors</h3>

      <CodeBlock>{`controller.status;            // GetStatus<T>
controller.getState;          // T — the current value
controller.status.data;       // T? — non-null only on success
controller.status.error;      // Object? — the error, if any
controller.status.errorMessage;  // String — '' when there is no error`}</CodeBlock>

      <h2>State and status together</h2>
      <p>
        A controller carrying <code>StateMixin</code> has both:{" "}
        <code>state</code> for its own reactive fields, and the mixin&apos;s
        status for one async value.
      </p>

      <CodeBlock>{`class _DashboardState extends GetxState {
  final _filter = 'all'.obs;
  String get filter => _filter.value;

  @override
  void onClose() => _filter.close();
}

class DashboardController extends GetxController<_DashboardState>
    with StateMixin<Report> {
  @override
  final state = _DashboardState();

  Future<void> loadReport() => futurize(() => api.report(state.filter));
}`}</CodeBlock>

      <Callout variant="tip" title="When not to use it">
        <p>
          <code>StateMixin</code> models one async value per controller. A
          screen that loads three independent things is clearer with three
          reactive fields and explicit flags — or three controllers.
        </p>
      </Callout>

      <h2>Reloading on foreground</h2>
      <p>
        Add <code>WidgetsBindingObserver</code> alongside the mixin for a
        screen that refreshes when the app returns to the foreground.
      </p>

      <CodeBlock>{`class HomeController extends GetxController<_HomeState>
    with WidgetsBindingObserver, StateMixin<HomeData> {
  @override
  final state = _HomeState();

  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void onReady() {
    super.onReady();
    _load();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState s) {
    if (s == AppLifecycleState.resumed) _load();
  }

  @override
  void onClose() {
    WidgetsBinding.instance.removeObserver(this);
    super.onClose();
  }

  Future<void> _load() => futurize(() => api.fetchHome());
}`}</CodeBlock>

      <PageNav
        prev={{ title: "Workers", href: "/docs/workers" }}
        next={{ title: "Choosing a Widget", href: "/docs/widgets" }}
      />
    </>
  );
}
