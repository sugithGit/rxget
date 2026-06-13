import 'package:analysis_server_plugin/plugin.dart';
import 'package:analysis_server_plugin/registry.dart';

import 'src/lints/avoid_public_rx_declaration.dart';
import 'src/lints/avoid_rx_outside_getx_state.dart';
import 'src/lints/getx_state_must_be_private.dart';

final plugin = _RxGetLintPlugin();

class _RxGetLintPlugin extends Plugin {
  @override
  String get name => 'rxget_lint';

  @override
  void register(PluginRegistry registry) {
    // 1. GetxState subclasses must be private.
    registry.registerWarningRule(GetxStateMustBePrivate());
    registry.registerFixForRule(
      GetxStateMustBePrivate.code,
      MakeGetxStatePrivate.new,
    );

    // 2. Rx variables must be private inside GetxState.
    registry.registerWarningRule(AvoidPublicRxDeclaration());
    registry.registerFixForRule(
      AvoidPublicRxDeclaration.code,
      MakeRxVariablePrivate.new,
    );

    // 3. Rx variables should only be declared inside GetxState subclasses.
    registry.registerWarningRule(AvoidRxOutsideGetxState());
  }
}
