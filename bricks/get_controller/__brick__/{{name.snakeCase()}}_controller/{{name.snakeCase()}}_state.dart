part of '{{name.snakeCase()}}_controller.dart';

final class _{{name.pascalCase()}}State {
  // Add fields and constructor for {{name}} state

  /// Private
  final _loading = false.obs;

  /// Public
  bool get loading => _loading.value;
}
