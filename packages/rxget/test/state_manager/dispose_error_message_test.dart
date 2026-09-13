import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

/// Mimics the shape of a real controller: the variable is declared in one
/// place, closed in another, and used from a third.
class _CounterState {
  final a = 8.obs;

  void closeA() {
    a.close();
  }
}

const _thisFile = 'dispose_error_message_test.dart';

void main() {
  tearDown(() {
    RxLifecycleDebug.captureStackTraces = true;
  });

  group('Use after close error message', () {
    testWidgets('observing a closed Rx points at declaration and close', (
      tester,
    ) async {
      final state = _CounterState()..closeA();

      await tester.pumpWidget(
        MaterialApp(home: Obx(() => Text('${state.a.value}'))),
      );

      final error = tester.takeException() as FlutterError;
      final message = error.toStringDeep();

      expect(message, contains('RxInt was used after being closed'));
      expect(message, contains('Obx/GetX'));
      expect(message, contains('The RxInt was declared at:'));
      expect(message, contains('and closed at:'));
      // Both locations point back at this file, not at rxget internals.
      expect(message, contains('_CounterState'));
      expect(message, contains('$_thisFile:8:'));
      expect(message, contains('$_thisFile:11:'));
      expect(message, isNot(contains('#0      debugCaptureLifecycleStack')));
    });

    test('closing twice still points at the declaration and the close', () {
      final state = _CounterState()..closeA();

      final message = _errorFrom(state.a.close).toStringDeep();

      expect(message, contains('RxInt was used after being closed'));
      expect(message, contains('The RxInt was declared at:'));
      expect(message, contains('$_thisFile:8:'));
      expect(message, contains('$_thisFile:11:'));
    });

    test('debugLabel names the variable in the message', () {
      final counter = 0.obs
        ..debugLabel = 'CounterState.a'
        ..close();

      final error = _errorFrom(counter.close);

      expect(
        error.toStringDeep(),
        contains('The RxInt "CounterState.a" was used after being closed'),
      );
    });

    test('without captured stacks the message explains how to get them', () {
      RxLifecycleDebug.captureStackTraces = false;
      final counter = 0.obs..close();

      final error = _errorFrom(counter.close);
      final message = error.toStringDeep();

      expect(message, contains('RxLifecycleDebug.captureStackTraces'));
      expect(message, isNot(contains('was declared at:')));
    });
  });
}

/// Runs [body] and returns the [FlutterError] it threw.
FlutterError _errorFrom(VoidCallback body) {
  try {
    body();
    // The whole point of these tests is to inspect the thrown FlutterError.
    // ignore: avoid_catching_errors
  } on FlutterError catch (error) {
    return error;
  }
  fail('Expected a FlutterError to be thrown.');
}
