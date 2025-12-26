import 'package:custom_lint_builder/custom_lint_builder.dart';
import 'src/rx_creation_outside_rx_state.dart';

export 'src/rx_creation_outside_rx_state.dart';

PluginBase createPlugin() => _RxGetLintPlugin();

class _RxGetLintPlugin extends PluginBase {
  @override
  List<LintRule> getLintRules(CustomLintConfigs configs) => [
        RxCreationOutsideRxState(),
      ];
}
