import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

// Test controllers
class TestController extends RxController {
  final count = 0.obs;
  bool wasDisposed = false;

  void increment() {
    count.value++;
  }

  @override
  void onClose() {
    wasDisposed = true;
    super.onClose();
  }
}

class AnotherController extends RxController {
  final name = 'test'.obs;
  bool wasDisposed = false;

  @override
  void onClose() {
    wasDisposed = true;
    super.onClose();
  }
}

class DependentController extends RxController {
  DependentController(this.testController);
  final TestController testController;
}

void main() {
  setUp(() {
    Get.resetInstance();
  });

  tearDown(() {
    Get.resetInstance();
  });

  group('GetInWidget - Dependency Injection', () {
    testWidgets('should inject and provide single dependency', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => TestController(), lazy: false),
            ],
            child: Builder(
              builder: (context) {
                final ctrl = Get.find<TestController>();
                return Text('Count: ${ctrl.count.value}');
              },
            ),
          ),
        ),
      );

      expect(find.text('Count: 0'), findsOneWidget);
    });

    testWidgets('should dispose dependency when widget is removed', (
      tester,
    ) async {
      final controller = TestController();

      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => controller, lazy: false),
            ],
            child: const Text('With Controller'),
          ),
        ),
      );

      expect(controller.wasDisposed, false);

      // Remove the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: Text('Removed'),
        ),
      );

      await tester.pump();

      expect(controller.wasDisposed, true);
    });

    testWidgets('should work with reactive updates', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => TestController(), lazy: false),
            ],
            child: Builder(
              builder: (context) {
                final ctrl = Get.find<TestController>();
                return Column(
                  children: [
                    Obx(() => Text('Count: ${ctrl.count.value}')),
                    ElevatedButton(
                      onPressed: ctrl.increment,
                      child: const Text('Increment'),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('Count: 0'), findsOneWidget);

      // Tap the button
      await tester.tap(find.text('Increment'));
      await tester.pump();

      expect(find.text('Count: 1'), findsOneWidget);
    });
  });

  group('GetInWidget - Multiple Dependencies', () {
    testWidgets('should inject multiple dependencies', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => TestController(), lazy: false),
              GetIn<AnotherController>(() => AnotherController(), lazy: false),
            ],
            child: Builder(
              builder: (context) {
                final testCtrl = Get.find<TestController>();
                final anotherCtrl = Get.find<AnotherController>();
                return Column(
                  children: [
                    Text('Count: ${testCtrl.count.value}'),
                    Text('Name: ${anotherCtrl.name.value}'),
                  ],
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('Count: 0'), findsOneWidget);
      expect(find.text('Name: test'), findsOneWidget);
    });

    testWidgets('should dispose all dependencies when widget is removed', (
      tester,
    ) async {
      final testController = TestController();
      final anotherController = AnotherController();

      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => testController, lazy: false),
              GetIn<AnotherController>(() => anotherController, lazy: false),
            ],
            child: const Text('With Controllers'),
          ),
        ),
      );

      expect(testController.wasDisposed, false);
      expect(anotherController.wasDisposed, false);

      // Remove the widget
      await tester.pumpWidget(
        const MaterialApp(
          home: Text('Removed'),
        ),
      );

      await tester.pump();

      expect(testController.wasDisposed, true);
      expect(anotherController.wasDisposed, true);
    });
  });

  group('GetInWidget - Tagged Dependencies', () {
    testWidgets('should support tagged dependencies', (tester) async {
      final ctrl1 = TestController();
      final ctrl2 = TestController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ListView(
              children: [
                GetInWidget(
                  dependencies: [
                    GetIn<TestController>(
                      () => ctrl1,
                      tag: 'first',
                      lazy: false,
                    ),
                  ],
                  child: Builder(
                    builder: (context) {
                      final c = Get.find<TestController>(tag: 'first');
                      return Obx(() => Text('First: ${c.count.value}'));
                    },
                  ),
                ),
                GetInWidget(
                  dependencies: [
                    GetIn<TestController>(
                      () => ctrl2,
                      tag: 'second',
                      lazy: false,
                    ),
                  ],
                  child: Builder(
                    builder: (context) {
                      final c = Get.find<TestController>(tag: 'second');
                      return Obx(() => Text('Second: ${c.count.value}'));
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.text('First: 0'), findsOneWidget);
      expect(find.text('Second: 0'), findsOneWidget);
    });
  });

  group('GetInWidget - Lazy Loading', () {
    testWidgets('should support lazy loading', (tester) async {
      final controller = TestController();
      bool created = false;

      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => controller),
            ],
            child: Builder(
              builder: (context) {
                return ElevatedButton(
                  onPressed: () {
                    Get.find<TestController>();
                    created = true;
                  },
                  child: const Text('Find'),
                );
              },
            ),
          ),
        ),
      );

      // Should be registered but not initialized/found yet
      expect(Get.isRegistered<TestController>(), true);
      expect(created, false);

      await tester.tap(find.text('Find'));
      await tester.pump();

      expect(created, true);
    });
  });

  group('GetInWidget - Dependent Dependencies', () {
    testWidgets('should inject dependent controllers using builder', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: GetInWidget(
            dependencies: [
              GetIn<TestController>(() => TestController(), lazy: false),
              // This works because TestController is already registered
              GetIn<DependentController>(
                () => DependentController(Get.find<TestController>()),
                lazy: false,
              ),
            ],
            child: Builder(
              builder: (context) {
                final dependent = Get.find<DependentController>();
                return Text(
                  'Dependent Count: ${dependent.testController.count}',
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('Dependent Count: 0'), findsOneWidget);
    });
  });
}
