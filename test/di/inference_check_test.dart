import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

class AutoInferredController extends RxController {
  final value = 'inferred'.obs;
}

void main() {
  setUp(() {
    Get.resetInstance();
  });

  tearDown(() {
    Get.resetInstance();
  });

  testWidgets('GetIn should infer type automatically without explicit generic', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: GetInWidget(
          dependencies: [
            // No <AutoInferredController> here, relying on inference
            GetIn(AutoInferredController()),
          ],
          child: Builder(
            builder: (context) {
              // This should work if T was inferred correctly as AutoInferredController
              final ctrl = Get.find<AutoInferredController>();
              return Text('Value: ${ctrl.value.value}');
            },
          ),
        ),
      ),
    );

    expect(find.text('Value: inferred'), findsOneWidget);
  });
}
