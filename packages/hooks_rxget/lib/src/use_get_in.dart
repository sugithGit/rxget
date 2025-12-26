import 'package:flutter/widgets.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:rxget/rxget.dart';

T useGetIn<T>(GetIn<T> getIn) {
  return use(_UseGetIn(getIn));
}

class _UseGetIn<T> extends Hook<T> {
  const _UseGetIn(this.getIn);
  final GetIn<T> getIn;

  @override
  _UseGetInState<T> createState() => _UseGetInState<T>();
}

class _UseGetInState<T> extends HookState<T, _UseGetIn<T>> {
  late final GetIn<T> _getIn;
  @override
  void initHook() {
    _getIn = hook.getIn;
    _getIn.register();
    super.initHook();
  }

  @override
  T build(BuildContext context) {
    // Return the instance. Assuming Get.find is available via rxget.
    // If GetIn registers with a tag, we need to use it.
    return Get.find<T>(tag: _getIn.tag);
  }

  @override
  void dispose() {
    _getIn.dispose();
    super.dispose();
  }
}
