import '../../../get_core/get_core.dart';
import '../../../get_instance/src/extension_instance.dart';

/// A class to define a dependency injection configuration.
///
/// [T] is the type of the dependency.
final class GetIn<T> {
  /// Creates a dependency configuration.
  ///
  /// [instance] is the object to inject.
  /// [lazy] determines if the dependency should be lazy loaded (default: true).
  /// [tag] is an optional tag for the dependency.
  GetIn(
    this.instance, {
    this.lazy = true,
    this.tag,
  }) : assert(
         T != dynamic,
         'You must explicitly specify the type T for GetIn<T> (e.g., GetIn<MyController>(...)) '
         'or ensure it is not inferred as dynamic.',
       );

  /// The dependency instance.
  final T instance;

  /// Whether to lazy load the dependency.
  final bool lazy;

  /// Optional tag for the dependency.
  final String? tag;

  /// Registers the dependency with GetX.
  void register() {
    if (lazy) {
      Get.lazyPut<T>(() => instance, tag: tag, fenix: false);
    } else {
      Get.put<T>(instance, tag: tag);
    }
  }

  /// Disposes the dependency from GetX.
  void dispose() {
    Get.delete<T>(tag: tag);
  }
}
