import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

void main() {
  testWidgets("GetxController smoke test", (tester) async {
    // Wrap controller creation in RxState.create to provide a valid zone for Rx variable initialization
    Get.lazyPut(() => RxState.create(() => Controller()));

    // We need to retrieve the controller to access it in the test
    final controller = Get.find<Controller>();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              Obx(
                () => Column(
                  children: [
                    Text('Count: ${controller.counter.value}'),
                    Text('Double: ${controller.doubleNum.value}'),
                    Text('String: ${controller.string.value}'),
                    Text('List: ${controller.list.length}'),
                    Text('Bool: ${controller.boolean.value}'),
                    Text('Map: ${controller.map.length}'),
                    ElevatedButton(
                      onPressed: controller.increment,
                      child: const Text("increment"),
                    ),
                    Obx(() => Text('Obx: ${controller.map.length}')),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );

    expect(find.text("Count: 0"), findsOneWidget);
    expect(find.text("Double: 0.0"), findsOneWidget);
    expect(find.text("String: string"), findsOneWidget);
    expect(find.text("Bool: true"), findsOneWidget);
    expect(find.text("List: 0"), findsOneWidget);
    expect(find.text("Map: 0"), findsOneWidget);
    expect(find.text("Obx: 0"), findsOneWidget);

    controller.increment();

    await tester.pump();

    expect(find.text("Count: 1"), findsOneWidget);

    await tester.tap(find.text('increment'));

    await tester.pump();

    expect(find.text("Count: 2"), findsOneWidget);
  });
}

class _State {}

class Controller extends GetxController<_State> {
  static Controller get to => Get.find();

  final RxInt counter = 0.obs;
  final RxDouble doubleNum = 0.0.obs;
  final count =
      0.obs; // Note: 'count' not used in test, but keeping as per original
  final string = "string".obs;
  final list = [].obs;
  final map = {}.obs;
  final boolean = true.obs;

  void increment() {
    counter.value++;
  }

  @override
  _State get state => _State();
}
