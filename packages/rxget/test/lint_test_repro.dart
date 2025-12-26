import 'package:rxget/rxget.dart';

class Valid extends RxState {
  final a = 0.obs; // OK
  final b = RxInt(0); // OK
}

class Invalid {
  final a = 0.obs; // LINT
  final b = RxInt(0); // LINT
}

void main() {
  final c = 0.obs; // LINT (Top level/Function scope)
  // RxState.create(() => ...); // If we supported the zone check removal, this lint doesn't know about zones.
  // It only checks for "Inside class implementing RxState".
}
