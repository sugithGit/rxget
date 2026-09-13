import 'dart:collection';

import 'package:flutter/foundation.dart';

/// A callback that removes a listener. Returned by [ListNotifierSingleMixin.addListener].
typedef Disposer = void Function();

/// A callback used to trigger a state update on a widget.
typedef GetStateUpdate = void Function();

/// Debug-only settings that control how much detail reactive objects keep
/// about their own lifecycle.
///
/// A reactive variable is almost never used in the same place it was declared
/// or closed:
///
/// ```dart
/// class CounterState extends GetxState {
///   final a = 8.obs; // <- declared here
///
///   @override
///   void onClose() {
///     a.close(); // <- closed here
///   }
///
///   void bump() => a.value++; // <- blows up here
/// }
/// ```
///
/// Knowing only the last line is rarely enough to fix the bug, so every
/// reactive object records the stack trace of where it was created and of
/// where it was closed, and the "used after close" error prints both.
///
/// These stack traces are captured only when assertions are enabled (debug
/// builds). Capturing them costs a little time and memory, so it can be turned
/// off for, say, a debug-mode benchmark:
///
/// ```dart
/// void main() {
///   RxLifecycleDebug.captureStackTraces = false;
///   runApp(const MyApp());
/// }
/// ```
abstract final class RxLifecycleDebug {
  /// Whether reactive objects record where they were created and closed.
  ///
  /// Defaults to `true`. Only consulted when assertions are enabled; profile
  /// and release builds never capture these stack traces.
  static bool captureStackTraces = true;

  /// How many frames of the creation/disposal stack traces are printed in the
  /// "used after close" error.
  static int stackFrameCount = 8;
}

/// Captures the current stack trace, but only in debug mode and only while
/// [RxLifecycleDebug.captureStackTraces] is on. Returns `null` otherwise.
StackTrace? debugCaptureLifecycleStack() {
  StackTrace? stack;
  assert(() {
    if (RxLifecycleDebug.captureStackTraces) {
      stack = StackTrace.current;
    }
    return true;
  }(), 'debugCaptureLifecycleStack');
  return stack;
}

/// Builds the error thrown when a reactive object is touched after it has been
/// closed.
///
/// [type] is the runtime type of the object, [label] its optional
/// [ListNotifierSingleMixin.debugLabel], and [member] the member that was used
/// (`'value'`, `'listen'`, `'close'`...). [creationStack] and [disposeStack]
/// are the traces captured by [debugCaptureLifecycleStack], and are what turns
/// a vague failure into a pair of clickable source locations.
FlutterError debugRxUseAfterCloseError({
  required String type,
  required String member,
  String? label,
  StackTrace? creationStack,
  StackTrace? disposeStack,
}) {
  final named = label == null ? 'A $type' : 'The $type "$label"';
  final closedTwice = member == 'close' || member == 'dispose';
  final observed = member == 'addListener' || member == 'refresh';
  final createdAt = _debugCallSite(creationStack);
  final closedAt = _debugCallSite(disposeStack);

  return FlutterError.fromParts(<DiagnosticsNode>[
    ErrorSummary(
      closedTwice
          ? '$named was closed twice.'
          : '$named was used after being closed.',
    ),
    ErrorDescription(
      closedTwice
          ? 'close() was called on a $type that had already been closed, so '
                'there is nothing left to release.'
          : observed
          ? 'An Obx/GetX widget (or another listener) tried to observe this '
                '$type after close() was called on it. A closed reactive '
                'variable can no longer be observed, written to or listened to.'
          : '$type.$member was called after close(). A closed reactive '
                'variable can no longer be observed, written to or listened to.',
    ),
    if (createdAt != null)
      ErrorDescription('\nThe $type was declared at:\n  $createdAt')
    else if (creationStack == null)
      ErrorHint(
        '\nWhere this $type was declared was not recorded. Run in debug mode '
        'with RxLifecycleDebug.captureStackTraces set to true to find out '
        'which variable this is.',
      ),
    if (closedAt != null) ErrorDescription('and closed at:\n  $closedAt'),
    if (creationStack != null)
      _debugStackNode('Where the $type was declared', creationStack),
    if (disposeStack != null)
      _debugStackNode('Where the $type was closed', disposeStack),
    if (closedTwice)
      ErrorHint(
        'Close each reactive variable exactly once, usually in the onClose() '
        'of the state or controller that owns it. If the same variable can be '
        'closed from more than one place, guard it with `if (!isDisposed)`.',
      )
    else ...<DiagnosticsNode>[
      ErrorHint(
        'Either the variable is being closed too early, or it is still in use '
        'after its owner was disposed. The two locations above tell you which '
        'variable this is and when it went away.',
      ),
      ErrorHint(
        'Reactive variables created in a GetxState are meant to be closed in '
        "that state's onClose(); closing them by hand elsewhere usually means "
        'they are closed while something is still observing them.',
      ),
    ],
  ]);
}

/// Whether [frame] belongs to rxget, Flutter or the Dart SDK rather than to
/// the code the developer wrote.
bool _isFrameworkFrame(String frame) =>
    frame.contains('package:rxget/') ||
    frame.contains('package:flutter/') ||
    frame.contains('(dart:');

/// The frames of [stack] with the leading rxget/Flutter/SDK frames removed, so
/// the trace starts at the application code that reached into rxget.
List<String> _debugAppFrames(StackTrace stack) {
  final frames = stack
      .toString()
      .trimRight()
      .split('\n')
      .where((frame) => frame.trim().isNotEmpty)
      .toList();
  final firstAppFrame = frames.indexWhere(
    (frame) => !_isFrameworkFrame(frame),
  );
  return firstAppFrame <= 0 ? frames : frames.sublist(firstAppFrame);
}

/// Returns the single line of [stack] that a developer wants to jump to: the
/// first frame of their own code, without its `#3` frame number.
String? _debugCallSite(StackTrace? stack) {
  if (stack == null) {
    return null;
  }
  final frames = _debugAppFrames(stack);
  if (frames.isEmpty) {
    return null;
  }
  return frames.first.trim().replaceFirst(RegExp(r'^#\d+\s+'), '');
}

/// Wraps [stack] in a diagnostics node, dropping the rxget frames and
/// truncating to [RxLifecycleDebug.stackFrameCount] frames so the error stays
/// readable.
DiagnosticsNode _debugStackNode(String name, StackTrace stack) {
  final frames = _debugAppFrames(stack);
  final hidden = frames.length - RxLifecycleDebug.stackFrameCount;
  final shown = hidden > 0
      ? <String>[
          ...frames.take(RxLifecycleDebug.stackFrameCount),
          '...     ($hidden more frames)',
        ]
      : frames;
  return DiagnosticsStackTrace(name, StackTrace.fromString(shown.join('\n')));
}

/// A [Listenable] that supports both single listeners and grouped listeners by ID.
///
/// Combines [ListNotifierSingleMixin] and [ListNotifierGroupMixin].
class ListNotifier extends Listenable
    with ListNotifierSingleMixin, ListNotifierGroupMixin {}

/// A Notifier with single listeners
class ListNotifierSingle = ListNotifier with ListNotifierSingleMixin;

/// A notifier with group of listeners identified by id
class ListNotifierGroup = ListNotifier with ListNotifierGroupMixin;

/// This mixin add to Listenable the addListener, removerListener and
/// containsListener implementation
mixin ListNotifierSingleMixin on Listenable {
  List<GetStateUpdate>? _updaters = <GetStateUpdate>[];

  /// An optional name for this object, used in debug messages.
  ///
  /// A stack trace can only point at the line a variable was declared on; a
  /// label can name it. Useful when several reactive variables are declared on
  /// the same line or built inside a loop:
  ///
  /// ```dart
  /// final a = 8.obs..debugLabel = 'CounterState.a';
  /// ```
  String? debugLabel;

  /// Where this object was created. Captured in debug mode only.
  final StackTrace? _debugCreationStack = debugCaptureLifecycleStack();

  /// Where [dispose] was called. Captured in debug mode only.
  StackTrace? _debugDisposeStack;

  // final int _version = 0;
  // final int _microtaskVersion = 0;

  /// Registers a [listener] and returns a [Disposer] to unregister it.
  @override
  Disposer addListener(GetStateUpdate listener) {
    assert(debugAssertNotDisposed('addListener'), 'ListNotifier was disposed');
    _updaters!.add(listener);
    return () => _updaters?.remove(listener);
  }

  /// Returns `true` if [listener] is currently registered.
  bool containsListener(GetStateUpdate listener) {
    return _updaters?.contains(listener) ?? false;
  }

  @override
  void removeListener(VoidCallback listener) {
    assert(
      debugAssertNotDisposed('removeListener'),
      'ListNotifier was disposed',
    );
    _updaters?.remove(listener);
  }

  /// Notifies all registered listeners to trigger a rebuild.
  @protected
  void refresh() {
    assert(debugAssertNotDisposed('refresh'), 'ListNotifier was disposed');
    _notifyUpdate();
  }

  /// Reports a read access to the [Notifier] system so reactive widgets can track dependencies.
  @protected
  void reportRead() {
    Notifier.instance.read(this);
  }

  /// Reports a disposer callback to the [Notifier] system for cleanup.
  @protected
  void reportAdd(VoidCallback disposer) {
    Notifier.instance.add(disposer);
  }

  void _notifyUpdate() {
    // if (_microtaskVersion == _version) {
    //   _microtaskVersion++;
    //   scheduleMicrotask(() {
    //     _version++;
    //     _microtaskVersion = _version;
    final list = _updaters?.toList() ?? [];

    for (var element in list) {
      element();
    }
    //   });
    // }
  }

  /// Whether this notifier has been disposed.
  bool get isDisposed => _updaters == null;

  /// Throws a detailed [FlutterError] when this object is used after being
  /// closed, naming the variable (when a [debugLabel] is set), the line it was
  /// declared on and the line that closed it.
  ///
  /// [member] is the member being used, so the message can say what was
  /// attempted. Always returns `true`, so it can be used inside an `assert`.
  @protected
  bool debugAssertNotDisposed([String member = 'value']) {
    assert(() {
      if (isDisposed) {
        throw debugRxUseAfterCloseError(
          type: '$runtimeType',
          member: member,
          label: debugLabel,
          creationStack: _debugCreationStack,
          disposeStack: _debugDisposeStack,
        );
      }
      return true;
    }(), 'ListNotifier was disposed');
    return true;
  }

  /// The current number of registered listeners.
  int get listenersLength {
    assert(
      debugAssertNotDisposed('listenersLength'),
      'ListNotifier was disposed',
    );
    return _updaters!.length;
  }

  /// Disposes all listeners and marks the notifier as disposed.
  @mustCallSuper
  void dispose() {
    assert(debugAssertNotDisposed('close'), 'ListNotifier was disposed');
    _debugDisposeStack = debugCaptureLifecycleStack();
    _updaters = null;
  }
}

/// A mixin that adds grouped listener support identified by [Object] keys.
///
/// Each group maintains its own [ListNotifierSingleMixin] so listeners
/// can be notified independently.
mixin ListNotifierGroupMixin on Listenable {
  HashMap<Object?, ListNotifierSingleMixin>? _updatersGroupIds =
      HashMap<Object?, ListNotifierSingleMixin>();

  /// Where this object was created. Captured in debug mode only.
  final StackTrace? _debugGroupCreationStack = debugCaptureLifecycleStack();

  /// Where [dispose] was called. Captured in debug mode only.
  StackTrace? _debugGroupDisposeStack;

  void _notifyGroupUpdate(Object id) {
    if (_updatersGroupIds!.containsKey(id)) {
      _updatersGroupIds![id]!._notifyUpdate();
    }
  }

  /// Reports a read to the [Notifier] system for the group identified by [id].
  @protected
  void notifyGroupChildrens(Object id) {
    assert(
      _debugAssertGroupNotDisposed('notifyGroupChildrens'),
      'ListNotifier was disposed',
    );
    Notifier.instance.read(_updatersGroupIds![id]!);
  }

  /// Returns `true` if a listener group with the given [id] exists.
  bool containsId(Object id) {
    return _updatersGroupIds?.containsKey(id) ?? false;
  }

  /// Notifies all listeners in the group identified by [id].
  @protected
  void refreshGroup(Object id) {
    assert(
      _debugAssertGroupNotDisposed('refreshGroup'),
      'ListNotifier was disposed',
    );
    _notifyGroupUpdate(id);
  }

  /// Same as [ListNotifierSingleMixin.debugAssertNotDisposed], for the grouped
  /// listeners held by this mixin.
  bool _debugAssertGroupNotDisposed([String member = 'value']) {
    assert(() {
      if (_updatersGroupIds == null) {
        throw debugRxUseAfterCloseError(
          type: '$runtimeType',
          member: member,
          creationStack: _debugGroupCreationStack,
          disposeStack: _debugGroupDisposeStack,
        );
      }
      return true;
    }(), 'ListNotifier was disposed');
    return true;
  }

  /// Removes a [listener] from the group identified by [id].
  void removeListenerId(Object id, VoidCallback listener) {
    assert(
      _debugAssertGroupNotDisposed('removeListenerId'),
      'ListNotifier was disposed',
    );
    if (_updatersGroupIds!.containsKey(id)) {
      _updatersGroupIds![id]!.removeListener(listener);
    }
  }

  /// Disposes all listener groups and marks this mixin as disposed.
  @mustCallSuper
  void dispose() {
    assert(
      _debugAssertGroupNotDisposed('close'),
      'ListNotifier was disposed',
    );
    _debugGroupDisposeStack = debugCaptureLifecycleStack();
    _updatersGroupIds?.forEach((key, value) => value.dispose());
    _updatersGroupIds = null;
  }

  /// Adds a [listener] to the group identified by [key].
  ///
  /// Creates the group if it doesn't exist. Returns a [Disposer].
  Disposer addListenerId(Object? key, GetStateUpdate listener) {
    _updatersGroupIds![key] ??= ListNotifierSingle();
    return _updatersGroupIds![key]!.addListener(listener);
  }

  /// To dispose an [id] from future updates(), this ids are registered
  /// by `GetBuilder()` or similar, so is a way to unlink the state change with
  /// the Widget from the Controller.
  void disposeId(Object id) {
    _updatersGroupIds?[id]?.dispose();
    _updatersGroupIds!.remove(id);
  }
}

/// The central notification hub for `GetX` and `Obx` reactivity.
///
/// Tracks which reactive variables are read during a widget build
/// and wires up the appropriate listeners for automatic rebuilds.
class Notifier {
  Notifier._();

  static Notifier? _instance;

  /// Returns the singleton [Notifier] instance.
  static Notifier get instance => _instance ??= Notifier._();

  NotifyData? _notifyData;

  /// Registers a dispose [listener] for cleanup when the observer unmounts.
  void add(VoidCallback listener) {
    _notifyData?.disposers.add(listener);
  }

  /// Subscribes the current observer to [updaters] changes.
  void read(ListNotifierSingleMixin updaters) {
    final listener = _notifyData?.updater;
    if (listener != null && !updaters.containsListener(listener)) {
      updaters.addListener(listener);
      add(() => updaters.removeListener(listener));
    }
  }

  /// Executes [builder] within a reactive scope tracked by [data].
  ///
  /// Any [GetListenable] read during [builder] execution will be
  /// automatically subscribed to [data.updater].
  T append<T>(NotifyData data, T Function() builder) {
    _notifyData = data;
    final result = builder();
    if (data.disposers.isEmpty && data.throwException) {
      throw ObxError();
    }
    _notifyData = null;
    return result;
  }
}

/// Data payload used by [Notifier] to track reactive subscriptions.
class NotifyData {
  /// Creates a [NotifyData].
  const NotifyData({
    required this.updater,
    required this.disposers,
    this.throwException = true,
  });

  /// The callback that triggers a widget rebuild.
  final GetStateUpdate updater;

  /// Cleanup callbacks to run when the observer is unmounted.
  final List<VoidCallback> disposers;

  /// Whether to throw an [ObxError] if no reactive variables are tracked.
  final bool throwException;
}

/// An error thrown when an `Obx` or `GetX` widget fails to track any observable.
class ObxError extends Error {
  /// Creates an [ObxError].
  ObxError();
  @override
  String toString() {
    return """
      [Get] the improper use of a GetX has been detected. 
      You should only use GetX or Obx for the specific widget that will be updated.
      If you are seeing this error, you probably did not insert any observable variables into GetX/Obx 
      or insert them outside the scope that GetX considers suitable for an update 
      (example: GetX => HeavyWidget => variableObservable).
      If you need to update a parent widget and a child widget, wrap each one in an Obx/GetX.
      """;
  }
}
