import 'package:flutter/widgets.dart';

import 'get_in.dart';

/// A widget that provides scoped dependency injection with automatic disposal.
///
/// `GetInWidget` automatically disposes injected dependencies when the widget is
/// removed from the widget tree.
///
/// Usage:
///
/// ```dart
/// GetInWidget(
///   dependencies: [
///     GetIn<MyController>(() => MyController()),
///     // Dependencies can reference previously registered ones:
///     GetIn<OtherController>(() => OtherController(Get.find<MyController>())),
///   ],
///   child: MyWidget(),
/// )
/// ```
final class GetInWidget extends StatefulWidget {
  /// Creates a GetInWidget for scoped dependency injection.
  ///
  /// [dependencies] can be either:
  /// - A list of [GetIn] configurations for simple cases
  /// - A builder function returning a list for dynamic dependency lists
  ///
  /// [child] is required.
  const GetInWidget({
    required this.child,
    required this.dependencies,
    super.key,
  });

  /// Dependencies to inject - can be a list or a builder function.
  final dynamic dependencies;

  /// The child widget.
  final Widget child;

  @override
  State<GetInWidget> createState() => _GetInWidgetState();
}

class _GetInWidgetState extends State<GetInWidget> {
  late final List<GetIn> _dependencies;

  @override
  void initState() {
    super.initState();
    // Support both list and builder function
    if (widget.dependencies is List<GetIn> Function()) {
      _dependencies = (widget.dependencies as List<GetIn> Function())();
    } else {
      _dependencies = widget.dependencies as List<GetIn>;
    }

    for (final dep in _dependencies) {
      dep.register();
    }
  }

  @override
  void dispose() {
    for (final dep in _dependencies) {
      dep.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
