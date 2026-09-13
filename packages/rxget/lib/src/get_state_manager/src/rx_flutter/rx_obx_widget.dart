import 'package:flutter/widgets.dart';

import '../simple/simple_builder.dart';

/// A callback that returns a [Widget] with no parameters.
typedef WidgetCallback = Widget Function();

/// The simplest reactive widget in GetX.
///
/// Just pass your Rx variable in the root scope of the callback to have it
/// automatically registered for changes.
///
/// final _name = "GetX".obs;
/// Obx(() => Text( _name.value )),... ;
class Obx extends ObxStatelessWidget {
  /// Creates an [Obx] widget.
  const Obx(this.builder, {super.key});

  /// The builder callback that returns the reactive widget tree.
  final WidgetCallback builder;

  @override
  Widget build(BuildContext context) {
    return builder();
  }
}
