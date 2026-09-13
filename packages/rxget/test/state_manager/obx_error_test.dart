import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

void main() {
  testWidgets('an Obx that observes nothing throws a catchable ObxError', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(home: Obx(() => const Text('no reactive reads here'))),
    );

    final error = tester.takeException();
    // The thrown type must be the ObxError this package exports, or callers
    // cannot catch it by name.
    expect(error, isA<ObxError>());
    expect(error.toString(), contains('improper use'));
  });

  testWidgets('an Obx that observes something does not throw', (tester) async {
    final count = 0.obs;

    await tester.pumpWidget(
      MaterialApp(home: Obx(() => Text('${count.value}'))),
    );

    expect(tester.takeException(), isNull);
    expect(find.text('0'), findsOneWidget);
    count.close();
  });
}
