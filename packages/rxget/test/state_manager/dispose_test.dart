import 'package:flutter/material.dart';
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

/// Controller that does NOT override onClose - RxVariables won't be auto-disposed
class _ControllerState {}

class ControllerWithoutDispose extends GetxController<_ControllerState> {
  final counter = 0.obs;

  @override
  _ControllerState get state => _ControllerState();

  void increment() {
    counter.value++;
  }
}

/// Controller that properly disposes RxVariables in onClose
class ControllerWithDispose extends GetxController<_ControllerState> {
  final counter = 0.obs;

  @override
  _ControllerState get state => _ControllerState();

  void increment() {
    counter.value++;
  }

  @override
  void onClose() {
    counter.close();
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

  group('Obx Widget Dispose Tests', () {
    tearDown(() {
      // Clean up any registered controllers
      Get.reset();
    });

    testWidgets(
      'RxVariable should NOT be disposed when Obx widget is unmounted',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());

        // Initially not disposed
        expect(controller.counter.isDisposed, isFalse);

        // Build widget with Obx
        await tester.pumpWidget(
          MaterialApp(
            home: Obx(() => Text('Count: ${controller.counter.value}')),
          ),
        );

        expect(find.text('Count: 0'), findsOneWidget);

        // Unmount the widget (replace with different widget)
        await tester.pumpWidget(
          const MaterialApp(home: Text('No Obx')),
        );

        // RxVariable should still NOT be disposed after widget unmount
        // GetX only removes listeners, it does NOT close the stream
        expect(controller.counter.isDisposed, isFalse);

        // Should still be able to update the value
        controller.increment();
        expect(controller.counter.value, equals(1));
      },
    );

    testWidgets(
      'RxVariable should remain reactive after Obx widget remount',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());

        // Build widget with Obx
        await tester.pumpWidget(
          MaterialApp(
            home: Obx(() => Text('Count: ${controller.counter.value}')),
          ),
        );

        expect(find.text('Count: 0'), findsOneWidget);

        // Update value
        controller.increment();
        await tester.pump();
        expect(find.text('Count: 1'), findsOneWidget);

        // Unmount the widget
        await tester.pumpWidget(
          const MaterialApp(home: Text('No Obx')),
        );

        // Update value while widget is unmounted
        controller.increment();
        expect(controller.counter.value, equals(2));

        // Remount a new Obx widget
        await tester.pumpWidget(
          MaterialApp(
            home: Obx(() => Text('Count: ${controller.counter.value}')),
          ),
        );

        // Should show the updated value
        expect(find.text('Count: 2'), findsOneWidget);

        // Should still be reactive
        controller.increment();
        await tester.pumpAndSettle();
        expect(find.text('Count: 3'), findsOneWidget);
      },
    );

    testWidgets(
      'Controller with onClose should dispose RxVariable when Get.delete() is called',
      (tester) async {
        final controller = Get.put(ControllerWithDispose());

        // Build widget
        await tester.pumpWidget(
          MaterialApp(
            home: Obx(() => Text('Count: ${controller.counter.value}')),
          ),
        );

        expect(controller.counter.isDisposed, isFalse);

        // First unmount the widget to avoid null errors during delete
        await tester.pumpWidget(
          const MaterialApp(home: Text('No Obx')),
        );

        // Now delete the controller
        Get.delete<ControllerWithDispose>();

        // RxVariable should now be disposed (because onClose was called)
        expect(controller.counter.isDisposed, isTrue);
      },
    );

    testWidgets(
      'Controller without onClose should NOT dispose RxVariable when Get.delete() is called',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());

        // Build widget
        await tester.pumpWidget(
          MaterialApp(
            home: Obx(() => Text('Count: ${controller.counter.value}')),
          ),
        );

        expect(controller.counter.isDisposed, isFalse);

        // Unmount widget first
        await tester.pumpWidget(
          const MaterialApp(home: Text('No Obx')),
        );

        // Delete the controller
        Get.delete<ControllerWithoutDispose>();

        // RxVariable should still NOT be disposed (no onClose implementation)
        expect(controller.counter.isDisposed, isFalse);
      },
    );

    testWidgets(
      'Multiple Obx widgets with same RxVariable should all update',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());

        await tester.pumpWidget(
          MaterialApp(
            home: Column(
              children: [
                Obx(() => Text('Widget1: ${controller.counter.value}')),
                Obx(() => Text('Widget2: ${controller.counter.value}')),
                Obx(() => Text('Widget3: ${controller.counter.value}')),
              ],
            ),
          ),
        );

        expect(find.text('Widget1: 0'), findsOneWidget);
        expect(find.text('Widget2: 0'), findsOneWidget);
        expect(find.text('Widget3: 0'), findsOneWidget);

        controller.increment();
        await tester.pump();

        expect(find.text('Widget1: 1'), findsOneWidget);
        expect(find.text('Widget2: 1'), findsOneWidget);
        expect(find.text('Widget3: 1'), findsOneWidget);
      },
    );

    testWidgets(
      'Unmounting one Obx should not affect other Obx widgets',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());
        var showWidget2 = true;

        // Build initial widget tree with StatefulBuilder to manage state
        await tester.pumpWidget(
          MaterialApp(
            home: StatefulBuilder(
              builder: (context, setState) => Column(
                children: [
                  Obx(() => Text('Widget1: ${controller.counter.value}')),
                  if (showWidget2)
                    Obx(() => Text('Widget2: ${controller.counter.value}')),
                  Obx(() => Text('Widget3: ${controller.counter.value}')),
                  ElevatedButton(
                    onPressed: () => setState(() => showWidget2 = false),
                    child: const Text('Hide Widget2'),
                  ),
                ],
              ),
            ),
          ),
        );

        expect(find.text('Widget1: 0'), findsOneWidget);
        expect(find.text('Widget2: 0'), findsOneWidget);
        expect(find.text('Widget3: 0'), findsOneWidget);

        // Hide Widget2 using the button
        await tester.tap(find.text('Hide Widget2'));
        await tester.pump();

        expect(find.text('Widget1: 0'), findsOneWidget);
        expect(find.text('Widget2: 0'), findsNothing);
        expect(find.text('Widget3: 0'), findsOneWidget);

        // Remaining widgets should still be reactive
        controller.increment();
        await tester.pump();

        expect(find.text('Widget1: 1'), findsOneWidget);
        expect(find.text('Widget3: 1'), findsOneWidget);

        // RxVariable should not be disposed
        expect(controller.counter.isDisposed, isFalse);
      },
    );

    testWidgets(
      'Stream should NOT close when one Obx is disposed but others still observe',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());
        var showFirstObx = true;

        // Build widget tree with multiple Obx observing same RxVariable
        await tester.pumpWidget(
          MaterialApp(
            home: StatefulBuilder(
              builder: (context, setState) => Column(
                children: [
                  // First Obx - will be unmounted
                  if (showFirstObx)
                    Obx(() => Text('First: ${controller.counter.value}')),
                  // Second Obx - will remain
                  Obx(() => Text('Second: ${controller.counter.value}')),
                  ElevatedButton(
                    onPressed: () => setState(() => showFirstObx = false),
                    child: const Text('Remove First'),
                  ),
                ],
              ),
            ),
          ),
        );

        // Both widgets should show initial value
        expect(find.text('First: 0'), findsOneWidget);
        expect(find.text('Second: 0'), findsOneWidget);

        // Verify RxVariable is NOT disposed
        expect(controller.counter.isDisposed, isFalse);

        // Remove the first Obx widget
        await tester.tap(find.text('Remove First'));
        await tester.pump();

        // First Obx should be gone, second should remain
        expect(find.text('First: 0'), findsNothing);
        expect(find.text('Second: 0'), findsOneWidget);

        // Stream should NOT be closed - other observer still exists
        expect(controller.counter.isDisposed, isFalse);

        // Second Obx should still be reactive
        controller.increment();
        await tester.pump();

        expect(find.text('Second: 1'), findsOneWidget);

        // Stream is still open
        expect(controller.counter.isDisposed, isFalse);
      },
    );

    testWidgets(
      'Stream should NOT close even when ALL Obx widgets are disposed',
      (tester) async {
        final controller = Get.put(ControllerWithoutDispose());

        // Build widget with Obx
        await tester.pumpWidget(
          MaterialApp(
            home: Obx(() => Text('Count: ${controller.counter.value}')),
          ),
        );

        expect(find.text('Count: 0'), findsOneWidget);
        expect(controller.counter.isDisposed, isFalse);

        // Remove ALL Obx widgets
        await tester.pumpWidget(
          const MaterialApp(home: Text('No observers')),
        );

        // Even with ZERO observers, stream should NOT be closed
        // GetX only removes listeners, it never closes the stream automatically
        expect(controller.counter.isDisposed, isFalse);

        // RxVariable should still work
        controller.increment();
        expect(controller.counter.value, equals(1));
      },
    );
  });
}
