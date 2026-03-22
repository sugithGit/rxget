import 'package:rxget/rxget.dart';

part 'counter_state.dart';

class CounterController extends GetxController<_CounterState> {
  @override
  _CounterState get state => _CounterState();

  void increment() {
    state._count.value++;
  }
}
