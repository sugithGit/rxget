/// Marks a class for `GetxState` code generation.
///
/// The annotated class serves as a schema — its fields define what reactive
/// state the generator will produce. The generator creates a private class
/// (`_ClassName`) that extends `GetxState` with:
///
/// - `Rx<T>` wrappers for each field (reactive by default)
/// - Public getters returning `.value`
/// - Public setters updating `.value`
/// - Automatic `onClose()` that closes all `Rx` fields
///
/// ## Example
///
/// ```dart
/// part 'counter_state.g.dart';
///
/// @getxState
/// class CounterState {
///   CounterState({this.count = 0, this.name = 'Counter'});
///   int count;
///   String name;
/// }
///
/// // Generated → _CounterState extends GetxState
/// // Use in controller:
/// class CounterController extends GetxController<_CounterState> {
///   @override
///   final state = _CounterState();
/// }
/// ```
class GetxStateAnnotation {
  /// Creates a [GetxStateAnnotation].
  const GetxStateAnnotation();
}

/// Convenience constant for the `@GetxStateAnnotation()` annotation.
///
/// Use `@getxState` to annotate your state schema class:
/// ```dart
/// @getxState
/// class MyState {
///   MyState({this.count = 0});
///   int count;
/// }
/// ```
const getxState = GetxStateAnnotation();

/// Marks a field to use plain update semantics instead of `.obs` reactivity.
///
/// Fields annotated with `@update` will **not** be wrapped in `Rx<T>`.
/// They become plain Dart fields in the generated class, and are excluded
/// from `onClose()` disposal. Use these with `GetxController.update()`
/// for manual rebuild control.
///
/// ## Example
///
/// ```dart
/// @getxState
/// class FormState {
///   FormState({this.email = '', @update this.isDirty = false});
///   String email;        // → Rx<String> (reactive)
///   @update bool isDirty; // → plain bool (non-reactive)
/// }
/// ```
class UpdateAnnotation {
  /// Creates an [UpdateAnnotation].
  const UpdateAnnotation();
}

/// Convenience constant for the `@UpdateAnnotation()` annotation.
///
/// Use `@update` on fields that should not be reactive:
/// ```dart
/// @update bool manuelSwitch;
/// ```
const update = UpdateAnnotation();
