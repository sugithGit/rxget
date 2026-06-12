# rxget

**A lightweight, memory-safe reactive state management and dependency injection library for Flutter.**

Forked from GetX. Stripped to its essence. Rebuilt with discipline.

[![pub package](https://img.shields.io/pub/v/rxget.svg)](https://pub.dev/packages/rxget)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

- [The rxget Philosophy](#the-rxget-philosophy)
- [What Changed from GetX](#what-changed-from-getx)
- [Installing](#installing)
- [Core Architecture](#core-architecture)
  - [The Three-Layer Rule: State → Controller → Widget](#the-three-layer-rule-state--controller--widget)
  - [1. GetxState — Own Your Memory](#1-getxstate--own-your-memory)
  - [2. GetxController — Own Your Logic](#2-getxcontroller--own-your-logic)
  - [3. GetInWidget & GetIn — Own Your Lifecycle](#3-getinwidget--getin--own-your-lifecycle)
- [Full Counter Example](#full-counter-example)
- [Deep Dive: GetIn — Scoped DI That Actually Works](#deep-dive-getin--scoped-di-that-actually-works)
  - [The Problem GetIn Solves](#the-problem-getin-solves)
  - [How GetIn Works Internally](#how-getin-works-internally)
  - [Lazy vs Eager Injection](#lazy-vs-eager-injection)
  - [Multiple Dependencies](#multiple-dependencies)
  - [Tags for Multiple Instances](#tags-for-multiple-instances)
- [Reactive Widgets](#reactive-widgets)
  - [Obx — Rebuild the UI](#obx--rebuild-the-ui)
  - [ObxValue — Local Reactive State](#obxvalue--local-reactive-state)
  - [Obl — React Without Rebuilding](#obl--react-without-rebuilding)
- [Reactive Types (.obs)](#reactive-types-obs)
- [Workers — React to Changes Over Time](#workers--react-to-changes-over-time)
- [Real-World Architecture Example](#real-world-architecture-example)
- [Testing](#testing)
- [Why rxget Over GetX?](#why-rxget-over-getx)
- [Community](#community)

---

## The rxget Philosophy

Most state management libraries ask you to learn a new paradigm. rxget asks you to follow one principle:

> **Every controller owns a private state. Every state owns its own memory. Every widget owns its controller's lifecycle.**

This is the **ownership chain** that makes rxget fundamentally different from GetX. In GetX, reactivity, logic, memory, and lifecycle were all tangled together inside a single `GetxController`. It worked — until it didn't. Controllers grew bloated. Streams leaked because nobody remembered to close them. Navigating back and forth between pages disposed controllers that were still alive somewhere else.

rxget fixes this by enforcing a strict **separation of responsibility**:

| Layer | Class | Responsibility |
|-------|-------|----------------|
| **State** | `GetxState` | Hold reactive variables. Dispose them in `onClose()`. |
| **Logic** | `GetxController<T>` | Contain business methods. Manipulate state. No `.obs` variables of its own. |
| **Lifecycle** | `GetInWidget` + `GetIn` | Inject controllers. Auto-dispose when widget leaves tree. Scope ownership. |

This isn't optional architecture. It's enforced by the framework:
- `GetxState.onClose()` is **abstract** — you *must* implement memory cleanup.
- `GetxController<T>` requires `T` to be **private** (start with `_`) — your state can't leak to unrelated code.
- `GetIn` tracks **registration ownership** — only the scope that created a dependency can destroy it.

---

## What Changed from GetX

rxget is a focused fork. Here's what was **removed** and what was **added**:

### ❌ Removed
- **Routing** (`Get.to()`, `Get.off()`, `GetMaterialApp`, named routes) — Use Flutter's built-in `Navigator` or `go_router`.
- **UI Helpers** (`Get.snackbar()`, `Get.dialog()`, `Get.bottomSheet()`) — Use the framework directly.
- **Translations / Themes** — Use Flutter's `Localizations` and `ThemeData`.
- **Route-based memory management** — Replaced by widget-scoped `GetInWidget`.
- **GetConnect / GetSocket** — Use `http`, `dio`, or your preferred networking library.

### ✅ Added
- **`GetxState`** — A dedicated state container with mandatory `onClose()` for memory safety.
- **`GetxController<T extends GetxState>`** — A typed controller that enforces private state ownership.
- **`GetInWidget` + `GetIn`** — Widget-scoped DI with ownership-tracked lifecycle management.
- **`Obl`** — A side-effect-only reactive widget that doesn't rebuild the UI.
- **Registration guard** — `GetIn` prevents the "double-pop" bug where navigating back and forth disposes shared dependencies.

### 🔄 Kept (Unchanged)
- **Reactive system** — `.obs`, `Obx`, `ObxValue`, mini-streams.
- **Global DI** — `Get.put()`, `Get.find()`, `Get.lazyPut()`, `Get.delete()`.
- **Workers** — `ever()`, `once()`, `debounce()`, `interval()`.
- **GetBuilder** — Simple callback-based state management.
- **Lifecycle hooks** — `onInit()`, `onReady()`, `onClose()`.

---

## Installing

Add rxget to your `pubspec.yaml`:

```yaml
dependencies:
  rxget: ^0.1.3
```

Import it:

```dart
import 'package:rxget/rxget.dart';
```

---

## Core Architecture

### The Three-Layer Rule: State → Controller → Widget

```
┌──────────────────────────────────────────────────────┐
│                     Widget Layer                      │
│                                                      │
│  GetInWidget                                         │
│  ├── dependencies: [GetIn(() => CounterController())]│
│  └── child: Scaffold(                               │
│        body: Obx(() => Text(controller.state.count)) │
│        fab:  onPressed: controller.increment         │
│      )                                               │
│                                                      │
│  Lifecycle: inject on mount → dispose on unmount     │
└──────────────────────┬───────────────────────────────┘
                       │ Get.find<CounterController>()
                       ▼
┌──────────────────────────────────────────────────────┐
│                   Controller Layer                    │
│                                                      │
│  class CounterController                             │
│        extends GetxController<_CounterState>          │
│                                                      │
│  ├── state → _CounterState()  (private!)             │
│  ├── void increment()                                │
│  │     └── state._count.value++                      │
│  └── onClose() → auto-calls state.onClose()          │
│                                                      │
│  Responsibility: business logic only. No .obs here.  │
└──────────────────────┬───────────────────────────────┘
                       │ state._count.value++
                       ▼
┌──────────────────────────────────────────────────────┐
│                     State Layer                       │
│                                                      │
│  class _CounterState extends GetxState                │
│                                                      │
│  ├── final _count = 0.obs                            │
│  ├── int get count => _count.value                   │
│  └── onClose()                                       │
│        └── _count.close()  ← MANDATORY               │
│                                                      │
│  Responsibility: hold reactive data. Dispose streams.│
└──────────────────────────────────────────────────────┘
```

---

### 1. GetxState — Own Your Memory

`GetxState` is where your reactive variables live. It has one strict contract: **you must implement `onClose()` and close every `.obs` stream you create.**

```dart
part of 'counter_controller.dart';

final class _CounterState extends GetxState {
  // All reactive variables live here
  final _count = 0.obs;
  final _name = 'Guest'.obs;
  final _isLoading = false.obs;

  // Public getters expose the values
  int get count => _count.value;
  String get name => _name.value;
  bool get isLoading => _isLoading.value;

  @override
  void onClose() {
    // This is NOT optional. Close every stream.
    _count.close();
    _name.close();
    _isLoading.close();
  }
}
```

**Why this matters:**

In GetX, developers would scatter `.obs` variables across controllers and forget to close them. Streams would stay in memory, listeners would accumulate, and the app would slowly leak. By making `onClose()` abstract in `GetxState`, rxget makes memory leaks a **compile-time concern** — you can't forget to add disposal because the compiler won't let you skip it.

**Why the state class must be private (`_CounterState`):**

rxget enforces that your state class name starts with `_`. This is a deliberate design choice:

```dart
// ✅ This works — private state
class CounterController extends GetxController<_CounterState> { ... }

// ❌ This throws an assertion error at runtime
class CounterController extends GetxController<CounterState> { ... }
```

The reasoning: state is an **implementation detail** of the controller. External code should interact with the controller's public API (`controller.increment()`), not reach directly into state. Making the state private prevents:
- Other controllers from depending on your internal reactive structure.
- UI code from directly mutating state fields.
- Tight coupling between features.

Using Dart's `part` / `part of` system, the state class lives in a separate file but shares the controller's library scope, giving the controller full access while hiding internals from everyone else.

---

### 2. GetxController — Own Your Logic

`GetxController<T>` is where your business logic lives. It has access to the state via `this.state` but **must not declare `.obs` variables itself**.

```dart
import 'package:rxget/rxget.dart';
part 'counter_state.dart';

class CounterController extends GetxController<_CounterState> {
  @override
  _CounterState get state => _CounterState();

  // Pure business logic — manipulates state, manages flows
  void increment() {
    state._count.value++;
  }

  void reset() {
    state._count.value = 0;
    state._name.value = 'Guest';
  }

  @override
  void onInit() {
    super.onInit();
    // Lifecycle hooks are available as usual
    ever(state._count, (count) {
      if (count > 100) {
        print('Count passed 100!');
      }
    });
  }

  // No need to override onClose() for state disposal —
  // GetxController automatically calls state.onClose() for you.
}
```

**The strict separation in action:**

```dart
// In GetX (the old way) — everything in one class:
class CounterController extends GetxController {
  final count = 0.obs;           // state mixed in
  final name = ''.obs;           // more state
  void increment() => count++;   // logic
  @override
  void onClose() {
    count.close();               // manual disposal (easy to forget)
    name.close();                // forgot this? memory leak.
    super.onClose();
  }
}

// In rxget (the new way) — strict separation:
// _CounterState: holds .obs, mandates onClose()
// CounterController: holds logic, auto-disposes state
```

---

### 3. GetInWidget & GetIn — Own Your Lifecycle

When rxget removed GetX's routing system, it also removed the route-based automatic disposal that came with it. `GetInWidget` replaces it with something better: **widget-scoped dependency injection**.

```dart
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return GetInWidget(
      dependencies: [
        GetIn<CounterController>(() => CounterController()),
      ],
      child: const HomeView(),
    );
  }
}
```

**What happens here:**
1. When `HomePage` **mounts**, `GetIn` registers `CounterController` into Get's global container.
2. Any descendant widget can access it via `Get.find<CounterController>()`.
3. When `HomePage` **unmounts** (e.g., popped from the navigator), `GetIn` automatically calls `Get.delete<CounterController>()`, which triggers `onClose()` on the controller, which triggers `onClose()` on the state, closing all streams.

**The entire disposal chain is automatic.** You don't call `dispose()`. You don't think about cleanup. You just define your dependencies, and the widget tree handles the rest.

---

## Full Counter Example

### File: `counter_state.dart`

```dart
part of 'counter_controller.dart';

final class _CounterState extends GetxState {
  final _count = 0.obs;

  int get count => _count.value;

  @override
  void onClose() {
    _count.close();
  }
}
```

### File: `counter_controller.dart`

```dart
import 'package:rxget/rxget.dart';
part 'counter_state.dart';

class CounterController extends GetxController<_CounterState> {
  @override
  _CounterState get state => _CounterState();

  void increment() {
    state._count.value++;
  }
}
```

### File: `main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';
import 'controller/counter_controller.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: GetInWidget(
        dependencies: [GetIn(() => CounterController())],
        child: const Home(),
      ),
    );
  }
}

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<CounterController>();

    return Scaffold(
      appBar: AppBar(
        title: Obx(() => Text('Clicks: ${controller.state.count}')),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const OtherScreen()),
          ),
          child: const Text('Go to Other Screen'),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class OtherScreen extends StatelessWidget {
  const OtherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<CounterController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Other Screen')),
      body: Center(
        child: Obx(() => Text(
          '${controller.state.count}',
          style: Theme.of(context).textTheme.headlineMedium,
        )),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

Notice: `OtherScreen` doesn't need its own `GetInWidget`. It just calls `Get.find()` because the controller is still alive — its owning `GetInWidget` is still in the widget tree (on `Home`). When `Home` is removed, the controller goes with it.

---

## Deep Dive: GetIn — Scoped DI That Actually Works

### The Problem GetIn Solves

Consider a real navigation flow:

```
Page A (has GetInWidget for ServiceX)
  → pushes Page B (also has GetInWidget for ServiceX)
    → user pops Page B
      → Page A's ServiceX should still be alive!
```

In naive implementations, when Page B pops and its `GetInWidget` disposes, it would call `Get.delete<ServiceX>()` — destroying the instance that Page A still needs. This is the **"double-pop" bug**.

### How GetIn Works Internally

`GetIn` uses an **ownership guard** (`_isRegistered`) to solve this:

```
Page A mounts → GetIn registers ServiceX → _isRegistered = true  ✓ (I own it)
Page B mounts → GetIn checks: already registered? → _isRegistered = false  ✗ (not mine)
Page B pops   → GetIn checks: _isRegistered == false → skip deletion. Service lives.
Page A pops   → GetIn checks: _isRegistered == true → delete. Service cleaned up.
```

**Only the scope that registered the dependency can delete it.** This means you can safely push pages that reference parent-scope dependencies without worrying about accidental disposal.

### Lazy vs Eager Injection

```dart
GetInWidget(
  dependencies: [
    // LAZY (default) — created on first Get.find() call
    GetIn<MyController>(() => MyController()),

    // EAGER — created immediately when GetInWidget mounts
    GetIn<AuthService>(() => AuthService(), lazy: false),
  ],
  child: MyWidget(),
)
```

Use **lazy** (default) for controllers that might not be needed immediately.
Use **eager** (`lazy: false`) for services that must be ready before the first frame (e.g., auth, analytics).

### Multiple Dependencies

Dependencies are registered in order, so later ones can reference earlier ones:

```dart
GetInWidget(
  dependencies: [
    GetIn<ApiService>(() => ApiService()),
    GetIn<UserRepository>(() => UserRepository(Get.find<ApiService>())),
    GetIn<ProfileController>(() => ProfileController(Get.find<UserRepository>())),
  ],
  child: ProfilePage(),
)
```

When the widget disposes, all three are cleaned up in reverse order — `ProfileController` first, then `UserRepository`, then `ApiService`.

### Tags for Multiple Instances

Need two instances of the same type? Use tags:

```dart
GetInWidget(
  dependencies: [
    GetIn<Logger>(() => Logger('auth'), tag: 'auth'),
    GetIn<Logger>(() => Logger('network'), tag: 'network'),
  ],
  child: MyWidget(),
)

// Access with tag:
final authLogger = Get.find<Logger>(tag: 'auth');
final netLogger = Get.find<Logger>(tag: 'network');
```

---

## Reactive Widgets

### Obx — Rebuild the UI

`Obx` automatically tracks which `.obs` variables are read inside it and rebuilds when they change.

```dart
Obx(() => Text('Count: ${controller.state.count}'));
```

Only the widget inside `Obx` rebuilds — not the entire page. This is surgically precise reactivity.

### ObxValue — Local Reactive State

For simple local state that doesn't need a controller:

```dart
ObxValue<RxBool>(
  (data) => Switch(
    value: data.value,
    onChanged: (flag) => data.value = flag,
  ),
  false.obs,
)
```

### Obl — React Without Rebuilding

`Obl` runs a side-effect when reactive values change, **without rebuilding its child widget**. Perfect for triggering navigation, showing dialogs, or logging.

```dart
Obl(
  () {
    // Read to register as a listener
    final step = controller.state.currentStep;
    // Side-effect — doesn't rebuild the child
    if (step == 3) {
      showCompletionDialog();
    }
  },
  child: const StepperWidget(), // Static — never rebuilt by Obl
)
```

---

## Reactive Types (.obs)

Make any value reactive by appending `.obs`:

```dart
final count = 0.obs;              // RxInt
final name = 'Flutter'.obs;       // RxString
final isActive = false.obs;       // RxBool
final price = 9.99.obs;           // RxDouble
final items = <String>[].obs;     // RxList
final config = <String, int>{}.obs; // RxMap
final user = User().obs;          // Rx<User>
```

**Access the value:**

```dart
print(count.value);     // reads
count.value = 42;       // writes — triggers rebuild
count(42);              // callable shorthand
```

**Important:** `.obs` wraps the value. `count` is an `RxInt`, not an `int`. Access `.value` to get the underlying data.

**Booleans:**

```dart
final flag = true.obs;
flag.toggle();          // flips between true/false
```

**Lists are reactive too:**

```dart
final list = [1, 2, 3].obs;
list.add(4);            // triggers rebuild
list[0] = 10;           // triggers rebuild
```

---

## Workers — React to Changes Over Time

Workers let you respond to reactive value changes with timing control:

```dart
@override
void onInit() {
  super.onInit();

  // Run every time count changes
  ever(state._count, (val) => print('Count is now $val'));

  // Run only the first time count changes
  once(state._count, (val) => print('First change: $val'));

  // Debounce: wait 500ms after the last change
  debounce(state._count, (val) => searchApi(val),
    time: const Duration(milliseconds: 500));

  // Interval: run at most once per second
  interval(state._count, (val) => syncToServer(val),
    time: const Duration(seconds: 1));
}
```

Workers return a `Worker` instance that can be disposed manually:

```dart
final worker = ever(state._count, (val) {
  if (val >= 100) worker.dispose(); // self-dispose
});
```

---

## Real-World Architecture Example

Here's how a feature like a user profile would look in a production app:

```
lib/
├── features/
│   └── profile/
│       ├── controller/
│       │   ├── profile_controller.dart
│       │   └── profile_state.dart        (part of controller)
│       ├── data/
│       │   ├── profile_repository.dart
│       │   └── profile_api_service.dart
│       └── view/
│           ├── profile_page.dart          (GetInWidget — injects deps)
│           └── profile_view.dart          (Obx — reacts to state)
```

### profile_state.dart

```dart
part of 'profile_controller.dart';

final class _ProfileState extends GetxState {
  final _user = Rxn<User>();           // nullable — no user until loaded
  final _isLoading = false.obs;
  final _errorMessage = Rxn<String>();

  User? get user => _user.value;
  bool get isLoading => _isLoading.value;
  String? get errorMessage => _errorMessage.value;

  @override
  void onClose() {
    _user.close();
    _isLoading.close();
    _errorMessage.close();
  }
}
```

### profile_controller.dart

```dart
import 'package:rxget/rxget.dart';
part 'profile_state.dart';

class ProfileController extends GetxController<_ProfileState> {
  ProfileController(this._repository);

  final ProfileRepository _repository;

  @override
  _ProfileState get state => _ProfileState();

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  Future<void> loadProfile() async {
    state._isLoading.value = true;
    state._errorMessage.value = null;

    try {
      state._user.value = await _repository.fetchUser();
    } catch (e) {
      state._errorMessage.value = e.toString();
    } finally {
      state._isLoading.value = false;
    }
  }
}
```

### profile_page.dart

```dart
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return GetInWidget(
      dependencies: [
        GetIn<ProfileApiService>(() => ProfileApiService()),
        GetIn<ProfileRepository>(() => ProfileRepository(Get.find())),
        GetIn<ProfileController>(() => ProfileController(Get.find())),
      ],
      child: const ProfileView(),
    );
  }
}
```

### profile_view.dart

```dart
class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ProfileController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: Obx(() {
        if (controller.state.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }
        if (controller.state.errorMessage != null) {
          return Center(child: Text('Error: ${controller.state.errorMessage}'));
        }
        final user = controller.state.user;
        if (user == null) return const SizedBox.shrink();

        return Column(
          children: [
            Text(user.name, style: const TextStyle(fontSize: 24)),
            Text(user.email),
          ],
        );
      }),
    );
  }
}
```

When the user navigates away from `ProfilePage`, the entire dependency graph — `ProfileController` → `ProfileRepository` → `ProfileApiService` — is disposed automatically. No manual cleanup. No leaked streams. No orphaned instances.

---

## Testing

Controllers can be tested like plain Dart classes without needing Flutter's widget testing infrastructure:

```dart
void main() {
  test('CounterController increments count', () {
    final controller = CounterController();

    // Register to trigger lifecycle
    Get.put(controller);
    expect(controller.state.count, 0);

    controller.increment();
    expect(controller.state.count, 1);

    controller.increment();
    expect(controller.state.count, 2);

    // Clean up
    Get.delete<CounterController>();
  });

  tearDown(() {
    Get.reset();
  });
}
```

**Mocking:**

```dart
class MockCounterController extends GetxController
    with Mock
    implements CounterController {}
```

---

## Why rxget Over GetX?

**1. Memory Safety by Design**
`GetxState.onClose()` is abstract — you can't skip disposal. GetX made it optional, and developers forgot.

**2. No Dependency Bloat**
rxget has zero third-party dependencies beyond Flutter itself. GetX pulls in routing, translations, HTTP clients, and more. Fewer dependencies = fewer breaking changes on Flutter upgrades.

**3. Widget-Scoped Lifecycle**
GetX tied controller disposal to routes. If you used custom navigation or `Navigator 2.0`, disposal broke silently. rxget ties disposal to the widget tree — the one thing Flutter guarantees.

**4. Ownership-Tracked DI**
`GetIn`'s registration guard prevents the double-pop bug that plagued GetX apps with nested navigation. Only the scope that created a dependency can destroy it.

**5. Enforced Architecture**
The private state requirement, the abstract `onClose()`, the typed controller generic — these aren't suggestions. They're compiler-enforced guardrails that prevent the most common GetX mistakes.

**6. Stability on Flutter Updates**
By focusing on just reactivity and DI, there's less surface area to break. Update Flutter, update rxget, move on.

---

## Community

### Community Channels

| **Slack** | **Discord** | **Telegram** |
| :--- | :--- | :--- |
| [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://communityinviter.com/apps/getxworkspace/getx) | [![Discord Shield](https://img.shields.io/discord/722900883784073290.svg?logo=discord)](https://discord.com/invite/9Hpt99N) | [![Telegram](https://img.shields.io/badge/chat-on%20Telegram-blue.svg)](https://t.me/joinchat/PhdbJRmsZNpAqSLJL6bH7g) |

### How to Contribute

- Report bugs and request features via GitHub Issues.
- Submit PRs for code, tests, or documentation improvements.
- Write articles or tutorials about rxget.
- Help translate documentation.

Every contribution is welcome!
