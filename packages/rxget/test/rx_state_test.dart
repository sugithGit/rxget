import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/src/get_rx/src/rx_state/rx_state.dart';
import 'package:rxget/src/get_rx/src/rx_types/rx_types.dart';

class _MockState1 implements RxState {
  final rxInt = RxInt(0);
  final rxList = RxList([]);
  final rxMap = RxMap({});
  final rxSet = RxSet({});
  final obsInt = 0.obs;
}

void main() {
  test('Rx creation failing outside RxState.create', () {
    expect(() => RxInt(0), throwsException);
    expect(() => RxList([]), throwsException);
    expect(() => RxMap({}), throwsException);
    expect(() => RxSet({}), throwsException);
    expect(() => 0.obs, throwsException);
    expect(() => [].obs, throwsException);
  });

  test('Rx creation succeeding inside RxState.create', () {
    final mock1 = _MockState1();
    expect(mock1.rxInt.value, 0);

    expect(mock1.rxList.length, 0);

    expect(mock1.rxMap.length, 0);

    expect(mock1.rxSet.length, 0);

    expect(mock1.obsInt.value, 0);
  });
}
