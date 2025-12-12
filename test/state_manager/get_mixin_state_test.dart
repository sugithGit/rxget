import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';
import 'package:rxget/src/get_state_manager/src/simple/mixin_builder.dart';

void main() {
  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.count, 0);
      controller.increment2();
      expect(controller.count, 1);
    }),
  );

  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.counter.value, 0);
      controller.increment();
      expect(controller.counter.value, 1);
    }),
  );

  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.doubleNum.value, 0.0);
    }),
  );

  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.string.value, "string");
    }),
  );

  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.list.length, 0);
    }),
  );

  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.map.length, 0);
    }),
  );

  test(
    'GetxController smoke test',
    () => RxState.create(() {
      final controller = Controller();
      expect(controller.boolean.value, true);
    }),
  );

  testWidgets("MixinBuilder with reactive and not reactive", (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: MixinBuilder<Controller>(
          init: Controller(),
          builder: (controller) {
            return Column(
              children: [
                Text(
                  'Count: ${controller.counter.value}',
                ),
                Text(
                  'Count2: ${controller.count}',
                ),
                Text(
                  'Double: ${controller.doubleNum.value}',
                ),
                Text(
                  'String: ${controller.string.value}',
                ),
                Text(
                  'List: ${controller.list.length}',
                ),
                Text(
                  'Bool: ${controller.boolean.value}',
                ),
                Text(
                  'Map: ${controller.map.length}',
                ),
                TextButton(
                  child: const Text("increment"),
                  onPressed: () => controller.increment(),
                ),
                TextButton(
                  child: const Text("increment2"),
                  onPressed: () => controller.increment2(),
                ),
              ],
            );
          },
        ),
      ),
    );

    expect(find.text("Count: 0"), findsOneWidget);
    expect(find.text("Count2: 0"), findsOneWidget);
    expect(find.text("Double: 0.0"), findsOneWidget);
    expect(find.text("String: string"), findsOneWidget);
    expect(find.text("Bool: true"), findsOneWidget);
    expect(find.text("List: 0"), findsOneWidget);
    expect(find.text("Map: 0"), findsOneWidget);

    Controller.to.increment();

    await tester.pump();

    expect(find.text("Count: 1"), findsOneWidget);

    await tester.tap(find.text('increment'));

    await tester.pump();

    expect(find.text("Count: 2"), findsOneWidget);

    await tester.tap(find.text('increment2'));

    await tester.pump();

    expect(find.text("Count2: 1"), findsOneWidget);
  });

  // testWidgets(
  //   "MixinBuilder with build null",
  //   (tester) async {
  //     expect(
  //       () => MixinBuilder<Controller>(
  //         init: Controller(),
  //         builder: null,
  //       ),
  //       throwsAssertionError,
  //     );
  //   },
  // );
}

class _State {}

class Controller extends GetxController<_State> {
  static Controller get to => Get.find();
  int count = 0;
  final counter = 0.obs;
  final doubleNum = 0.0.obs;
  final string = "string".obs;
  final list = [].obs;
  final map = {}.obs;
  final boolean = true.obs;

  void increment() {
    counter.value++;
  }

  void increment2() {
    count++;
    update();
  }

  @override
  _State get state => _State();
}
