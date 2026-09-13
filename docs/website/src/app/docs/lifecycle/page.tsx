import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Lifecycle — rxget",
  description:
    "onStart, onInit, onReady, onClose and onDelete: when each fires, what is safe to do in each, and how disposal chains to state.",
};

export default function LifecyclePage() {
  return (
    <>
      <h1>Lifecycle</h1>
      <p className="lead">
        Every controller gets five hooks from <code>GetLifeCycleMixin</code>.
        Two of them you call; three of them you override.
      </p>

      <h2>The sequence</h2>

      <div className="not-prose my-8 space-y-3">
        {[
          {
            n: "onStart()",
            when: "The instance is first resolved by Get.find or a builder",
            you: "Never override — it is @nonVirtual",
          },
          {
            n: "onInit()",
            when: "Immediately after onStart, once per instance",
            you: "Set up listeners, workers, subscriptions",
          },
          {
            n: "onReady()",
            when: "One frame after onInit",
            you: "Navigation, dialogs, anything needing a built tree",
          },
          {
            n: "onClose()",
            when: "Just before the instance is released",
            you: "Cancel timers and subscriptions",
          },
          {
            n: "onDelete()",
            when: "Called by the framework to run onClose once",
            you: "Never override — it is @nonVirtual",
          },
        ].map((s, i) => (
          <div
            key={s.n}
            className="flex gap-4 rounded-lg border border-border p-4"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="m-0 font-mono text-sm font-semibold text-foreground">
                {s.n}
              </p>
              <p className="m-0 mt-1 text-xs text-muted-foreground">
                <span className="text-foreground/70">Fires:</span> {s.when}
              </p>
              <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                <span className="text-foreground/70">Use for:</span> {s.you}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2>onInit()</h2>
      <p>
        Runs once, synchronously, the first time the controller is resolved. The
        widget tree does not exist yet, so this is for wiring, not for anything
        visual.
      </p>

      <CodeBlock>{`@override
void onInit() {
  super.onInit();                       // required — schedules onReady

  ever(state._query, _search);          // workers
  _sub = repository.updates.listen(_apply);
  _timer = Timer.periodic(const Duration(seconds: 30), (_) => _poll());
}`}</CodeBlock>

      <Callout variant="warning" title="Always call super.onInit()">
        <p>
          The base implementation is what schedules <code>onReady()</code> for
          the next frame. Skip it and <code>onReady()</code> never runs.
        </p>
      </Callout>

      <h2>onReady()</h2>
      <p>
        Runs one frame after <code>onInit</code>, via{" "}
        <code>addPostFrameCallback</code>. By the time it fires the first frame
        has been built, so the element tree is available.
      </p>

      <CodeBlock>{`@override
void onReady() {
  super.onReady();

  // Safe here: the tree exists
  if (!state.hasSeenOnboarding) {
    Navigator.of(context).push(...);
  }
  _loadInitialData();
}`}</CodeBlock>

      <p>
        This is the hook for anything that would throw if run during a build —
        navigation, showing a dialog, or reading an <code>InheritedWidget</code>{" "}
        that is not ready during <code>onInit</code>.
      </p>

      <h2>onClose()</h2>
      <p>
        The mirror of <code>onInit</code>. Cancel everything you started.
      </p>

      <CodeBlock>{`@override
void onClose() {
  _timer?.cancel();
  _sub.cancel();
  _scrollController.dispose();
  super.onClose();     // disposes state — keep this last
}`}</CodeBlock>

      <Callout variant="note" title="Your state disposes itself">
        <p>
          You do not close reactive variables here.{" "}
          <code>GetxController.onClose()</code> calls{" "}
          <code>state.onClose()</code>, and that is where the{" "}
          <code>Rx</code> objects are closed. Calling{" "}
          <code>super.onClose()</code> is what makes that happen.
        </p>
      </Callout>

      <h2>onStart() and onDelete()</h2>
      <p>
        Both are <code>@nonVirtual</code> — they exist so the framework can
        guarantee each phase runs exactly once, and you cannot accidentally
        break that by overriding.
      </p>

      <CodeBlock title="lifecycle.dart">{`@mustCallSuper
@nonVirtual
void onStart() {
  if (_initialized) return;   // idempotent
  onInit();
  _initialized = true;
}

@mustCallSuper
@nonVirtual
void onDelete() {
  if (_isClosed) return;      // idempotent
  _isClosed = true;
  onClose();
}`}</CodeBlock>

      <p>
        Because both guard against re-entry, deleting a controller twice is
        harmless, and so is resolving one that is already started.
      </p>

      <h3>Inspecting the state</h3>

      <CodeBlock>{`controller.initialized;   // true once onInit has run
controller.isClosed;      // true once onClose has run`}</CodeBlock>

      <h2>What triggers each phase</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Action</th>
              <th className="py-2 font-semibold">Effect</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">Get.put(c)</td>
              <td className="py-2">Registers and starts immediately</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">
                Get.lazyPut(() =&gt; c)
              </td>
              <td className="py-2">
                Registers a factory; starts on first Get.find
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">Get.find&lt;C&gt;()</td>
              <td className="py-2">
                Starts the instance if it has not started
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">Get.delete&lt;C&gt;()</td>
              <td className="py-2">Calls onDelete, then unregisters</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-xs">
                GetInWidget unmount
              </td>
              <td className="py-2">
                Deletes the dependencies this scope registered
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-xs">
                GetBuilder unmount
              </td>
              <td className="py-2">
                Deletes if autoRemove and this builder created it
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>A complete controller</h2>

      <CodeBlock>{`class _FeedState extends GetxState {
  final _posts = <Post>[].obs;
  final _query = ''.obs;

  List<Post> get posts => _posts.value;
  String get query => _query.value;

  @override
  void onClose() {
    _posts.close();
    _query.close();
  }
}

class FeedController extends GetxController<_FeedState> {
  @override
  final state = _FeedState();

  Timer? _poll;
  late final Worker _searchWorker;
  StreamSubscription<Post>? _live;

  @override
  void onInit() {
    super.onInit();
    // Debounce search so typing does not hit the network per keystroke
    _searchWorker = debounce(
      state._query,
      _search,
      time: const Duration(milliseconds: 400),
    );
    _live = repository.livePosts.listen(state._posts.add);
  }

  @override
  void onReady() {
    super.onReady();
    _refresh();                                    // first load after first frame
    _poll = Timer.periodic(const Duration(minutes: 1), (_) => _refresh());
  }

  @override
  void onClose() {
    _poll?.cancel();
    _searchWorker.dispose();
    _live?.cancel();
    super.onClose();                               // closes _posts and _query
  }

  Future<void> _refresh() async =>
      state._posts.assignAll(await repository.fetch(state.query));

  void _search(String q) => _refresh();
}`}</CodeBlock>

      <PageNav
        prev={{ title: "Controllers & State", href: "/docs/controllers" }}
        next={{ title: "Dependency Injection", href: "/docs/dependency-injection" }}
      />
    </>
  );
}
