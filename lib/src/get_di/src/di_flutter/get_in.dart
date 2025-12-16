import '../../../get_core/get_core.dart';
import '../../../get_instance/src/extension_instance.dart';

/// A class to define a dependency injection configuration.
///
/// [T] is the type of the dependency.
final class GetIn<T> {
  /// Creates a dependency configuration.
  ///
  /// [instance] can be the object to inject (instance of [T])
  /// or a factory function returning the object ([T] Function()).
  ///
  /// [lazy] determines if the dependency should be lazy loaded (default: true).
  /// [tag] is an optional tag for the dependency.
  GetIn(
    dynamic instance, {
    this.lazy = true,
    this.tag,
  }) : _instance = instance is T ? instance : null,
       _builder = instance is T Function() ? instance : null,
       assert(
         T != dynamic,
         'You must explicitly specify the type T for GetIn<T> (e.g., GetIn<MyController>(...)) '
         'or ensure it is not inferred as dynamic.',
       ),
       assert(
         instance is T || instance is T Function(),
         'The argument must be of type $T or $T Function().',
       );

  /// The dependency instance.
  final T? _instance;

  /// The dependency builder.
  final T Function()? _builder;

  /// Whether to lazy load the dependency.
  final bool lazy;

  /// Optional tag for the dependency.
  final String? tag;

  /// Registers the dependency with GetX.
  void register() {
    if (_builder != null) {
      if (lazy) {
        Get.lazyPut<T>(_builder, tag: tag, fenix: false);
      } else {
        Get.put<T>(_builder(), tag: tag);
      }
    } else {
      if (lazy) {
        Get.lazyPut<T>(() => _instance!, tag: tag, fenix: false);
      } else {
        Get.put<T>(_instance as T, tag: tag);
      }
    }
  }

  /// Disposes the dependency from GetX.
  void dispose() {
    Get.delete<T>(tag: tag);
  }
}
