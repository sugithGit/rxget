import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

class _State extends GetxState {
  final count = 0.obs;

  @override
  void onClose() => count.close();
}

class _Controller extends GetxController<_State> {
  @override
  final state = _State();
}

void main() {
  group('Observer subscriptions follow the last build', () {
    testWidgets('a variable that is no longer read is released', (
      tester,
    ) async {
      final useFirst = true.obs;
      final first = 'a'.obs;
      final second = 'b'.obs;

      await tester.pumpWidget(
        MaterialApp(
          home: Obx(() => Text(useFirst.value ? first.value : second.value)),
        ),
      );

      expect(first.listenersLength, 1);
      expect(second.listenersLength, 0);

      useFirst.value = false;
      await tester.pump();

      expect(find.text('b'), findsOneWidget);
      // The branch that read `first` is gone, so the widget must no longer
      // hold a subscription to it.
      expect(first.listenersLength, 0);
      expect(second.listenersLength, 1);
    });

    testWidgets('re-reading the same variable does not stack listeners', (
      tester,
    ) async {
      final count = 0.obs;

      await tester.pumpWidget(
        MaterialApp(home: Obx(() => Text('${count.value}${count.value}'))),
      );

      for (var i = 1; i <= 5; i++) {
        count.value = i;
        await tester.pump();
      }

      expect(count.listenersLength, 1);
    });

    testWidgets('unmounting releases every observed variable', (tester) async {
      final count = 0.obs;

      await tester.pumpWidget(MaterialApp(home: Obx(() => Text('$count'))));
      expect(count.listenersLength, 1);

      await tester.pumpWidget(const MaterialApp(home: SizedBox()));
      expect(count.listenersLength, 0);
    });

    testWidgets('unmounting after the variable was closed does not throw', (
      tester,
    ) async {
      final controller = _Controller();
      Get.put(controller);

      await tester.pumpWidget(
        MaterialApp(home: Obx(() => Text('${controller.state.count.value}'))),
      );

      // The controller — and with it the reactive variable — is disposed
      // before the widget observing it leaves the tree.
      Get.delete<_Controller>();
      await tester.pumpWidget(const MaterialApp(home: SizedBox()));

      expect(tester.takeException(), isNull);
    });
  });

  group('Notifications are coalesced', () {
    testWidgets('a burst of writes rebuilds once', (tester) async {
      final count = 0.obs;
      var builds = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Obx(() {
            builds++;
            return Text('${count.value}');
          }),
        ),
      );
      expect(builds, 1);

      for (var i = 1; i <= 100; i++) {
        count.value = i;
      }
      await tester.pump();

      expect(builds, 2);
      expect(find.text('100'), findsOneWidget);
    });

    testWidgets('writes to several variables rebuild once', (tester) async {
      final a = 0.obs;
      final b = 0.obs;
      var builds = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Obx(() {
            builds++;
            return Text('${a.value}-${b.value}');
          }),
        ),
      );

      a.value = 1;
      b.value = 2;
      await tester.pump();

      expect(builds, 2);
      expect(find.text('1-2'), findsOneWidget);
    });
  });

  group('Grouped listeners are created on demand', () {
    test('a controller starts with no listener groups', () {
      final controller = _Controller()..onStart();

      expect(controller.containsId('any'), isFalse);

      // Updating an id nothing is listening to is a no-op and must not
      // allocate the group.
      controller.update(['any']);
      expect(controller.containsId('any'), isFalse);

      controller.onDelete();
    });

    test('a group appears once something listens to it', () {
      final controller = _Controller()..onStart();
      var notified = 0;

      final remove = controller.addListenerId('row', () => notified++);
      expect(controller.containsId('row'), isTrue);

      controller.update(['row']);
      expect(notified, 1);

      // An unrelated id must not reach this listener.
      controller.update(['other']);
      expect(notified, 1);

      remove();
      controller.onDelete();
    });
  });

  group('Notifier scope is restored', () {
    testWidgets('a build that throws does not poison later reads', (
      tester,
    ) async {
      final boom = true.obs;
      final outside = 0.obs;

      await tester.pumpWidget(
        MaterialApp(
          home: Obx(() {
            if (boom.value) {
              throw StateError('build failed');
            }
            return const SizedBox();
          }),
        ),
      );
      expect(tester.takeException(), isA<StateError>());

      // Reading a variable outside any reactive scope must not attach it to
      // the scope the failed build left behind.
      expect(outside.value, 0);
      expect(outside.listenersLength, 0);
    });
  });
}
