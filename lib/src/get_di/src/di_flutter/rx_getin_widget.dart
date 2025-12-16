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
///     GetIn<MyController>(MyController()),
///     // Use a builder for dependencies that depend on others:
///     GetIn<OtherController>(() => OtherController(Get.find<MyController>())),
///   ],
///   child: MyWidget(),
/// )
/// ```
final class GetInWidget extends StatefulWidget {
  /// Creates a GetInWidget for scoped dependency injection.
  ///
  /// [dependencies] is a list of [GetIn] configurations.
  /// [child] is required.
  const GetInWidget({
    required this.child,
    required this.dependencies,
    super.key,
  });

  /// List of dependencies to inject.
  final List<GetIn> dependencies;

  /// The child widget.
  final Widget child;

  @override
  State<GetInWidget> createState() => _GetInWidgetState();
}

class _GetInWidgetState extends State<GetInWidget> {
  @override
  void initState() {
    super.initState();
    for (final dep in widget.dependencies) {
      dep.register();
    }
  }

  @override
  void dispose() {
    for (final dep in widget.dependencies) {
      dep.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
