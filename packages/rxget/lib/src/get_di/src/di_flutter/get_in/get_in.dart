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

  /// Tracks whether **this** [GetIn] instance was the one that registered
  /// the dependency into the GetX container.
  ///
  /// ## Why this field exists — the "double-pop" bug
  ///
  /// Consider the following navigation flow:
  ///
  /// Page A  →  Page B  →  (pop)  →  Page A  →  (pop)  →  Page A
  ///            ↑ controller registered here
  ///                        ↑ controller disposed here
  ///                                               ↑ Page B pushed again
  ///                                                 ↑ controller registered again
  ///
  /// Without this guard the old flow was:
  ///
  /// 1. Page A is already alive and has `T` registered in the GetX container
  ///    (e.g., by its own `GetInWidget`).
  /// 2. A nested `GetInWidget` on Page B tries to register `T`.  Because
  ///    `Get.isRegistered<T>()` returns `true`, it skips registration — correct.
  /// 3. The user pops Page B.  Without `_isRegistered`, `_disposeLogic` would
  ///    **unconditionally** call `Get.delete<T>()`, wiping out the instance that
  ///    belongs to Page A's scope.  When the user returns to Page A the
  ///    controller is gone and `Get.find<T>()` throws.
  ///
  /// The fix: set `_isRegistered = true` only when *this* instance performed
  /// the registration, and in `_disposeLogic` delete the dependency only when
  /// `_isRegistered` is `true`.  If another scope already owned the
  /// registration we leave it completely untouched.
  ///
  /// The field is nullable rather than `late final bool`.
  /// This means it defaults to `null` (which [_disposeLogic] treats as `false`)
  /// and safely handles any edge case where [dispose] is called without a prior
  /// [register] call (e.g., if Flutter replaces the widget tree during a test
  /// or error recovery before `initState` completes).  In normal usage
  /// [GetInWidget] always calls `register()` in `initState` first.
  bool _isRegistered = false;

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
  /// Registers the dependency in the GetX container.
  ///
  /// **Guard — already-registered check:**
  /// If `T` (with the same optional [GetIn.tag]) is already present in the
  /// GetX container it means another scope (e.g., a parent page or an ancestor
  /// `GetInWidget`) owns that registration.  In that case:
  ///   - We set [_isRegistered] to `false` to record that *we* did not register
  ///     it.
  ///   - We return early without touching the existing instance.
  ///
  /// This prevents the double-pop bug: if we skipped registration here, we must
  /// also skip deletion in [_disposeLogic]; the guard value ensures that.
  ///
  /// **Normal path:**
  /// If the dependency is not yet registered, we register it (lazily via
  /// `lazyPut` or eagerly via `put`, depending on [GetIn.lazy]) and set
  /// [_isRegistered] to `true` so that [_disposeLogic] knows it is safe — and
  /// necessary — to delete it when the owning widget leaves the tree.
  void _registerLogic() {
    if (Get.isRegistered<T>(tag: tag)) {
      // Another scope already owns this registration — do not touch it.
      // _isRegistered = false signals _disposeLogic to leave it alone.
      _isRegistered = false;
      return;
    }

    if (lazy) {
      // Register a lazy factory; the instance is created on first Get.find<T>().
      Get.lazyPut<T>(_builder, tag: tag, fenix: false);
    } else {
      // Register an eager instance; the builder is invoked immediately.
      Get.put<T>(_builder(), tag: tag);
    }

    // We performed the registration — we are responsible for cleanup.
    _isRegistered = true;
  }

  /// Removes the dependency from the GetX container **only** if this
  /// [GetIn] instance was the one that registered it.
  ///
  /// The guard uses `_isRegistered == true` (strict equality against the
  /// nullable field):
  /// - `true`  → we registered it, delete it now.
  /// - `false` → another scope registered it; leave it alone.
  /// - `null`  → [register] was never called (unexpected but safe); skip.
  ///
  /// This is the key guard that fixes the double-pop / controller-disposed
  /// bug described on [_isRegistered].
  void _disposeLogic() {
    if (_isRegistered) {
      Get.delete<T>(tag: tag);
    }
    // If _isRegistered is false or null we do nothing: either the owning scope
    // will handle its own cleanup, or register() was never called at all.
  }
}
