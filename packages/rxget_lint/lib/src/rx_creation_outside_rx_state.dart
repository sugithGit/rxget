import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/element/element.dart';
import 'package:analyzer/dart/element/type.dart';
import 'package:analyzer/error/listener.dart';
import 'package:custom_lint_builder/custom_lint_builder.dart';

class RxCreationOutsideRxState extends DartLintRule {
  RxCreationOutsideRxState() : super(code: _code);

  static const _code = LintCode(
    name: 'rx_creation_outside_rx_state',
    problemMessage:
        'Rx variables should only be created inside classes that implement RxState.',
    correctionMessage:
        'Implement RxState in the enclosing class or move the Rx creation to a valid scope.',
  );

  @override
  void run(
    CustomLintResolver resolver,
    ErrorReporter reporter,
    CustomLintContext context,
  ) {
    context.registry.addInstanceCreationExpression((node) {
      final type = node.staticType;
      if (type == null) return;

      if (_isRxType(type)) {
        if (!_isInsideRxState(node)) {
          reporter.reportErrorForNode(code, node);
        }
      }
    });

    context.registry.addPropertyAccess((node) {
      if (node.propertyName.name == 'obs') {
        if (!_isInsideRxState(node)) {
          reporter.reportErrorForNode(code, node);
        }
      }
    });
  }

  bool _isRxType(DartType type) {
    final name = type.element?.name;
    if (name == null) return false;
    return name.startsWith('Rx') || name == 'Rx';
  }

  bool _isInsideRxState(AstNode node) {
    final classDeclaration = node.thisOrAncestorOfType<ClassDeclaration>();
    if (classDeclaration == null) {
      // Not inside a class at all? Then it's definitely outside RxState context (e.g. top level)
      // Unless we want to allow top level? User said "RxState class only".
      return false;
    }

    final element = classDeclaration.declaredElement;
    if (element == null) return false;

    // Check if class implements RxState
    return _implementsRxState(element);
  }

  bool _implementsRxState(InterfaceElement? element) {
    if (element == null) return false;
    if (element.name == 'RxState') return true;

    for (final type in element.allSupertypes) {
      if (type.element.name == 'RxState') {
        return true;
      }
    }
    return false;
  }
}
