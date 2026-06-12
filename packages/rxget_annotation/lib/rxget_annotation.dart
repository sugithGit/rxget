/// Annotations for rxget code generation.
///
/// Use `@getxState` on a class to generate a private `GetxState` subclass
/// with reactive (`Rx`) fields, public getters/setters, and automatic
/// `onClose()` disposal.
///
/// Use `@update` on individual fields to exclude them from reactive wrapping.
/// These fields will be plain Dart fields managed via `GetxController.update()`.
library;

export 'src/annotations.dart';
