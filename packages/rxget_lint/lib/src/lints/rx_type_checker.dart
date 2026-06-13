import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/element/type.dart';

/// All Rx class names from the rxget package.
const rxTypeNames = <String>{
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

/// Returns `true` if the [classDecl] extends `GetxState`.
bool isGetxStateSubclass(ClassDeclaration classDecl) {
  final extendsClause = classDecl.extendsClause;
  if (extendsClause == null) return false;

  final superName = extendsClause.superclass.name2.lexeme;
  if (superName == 'GetxState') return true;

  // Also check resolved type chain for GetxState.
  final classElement = classDecl.declaredFragment?.element;
  if (classElement != null) {
    for (final supertype in classElement.allSupertypes) {
      final name = supertype.element3.name3;
      if (name == 'GetxState') {
        final source = supertype.element3.firstFragment.libraryFragment?.source;
        if (source != null && source.uri.toString().contains('rxget')) {
          return true;
        }
      }
    }
  }

  return false;
}

/// Returns `true` if the variable is an Rx type, either by:
/// 1. Its resolved (inferred) type being an Rx subtype
/// 2. Its initializer calling `.obs` or an Rx constructor
/// 3. Its explicit type annotation being an Rx type
bool isRxVariable(VariableDeclaration variable) {
  // Check 1: Use the resolved type from the element (handles inferred types).
  final element = variable.declaredFragment?.element;
  if (element != null) {
    final type = element.type;
    if (isDartTypeRx(type)) return true;
  }

  // Check 2: Fallback — inspect the initializer AST for `.obs` or Rx constructors.
  final initializer = variable.initializer;
  if (initializer != null) {
    if (isObsCall(initializer)) return true;
    if (isRxConstructorCall(initializer)) return true;
  }

  // Check 3: Inspect the explicit type annotation.
  final parent = variable.parent;
  if (parent is VariableDeclarationList) {
    final typeAnnotation = parent.type;
    if (typeAnnotation is NamedType) {
      final typeName = typeAnnotation.name2.lexeme;
      if (rxTypeNames.contains(typeName)) return true;
    }
  }

  return false;
}

/// Checks if a resolved DartType is an Rx type from the rxget package.
bool isDartTypeRx(DartType type) {
  if (type is InterfaceType) {
    final element = type.element3;
    final className = element.name3;
    if (className != null && rxTypeNames.contains(className)) {
      final source = element.firstFragment.libraryFragment?.source;
      if (source != null) {
        final uri = source.uri.toString();
        if (uri.contains('rxget')) return true;
      }
    }

    // Check supertype chain: the variable's type might extend Rx.
    for (final supertype in element.allSupertypes) {
      final superName = supertype.element3.name3;
      if (superName != null && rxTypeNames.contains(superName)) {
        final source = supertype.element3.firstFragment.libraryFragment?.source;
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
bool isObsCall(Expression expression) {
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
bool isRxConstructorCall(Expression expression) {
  if (expression is InstanceCreationExpression) {
    final typeName = expression.constructorName.type.name2.lexeme;
    return rxTypeNames.contains(typeName);
  }
  // Function reference style: `RxInt(0)` can also parse as
  // MethodInvocation in some contexts.
  if (expression is MethodInvocation) {
    final name = expression.methodName.name;
    return rxTypeNames.contains(name);
  }
  return false;
}
