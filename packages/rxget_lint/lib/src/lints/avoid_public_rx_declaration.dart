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

/// Lint rule that warns when Rx variables are declared as public fields.
///
/// All Rx types (`Rx<T>`, `RxInt`, `RxString`, `.obs`, etc.) should be declared
/// as private fields (prefixed with `_`) to prevent external mutation of
/// reactive state.
///
/// **BAD:**
/// ```dart
/// class MyController {
///   final count = 0.obs;          // public Rx field
///   final name = Rx<String>('');  // public Rx field
/// }
/// ```
///
/// **GOOD:**
/// ```dart
/// class MyController {
///   final _count = 0.obs;          // private Rx field
///   final _name = Rx<String>('');  // private Rx field
/// }
/// ```
class AvoidPublicRxDeclaration extends AnalysisRule {
  AvoidPublicRxDeclaration()
    : super(name: code.name, description: code.problemMessage);

  static const code = LintCode(
    'avoid_public_rx_declaration',
    'Rx variables must be declared as private (prefixed with "_").',
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

  /// All Rx class names from the rxget package that should be private.
  static const _rxTypeNames = <String>{
    'Rx',
    'Rxn',
    'RxBool',
    'RxnBool',
    'RxInt',
    'RxnInt',
    'RxDouble',
    'RxnDouble',
    'RxNum',
    'RxnNum',
    'RxString',
    'RxnString',
    'RxList',
    'RxMap',
    'RxSet',
    'GetListenable',
  };

  @override
  void visitFieldDeclaration(FieldDeclaration node) {
    // Skip static fields — they are not instance state.
    if (node.isStatic) return;

    for (final variable in node.fields.variables) {
      final variableName = variable.name.lexeme;

      // Already private — nothing to check.
      if (variableName.startsWith('_')) continue;

      if (_isRxType(variable)) {
        rule.reportAtNode(variable);
      }
    }
  }

  /// Returns `true` if the variable is an Rx type, either by:
  /// 1. Its resolved (inferred) type being an Rx subtype
  /// 2. Its initializer calling `.obs` or an Rx constructor
  bool _isRxType(VariableDeclaration variable) {
    // Check 1: Use the resolved type from the element (handles inferred types).
    final element = variable.declaredFragment?.element;
    if (element != null) {
      final type = element.type;
      if (_isDartTypeRx(type)) return true;
    }

    // Check 2: Fallback — inspect the initializer AST for `.obs` or Rx constructors.
    final initializer = variable.initializer;
    if (initializer != null) {
      if (_isObsCall(initializer)) return true;
      if (_isRxConstructorCall(initializer)) return true;
    }

    // Check 3: Inspect the explicit type annotation.
    final parent = variable.parent;
    if (parent is VariableDeclarationList) {
      final typeAnnotation = parent.type;
      if (typeAnnotation is NamedType) {
        final typeName = typeAnnotation.name2.lexeme;
        if (_rxTypeNames.contains(typeName)) return true;
      }
    }

    return false;
  }

  /// Checks if a resolved DartType is an Rx type.
  bool _isDartTypeRx(DartType type) {
    if (type is InterfaceType) {
      final element = type.element3;
      final className = element.name3;
      if (className != null && _rxTypeNames.contains(className)) {
        // Verify it's from the rxget package (not some random class
        // with the same name).
        final source = element.firstFragment.libraryFragment?.source;
        if (source != null) {
          final uri = source.uri.toString();
          if (uri.contains('rxget')) return true;
        }
      }

      // Check supertype chain: the variable's type might extend Rx.
      for (final supertype in element.allSupertypes) {
        final superName = supertype.element3.name3;
        if (superName != null && _rxTypeNames.contains(superName)) {
          final source =
              supertype.element3.firstFragment.libraryFragment?.source;
          if (source != null) {
            final uri = source.uri.toString();
            if (uri.contains('rxget')) return true;
          }
        }
      }
    }
    return false;
  }

  /// Checks if an expression is a `.obs` property access.
  /// e.g.: `0.obs`, `'hello'.obs`, `[].obs`
  bool _isObsCall(Expression expression) {
    if (expression is PropertyAccess) {
      return expression.propertyName.name == 'obs';
    }
    if (expression is PrefixedIdentifier) {
      return expression.identifier.name == 'obs';
    }
    // Method invocation: someValue.obs<T>()
    if (expression is MethodInvocation) {
      return expression.methodName.name == 'obs';
    }
    return false;
  }

  /// Checks if an expression is an Rx constructor invocation.
  /// e.g.: `Rx<int>(0)`, `RxInt(0)`, `RxBool(false)`
  bool _isRxConstructorCall(Expression expression) {
    if (expression is InstanceCreationExpression) {
      final typeName = expression.constructorName.type.name2.lexeme;
      return _rxTypeNames.contains(typeName);
    }
    // Function reference style: `RxInt(0)` can also parse as
    // MethodInvocation in some contexts.
    if (expression is MethodInvocation) {
      final name = expression.methodName.name;
      return _rxTypeNames.contains(name);
    }
    return false;
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
