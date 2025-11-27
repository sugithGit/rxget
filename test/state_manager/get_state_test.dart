import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

void main() {
  Get.lazyPut<Controller2>(() => Controller2());
  testWidgets("GetxController smoke test", (test) async {
    await test.pumpWidget(
      MaterialApp(
        home: GetBuilder<Controller>(
          init: Controller(),
          builder: (controller) => Column(
            children: [
              Text(
                '${controller.counter}',
              ),
              TextButton(
                child: const Text("increment"),
                onPressed: () => controller.increment(),
              ),
              TextButton(
                child: const Text("incrementWithId"),
                onPressed: () => controller.incrementWithId(),
              ),
              GetBuilder<Controller>(
                id: '1',
                didChangeDependencies: (_) {
                  // print("didChangeDependencies called");
                },
                builder: (controller) {
                  return Text('id ${controller.counter}');
                },
              ),
              GetBuilder<Controller2>(
                builder: (controller) {
                  return Text('lazy ${controller.test}');
                },
              ),
              GetBuilder<ControllerNonGlobal>(
                init: ControllerNonGlobal(),
                global: false,
                builder: (controller) {
                  return Text('single ${controller.nonGlobal}');
                },
              ),
            ],
          ),
        ),
      ),
    );

    expect(find.text("0"), findsOneWidget);

    Controller.to.increment();

    await test.pump();

    expect(find.text("1"), findsOneWidget);

    await test.tap(find.text('increment'));

    await test.pump();

    expect(find.text("2"), findsOneWidget);

    await test.tap(find.text('incrementWithId'));

    await test.pump();

    expect(find.text("id 3"), findsOneWidget);
    expect(find.text("lazy 0"), findsOneWidget);
    expect(find.text("single 0"), findsOneWidget);
  });

  // testWidgets(
  //   "MixinBuilder with build null",
  //   (test) async {
  //     expect(
  //       () => GetBuilder<Controller>(
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

  int counter = 0;

  void increment() {
    counter++;
    update();
  }

  void incrementWithId() {
    counter++;
    update(['1']);
  }

  @override
  _State get state => _State();
}

class Controller2 extends GetxController<_State> {
  int test = 0;

  @override
  _State get state => _State();
}

class ControllerNonGlobal extends GetxController<_State> {
  int nonGlobal = 0;

  @override
  _State get state => _State();
}
