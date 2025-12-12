import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

void main() {
  testWidgets("GetxController smoke test", (tester) async {
    Get
      ..lazyPut<Controller2>(() => RxState.create(() => Controller2()))
      ..lazyPut(() => RxState.create(() => Controller()));
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: GetX<Controller>(
            builder: (controller) {
              return Column(
                children: [
                  Text("Count: ${controller.counter.value}"),
                  Text("Double: ${controller.doubleNum.value}"),
                  Text("String: ${controller.string.value}"),
                  Text("Bool: ${controller.boolean.value}"),
                  Text("List: ${controller.list.length}"),
                  Text("Map: ${controller.map.length}"),
                  ElevatedButton(
                    onPressed: controller.increment,
                    child: Text("increment"),
                  ),
                  GetX<Controller2>(
                    builder: (controller) {
                      return Text('lazy ${controller.lazy.value}');
                    },
                  ),
                  GetX<ControllerNonGlobal>(
                    init: RxState.create(() => ControllerNonGlobal()),
                    global: false,
                    builder: (controller) {
                      return Text('single ${controller.nonGlobal.value}');
                    },
                  ),
                ],
              );
            },
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

    Controller.to.increment();

    await tester.pump();

    expect(find.text("Count: 1"), findsOneWidget);

    await tester.tap(find.text('increment'));

    await tester.pump();

    expect(find.text("Count: 2"), findsOneWidget);
    expect(find.text("lazy 0"), findsOneWidget);
    expect(find.text("single 0"), findsOneWidget);
  });
}

class _State {}

class Controller2 extends GetxController<_State> {
  final RxInt lazy = 0.obs;

  @override
  _State get state => _State();
}

class ControllerNonGlobal extends GetxController<_State> {
  final RxInt nonGlobal = 0.obs;

  @override
  _State get state => _State();
}

class Controller extends GetxController<_State> {
  static Controller get to => Get.find();

  final counter = 0.obs;
  final doubleNum = 0.0.obs;
  final string = "string".obs;
  final list = <int>[].obs;
  final map = <String, int>{}.obs;
  final boolean = true.obs;

  void increment() {
    counter.value++;
  }

  @override
  _State get state => _State();
}
