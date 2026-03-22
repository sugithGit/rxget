import 'dart:collection';

import 'package:flutter/foundation.dart';

/// A callback that removes a listener. Returned by [ListNotifierSingleMixin.addListener].
typedef Disposer = void Function();

/// A callback used to trigger a state update on a widget.
typedef GetStateUpdate = void Function();

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

  // final int _version = 0;
  // final int _microtaskVersion = 0;

  /// Registers a [listener] and returns a [Disposer] to unregister it.
  @override
  Disposer addListener(GetStateUpdate listener) {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
    _updaters!.add(listener);
    return () => _updaters?.remove(listener);
  }

  /// Returns `true` if [listener] is currently registered.
  bool containsListener(GetStateUpdate listener) {
    return _updaters?.contains(listener) ?? false;
  }

  @override
  void removeListener(VoidCallback listener) {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
    _updaters?.remove(listener);
  }

  /// Notifies all registered listeners to trigger a rebuild.
  @protected
  void refresh() {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
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

  bool _debugAssertNotDisposed() {
    assert(() {
      if (isDisposed) {
        throw FlutterError(
          '''A $runtimeType was used after being disposed.\n
'Once you have called dispose() on a $runtimeType, it can no longer be used.''',
        );
      }
      return true;
    }(), 'ListNotifier was disposed');
    return true;
  }

  /// The current number of registered listeners.
  int get listenersLength {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
    return _updaters!.length;
  }

  /// Disposes all listeners and marks the notifier as disposed.
  @mustCallSuper
  void dispose() {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
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

  void _notifyGroupUpdate(Object id) {
    if (_updatersGroupIds!.containsKey(id)) {
      _updatersGroupIds![id]!._notifyUpdate();
    }
  }

  /// Reports a read to the [Notifier] system for the group identified by [id].
  @protected
  void notifyGroupChildrens(Object id) {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
    Notifier.instance.read(_updatersGroupIds![id]!);
  }

  /// Returns `true` if a listener group with the given [id] exists.
  bool containsId(Object id) {
    return _updatersGroupIds?.containsKey(id) ?? false;
  }

  /// Notifies all listeners in the group identified by [id].
  @protected
  void refreshGroup(Object id) {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
    _notifyGroupUpdate(id);
  }

  bool _debugAssertNotDisposed() {
    assert(() {
      if (_updatersGroupIds == null) {
        throw FlutterError(
          '''A $runtimeType was used after being disposed.\n
'Once you have called dispose() on a $runtimeType, it can no longer be used.''',
        );
      }
      return true;
    }(), 'ListNotifier was disposed');
    return true;
  }

  /// Removes a [listener] from the group identified by [id].
  void removeListenerId(Object id, VoidCallback listener) {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
    if (_updatersGroupIds!.containsKey(id)) {
      _updatersGroupIds![id]!.removeListener(listener);
    }
  }

  /// Disposes all listener groups and marks this mixin as disposed.
  @mustCallSuper
  void dispose() {
    assert(_debugAssertNotDisposed(), 'ListNotifier was disposed');
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
