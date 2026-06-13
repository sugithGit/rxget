import 'package:rxget_annotation/rxget_annotation.dart';

part 'main.g.dart';

// Mock definitions of GetxState and Rx to allow this example to compile
// as a pure Dart package without requiring the Flutter SDK.
abstract class GetxState {
  void onClose() {}
}

class Rx<T> {
  Rx(this.value);
  T value;
  void close() {}
}

@getxState
class CounterState {
  CounterState({
    this.count = 0,
    @update this.title = 'Counter',
  });

  int count;

  @update
  String title;
}

void main() {
  final state = _CounterState(count: 10, title: 'My Counter');
  print('Title: ${state.title}, Count: ${state.count}');
  state.count = 11;
  print('Updated Count: ${state.count}');
  state.onClose();
}
