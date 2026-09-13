import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

int times = 30;

void printValue(String value) {
  // Benchmark print
  // ignore: avoid_print
  print(value);
}

Future<int> valueNotifier() {
  final c = Completer<int>();
  final value = ValueNotifier<int>(0);
  final timer = Stopwatch()..start();

  value.addListener(() {
    if (times == value.value) {
      timer.stop();
      printValue(
        """${value.value} listeners notified | [VALUE_NOTIFIER] time: ${timer.elapsedMicroseconds}ms""",
      );
      c.complete(timer.elapsedMicroseconds);
    }
  });

  for (var i = 0; i < times + 1; i++) {
    value.value = i;
  }

  return c.future;
}

Future<int> getValue() {
  final c = Completer<int>();
  final value = Rx<int>(0);
  final timer = Stopwatch()..start();

  value.addListener(() {
    if (times == value.value) {
      timer.stop();
      printValue(
        """${value.value} listeners notified | [RXGET_RX] time: ${timer.elapsedMicroseconds}ms""",
      );
      c.complete(timer.elapsedMicroseconds);
    }
  });

  for (var i = 0; i < times + 1; i++) {
    value.value = i;
  }

  return c.future;
}

void main() {
  test('percentage test', () {
    printValue('============================================');
    printValue('PERCENTAGE TEST');

    const referenceValue = 200;
    const requestedValue = 100;

    printValue(
      '''
referenceValue is ${calculePercentage(referenceValue, requestedValue)}% more than requestedValue''',
    );
    expect(calculePercentage(referenceValue, requestedValue), 100);
  });
  test('run benchmarks from ValueNotifier', () async {
    times = 30;
    printValue('============================================');
    printValue('VALUE_NOTIFIER X GETX_VALUE TEST');
    printValue('-----------');
    await getValue();
    await valueNotifier();
    printValue('-----------');

    times = 30000;
    final getx = await getValue();
    final dart = await valueNotifier();
    printValue('-----------');

    printValue('ValueNotifier delay $dart ms to made $times requests');
    printValue('Rx delay $getx ms to made $times requests');
    printValue('-----------');
    printValue(
      '''
Rx is ${calculePercentage(dart, getx)}% faster than Default ValueNotifier with $times requests''',
    );
  });
}

int calculePercentage(int dart, int getx) {
  return (dart / getx * 100).round() - 100;
}
