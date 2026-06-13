import 'package:analysis_server_plugin/edit/dart/correction_producer.dart';
import 'package:analysis_server_plugin/edit/dart/dart_fix_kind_priority.dart';
import 'package:analyzer/analysis_rule/analysis_rule.dart';
import 'package:analyzer/analysis_rule/rule_context.dart';
import 'package:analyzer/analysis_rule/rule_visitor_registry.dart';
import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import 'package:analyzer/error/error.dart';
import 'package:analyzer_plugin/utilities/change_builder/change_builder_core.dart';
import 'package:analyzer_plugin/utilities/fixes/fixes.dart';
import 'package:analyzer_plugin/utilities/range_factory.dart';

/// Lint rule that enforces classes extending `GetxState` to be private.
///
/// State classes should be private (prefixed with `_`) so they cannot be
/// instantiated or accessed directly outside the controller file. This
/// ensures that all state mutations go through the controller.
///
/// **BAD:**
/// ```dart
/// class LiftState extends GetxState { // public — ERROR
///   final _count = 0.obs;
///   @override
///   void onClose() { _count.close(); }
/// }
/// ```
///
/// **GOOD:**
/// ```dart
/// class _LiftState extends GetxState { // private — OK
///   final _count = 0.obs;
///   @override
///   void onClose() { _count.close(); }
/// }
/// ```
class GetxStateMustBePrivate extends AnalysisRule {
  GetxStateMustBePrivate()
    : super(name: code.name, description: code.problemMessage);

  static const code = LintCode(
    'getx_state_must_be_private',
    'Classes extending GetxState must be private (prefixed with "_"). '
        'State classes should only be accessible within the controller file.',
    correctionMessage:
        'Try making the state class private by prefixing with "_".',
  );

  @override
  DiagnosticCode get diagnosticCode => code;

  @override
  void registerNodeProcessors(
    RuleVisitorRegistry registry,
    RuleContext context,
  ) {
    final visitor = _Visitor(this, context);
    registry.addClassDeclaration(this, visitor);
  }
}

class _Visitor extends SimpleAstVisitor<void> {
  _Visitor(this.rule, this.context);

  final AnalysisRule rule;
  final RuleContext context;

  @override
  void visitClassDeclaration(ClassDeclaration node) {
    final extendsClause = node.extendsClause;
    if (extendsClause == null) return;

    // Check direct superclass name.
    if (!_extendsGetxState(node)) return;

    final className = node.namePart.typeName.lexeme;
    if (!className.startsWith('_')) {
      rule.reportAtToken(node.namePart.typeName);
    }
  }

  bool _extendsGetxState(ClassDeclaration node) {
    final superName = node.extendsClause?.superclass.name.lexeme;
    if (superName == 'GetxState') return true;

    // Also check resolved supertypes.
    final classElement = node.declaredFragment?.element;
    if (classElement != null) {
      for (final supertype in classElement.allSupertypes) {
        final name = supertype.element.name;
        if (name == 'GetxState') {
          final source =
              supertype.element.firstFragment.libraryFragment.source;
          if (source.uri.toString().contains('rxget')) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

// ---------------------------------------------------------------------------
// Quick Fix: Make GetxState class private
// ---------------------------------------------------------------------------

class MakeGetxStatePrivate extends ResolvedCorrectionProducer {
  MakeGetxStatePrivate({required super.context});
  static const _fixKind = FixKind(
    'rxget_lint.fix.makeGetxStatePrivate',
    DartFixKindPriority.standard,
    'Make GetxState class private by adding "_" prefix',
  );

  @override
  CorrectionApplicability get applicability =>
      CorrectionApplicability.singleLocation;

  @override
  FixKind get fixKind => _fixKind;

  @override
  Future<void> compute(ChangeBuilder builder) async {
    final node = this.node;

    // The reported node is the class name token.
    if (node is! SimpleIdentifier) return;

    final currentName = node.name;
    if (currentName.startsWith('_')) return;

    final newName = '_$currentName';

    await builder.addDartFileEdit(file, (builder) {
      builder.addSimpleReplacement(range.node(node), newName);
    });
  }
}
