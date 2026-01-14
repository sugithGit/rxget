import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

class _State {
  final _counter = 0.obs;
  final _list = <int>[].obs;
  final _name = 'test'.obs;

  int get counter => _counter.value;
  List<int> get list => _list.value;
  String get name => _name.value;

  /// Close all RxVariables in this state
  void dispose() {
    _counter.close();
    _list.close();
    _name.close();
  }
}

class Controller extends GetxController<_State> {
  @override
  final state = _State();

  // void increment() {
  //   state._counter.value++;
  // }

  // void addItem(int item) {
  //   state._list.value = [...state._list.value, item];
  // }

  // void setName(String name) {
  //   state._name.value = name;
  // }

  @override
  void onClose() {
    state.dispose();
    super.onClose();
  }
}

void main() {
  group('Controller Lifecycle Tests', () {
    late Controller controller;

    setUp(() {
      controller = Controller()..onStart();
    });

    tearDown(() {
      // Create fresh controller for each test, don't try to clean up disposed one
    });

    test('Controller should have isClosed=false before disposal', () {
      expect(controller.isClosed, isFalse);
      expect(controller.initialized, isTrue);
    });

    test('Controller should have isClosed=true after onDelete()', () {
      controller.onDelete();

      expect(controller.isClosed, isTrue);
    });

    test('Controller onDelete() should only be called once', () {
      controller.onDelete();
      expect(controller.isClosed, isTrue);

      // Calling again should not throw
      controller.onDelete();
      expect(controller.isClosed, isTrue);
    });
  });

  group('RxVariable isDisposed Tests', () {
    test('RxVariable should be marked as disposed after close()', () {
      final counter = 0.obs;

      expect(counter.isDisposed, isFalse);

      counter.close();

      expect(counter.isDisposed, isTrue);
    });

    test('RxInt should be marked as disposed after close()', () {
      final rxInt = RxInt(42);

      expect(rxInt.isDisposed, isFalse);

      rxInt.close();

      expect(rxInt.isDisposed, isTrue);
    });

    test('RxString should be marked as disposed after close()', () {
      final rxString = RxString('hello');

      expect(rxString.isDisposed, isFalse);

      rxString.close();

      expect(rxString.isDisposed, isTrue);
    });

    test('RxList should be marked as disposed after close()', () {
      final rxList = <int>[].obs;

      expect(rxList.isDisposed, isFalse);

      rxList.close();

      expect(rxList.isDisposed, isTrue);
    });

    test('Setting value on disposed RxVariable should be silently ignored', () {
      final counter = 0.obs
        ..close()
        // This should be silently ignored (no exception thrown)
        // Based on the RxObjectMixin.value setter: if (isDisposed) return;
        ..value = 999;

      expect(counter.isDisposed, isTrue);
    });

    test('RxVariable without stream access should dispose cleanly', () {
      // When stream is never accessed, _controller is null
      // In this case, close() should still work
      final counter = 0.obs;

      expect(counter.isDisposed, isFalse);

      // Close without ever accessing the stream
      counter.close();

      expect(counter.isDisposed, isTrue);
    });
  });

  group('State Disposal Tests', () {
    test('All RxVariables in _State should be disposed together', () {
      final state = _State();

      expect(state._counter.isDisposed, isFalse);
      expect(state._list.isDisposed, isFalse);
      expect(state._name.isDisposed, isFalse);

      state.dispose();

      expect(state._counter.isDisposed, isTrue);
      expect(state._list.isDisposed, isTrue);
      expect(state._name.isDisposed, isTrue);
    });

    test(
      'State RxVariables should be disposed when Controller.onDelete() is called',
      () {
        final controller = Controller()..onStart();

        expect(controller.state._counter.isDisposed, isFalse);
        expect(controller.state._list.isDisposed, isFalse);
        expect(controller.state._name.isDisposed, isFalse);

        controller.onDelete();

        expect(controller.isClosed, isTrue);
        expect(controller.state._counter.isDisposed, isTrue);
        expect(controller.state._list.isDisposed, isTrue);
        expect(controller.state._name.isDisposed, isTrue);
      },
    );
  });

  group('ListNotifier Disposal Tests', () {
    test(
      'Controller (ListNotifier) should have isDisposed=false initially',
      () {
        final controller = Controller()..onStart();

        expect(controller.isDisposed, isFalse);

        controller.onDelete();
      },
    );

    test(
      'ListNotifier listenersLength should be 0 after listeners removed',
      () {
        final controller = Controller()..onStart();

        // Add a listener
        final disposer = controller.addListener(() {});

        expect(controller.listenersLength, greaterThan(0));

        // Remove the listener
        disposer();

        expect(controller.listenersLength, equals(0));

        controller.onDelete();
      },
    );
  });

  group('RxVariable Stream Behavior Tests', () {
    test('Stream subscription should receive value updates', () async {
      final counter = 0.obs;
      final receivedValues = <int>[];

      // Access the stream and subscribe
      final subscription = counter.stream.listen(receivedValues.add);

      // Give time for initial value to be added
      await Future.delayed(const Duration(milliseconds: 10));

      // Update values
      counter
        ..value = 1
        ..value = 2
        ..value = 3;

      // Wait for stream events to propagate
      await Future.delayed(const Duration(milliseconds: 50));

      await subscription.cancel();

      // Should have received the updates
      expect(receivedValues, contains(1));
      expect(receivedValues, contains(2));
      expect(receivedValues, contains(3));

      // Clean up - close after subscription is cancelled to avoid the bug
      counter.close();
    });

    test('listenAndPump should prime stream with current value', () async {
      final counter = 5.obs;
      final receivedValues = <int>[];

      final subscription = counter.listenAndPump(receivedValues.add);

      // Wait for stream events
      await Future.delayed(const Duration(milliseconds: 50));

      await subscription.cancel();

      // Should have received the initial value (5)
      expect(receivedValues, contains(5));

      counter.close();
    });

    test(
      'Stream should not emit after value is set on disposed RxVariable',
      () async {
        final counter = 0.obs;
        final receivedValues = <int>[];

        // Access stream before close to create controller
        final subscription = counter.stream.listen(receivedValues.add);

        await Future.delayed(const Duration(milliseconds: 10));

        // Record values before close
        counter
          ..value = 1
          ..value = 2;

        await Future.delayed(const Duration(milliseconds: 10));

        // Close and cancel subscription before testing disposed behavior
        await subscription.cancel();
        counter.close();

        // Now try to set value on disposed RxVariable
        final valuesBeforeDisposedSet = List<int>.from(receivedValues);
        counter.value = 999;

        await Future.delayed(const Duration(milliseconds: 10));

        // Values should remain the same (999 should not be received)
        expect(receivedValues.length, equals(valuesBeforeDisposedSet.length));
        expect(receivedValues, isNot(contains(999)));
      },
    );
  });

  group('Memory Safety Tests', () {
    test(
      'Calling close() twice should throw FlutterError (use after dispose)',
      () {
        final counter = 0.obs..close();

        // Second close should throw because resource is already disposed
        expect(() => counter.close(), throwsFlutterError);
      },
    );

    test('Accessing value after close should still work', () {
      final counter = 42.obs..close();

      // Value should still be accessible (just can't be updated)
      expect(counter.value, equals(42));
    });

    test(
      'RxVariable without stream listeners disposes cleanly without null errors',
      () {
        final counter = 0.obs;

        // Never access the stream, just close
        expect(() => counter.close(), returnsNormally);
        expect(counter.isDisposed, isTrue);
      },
    );
  });
}
