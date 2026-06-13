import 'package:analysis_server_plugin/edit/dart/correction_producer.dart';
import 'package:analysis_server_plugin/edit/dart/dart_fix_kind_priority.dart';
import 'package:analyzer/analysis_rule/analysis_rule.dart';
import 'package:analyzer/analysis_rule/rule_context.dart';
import 'package:analyzer/analysis_rule/rule_visitor_registry.dart';
import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import 'package:analyzer/dart/element/element.dart';
import 'package:analyzer/dart/element/type.dart';
import 'package:analyzer/error/error.dart';
import 'package:analyzer_plugin/utilities/change_builder/change_builder_core.dart';
import 'package:analyzer_plugin/utilities/fixes/fixes.dart';
import 'package:analyzer_plugin/utilities/range_factory.dart';

import 'rx_type_checker.dart';

/// Lint rule that warns when Rx variables are declared as public fields
/// inside a [GetxState] subclass.
///
/// All Rx types (`Rx<T>`, `RxInt`, `RxString`, `.obs`, etc.) should be declared
/// as private fields (prefixed with `_`) to prevent external mutation of
/// reactive state. Exposing Rx variables publicly breaks encapsulation and
/// allows any part of the code to mutate reactive state directly.
///
/// **BAD:**
/// ```dart
/// class _MyState extends GetxState {
///   final count = 0.obs;          // public Rx field
///   final name = Rx<String>('');  // public Rx field
/// }
/// ```
///
/// **GOOD:**
/// ```dart
/// class _MyState extends GetxState {
///   final _count = 0.obs;          // private Rx field
///   final _name = Rx<String>('');  // private Rx field
/// }
/// ```
class AvoidPublicRxDeclaration extends AnalysisRule {
  AvoidPublicRxDeclaration()
    : super(name: code.name, description: code.problemMessage);

  static const code = LintCode(
    'avoid_public_rx_declaration',
    'Rx variables must be declared as private (prefixed with "_") inside '
        'GetxState. Exposing Rx fields publicly breaks reactive state '
        'encapsulation.',
    correctionMessage: 'Try making Rx variable private by prefixing with "_".',
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
    // Skip static fields — they are not instance state.
    if (node.isStatic) return;

    // Only enforce inside GetxState subclasses.
    final classDecl = node.thisOrAncestorOfType<ClassDeclaration>();
    if (classDecl == null || !isGetxStateSubclass(classDecl)) return;

    for (final variable in node.fields.variables) {
      final variableName = variable.name.lexeme;

      // Already private — nothing to check.
      if (variableName.startsWith('_')) continue;

      if (isRxVariable(variable)) {
        rule.reportAtNode(variable);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Quick Fix: Make Rx variable private
// ---------------------------------------------------------------------------

class MakeRxVariablePrivate extends ResolvedCorrectionProducer {
  static const _fixKind = FixKind(
    'rxget_lint.fix.makeRxVariablePrivate',
    DartFixKindPriority.standard,
    'Make Rx variable private by adding "_" prefix',
  );

  MakeRxVariablePrivate({required super.context});

  @override
  CorrectionApplicability get applicability =>
      CorrectionApplicability.singleLocation;

  @override
  FixKind get fixKind => _fixKind;

  @override
  Future<void> compute(ChangeBuilder builder) async {
    final node = this.node;

    // The reported node is a VariableDeclaration.
    if (node is! VariableDeclaration) return;

    final name = node.name;
    final currentName = name.lexeme;

    // Already private — should not happen, but guard.
    if (currentName.startsWith('_')) return;

    final newName = '_$currentName';

    await builder.addDartFileEdit(file, (builder) {
      builder.addSimpleReplacement(range.token(name), newName);
    });
  }
}
