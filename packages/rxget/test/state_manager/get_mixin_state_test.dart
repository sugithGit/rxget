import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';
import 'package:rxget/src/get_state_manager/src/simple/mixin_builder.dart';

void main() {
  testWidgets("MixinBuilder with reactive and not reactive", (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: MixinBuilder<Controller>(
          init: Controller(),
          builder: (controller) {
            return Column(
              children: [
                Text(
                  'Count: ${controller.state.counter.value}',
                ),
                Text(
                  'Count2: ${controller.state.count}',
                ),
                Text(
                  'Double: ${controller.state.doubleNum.value}',
                ),
                Text(
                  'String: ${controller.state.string.value}',
                ),
                Text(
                  'List: ${controller.state.list.length}',
                ),
                Text(
                  'Bool: ${controller.state.boolean.value}',
                ),
                Text(
                  'Map: ${controller.state.map.length}',
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

class _State extends GetxState {
  int count = 0;
  RxInt counter = 0.obs;
  RxDouble doubleNum = 0.0.obs;
  RxString string = "string".obs;
  RxList list = [].obs;
  RxMap map = {}.obs;
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

  void increment() {
    state.counter.value++;
  }

  void increment2() {
    state.count++;
    update();
  }

  @override
  final state = _State();
}
