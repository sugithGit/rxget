import 'dart:async';
import 'package:flutter/widgets.dart';
import '../simple/list_notifier.dart';

typedef EffectCallback = void Function();

/// A Stateless widget that registers reactive reads and runs [effect]
/// on build and whenever those reads change. Does NOT rebuild the UI.
class Obl extends OblStatelessWidget {
  const Obl({
    required this.effect,
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
  List<Disposer>? disposers = <Disposer>[];

  void _onReactiveUpdate() {
    // Call the combined effect asynchronously to avoid re-entrancy issues.
    scheduleMicrotask(() {
      if (widget is Obl) {
        try {
          (widget as Obl).effect();
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
    return Notifier.instance.append(
      NotifyData(disposers: disposers!, updater: _onReactiveUpdate),
      super.build,
    );
  }

  @override
  void unmount() {
    // Dispose collected disposers
    if (disposers != null) {
      for (final d in disposers!) {
        d();
      }
      disposers!.clear();
      disposers = null;
    }
    super.unmount();
  }
}
