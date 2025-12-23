import '../../../../get_core/get_core.dart';
import '../../extension/extension_instance.dart';
import 'get_in_base.dart';

/// A configuration class for defining and managing a single dependency injection.
///
/// [T] represents the type of the dependency being registered.
///
/// This class encapsulates the logic for creating, registering, and disposing
/// a dependency, supporting both eager and lazy initialization.
final class GetIn<T> implements GetInBase {
  /// Creates a [GetIn] configuration.
  ///
  /// [builder] is a factory function that returns an instance of [T].
  /// This function is invoked when the dependency is requested (if [lazy] is true)
  /// or immediately upon registration (if [lazy] is false).
  ///
  /// [lazy] determines whether the dependency is initialized lazily.
  /// Defaults to `true`.
  ///
  /// [tag] is an optional string identifier for grouping or distinguishing
  /// multiple dependencies of the same type.
  ///
  /// Example Usage:
  /// ```dart
  /// GetIn<MyController>(() => MyController());
  /// GetIn<Service>(() => Service(), lazy: false, tag: 'core');
  /// ```
  GetIn(
    this._builder, {
    this.lazy = true,
    this.tag,
  }) : assert(
         T != dynamic,
         'GetIn<dynamic> detected. You likely used "List<GetIn>" which infers dynamic. Use "List<GetInBase>" or explicitly specify the type "GetIn<MyType>"',
       );

  /// The factory function used to create the dependency instance.
  final T Function() _builder;

  /// Whether the dependency should be lazily loaded.
  ///
  /// If `true`, the [_builder] is not called until the dependency is first used.
  /// If `false`, the [_builder] is called immediately upon registration.
  final bool lazy;

  /// An optional unique identifier for this dependency.
  ///
  /// Useful when registering multiple instances of the same type [T].
  final String? tag;

  @override
  void register() {
    _registerLogic();
  }

  @override
  void dispose() {
    _disposeLogic();
  }

  @override
  String toString() {
    return 'GetIn<$T>(tag: $tag, lazy: $lazy)';
  }
}

/// A private extension to encapsulate the implementation details of [GetIn].
///
/// This extension hides the logic for registering and disposing dependencies
/// from the public API, keeping the [GetIn] class focused on configuration.
extension _GetInLogic<T> on GetIn<T> {
  void _registerLogic() {
    if (lazy) {
      Get.lazyPut<T>(_builder, tag: tag, fenix: false);
    } else {
      Get.put<T>(_builder(), tag: tag);
    }
  }

  void _disposeLogic() {
    Get.delete<T>(tag: tag);
  }
}
