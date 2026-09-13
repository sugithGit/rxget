import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Cheat Sheet — rxget",
  description: "Every rxget API on one page, grouped by task.",
};

export default function CheatSheetPage() {
  return (
    <>
      <h1>Cheat Sheet</h1>
      <p className="lead">Everything on one page, grouped by what you are doing.</p>

      <h2>A controller</h2>

      <CodeBlock>{`class _CounterState extends GetxState {
  final _count = 0.obs;
  bool isEditing = false;           // plain field, use update()

  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
  void toggle() { state.isEditing = !state.isEditing; update(); }
}`}</CodeBlock>

      <h2>Reactive values</h2>

      <CodeBlock>{`final _i = 0.obs;            // RxInt          final _n = RxnInt();
final _d = 0.0.obs;          // RxDouble       final _nd = RxnDouble();
final _s = ''.obs;           // RxString       final _ns = RxnString();
final _b = false.obs;        // RxBool         final _nb = RxnBool();
final _l = <int>[].obs;      // RxList<int>
final _m = <String, int>{}.obs;  // RxMap
final _e = <int>{}.obs;      // RxSet
final _o = Rx<User>(user);   // Rx<User>       final _no = Rxn<User>();

_i.value;  _i.value = 5;  _i.value++;
_i(7);     _i();          _i.string
_i.refresh();             _i.trigger(7);
_i.close();               _i.isDisposed
_i.listenersLength        _i.debugLabel = 'name';`}</CodeBlock>

      <h2>Collections</h2>

      <CodeBlock>{`_l.add(x);        _l.addAll(xs);      _l.remove(x);
_l.removeWhere(f); _l.insert(0, x);   _l.clear();   _l.sort();
_l.addIf(cond, x); _l.addAllIf(cond, xs);  _l.addNonNull(x);
_l.assign(x);      _l.assignAll(xs);`}</CodeBlock>

      <h2>Widgets</h2>

      <CodeBlock>{`Obx(() => Text('\${c.state.count}'));
Observer(builder: (context) => Text('\${c.state.count}'));
ObxValue<RxBool>((d) => Switch(value: d.value, onChanged: (v) => d.value = v), rx);

Obl(() { if (c.state.done) navigate(); }, child: const Form());

GetBuilder<C>(builder: (c) => Text('\${c.state.count}'));
GetBuilder<C>(id: 'header', builder: (c) => Text(c.state.title));
GetBuilder<C>(init: C(), filter: (c) => c.state.count, builder: ...);

GetX<C>(init: C(), builder: (c) => Text('\${c.state.count}'));

MixinBuilder<C>(id: 'x', builder: (c) => ...);

ValueBuilder<bool>(
  initialValue: false,
  builder: (v, update) => Switch(value: v, onChanged: update),
);

class V extends GetView<C> { ... controller ... }
class W extends GetWidget<C> { ... controller ... }   // with Get.create`}</CodeBlock>

      <h2>Dependency injection</h2>

      <CodeBlock>{`Get.put(C());                         Get.put(C(), permanent: true);
Get.lazyPut(() => C());               Get.lazyPut(() => C(), fenix: true);
await Get.putAsync(() async => C());  Get.create(() => C());
Get.spawn(() => C());

Get.find<C>();                        Get.find<C>(tag: 't');
Get.isRegistered<C>();                Get.isPrepared<C>();
Get.getInstanceInfo<C>();

Get.delete<C>();                      Get.delete<C>(force: true);
Get.deleteAll();                      Get.reset();
Get.reload<C>();                      Get.reloadAll();
Get.replace<C>(MockC());              Get.lazyReplace<C>(() => MockC());

Get.smartManagement = SmartManagement.keepFactory;
Get.isLogEnable = false;`}</CodeBlock>

      <h2>Scoped injection</h2>

      <CodeBlock>{`GetInWidget(
  dependencies: [
    GetIn<Api>(() => Api(), lazy: false),
    GetIn<C>(() => C(Get.find<Api>())),
    GetIn<L>(() => L(), tag: 'inbox'),
  ],
  child: const View(),
)

// hooks
final c = useGetIn(GetIn<C>(() => C()));`}</CodeBlock>

      <h2>Workers</h2>

      <CodeBlock>{`final w1 = ever(_rx, (v) => ...);
final w2 = everAll([_a, _b], (v) => ...);
final w3 = once(_rx, (v) => ...);
final w4 = debounce(_rx, (v) => ..., time: const Duration(milliseconds: 400));
final w5 = interval(_rx, (v) => ..., time: const Duration(seconds: 2));

w1.dispose();                      // or w1()
Workers([w1, w2, w3]).dispose();

// shared options
ever(_rx, cb, condition: () => enabled, onError: ..., onDone: ...);`}</CodeBlock>

      <h2>Lifecycle</h2>

      <CodeBlock>{`@override void onInit()  { super.onInit();  /* wire up */ }
@override void onReady() { super.onReady(); /* needs a built tree */ }
@override void onClose() { /* cancel */ super.onClose(); }

controller.initialized;   controller.isClosed;`}</CodeBlock>

      <h2>Async status</h2>

      <CodeBlock>{`class C extends GetxController<_S> with StateMixin<User> {
  @override
  final state = _S();

  Future<void> load() => futurize(() => api.user());
}

setLoading();  setSuccess(d);  setError(e);  setEmpty();

controller.obx(
  (state) => Profile(user: state),
  onLoading: const Spinner(),
  onError: (e) => Text('\$e'),
  onEmpty: const Text('nothing'),
  onCustom: (context) => const Offline(),
);

status.isLoading  status.isSuccess  status.isError
status.isEmpty    status.isCustom
status.data       status.error      status.errorMessage`}</CodeBlock>

      <h2>Controller base classes</h2>

      <CodeBlock>{`GetxController<_State>       // state + update() + lifecycle
RxController                 // lifecycle only, no listeners

// Async status — mix in, do not use StateController (see note)
class C extends GetxController<_S> with StateMixin<T> { ... }

// App lifecycle — mix in, do not use FullLifeCycleController
class C extends GetxController<_S> with WidgetsBindingObserver { ... }

with ScrollMixin                       // onEndScroll / onTopScroll
with GetSingleTickerProviderStateMixin // one AnimationController
with GetTickerProviderStateMixin       // several`}</CodeBlock>

      <Callout variant="danger" title="StateController, SuperController, FullLifeCycleController">
        <p>
          All three extend the bare <code>GetxController</code> and throw the
          private-state assertion when constructed in a debug build. Use the
          mixin forms above. See{" "}
          <a href="/docs/controllers">Controllers &amp; State</a>.
        </p>
      </Callout>

      <h2>Code generation</h2>

      <CodeBlock>{`part 'x.g.dart';

@getxState
class CounterState {
  CounterState({this.count = 0, this.title = ''});
  int count;              // → Rx<int>
  String? subtitle;       // → Rxn<String>
  @update bool isDirty = false;   // → plain field
}`}</CodeBlock>

      <CodeBlock language="bash">{`dart run build_runner build --delete-conflicting-outputs
dart run build_runner watch --delete-conflicting-outputs`}</CodeBlock>

      <h2>Debugging</h2>

      <CodeBlock>{`RxLifecycleDebug.captureStackTraces = false;   // off for benchmarks
RxLifecycleDebug.stackFrameCount = 16;

final _a = 8.obs..debugLabel = 'CounterState.a';

_rx.listenersLength;   _rx.isDisposed;
Get.getInstanceInfo<C>();`}</CodeBlock>

      <PageNav
        prev={{ title: "Counter App", href: "/docs/counter-app" }}
        next={{ title: "Design Principles", href: "/docs/philosophy" }}
      />
    </>
  );
}
