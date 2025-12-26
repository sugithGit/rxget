import '../../../../rxget.dart';

abstract class GetState with GetStateMixin {}

mixin GetStateMixin {
  Rx<T> obs<T>(T value) {
    return Rx(value);
  }
}

class A extends GetState {
  late final a = obs(0);
}
