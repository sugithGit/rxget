import '../../rxget.dart';

extension GetResetExt on GetInterface {
  /// Resets all instances and clears navigation history.
  ///
  /// [clearRouteBindings] determines whether to clear route-specific bindings.
  void reset({bool clearRouteBindings = true}) {
    Get.resetInstance(clearRouteBindings: clearRouteBindings);
  }
}
