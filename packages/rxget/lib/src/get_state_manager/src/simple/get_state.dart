// ignore_for_file: overridden_fields
// ignore_for_file: avoid_multiple_declarations_per_line
// ignore_for_file: document_ignores

import 'dart:async';

import 'package:flutter/material.dart';

import '../../../../rxget.dart';
import 'list_notifier.dart';

/// A factory function that returns an instance of type [T].
typedef InitBuilder<T> = T Function();

/// A builder function that receives a [GetLifeCycleMixin] controller and returns a [Widget].
typedef GetControllerBuilder<T extends GetLifeCycleMixin> =
    Widget Function(T controller);

// extension FilterExt on BuildContext {
//   T filter<T extends GetxController>(Object Function(T value)? filter) {
//     return Bind.of(this, filter: filter, rebuild: true);
//   }
// }

/// A widget that rebuilds when its associated [GetxController] updates.
///
/// This is a convenience widget that wraps a [Binder] and [Builder]
/// to observe controller changes and rebuild the [builder] callback.
class GetBuilder<T extends GetxController> extends StatelessWidget {
  /// Creates a [GetBuilder] widget.
  ///
  /// - [builder]: called with the controller instance to produce the widget tree.
  /// - [init]: optional initial controller instance.
  /// - [global]: whether to use the global Get instance registry.
  /// - [autoRemove]: whether to automatically remove the controller when disposed.
  /// - [assignId]: whether to assign an ID for this binding.
  /// - [filter]: an optional filter function that limits rebuilds.
  /// - [tag]: optional tag for the controller instance.
  /// - [id]: optional identifier to listen to specific update groups.
  const GetBuilder({
    required this.builder,
    super.key,
    this.init,
    this.global = true,
    this.autoRemove = true,
    this.assignId = false,
    this.initState,
    this.filter,
    this.tag,
    this.dispose,
    this.id,
    this.didChangeDependencies,
    this.didUpdateWidget,
  });

  /// Builder callback that receives the controller and returns a widget.
  final GetControllerBuilder<T> builder;

  /// Whether to use the global dependency registry.
  final bool global;

  /// Optional identifier to listen to specific update groups.
  final Object? id;

  /// Optional tag for the controller instance.
  final String? tag;

  /// Whether to automatically delete the controller when disposed.
  final bool autoRemove;

  /// Whether to assign a unique ID for this binding.
  final bool assignId;

  /// Optional filter to limit rebuilds to specific state changes.
  final Object Function(T value)? filter;

  /// Callback invoked when the element is first inserted into the tree.
  final void Function(BindElement<T> state)? initState;

  /// Callback invoked when the element is permanently removed from the tree.
  final void Function(BindElement<T> state)? dispose;

  /// Callback invoked when a dependency of this element changes.
  final void Function(BindElement<T> state)? didChangeDependencies;

  /// Callback invoked when the parent widget rebuilds with a new configuration.
  final void Function(Binder<T> oldWidget, BindElement<T> state)?
  didUpdateWidget;

  /// Optional initial controller instance.
  final T? init;

  @override
  Widget build(BuildContext context) {
    return Binder(
      init: init == null ? null : () => init!,
      global: global,
      autoRemove: autoRemove,
      assignId: assignId,
      initState: initState,
      filter: filter,
      tag: tag,
      dispose: dispose,
      id: id,
      lazy: false,
      didChangeDependencies: didChangeDependencies,
      didUpdateWidget: didUpdateWidget,
      child: Builder(
        builder: (context) {
          final controller = Bind.of<T>(context, rebuild: true);
          return builder(controller);
        },
      ),
    );
    // return widget.builder(controller!);
  }
}

/// An abstract widget that provides scoped dependency injection and lifecycle management.
///
/// [Bind] registers a dependency of type [T] in the widget tree and
/// automatically manages its creation, lookup, and disposal.
///
/// Use `Bind.builder()` or the static helpers `Bind.put()`, `Bind.lazyPut()`,
/// `Bind.create()`, and `Bind.spawn()` to create bindings.
abstract class Bind<T> extends StatelessWidget {
  /// Creates a [Bind] widget.
  const Bind({
    required this.child,
    super.key,
    this.init,
    this.global = true,
    this.autoRemove = true,
    this.assignId = false,
    this.initState,
    this.filter,
    this.tag,
    this.dispose,
    this.id,
    this.didChangeDependencies,
    this.didUpdateWidget,
  });

  /// Creates a [Bind] using named parameters for fine-grained control.
  ///
  /// - [init]: factory to lazily create the instance.
  /// - [create]: factory receiving a [BuildContext].
  /// - [global]: whether to register globally (default: `true`).
  /// - [autoRemove]: whether to auto-dispose (default: `true`).
  /// - [assignId]: whether to use a unique ID.
  /// - [filter]: optional filter for selective rebuilds.
  /// - [tag]: optional tag for the instance.
  factory Bind.builder({
    Widget? child,
    InitBuilder<T>? init,
    InstanceCreateBuilderCallback<T>? create,
    bool global = true,
    bool autoRemove = true,
    bool assignId = false,
    Object Function(T value)? filter,
    String? tag,
    Object? id,
    void Function(BindElement<T> state)? initState,
    void Function(BindElement<T> state)? dispose,
    void Function(BindElement<T> state)? didChangeDependencies,
    void Function(Binder<T> oldWidget, BindElement<T> state)? didUpdateWidget,
  }) => _FactoryBind<T>(
    // key: key,
    init: init,
    create: create,
    global: global,
    autoRemove: autoRemove,
    assignId: assignId,
    initState: initState,
    filter: filter,
    tag: tag,
    dispose: dispose,
    id: id,
    didChangeDependencies: didChangeDependencies,
    didUpdateWidget: didUpdateWidget,
    child: child,
  );

  /// Factory function that lazily creates the dependency of type [T].
  final InitBuilder<T>? init;

  /// Whether to register the dependency in the global Get registry.
  final bool global;

  /// Optional identifier to listen to specific update groups.
  final Object? id;

  /// Optional tag to distinguish multiple instances of the same type.
  final String? tag;

  /// Whether to automatically remove the dependency when the widget is disposed.
  final bool autoRemove;

  /// Whether to assign a unique ID for this binding.
  final bool assignId;

  /// Optional filter that limits rebuilds based on state changes.
  final Object Function(T value)? filter;

  /// Callback invoked when the element is first inserted into the tree.
  final void Function(BindElement<T> state)? initState;

  /// Callback invoked when the element is permanently removed from the tree.
  final void Function(BindElement<T> state)? dispose;

  /// Callback invoked when a dependency of this element changes.
  final void Function(BindElement<T> state)? didChangeDependencies;

  /// Callback invoked when the parent widget rebuilds with a new configuration.
  final void Function(Binder<T> oldWidget, BindElement<T> state)?
  didUpdateWidget;

  /// The child widget to render.
  final Widget? child;

  /// Registers an instance of type [S] and returns a [Bind] configuration.
  ///
  /// This is similar to `Get.put()` but designed for use within the widget tree.
  static Bind put<S>(
    S dependency, {
    String? tag,
    bool permanent = false,
  }) {
    Get.put<S>(dependency, tag: tag, permanent: permanent);
    return _FactoryBind<S>(
      autoRemove: permanent,
      assignId: true,
      tag: tag,
    );
  }

  /// Whether to use fenix mode globally for `lazyPut` bindings.
  static bool fenixMode = false;

  /// Lazily registers an instance of type [S] using [builder].
  ///
  /// The instance is created only when first accessed via `Get.find<S>()`.
  static Bind lazyPut<S>(
    InstanceBuilderCallback<S> builder, {
    String? tag,
    bool? fenix,
    // VoidCallback? onInit,
    VoidCallback? onClose,
  }) {
    Get.lazyPut<S>(builder, tag: tag, fenix: fenix ?? fenixMode);
    return _FactoryBind<S>(
      tag: tag,
      // initState: (_) {
      //   onInit?.call();
      // },
      dispose: (_) {
        onClose?.call();
      },
    );
  }

  /// Creates a non-singleton instance of type [S] using a context-aware [builder].
  ///
  /// Each call to `Get.find<S>()` returns a new instance.
  static Bind create<S>(
    InstanceCreateBuilderCallback<S> builder, {
    String? tag,
    bool permanent = true,
  }) {
    return _FactoryBind<S>(
      create: builder,
      tag: tag,
      global: false,
    );
  }

  /// Registers a factory that creates a new instance of type [S] on every `find` call.
  static Bind spawn<S>(
    InstanceBuilderCallback<S> builder, {
    String? tag,
    bool permanent = true,
  }) {
    Get.spawn<S>(builder, tag: tag, permanent: permanent);
    return _FactoryBind<S>(
      tag: tag,
      global: false,
      autoRemove: permanent,
    );
  }

  /// Finds and returns the registered instance of type [S].
  static S find<S>({String? tag}) => Get.find<S>(tag: tag);

  /// Deletes the registered instance of type [S].
  static Future<bool> delete<S>({String? tag, bool force = false}) async =>
      Get.delete<S>(tag: tag, force: force);

  /// Deletes all registered instances.
  static Future<void> deleteAll({bool force = false}) async =>
      Get.deleteAll(force: force);

  /// Reloads all registered instances.
  static void reloadAll({bool force = false}) => Get.reloadAll(force: force);

  /// Reloads a specific registered instance of type [S].
  static void reload<S>({String? tag, String? key, bool force = false}) =>
      Get.reload<S>(tag: tag, key: key, force: force);

  /// Checks whether an instance of type [S] is currently registered.
  static bool isRegistered<S>({String? tag}) => Get.isRegistered<S>(tag: tag);

  /// Checks whether a lazy instance of type [S] is prepared but not yet created.
  static bool isPrepared<S>({String? tag}) => Get.isPrepared<S>(tag: tag);

  /// Replaces a registered instance of type [P] with a new [child] instance.
  static void replace<P>(P child, {String? tag}) {
    final info = Get.getInstanceInfo<P>(tag: tag);
    final permanent = info.isPermanent ?? false;
    delete<P>(tag: tag, force: permanent);
    Get.put(child, tag: tag, permanent: permanent);
  }

  /// Lazily replaces a registered instance of type [P] with a new builder.
  static void lazyReplace<P>(
    InstanceBuilderCallback<P> builder, {
    String? tag,
    bool? fenix,
  }) {
    final info = Get.getInstanceInfo<P>(tag: tag);
    final permanent = info.isPermanent ?? false;
    delete<P>(tag: tag, force: permanent);
    Get.lazyPut(builder, tag: tag, fenix: fenix ?? permanent);
  }

  /// Retrieves the controller of type [T] from the nearest [Binder] ancestor.
  ///
  /// If [rebuild] is `true`, the calling context subscribes to controller updates.
  static T of<T>(
    BuildContext context, {
    bool rebuild = false,
    // Object Function(T value)? filter,
  }) {
    final inheritedElement =
        context.getElementForInheritedWidgetOfExactType<Binder<T>>()
            as BindElement<T>?;

    if (inheritedElement == null) {
      throw BindError(controller: '$T', tag: null);
    }

    if (rebuild) {
      // var newFilter = filter?.call(inheritedElement.controller!);
      // if (newFilter != null) {
      //  context.dependOnInheritedElement(inheritedElement, aspect: newFilter);
      // } else {
      context.dependOnInheritedElement(inheritedElement);
      // }
    }

    final controller = inheritedElement.controller;

    return controller;
  }

  /// Returns a copy of this [Bind] with the given [child] widget.
  @factory
  Bind<T> _copyWithChild(Widget child);
}

class _FactoryBind<T> extends Bind<T> {
  const _FactoryBind({
    super.key,
    this.child,
    this.init,
    this.create,
    this.global = true,
    this.autoRemove = true,
    this.assignId = false,
    this.initState,
    this.filter,
    this.tag,
    this.dispose,
    this.id,
    this.didChangeDependencies,
    this.didUpdateWidget,
  }) : super(child: child);
  @override
  final InitBuilder<T>? init;

  final InstanceCreateBuilderCallback<T>? create;

  @override
  final bool global;
  @override
  final Object? id;
  @override
  final String? tag;
  @override
  final bool autoRemove;
  @override
  final bool assignId;
  @override
  final Object Function(T value)? filter;

  @override
  final void Function(BindElement<T> state)? initState;
  @override
  final void Function(BindElement<T> state)? dispose;
  @override
  final void Function(BindElement<T> state)? didChangeDependencies;
  @override
  final void Function(Binder<T> oldWidget, BindElement<T> state)?
  didUpdateWidget;

  @override
  final Widget? child;

  @override
  Bind<T> _copyWithChild(Widget child) {
    return Bind<T>.builder(
      init: init,
      create: create,
      global: global,
      autoRemove: autoRemove,
      assignId: assignId,
      initState: initState,
      filter: filter,
      tag: tag,
      dispose: dispose,
      id: id,
      didChangeDependencies: didChangeDependencies,
      didUpdateWidget: didUpdateWidget,
      child: child,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Binder<T>(
      create: create,
      global: global,
      autoRemove: autoRemove,
      assignId: assignId,
      initState: initState,
      filter: filter,
      tag: tag,
      dispose: dispose,
      id: id,
      didChangeDependencies: didChangeDependencies,
      didUpdateWidget: didUpdateWidget,
      child: child!,
    );
  }
}

/// A convenience widget that applies multiple [Bind] widgets in order.
///
/// The [binds] list is folded so each binding wraps the next,
/// providing all dependencies to the [child] widget.
class Binds extends StatelessWidget {
  /// Creates a [Binds] widget.
  ///
  /// [binds] must not be empty.
  Binds({
    required this.binds,
    required this.child,
    super.key,
  }) : assert(binds.isNotEmpty, 'Binds cannot be empty');

  /// The list of [Bind] configurations to apply.
  final List<Bind<dynamic>> binds;

  /// The child widget that receives all the bindings.
  final Widget child;

  @override
  Widget build(BuildContext context) =>
      binds.reversed.fold(child, (widget, e) => e._copyWithChild(widget));
}

class Binder<T> extends InheritedWidget {
  /// Create an inherited widget that updates its dependents when [GetxController]
  /// sends notifications.
  ///
  /// The [child] argument is required
  const Binder({
    required super.child,
    super.key,
    this.init,
    this.global = true,
    this.autoRemove = true,
    this.assignId = false,
    this.lazy = true,
    this.initState,
    this.filter,
    this.tag,
    this.dispose,
    this.id,
    this.didChangeDependencies,
    this.didUpdateWidget,
    this.create,
  });

  /// Factory function that lazily creates the controller.
  final InitBuilder<T>? init;

  /// Context-aware factory to create the controller.
  final InstanceCreateBuilderCallback? create;

  /// Whether to register the instance globally.
  final bool global;

  /// Optional identifier to listen to specific update groups.
  final Object? id;

  /// Optional tag for the controller instance.
  final String? tag;

  /// Whether to lazily initialize the controller.
  final bool lazy;

  /// Whether to automatically remove the controller when disposed.
  final bool autoRemove;

  /// Whether to assign a unique ID for this binding.
  final bool assignId;

  /// Optional filter that limits rebuilds.
  final Object Function(T value)? filter;

  /// Callback invoked when the element is first inserted into the tree.
  final void Function(BindElement<T> state)? initState;

  /// Callback invoked when the element is permanently removed from the tree.
  final void Function(BindElement<T> state)? dispose;

  /// Callback invoked when a dependency of this element changes.
  final void Function(BindElement<T> state)? didChangeDependencies;

  /// Callback invoked when the parent widget rebuilds with a new configuration.
  final void Function(Binder<T> oldWidget, BindElement<T> state)?
  didUpdateWidget;

  @override
  bool updateShouldNotify(Binder<T> oldWidget) {
    return oldWidget.id != id ||
        oldWidget.global != global ||
        oldWidget.autoRemove != autoRemove ||
        oldWidget.assignId != assignId;
  }

  @override
  InheritedElement createElement() => BindElement<T>(this);
}

/// The BindElement is responsible for injecting dependencies into the widget
/// tree so that they can be observed
class BindElement<T> extends InheritedElement {
  BindElement(Binder<T> super.widget) {
    initState();
  }

  /// List of dispose callbacks to run when the element is unmounted.
  final disposers = <Disposer>[];

  InitBuilder<T>? _controllerBuilder;

  T? _controller;

  /// The controller instance managed by this element.
  ///
  /// Lazily initialized on first access. Throws [BindError] if
  /// no controller could be created.
  T get controller {
    if (_controller == null) {
      _controller = _controllerBuilder?.call();
      _subscribeToController();
      if (_controller == null) {
        throw BindError(controller: T, tag: widget.tag);
      }
      return _controller!;
    } else {
      return _controller!;
    }
  }

  bool? _isCreator = false;
  bool? _needStart = false;
  bool _wasStarted = false;
  VoidCallback? _remove;
  Object? _filter;

  /// Initializes the dependency registration and controller builder.
  void initState() {
    widget.initState?.call(this);

    final isRegistered = Get.isRegistered<T>(tag: widget.tag);

    if (widget.global) {
      if (isRegistered) {
        if (Get.isPrepared<T>(tag: widget.tag)) {
          _isCreator = true;
        } else {
          _isCreator = false;
        }

        _controllerBuilder = () => Get.find<T>(tag: widget.tag);
      } else {
        _controllerBuilder = () =>
            widget.create?.call(this) ?? widget.init?.call();
        _isCreator = true;
        if (widget.lazy) {
          Get.lazyPut<T>(_controllerBuilder!, tag: widget.tag);
        } else {
          Get.put<T>(_controllerBuilder!(), tag: widget.tag);
        }
      }
    } else {
      if (widget.create != null) {
        _controllerBuilder = () => widget.create!.call(this);
        Get.spawn<T>(_controllerBuilder!, tag: widget.tag, permanent: false);
      } else {
        _controllerBuilder = widget.init;
      }
      _controllerBuilder =
          (widget.create != null ? () => widget.create!.call(this) : null) ??
          widget.init;
      _isCreator = true;
      _needStart = true;
    }
  }

  /// Register to listen Controller's events.
  /// It gets a reference to the remove() callback, to delete the
  /// setState "link" from the Controller.
  void _subscribeToController() {
    if (widget.filter != null) {
      _filter = widget.filter!(_controller as T);
    }
    final filter = _filter != null ? _filterUpdate : getUpdate;
    final localController = _controller;

    if ((_needStart ?? false) && localController is GetLifeCycleMixin) {
      localController.onStart();
      _needStart = false;
      _wasStarted = true;
    }

    if (localController is GetxController) {
      _remove?.call();
      _remove = (widget.id == null)
          ? localController.addListener(filter)
          : localController.addListenerId(widget.id, filter);
    } else if (localController is Listenable) {
      _remove?.call();
      localController.addListener(filter);
      _remove = () => localController.removeListener(filter);
    } else if (localController is StreamController) {
      _remove?.call();
      final stream = localController.stream.listen((_) => filter());
      _remove = () => stream.cancel();
    }
  }

  void _filterUpdate() {
    final newFilter = widget.filter!(_controller as T);
    if (newFilter != _filter) {
      _filter = newFilter;
      getUpdate();
    }
  }

  /// Disposes of the controller and cleans up all internal references.
  void dispose() {
    widget.dispose?.call(this);
    if (_isCreator! || widget.assignId) {
      if (widget.autoRemove && Get.isRegistered<T>(tag: widget.tag)) {
        Get.delete<T>(tag: widget.tag);
      }
    }

    for (final disposer in disposers) {
      disposer();
    }

    disposers.clear();

    _remove?.call();
    _controller = null;
    _isCreator = null;
    _remove = null;
    _filter = null;
    _needStart = null;
    _controllerBuilder = null;
    _controller = null;
  }

  @override
  Binder<T> get widget => super.widget as Binder<T>;

  var _dirty = false;

  @override
  void update(Binder<T> newWidget) {
    final oldNotifier = widget.id;
    final newNotifier = newWidget.id;
    if (oldNotifier != newNotifier && _wasStarted) {
      _subscribeToController();
    }
    widget.didUpdateWidget?.call(widget, this);
    super.update(newWidget);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    widget.didChangeDependencies?.call(this);
  }

  @override
  Widget build() {
    if (_dirty) {
      notifyClients(widget);
    }
    // return Notifier.instance.notifyAppend(
    //   NotifyData(
    //       disposers: disposers, updater: getUpdate, throwException: false),
    return super.build();
    //);
  }

  /// Marks the element as dirty and schedules a rebuild.
  void getUpdate() {
    _dirty = true;
    markNeedsBuild();
  }

  @override
  void notifyClients(Binder<T> oldWidget) {
    super.notifyClients(oldWidget);
    _dirty = false;
  }

  @override
  void unmount() {
    dispose();
    super.unmount();
  }
}

/// An error thrown when a [Bind] of type [T] cannot be found in the widget tree.
class BindError<T> extends Error {
  /// Creates a [BindError].
  BindError({required this.controller, required this.tag});

  /// The type of the controller that could not be found.
  final T controller;

  /// The tag used during the lookup.
  final String? tag;

  @override
  String toString() {
    if (controller == 'dynamic') {
      return '''Error: please specify type [<T>] when calling context.listen<T>() or context.find<T>() method.''';
    }

    return '''Error: No Bind<$controller>  ancestor found. To fix this, please add a Bind<$controller> widget ancestor to the current context.
      ''';
  }
}
