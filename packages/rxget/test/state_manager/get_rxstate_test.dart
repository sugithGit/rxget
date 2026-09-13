import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

/// This used to exercise the `GetX` widget, which created, observed and
/// disposed a controller in one place. That widget is gone; the same ground is
/// covered by `GetInWidget` for the lifetime and `Obx` for the observation.
void main() {
  testWidgets('GetInWidget scopes controllers that Obx observes', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: GetInWidget(
          dependencies: [
            GetIn<Controller>(() => Controller()),
            // Lazy by default: built on the first Get.find.
            GetIn<Controller2>(() => Controller2()),
            GetIn<ControllerTagged>(
              () => ControllerTagged(),
              tag: 'tagged',
            ),
          ],
          child: Builder(
            builder: (_) {
              final c = Get.find<Controller>();
              return Column(
                children: [
                  Obx(() => Text('Count: ${c.state.counter.value}')),
                  Obx(() => Text('Double: ${c.state.doubleNum.value}')),
                  Obx(() => Text('String: ${c.state.string.value}')),
                  Obx(() => Text('List: ${c.state.list.length}')),
                  Obx(() => Text('Bool: ${c.state.boolean.value}')),
                  Obx(() => Text('Map: ${c.state.map.length}')),
                  TextButton(
                    onPressed: c.increment,
                    child: const Text('increment'),
                  ),
                  Obx(
                    () => Text(
                      'lazy ${Get.find<Controller2>().state.lazy.value}',
                    ),
                  ),
                  Obx(
                    () => Text(
                      'tagged '
                      '${Get.find<ControllerTagged>(tag: 'tagged').state.value.value}',
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );

    expect(find.text('Count: 0'), findsOneWidget);
    expect(find.text('Double: 0.0'), findsOneWidget);
    expect(find.text('String: string'), findsOneWidget);
    expect(find.text('Bool: true'), findsOneWidget);
    expect(find.text('List: 0'), findsOneWidget);
    expect(find.text('Map: 0'), findsOneWidget);
    expect(find.text('lazy 0'), findsOneWidget);
    expect(find.text('tagged 0'), findsOneWidget);

    await tester.tap(find.text('increment'));
    await tester.pump();
    expect(find.text('Count: 1'), findsOneWidget);

    Get.find<Controller2>().state.lazy.value++;
    await tester.pump();
    expect(find.text('lazy 1'), findsOneWidget);
  });

  testWidgets('unmounting the scope deletes what it registered', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: GetInWidget(
          dependencies: [GetIn<Controller>(() => Controller())],
          child: Obx(
            () => Text('${Get.find<Controller>().state.counter.value}'),
          ),
        ),
      ),
    );
    expect(Get.isRegistered<Controller>(), isTrue);

    await tester.pumpWidget(const MaterialApp(home: SizedBox()));
    expect(Get.isRegistered<Controller>(), isFalse);
  });
}

class _State extends GetxState {
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
  @override
  final state = _State();

  void increment() => state.counter.value++;
}

class _State2 extends GetxState {
  RxInt lazy = 0.obs;

  @override
  void onClose() => lazy.close();
}

class Controller2 extends GetxController<_State2> {
  @override
  final state = _State2();
}

class _StateTagged extends GetxState {
  RxInt value = 0.obs;

  @override
  void onClose() => value.close();
}

class ControllerTagged extends GetxController<_StateTagged> {
  @override
  final state = _StateTagged();
}
