# rxget_annotation

Annotations for the `rxget` state management package. Use with `rxget_generator` to eliminate GetxState boilerplate.

## Usage

Use the `@getxState` annotation on a class to define your reactive state schema:

```dart
import 'package:rxget_annotation/rxget_annotation.dart';

@getxState
class CounterState {
  CounterState({
    this.count = 0,
    @update this.isEditing = false,
  });

  int count;
  bool isEditing;
}
```
