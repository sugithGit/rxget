import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import '../../../get_core/get_core.dart';
import '../../../get_di/src/extension/extension_instance.dart';
import '../../../get_instance/src/lifecycle.dart';
import '../simple/list_notifier.dart';

typedef GetXControllerBuilder<T extends GetLifeCycleMixin> =
    Widget Function(T controller);

class GetX<T extends GetLifeCycleMixin> extends StatefulWidget {
  const GetX({
    required this.builder,
    super.key,
    this.tag,
    this.global = true,
    this.autoRemove = true,
    this.initState,
    this.assignId = false,
    //  this.stream,
    this.dispose,
    this.didChangeDependencies,
    this.didUpdateWidget,
    this.init,
    // this.streamController
  });
  final GetXControllerBuilder<T> builder;
  final bool global;
  final bool autoRemove;
  final bool assignId;
  final void Function(GetXState<T> state)? initState;
  final void Function(GetXState<T> state)? dispose;
  final void Function(GetXState<T> state)? didChangeDependencies;
  final void Function(GetX oldWidget, GetXState<T> state)? didUpdateWidget;
  final T? init;
  final String? tag;

  @override
  StatefulElement createElement() => StatefulElement(this);

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties
      ..add(
        DiagnosticsProperty<T>('controller', init),
      )
      ..add(DiagnosticsProperty<String>('tag', tag))
      ..add(
        ObjectFlagProperty<GetXControllerBuilder<T>>.has('builder', builder),
      );
  }

  @override
  GetXState<T> createState() => GetXState<T>();
}

class GetXState<T extends GetLifeCycleMixin> extends State<GetX<T>> {
  T? controller;
  bool? _isCreator = false;

  @override
  void initState() {
    // var isPrepared = Get.isPrepared<T>(tag: widget.tag);
    final isRegistered = Get.isRegistered<T>(tag: widget.tag);

    if (widget.global) {
      if (isRegistered) {
        _isCreator = Get.isPrepared<T>(tag: widget.tag);
        controller = Get.find<T>(tag: widget.tag);
      } else {
        controller = widget.init;
        _isCreator = true;
        Get.put<T>(controller!, tag: widget.tag);
      }
    } else {
      controller = widget.init;
      _isCreator = true;
      controller?.onStart();
    }
    widget.initState?.call(this);
    if (widget.global && Get.smartManagement == SmartManagement.onlyBuilder) {
      controller?.onStart();
    }

    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (widget.didChangeDependencies != null) {
      widget.didChangeDependencies?.call(this);
    }
  }

  @override
  void didUpdateWidget(GetX oldWidget) {
    super.didUpdateWidget(oldWidget as GetX<T>);
    widget.didUpdateWidget?.call(oldWidget, this);
  }

  @override
  void dispose() {
    if (widget.dispose != null) {
      widget.dispose?.call(this);
    }
    if (_isCreator! || widget.assignId) {
      if (widget.autoRemove && Get.isRegistered<T>(tag: widget.tag)) {
        Get.delete<T>(tag: widget.tag);
      }
    }

    _scope.close();

    controller = null;
    _isCreator = null;
    super.dispose();
  }

  void _update() {
    if (_scope.isClosed || _updateScheduled || !mounted) {
      return;
    }
    // A controller that writes to several reactive variables in one method
    // notifies once per write; without this guard each one schedules its own
    // setState.
    _updateScheduled = true;
    scheduleMicrotask(() {
      _updateScheduled = false;
      if (_scope.isClosed || !mounted) {
        return;
      }
      setState(() {});
    });
  }

  bool _updateScheduled = false;

  late final RxObserverScope _scope = RxObserverScope(_update);

  /// Cleanup callbacks collected by this widget's reactive scope.
  List<Disposer> get disposers => _scope.disposers;

  @override
  Widget build(BuildContext context) =>
      _scope.run(() => widget.builder(controller!));

  @override
  void debugFillProperties(DiagnosticPropertiesBuilder properties) {
    super.debugFillProperties(properties);
    properties.add(DiagnosticsProperty<T>('controller', controller));
  }
}
