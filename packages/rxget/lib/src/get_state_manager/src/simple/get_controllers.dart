// Mixin usage
// ignore: prefer_mixin
// ignore_for_file: always_put_control_body_on_new_line
import 'package:flutter/widgets.dart';
import '../../../get_instance/src/lifecycle.dart';

import 'list_notifier.dart';

/// Abstract base class for state objects used with [GetxController].
///
/// State classes must extend this class and implement [onClose] to
/// properly dispose of RxVariables and other resources.
///
/// ---
/// Example:
/// ```dart
/// class _CounterState extends GetxState {
///   final counter = 0.obs;
///   final name = 'test'.obs;
///
///   @override
///   void onClose() {
///     counter.close();
///     name.close();
///   }
/// }
/// ```
abstract class GetxState {
  /// Called when the controller is disposed.
  ///
  /// Override this method to close all RxVariables and dispose of
  /// any resources held by this state object.
  ///
  /// Example:
  /// ```dart
  /// @override
  /// void onClose() {
  ///   counter.close();
  ///   name.close();
  /// }
  /// ```
  void onClose();
}

/// A base controller class that provides state management functionality.
///
/// Extend this class to create a controller that can be used with GetX's
/// state management system. This class provides methods to update the UI
/// when the controller's state changes.
///
/// The state class must extend [GetxState] and implement [GetxState.onClose]
/// to properly dispose of RxVariables when the controller is disposed.
///
/// ---
/// Example:
/// ```dart
/// class _CounterState extends GetxState {
///   final _count = 0.obs;
///
///   int get count => _count.value;
///
///   @override
///   void onClose() {
///     _count.close();
///   }
/// }
///
/// class CounterController extends GetxController<_CounterState> {
///   @override
///   final state = _CounterState();
///
///   void increment() {
///     state._count.value++;
///     update();
///   }
/// }
/// ```
// ignore: prefer_mixin
abstract class GetxController<T extends GetxState> extends ListNotifier
    with GetLifeCycleMixin {
  GetxController() {
    assert(
      T.toString().startsWith('_'),
      'State class for $runtimeType must be private (start with "_")',
    );
  }

  /// The state object managed by this controller.
  ///
  /// Subclasses **must override** this getter to provide a concrete state
  /// instance (for example, `final _State state = _State();`).
  ///
  /// The [state] object should contain your reactive variables (`Rx<T>` or `.obs`)
  /// that represent the controller's data layer.
  ///
  /// The [state] class must extend [GetxState] and implement [GetxState.onClose]
  /// to handle proper resource cleanup when the controller is disposed.
  ///
  /// ---
  /// Example:
  /// ```dart
  /// class _CounterState extends GetxState {
  ///   final _count = 0.obs;
  ///
  ///   int get count => _count.value;
  ///
  ///   @override
  ///   void onClose() {
  ///     _count.close();
  ///   }
  /// }
  ///
  /// class CounterController extends GetxController<_CounterState> {
  ///   @override
  ///   final state = _CounterState();
  ///
  ///   void increment() {
  ///     state._count.value++;
  ///     update();
  ///   }
  /// }
  /// ```
  ///
  /// You can use `Obx` or `GetBuilder` in your UI to reactively rebuild
  /// widgets when fields inside [state] change.
  T get state;

  /// Called when the controller is disposed.
  ///
  /// This method automatically calls [state.onClose()] to dispose of
  /// all RxVariables and resources in the state object.
  ///
  /// If you need to perform additional cleanup in your controller,
  /// override this method and call `super.onClose()`:
  ///
  /// ```dart
  /// @override
  /// void onClose() {
  ///   // Your cleanup code here
  ///   super.onClose(); // This calls state.onClose() automatically
  /// }
  /// ```
  @override
  @mustCallSuper
  void onClose() {
    state.onClose();
    super.onClose();
  }

  /// Notifies listeners to update the UI.
  ///
  /// When called without parameters, it will update all widgets that depend on
  /// this controller. You can also specify specific widget IDs to update only
  /// those widgets.
  ///
  /// Parameters:
  /// - [ids]: Optional list of widget IDs to update. If null, updates all widgets.
  /// - [condition]: If false, the update will be skipped.
  ///
  void update([List<Object>? ids, bool condition = true]) {
    if (!condition) {
      return;
    }
    if (ids == null) {
      refresh();
    } else {
      for (final id in ids) {
        refreshGroup(id);
      }
    }
  }
}

/// A base controller class for reactive state management using Rx variables.
///
/// This class is a lightweight alternative to [GetxController] when you only
/// need reactive variables without the need for manual UI updates.
///
/// Example:
/// ```dart
/// class UserController extends RxController {
///   final name = 'John'.obs;
///   final age = 30.obs;
/// }
/// ```
abstract class RxController with GetLifeCycleMixin {}
