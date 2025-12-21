import '../../../get_core/get_core.dart';
import '../extension/extension_instance.dart';

/// A class to define a dependency injection configuration.
///
/// [T] is the type of the dependency.
/// A contract for managing the lifecycle of a dependency injection binding.
///
/// Implementers of this interface are responsible for registering and disposing
/// of dependencies within the `GetX` ecosystem.
abstract interface class GetInBinding {
  /// Registers the dependency into the `GetX` dependency injection system.
  void register();

  /// Removes the dependency from the `GetX` dependency injection system.
  void dispose();
}

/// A configuration class for defining and managing a single dependency injection.
///
/// [T] represents the type of the dependency being registered.
///
/// This class encapsulates the logic for creating, registering, and disposing
/// a dependency, supporting both eager and lazy initialization.
final class GetIn<T> implements GetInBinding {
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
  const GetIn(
    this._builder, {
    this.lazy = true,
    this.tag,
  });

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
    if (lazy) {
      Get.lazyPut<T>(_builder, tag: tag, fenix: false);
    } else {
      Get.put<T>(_builder(), tag: tag);
    }
  }

  @override
  void dispose() {
    Get.delete<T>(tag: tag);
  }

  @override
  String toString() {
    return 'GetIn<$T>(tag: $tag, lazy: $lazy)';
  }
}
