import 'package:analyzer/analysis_rule/analysis_rule.dart';
import 'package:analyzer/analysis_rule/rule_context.dart';
import 'package:analyzer/analysis_rule/rule_visitor_registry.dart';
import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import 'package:analyzer/error/error.dart';

import 'rx_type_checker.dart';

/// Lint rule that warns when Rx variables (`.obs`, `Rx<T>`, etc.) are declared
/// outside a `GetxState` subclass.
///
/// Creating reactive variables outside `GetxState` means they won't be
/// automatically disposed via `onClose()`, which can lead to memory leaks
/// and maintainability issues.
///
/// **BAD:**
/// ```dart
/// class MyService {
///   final _count = 0.obs;  // WARNING: no GetxState disposal system
/// }
/// ```
///
/// **GOOD:**
/// ```dart
/// class _MyState extends GetxState {
///   final _count = 0.obs;  // OK: disposed in onClose()
///   @override
///   void onClose() { _count.close(); }
/// }
/// ```
class AvoidRxOutsideGetxState extends AnalysisRule {
  AvoidRxOutsideGetxState()
    : super(name: code.name, description: code.problemMessage);

  static const code = LintCode(
    'avoid_rx_outside_getx_state',
    'Rx variables should only be declared inside a GetxState subclass. '
        'Creating .obs or Rx variables without GetxState and its disposal '
        'system can lead to memory leaks and maintainability issues.',
  );

  @override
  DiagnosticCode get diagnosticCode => code;

  @override
  void registerNodeProcessors(
    RuleVisitorRegistry registry,
    RuleContext context,
  ) {
    final visitor = _Visitor(this, context);
    registry.addFieldDeclaration(this, visitor);
  }
}

class _Visitor extends SimpleAstVisitor<void> {
  _Visitor(this.rule, this.context);

  final AnalysisRule rule;
  final RuleContext context;

  @override
  void visitFieldDeclaration(FieldDeclaration node) {
    // Skip static fields.
    if (node.isStatic) return;

    // If inside a GetxState subclass, the other rule handles it — skip.
    final classDecl = node.thisOrAncestorOfType<ClassDeclaration>();
    if (classDecl == null) return;
    if (isGetxStateSubclass(classDecl)) return;

    for (final variable in node.fields.variables) {
      if (isRxVariable(variable)) {
        rule.reportAtNode(variable);
      }
    }
  }
}
