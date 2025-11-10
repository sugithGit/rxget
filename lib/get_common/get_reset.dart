import '../get.dart';

extension GetResetExt on GetInterface {
  void reset({bool clearRouteBindings = true}) {
    Get.resetInstance(clearRouteBindings: clearRouteBindings);
  }
}
