import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

enum Status { base, loading, success }

void main() {
  testWidgets('Obl listens to enum changes', (tester) async {
    final status = Status.base.obs;
    int callCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: Obl(
          () {
            callCount++;
            // accessing value to register listener
            status.value;
          },
          child: const SizedBox(),
        ),
      ),
    );

    // Initial build calls effect
    expect(callCount, 1, reason: "Initial call");
    expect(status.value, Status.base);

    // Change to loading
    status.value = Status.loading;
    // Obl uses scheduleMicrotask, so we need to pump to process it
    await tester.pump();

    expect(status.value, Status.loading);
    expect(callCount, 2, reason: "Should be called when changing to loading");

    // Change to success
    status.value = Status.success;
    await tester.pump();

    expect(status.value, Status.success);
    expect(callCount, 3, reason: "Should be called when changing to success");
  });

  testWidgets('Obl listens to dynamic dependencies (conditional)', (
    tester,
  ) async {
    final toggle = true.obs;
    final valueA = 0.obs;
    final valueB = 0.obs;
    int callCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: Obl(
          () {
            callCount++;
            if (toggle.value) {
              valueA.value;
            } else {
              valueB.value;
            }
          },
          child: const SizedBox(),
        ),
      ),
    );

    // Initial: toggle=true, reads valueA
    expect(callCount, 1);

    // Change valueA -> should trigger
    valueA.value++;
    await tester.pump();
    expect(callCount, 2, reason: "Change valueA should trigger");

    // Change valueB -> should NOT trigger (not observed)
    valueB.value++;
    await tester.pump();
    expect(callCount, 2, reason: "Change valueB should NOT trigger yet");

    // Change toggle -> false
    toggle.value = false;
    await tester.pump();
    expect(callCount, 3, reason: "Change toggle should trigger");
    // Now effect reads valueB.
    // IF Obl fails to re-register, it won't be listening to valueB.

    // Change valueB -> should trigger
    valueB.value++;
    await tester.pump();
    expect(callCount, 4, reason: "Change valueB should trigger now");
  });

  testWidgets('Obl does not rebuild child when observables change', (
    tester,
  ) async {
    final count = 0.obs;
    int childBuildCount = 0;
    int effectCallCount = 0;

    // A widget that counts how many times it is built
    final child = Builder(
      builder: (context) {
        childBuildCount++;
        return const Text('Static Child');
      },
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Obl(
          () {
            effectCallCount++;
            count.value; // Register listener
          },
          child: child,
        ),
      ),
    );

    // Initial state
    expect(effectCallCount, 1, reason: "Effect runs on init");
    expect(childBuildCount, 1, reason: "Child builds on init");

    // Update observable
    count.value++;
    await tester.pump();

    // Effect should run again
    expect(effectCallCount, 2, reason: "Effect runs on update");

    // Child should NOT rebuild
    expect(childBuildCount, 1, reason: "Child should NOT rebuild on update");
  });
}
