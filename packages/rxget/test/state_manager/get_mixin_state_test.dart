import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

/// `MixinBuilder` used to combine `update()` rebuilds with reactive ones in a
/// single widget. The same coverage is now expressed the way the library
/// intends: a `GetBuilder` for the manual field, an `Obx` for the reactive
/// ones.
void main() {
  testWidgets('GetBuilder and Obx side by side', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: GetBuilder<Controller>(
          init: Controller(),
          builder: (controller) {
            return Column(
              children: [
                // Reactive — rebuilds on .obs writes.
                Obx(() => Text('Count: ${controller.state.counter.value}')),
                // Manual — rebuilds only on update().
                Text('Count2: ${controller.state.count}'),
                Obx(() => Text('Double: ${controller.state.doubleNum.value}')),
                Obx(() => Text('String: ${controller.state.string.value}')),
                Obx(() => Text('List: ${controller.state.list.length}')),
                Obx(() => Text('Bool: ${controller.state.boolean.value}')),
                Obx(() => Text('Map: ${controller.state.map.length}')),
                TextButton(
                  onPressed: controller.increment,
                  child: const Text('increment'),
                ),
                TextButton(
                  onPressed: controller.increment2,
                  child: const Text('increment2'),
                ),
              ],
            );
          },
        ),
      ),
    );

    expect(find.text('Count: 0'), findsOneWidget);
    expect(find.text('Count2: 0'), findsOneWidget);
    expect(find.text('Double: 0.0'), findsOneWidget);
    expect(find.text('String: string'), findsOneWidget);
    expect(find.text('Bool: true'), findsOneWidget);
    expect(find.text('List: 0'), findsOneWidget);
    expect(find.text('Map: 0'), findsOneWidget);

    Controller.to.increment();
    await tester.pump();
    expect(find.text('Count: 1'), findsOneWidget);

    await tester.tap(find.text('increment'));
    await tester.pump();
    expect(find.text('Count: 2'), findsOneWidget);

    // The plain field only moves once update() is called.
    await tester.tap(find.text('increment2'));
    await tester.pump();
    expect(find.text('Count2: 1'), findsOneWidget);
  });
}

class _State extends GetxState {
  int count = 0;
  RxInt counter = 0.obs;
  RxDouble doubleNum = 0.0.obs;
  RxString string = 'string'.obs;
  RxList<dynamic> list = <dynamic>[].obs;
  RxMap<dynamic, dynamic> map = <dynamic, dynamic>{}.obs;
  RxBool boolean = true.obs;

  @override
  void onClose() {
    counter.close();
    doubleNum.close();
    string.close();
    list.close();
    map.close();
    boolean.close();
  }
}

class Controller extends GetxController<_State> {
  static Controller get to => Get.find();

  @override
  final state = _State();

  void increment() => state.counter.value++;

  void increment2() {
    state.count++;
    update();
  }
}
