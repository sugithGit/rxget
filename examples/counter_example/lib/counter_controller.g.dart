// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'counter_controller.dart';

// **************************************************************************
// GetxStateGenerator
// **************************************************************************

class _CounterState extends GetxState {
  _CounterState({
    int count = 0,
    String title = 'Counter',
    bool isEditing = false,
    bool? testingA,
  }) : _count = Rx<int>(count),
       _title = Rx<String>(title),
       _testingA = Rxn<bool>(testingA),
       _isEditing = isEditing;

  // --- Reactive fields ---

  final Rx<int> _count;
  int get count => _count.value;
  set count(int value) => _count.value = value;

  final Rx<String> _title;
  String get title => _title.value;
  set title(String value) => _title.value = value;

  final Rxn<bool> _testingA;
  bool? get testingA => _testingA.value;
  set testingA(bool? value) => _testingA.value = value;

  // --- Update fields (non-reactive) ---

  bool _isEditing;
  bool get isEditing => _isEditing;
  set isEditing(bool value) => _isEditing = value;

  // --- Lifecycle ---

  @override
  void onClose() {
    _count.close();
    _title.close();
    _testingA.close();
  }
}
