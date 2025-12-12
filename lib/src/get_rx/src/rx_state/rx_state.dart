part of '../rx_types/rx_types.dart';

class RxState {
  static const String rxZoneKey = 'getx_rx_zone_key';

  /// Helper to create a new RxState context.
  /// Useful for manual instantiation if not using Get.lazyPut.
  static T create<T>(T Function() builder) {
    return runZoned(builder, zoneValues: {rxZoneKey: true});
  }

  static void _checkZone() {
    if (Zone.current[rxZoneKey] != true) {
      throw StateError(
        'Rx variables can only be created within an RxState context.\n'
        'Use Get.lazyPut(() => Controller()) or RxState.create(() => Controller()).\n'
        'If using Get.put(Controller()), ensure Rx variables are initialized lazily (e.g., late final count = 0.obs).',
      );
    }
  }
}

/// Global function to create Rx variables.
/// Checks if called within an RxState context.
Rx<T> obs<T>(T value) {
  RxState._checkZone();
  return Rx<T>(value);
}
