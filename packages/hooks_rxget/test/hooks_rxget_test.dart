import 'package:flutter/widgets.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_rxget/hooks_rxget.dart';
import 'package:rxget/rxget.dart';

class TestController {
  TestController() {
    count++;
  }
  static int count = 0;
}

class AnotherController {
  AnotherController() {
    count++;
  }
  static int count = 0;
}

void main() {
  setUp(() {
    TestController.count = 0;
    AnotherController.count = 0;
    Get.reset(); // Reset state between tests
  });

  testWidgets('useGetIn registers and retrieves instance', (tester) async {
    final getIn = GetIn<TestController>(() => TestController());

    late TestController controller;

    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: HookBuilder(
          builder: (context) {
            controller = useGetIn(getIn);
            return Container();
          },
        ),
      ),
    );

    expect(controller, isA<TestController>());
    expect(TestController.count, 1);
    expect(Get.isRegistered<TestController>(), isTrue);

    await tester.pumpWidget(const SizedBox());

    expect(Get.isRegistered<TestController>(), isFalse);
  });

  testWidgets('useGetIn respects tag', (tester) async {
    final getIn = GetIn<TestController>(
      () => TestController(),
      tag: 'test_tag',
    );

    late TestController controller;

    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: HookBuilder(
          builder: (context) {
            controller = useGetIn(getIn);
            return Container();
          },
        ),
      ),
    );

    expect(controller, isA<TestController>());
    expect(Get.isRegistered<TestController>(tag: 'test_tag'), isTrue);
    expect(Get.isRegistered<TestController>(), isFalse);

    await tester.pumpWidget(const SizedBox());

    expect(Get.isRegistered<TestController>(tag: 'test_tag'), isFalse);
  });

  testWidgets('useGetIn with lazy=false initializes immediately', (
    tester,
  ) async {
    final getIn = GetIn<TestController>(
      () => TestController(),
      lazy: false,
    );

    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: HookBuilder(
          builder: (context) {
            useGetIn(getIn);
            return Container();
          },
        ),
      ),
    );

    expect(TestController.count, 1);
    expect(Get.isRegistered<TestController>(), isTrue);

    await tester.pumpWidget(const SizedBox());
    expect(Get.isRegistered<TestController>(), isFalse);
  });

  testWidgets('Multiple useGetIn hooks coexist', (tester) async {
    final getIn1 = GetIn<TestController>(() => TestController());
    final getIn2 = GetIn<AnotherController>(() => AnotherController());

    late TestController controller1;
    late AnotherController controller2;

    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: HookBuilder(
          builder: (context) {
            controller1 = useGetIn(getIn1);
            controller2 = useGetIn(getIn2);
            return Container();
          },
        ),
      ),
    );

    expect(controller1, isA<TestController>());
    expect(controller2, isA<AnotherController>());
    expect(Get.isRegistered<TestController>(), isTrue);
    expect(Get.isRegistered<AnotherController>(), isTrue);

    await tester.pumpWidget(const SizedBox());

    expect(Get.isRegistered<TestController>(), isFalse);
    expect(Get.isRegistered<AnotherController>(), isFalse);
  });

  testWidgets('Child widget can access dependency via Get.find', (
    tester,
  ) async {
    final getIn = GetIn<TestController>(() => TestController());

    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: HookBuilder(
          builder: (context) {
            useGetIn(getIn);
            return Builder(
              builder: (innerContext) {
                // Access dependency in child
                final found = Get.find<TestController>();
                expect(found, isA<TestController>());
                return Container();
              },
            );
          },
        ),
      ),
    );
  });

  testWidgets('Rebuilding widget does not recreate dependency', (tester) async {
    final getIn = GetIn<TestController>(() => TestController());
    // Create a value notifier to trigger rebuilds
    final rebuildNotifier = ValueNotifier(0);

    await tester.pumpWidget(
      Directionality(
        textDirection: TextDirection.ltr,
        child: HookBuilder(
          builder: (context) {
            useGetIn(getIn);
            // Listen to notifier to trigger rebuild
            useListenable(rebuildNotifier);
            return Container();
          },
        ),
      ),
    );

    expect(TestController.count, 1);

    // Trigger rebuild
    rebuildNotifier.value++;
    await tester.pump();

    // Count should still be 1
    expect(TestController.count, 1);
  });

  testWidgets('useGetIn throws if builder fails', (tester) async {
    final getIn = GetIn<TestController>(() => throw Exception('Builder error'));

    // When a build method throws, pumpWidget rethrows the exception.
    // We need to catch it and also clear any reported FlutterError.
    try {
      await tester.pumpWidget(
        Directionality(
          textDirection: TextDirection.ltr,
          child: HookBuilder(
            builder: (context) {
              useGetIn(getIn);
              return Container();
            },
          ),
        ),
      );
      fail('pumpWidget should have thrown');
    } on Exception catch (e) {
      // Verify we caught the expected exception
      expect(e, isA<Exception>());
      // If the framework caught it too, we need to clear it to avoid test failure
      tester.takeException();
    }
  });
}
