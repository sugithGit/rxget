// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'main.dart';

// **************************************************************************
// GetxStateGenerator
// **************************************************************************

class _CounterState extends GetxState {
  _CounterState({int count = 0, String title = 'Counter'})
    : _count = Rx<int>(count),
      _title = title;

  // --- Reactive fields ---

  final Rx<int> _count;
  int get count => _count.value;
  set count(int value) => _count.value = value;

  // --- Update fields (non-reactive) ---

  String _title;
  String get title => _title;
  set title(String value) => _title = value;

  // --- Lifecycle ---

  @override
  void onClose() {
    _count.close();
  }
}
