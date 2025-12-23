import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

// Mocks
class AuthRemote {}

void main() {
  test('GetIn assertion prevents dynamic type', () {
    // 1. Explicit dynamic should throw
    expect(() {
      GetIn<dynamic>(() => AuthRemote());
    }, throwsA(isA<AssertionError>()));

    // 2. The Trap: List<GetIn> infers dynamic for its elements
    expect(() {
      List<GetIn> _ = [
        GetIn(() => AuthRemote()), // This forces T=dynamic
      ];
    }, throwsA(isA<AssertionError>()));
  });

  test('GetIn assertion allows valid types', () {
    // Should not throw (inferred as GetIn<AuthRemote>)
    GetIn(() => AuthRemote());

    // Explicit type
    GetIn<AuthRemote>(() => AuthRemote());

    // Correct usage: List<GetInBase>
    final List<GetInBase> list = [
      GetIn(() => AuthRemote()),
    ];
    expect(list.length, 1);
  });
}
