import 'dart:async';
import 'package:flutter/widgets.dart';
import '../simple/list_notifier.dart';

typedef EffectCallback = void Function();

/// A Stateless widget that registers reactive reads and runs [effect]
/// on build and whenever those reads change. Does NOT rebuild the UI.
class Obl extends OblStatelessWidget {
  const Obl(
    this.effect, {
    required this.child,
    super.key,
  });

  /// Single combined callback: should read reactive-backed getters and
  /// perform side-effects. Example:
  ///   () {
  ///     controller.state.currentStep; // read to register
  ///     if (controller.state.currentStep == 3) { doSomething(); } // side-effect
  ///   }
  final EffectCallback effect;

  /// Static child returned by build (not rebuilt by Obl).
  final Widget child;

  @override
  Widget build(BuildContext context) {
    // Execute effect while Notifier is wrapping the build so GetX can register
    // any reactive reads made inside the effect closure.
    effect();
    return child;
  }
}

/// Keep the same base class you provided for compatibility
abstract class OblStatelessWidget extends StatelessWidget {
  const OblStatelessWidget({super.key});
  @override
  StatelessElement createElement() => OblElement(this);
}

/// Element that tracks reactive disposers
class OblElement = StatelessElement with StatelessOblObserverComponent;

/// Component that sets up Notifier tracking and invokes the single `effect`
/// when observables change.
mixin StatelessOblObserverComponent on StatelessElement {
  RxObserverScope? _scope;
  bool _effectScheduled = false;

  /// Cleanup callbacks collected by this element's reactive scope.
  List<Disposer>? get disposers => _scope?.disposers;

  void _onReactiveUpdate() {
    final scope = _scope;
    if (scope == null || scope.isClosed || _effectScheduled) {
      return;
    }
    // Coalesce a burst of writes into a single run of the effect, rather than
    // re-running it once per notification.
    _effectScheduled = true;
    // Call the combined effect asynchronously to avoid re-entrancy issues.
    scheduleMicrotask(() {
      _effectScheduled = false;
      if (_scope == null || _scope!.isClosed) {
        return;
      }

      if (widget is Obl) {
        try {
          _scope!.run(
            () {
              (widget as Obl).effect();
            },
          );
        } catch (e, st) {
          // Rethrow so error surface is visible during development.
          FlutterError.reportError(
            FlutterErrorDetails(
              exception: e,
              stack: st,
              library: 'Obl',
              context: ErrorDescription('while running Obl.effect'),
            ),
          );
          rethrow;
        }
      }
    });
  }

  @override
  Widget build() {
    // Wrap the build with Notifier so any Rx reads inside the widget's build
    // (i.e. inside Obl.effect()) are registered; disposers will be collected.
    return (_scope ??= RxObserverScope(_onReactiveUpdate)).run(super.build);
  }

  @override
  void unmount() {
    _scope?.close();
    _scope = null;
    super.unmount();
  }
}
