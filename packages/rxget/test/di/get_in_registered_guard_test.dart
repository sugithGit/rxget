import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rxget/rxget.dart';

// ---------------------------------------------------------------------------
// Shared test controllers
// ---------------------------------------------------------------------------

/// A minimal controller that records whether it has been closed.
class PageAController extends RxController {
  bool wasDisposed = false;

  @override
  void onClose() {
    wasDisposed = true;
    super.onClose();
  }
}

/// A separate controller that Page B would register.
class PageBController extends RxController {
  bool wasDisposed = false;

  @override
  void onClose() {
    wasDisposed = true;
    super.onClose();
  }
}

// ---------------------------------------------------------------------------
// Widget helpers used to simulate navigation scenarios
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

void main() {
  setUp(Get.resetInstance);
  tearDown(Get.resetInstance);

  // ─────────────────────────────────────────────────────────────────────────
  // Core _isRegistered guard behaviour
  // ─────────────────────────────────────────────────────────────────────────
  group('GetIn._isRegistered guard — core behaviour', () {
    test(
      'does NOT delete a dependency it did not register',
      () {
        // Simulate Page A registering PageAController first.
        Get.put<PageAController>(PageAController());
        expect(
          Get.isRegistered<PageAController>(),
          isTrue,
          reason: 'Precondition: PageAController is already in the container',
        );

        // Page B also declares GetIn<PageAController>, but the container
        // already has one so it should skip and set _isRegistered = false.
        GetIn<PageAController>(
            () => PageAController(),
            lazy: false,
          )
          ..register()
          // Disposing Page B's GetIn must NOT remove Page A's controller.
          ..dispose();

        expect(
          Get.isRegistered<PageAController>(),
          isTrue,
          reason:
              'PageAController must still be registered — Page B did not own it '
              'so it must not delete it on dispose.',
        );
      },
    );

    test(
      'DOES delete a dependency it registered itself',
      () {
        expect(
          Get.isRegistered<PageAController>(),
          isFalse,
          reason: 'Precondition: nothing is registered yet',
        );

        final getIn = GetIn<PageAController>(
          () => PageAController(),
          lazy: false,
        )..register();

        expect(Get.isRegistered<PageAController>(), isTrue);

        getIn.dispose();

        expect(
          Get.isRegistered<PageAController>(),
          isFalse,
          reason:
              'GetIn registered PageAController itself, so it should clean '
              'it up on dispose.',
        );
      },
    );

    test(
      'tagged dependency: does NOT delete when already registered under same tag',
      () {
        // Another scope registers the tagged instance.
        Get.put<PageAController>(PageAController(), tag: 'scopeA');

        GetIn<PageAController>(
            () => PageAController(),
            lazy: false,
            tag: 'scopeA',
          )
          ..register() // should skip — already registered
          ..dispose(); // should NOT delete

        expect(
          Get.isRegistered<PageAController>(tag: 'scopeA'),
          isTrue,
          reason: 'Tagged instance registered by another scope must survive.',
        );
      },
    );

    test(
      'tagged dependency: DOES delete when it registered the instance',
      () {
        GetIn<PageAController>(
            () => PageAController(),
            lazy: false,
            tag: 'ownScope',
          )
          ..register()
          ..dispose();

        expect(
          Get.isRegistered<PageAController>(tag: 'ownScope'),
          isFalse,
          reason:
              'GetIn registered the tagged instance itself, so cleanup is expected.',
        );
      },
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Full widget-level regression: the "double-pop" navigation scenario
  // ─────────────────────────────────────────────────────────────────────────
  group('GetIn._isRegistered guard — double-pop regression (widget level)', () {
    /// Reproduces the exact bug scenario using a real Navigator:
    ///
    ///   Page A alive (owns PageAController)
    ///     → push Page B (PageBController registered; PageAController already exists)
    ///     → pop  Page B (PageBController disposed;  PageAController must stay alive)
    ///     → Page A still usable (PageAController still exists)
    testWidgets(
      'PageAController survives Page B dispose (the double-pop bug)',
      (tester) async {
        // ── Step 1: show Page A via Navigator ────────────────────────────
        await tester.pumpWidget(
          MaterialApp(
            // Page A is the initial route; it owns PageAController.
            home: GetInWidget(
              dependencies: [
                GetIn<PageAController>(() => PageAController(), lazy: false),
              ],
              child: Builder(
                builder: (ctx) {
                  final ctrl = Get.find<PageAController>();
                  return Column(
                    children: [
                      Text('PageA: disposed=${ctrl.wasDisposed}'),
                      ElevatedButton(
                        onPressed: () {
                          // Push Page B on top of Page A.
                          Navigator.of(ctx).push(
                            MaterialPageRoute<void>(
                              builder: (_) => GetInWidget(
                                dependencies: [
                                  // PageAController already registered by
                                  // Page A — should NOT be deleted on pop.
                                  GetIn<PageAController>(
                                    () => PageAController(),
                                    lazy: false,
                                  ),
                                  GetIn<PageBController>(
                                    () => PageBController(),
                                    lazy: false,
                                  ),
                                ],
                                child: Builder(
                                  builder: (_) => ElevatedButton(
                                    onPressed: () => Navigator.of(ctx).pop(),
                                    child: const Text('PopPageB'),
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                        child: const Text('PushPageB'),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        );

        expect(
          find.text('PageA: disposed=false'),
          findsOneWidget,
          reason: 'PageAController must be alive on Page A',
        );
        expect(Get.isRegistered<PageAController>(), isTrue);

        // ── Step 2: push Page B ──────────────────────────────────────────
        await tester.tap(find.text('PushPageB'));
        await tester.pumpAndSettle();

        expect(
          Get.isRegistered<PageAController>(),
          isTrue,
          reason:
              'PageAController must still be registered while Page B is visible',
        );
        expect(
          Get.isRegistered<PageBController>(),
          isTrue,
          reason: 'PageBController should now be registered',
        );

        // ── Step 3: pop Page B ───────────────────────────────────────────
        await tester.tap(find.text('PopPageB'));
        await tester.pumpAndSettle();

        // This is the regression assertion — without _isRegistered the old
        // code would call Get.delete<PageAController>() here, causing
        // Get.find on Page A to throw.
        expect(
          Get.isRegistered<PageAController>(),
          isTrue,
          reason:
              'BUG REGRESSION: PageAController must NOT be deleted when Page B '
              'is popped (because Page B did not own the registration).',
        );
        expect(
          Get.isRegistered<PageBController>(),
          isFalse,
          reason:
              'PageBController should be cleaned up when Page B is disposed.',
        );

        expect(
          find.text('PageA: disposed=false'),
          findsOneWidget,
          reason:
              'PageAController must still be usable after Page B is popped.',
        );
      },
    );

    /// Verifies the complementary case: when Page B is the sole registrant
    /// of its own controller, that controller IS cleaned up on pop.
    testWidgets(
      'PageBController (owned by Page B) is disposed when Page B is popped',
      (tester) async {
        // Show only Page B (no Page A in tree).
        await tester.pumpWidget(
          MaterialApp(
            home: GetInWidget(
              dependencies: [
                GetIn<PageBController>(() => PageBController(), lazy: false),
              ],
              child: const Text('PageB only'),
            ),
          ),
        );

        expect(Get.isRegistered<PageBController>(), isTrue);

        // Remove Page B.
        await tester.pumpWidget(const MaterialApp(home: Text('Gone')));
        await tester.pump();

        expect(
          Get.isRegistered<PageBController>(),
          isFalse,
          reason:
              'PageBController was registered by this GetIn so it must be '
              'deleted on dispose.',
        );
      },
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Lazy loading variant — same guard applies
  // ─────────────────────────────────────────────────────────────────────────
  group('GetIn._isRegistered guard — lazy loading', () {
    test(
      'lazy: does NOT delete pre-existing dependency on dispose',
      () {
        // Pre-register so that the lazy GetIn finds it already registered.
        Get.put<PageAController>(PageAController());

        GetIn<PageAController>(
            () => PageAController(),
          ) // lazy: true
          ..register() // should skip
          ..dispose(); // should NOT delete

        expect(
          Get.isRegistered<PageAController>(),
          isTrue,
          reason:
              'Lazy GetIn that skipped registration must not delete the existing instance.',
        );
      },
    );

    test(
      'lazy: DOES delete dependency it lazily registered',
      () {
        final getIn =
            GetIn<PageAController>(
                () => PageAController(),
              ) // lazy: true
              ..register();

        expect(Get.isRegistered<PageAController>(), isTrue);

        getIn.dispose();

        expect(
          Get.isRegistered<PageAController>(),
          isFalse,
          reason: 'Lazy GetIn that registered the instance must clean it up.',
        );
      },
    );
  });
}
