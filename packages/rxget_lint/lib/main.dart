import 'package:analysis_server_plugin/plugin.dart';
import 'package:analysis_server_plugin/registry.dart';

import 'src/lints/avoid_public_rx_declaration.dart';

final plugin = _RxGetLintPlugin();

class _RxGetLintPlugin extends Plugin {
  @override
  String get name => 'rxget_lint';

  @override
  void register(PluginRegistry registry) {
    // Rx variables must be private — enabled by default as a warning.
    registry.registerWarningRule(AvoidPublicRxDeclaration());
    registry.registerFixForRule(
      AvoidPublicRxDeclaration.code,
      MakeRxVariablePrivate.new,
    );
  }
}
