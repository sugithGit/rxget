part of 'counter_controller.dart';

/// Schema class for counter state.
///
/// The generator will produce `_CounterState extends GetxState` with:
/// - `Rx<int> _count` + getter/setter
/// - `Rx<String> _title` + getter/setter
/// - `bool _isEditing` (plain, via @update)
/// - Auto `onClose()` that closes `_count` and `_title`
@getxState
class CounterState {
  CounterState({
    this.count = 0,
    this.title = 'Counter',
    this.isEditing = false,
    this.testingA,
  });

  int count;
  String title;
  @update
  bool isEditing;
  bool? testingA;
}
