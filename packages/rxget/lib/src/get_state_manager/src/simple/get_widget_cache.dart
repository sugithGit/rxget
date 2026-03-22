import 'package:flutter/widgets.dart';

/// A widget base class that caches its state across widget tree rebuilds.
///
/// Subclasses must implement [createWidgetCache] to provide a [WidgetCache].
abstract class GetWidgetCache extends Widget {
  /// Creates a [GetWidgetCache] widget.
  const GetWidgetCache({super.key});

  @override
  GetWidgetCacheElement createElement() => GetWidgetCacheElement(this);

  /// Creates a [WidgetCache] instance for this widget.
  @protected
  @factory
  WidgetCache createWidgetCache();
}

/// The [Element] for [GetWidgetCache] that manages the [WidgetCache] lifecycle.
class GetWidgetCacheElement extends ComponentElement {
  /// Creates a [GetWidgetCacheElement] for the given [widget].
  GetWidgetCacheElement(GetWidgetCache widget)
    : cache = widget.createWidgetCache(),
      super(widget) {
    cache._element = this;
    cache._widget = widget;
  }

  @override
  void mount(Element? parent, Object? newSlot) {
    cache.onInit();
    super.mount(parent, newSlot);
  }

  @override
  Widget build() => cache.build(this);

  /// The cached state for this element.
  final WidgetCache<GetWidgetCache> cache;

  @override
  void activate() {
    super.activate();
    markNeedsBuild();
  }

  @override
  void unmount() {
    super.unmount();
    cache
      ..onClose()
      .._element = null;
  }
}

/// A cache that holds state for a [GetWidgetCache] widget.
///
/// Subclasses must implement [build] to return the widget tree.
/// Override [onInit] and [onClose] for lifecycle hooks.
@optionalTypeArgs
abstract class WidgetCache<T extends GetWidgetCache> {
  /// The widget associated with this cache.
  T? get widget => _widget;
  T? _widget;

  /// The [BuildContext] for this cache's element.
  BuildContext? get context => _element;

  GetWidgetCacheElement? _element;

  /// Called when the element is first mounted to the tree.
  @protected
  @mustCallSuper
  void onInit() {}

  /// Called when the element is permanently removed from the tree.
  @protected
  @mustCallSuper
  void onClose() {}

  /// Builds the widget tree for this cache.
  @protected
  Widget build(BuildContext context);
}
