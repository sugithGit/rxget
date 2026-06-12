import 'package:rxget/rxget.dart';
import 'package:rxget_annotation/rxget_annotation.dart';

part 'counter_controller.g.dart';
part 'counter_state.dart';

/// Controller that manages counter logic.
///
/// Uses the generated `_CounterState` class which has:
/// - `_count` (Rx<int>) for reactive count
/// - `_title` (Rx<String>) for reactive title
/// - `_isEditing` (plain bool) for non-reactive editing flag
class CounterController extends GetxController<_CounterState> {
  CounterController({int initialCount = 0})
    : state = _CounterState(count: initialCount);

  @override
  final _CounterState state;

  /// Increment the counter reactively.
  void increment() {
    state._count.value++;
  }

  /// Decrement the counter reactively.
  void decrement() {
    if (state.count > 0) {
      state._count.value--;
    }
  }

  /// Reset the counter to zero.
  void reset() {
    state._count.value = 0;
  }

  /// Update the title reactively.
  void setTitle(String newTitle) {
    state._title.value = newTitle;
  }

  /// Toggle editing mode (non-reactive, uses update()).
  void toggleEditing() {
    state.isEditing = !state.isEditing;
    this.update();
  }
}
