part of 'counter_controller.dart';

final class _CounterState extends GetxState {
  final _count = 0.obs;

  int get count => _count.value;

  @override
  void onClose() {
    _count.close();
  }
}
