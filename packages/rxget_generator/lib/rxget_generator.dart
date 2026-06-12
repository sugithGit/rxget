/// Code generator for rxget `GetxState` classes.
///
/// This package provides a `build_runner` generator that reads
/// `@getxState`-annotated schema classes and generates private
/// `GetxState` subclasses with:
///
/// - `Rx<T>` reactive wrappers for each field
/// - Public getters and setters
/// - Automatic `onClose()` disposal
///
/// Add this package as a `dev_dependency` and run:
/// ```bash
/// dart run build_runner build
/// ```
library;

export 'src/getx_state_generator.dart';
