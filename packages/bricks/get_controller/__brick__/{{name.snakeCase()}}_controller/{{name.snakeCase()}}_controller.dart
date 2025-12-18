import 'package:rxget/get.dart';

part '{{name.snakeCase()}}_state.dart';

final class {{name.pascalCase()}}Controller extends GetxController<_{{name.pascalCase()}}State> {
  @override
  // 
  // ignore: library_private_types_in_public_api
  final state = _{{name.pascalCase()}}State();

  /// Event Getters
  //
  void updateLoading()=> _updateLoading();

  /// Events
  //

  void _updateLoading(){
    state._loading.value = !state._loading.value;
  }
}
