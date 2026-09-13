import 'dart:async';

import 'package:flutter/widgets.dart';

import 'list_notifier.dart';

typedef ValueBuilderUpdateCallback<T> = void Function(T snapshot);

typedef ValueBuilderBuilder<T> =
    Widget Function(T snapshot, ValueBuilderUpdateCallback<T> updater);

/// Element that tracks reactive disposers
class ObxElement = StatelessElement with StatelessObserverComponent;

/// A StatelessWidget than can listen reactive changes.
abstract class ObxStatelessWidget extends StatelessWidget {
  /// Initializes [key] for subclasses.
  const ObxStatelessWidget({super.key});
  @override
  StatelessElement createElement() => ObxElement(this);
}

/// a Component that can track changes in a reactive variable
mixin StatelessObserverComponent on StatelessElement {
  RxObserverScope? _scope;
  bool _rebuildScheduled = false;

  /// Cleanup callbacks collected by this element's reactive scope.
  List<Disposer>? get disposers => _scope?.disposers;

  void getUpdate() {
    final scope = _scope;
    if (scope == null || scope.isClosed || _rebuildScheduled) {
      return;
    }
    // Several reactive variables usually change together, and a loop writing
    // to one variable notifies on every write. One microtask per pass is
    // enough; without this guard each write queues its own rebuild.
    _rebuildScheduled = true;
    scheduleMicrotask(() {
      _rebuildScheduled = false;
      // The element can be unmounted between scheduling and running, and
      // markNeedsBuild on a defunct element asserts.
      if (_scope == null || _scope!.isClosed || !mounted) {
        return;
      }
      markNeedsBuild();
    });
  }

  @override
  Widget build() {
    return (_scope ??= RxObserverScope(getUpdate)).run(super.build);
  }

  @override
  void unmount() {
    super.unmount();
    _scope?.close();
    _scope = null;
  }
}
