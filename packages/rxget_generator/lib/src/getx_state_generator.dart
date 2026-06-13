import 'package:analyzer/dart/element/element.dart';
import 'package:analyzer/dart/element/nullability_suffix.dart';
import 'package:analyzer/dart/element/type.dart';
import 'package:build/build.dart';
import 'package:rxget_annotation/rxget_annotation.dart';
import 'package:source_gen/source_gen.dart';

import 'field_info.dart';

/// A `source_gen` generator that produces `GetxState` subclasses from
/// `@getxState`-annotated schema classes.
///
/// Given:
/// ```dart
/// @getxState
/// class CounterState {
///   CounterState({this.count = 0});
///   int count;
/// }
/// ```
///
/// Generates:
/// ```dart
/// class _CounterState extends GetxState {
///   _CounterState({int count = 0}) : _count = Rx<int>(count);
///
///   final Rx<int> _count;
///   int get count => _count.value;
///   set count(int value) => _count.value = value;
///
///   @override
///   void onClose() {
///     _count.close();
///   }
/// }
/// ```
class GetxStateGenerator extends GeneratorForAnnotation<GetxStateAnnotation> {
  /// Creates a new [GetxStateGenerator] instance.
  const GetxStateGenerator({
    super.throwOnUnresolved,
  });

  static const _updateChecker = TypeChecker.fromUrl(
      'package:rxget_annotation/src/annotations.dart#UpdateAnnotation');

  /// Whether to throw an exception if an annotated element cannot be resolved.
  @override
  bool get throwOnUnresolved => super.throwOnUnresolved;

  /// The type checker used to match the annotation.
  @override
  TypeChecker get typeChecker => super.typeChecker;

  @override
  String generateForAnnotatedElement(
    Element element,
    ConstantReader annotation,
    BuildStep buildStep,
  ) {
    if (element is! ClassElement) {
      throw InvalidGenerationSourceError(
        '@getxState can only be applied to classes.',
        element: element,
        todo: 'Remove the @getxState annotation from non-class elements.',
      );
    }

    final classElement = element;
    final className = classElement.name;
    final generatedClassName = '_$className';

    // Parse fields from the class
    final fields = _parseFields(classElement);

    if (fields.isEmpty) {
      throw InvalidGenerationSourceError(
        '@getxState class "$className" has no fields to generate state for.',
        element: element,
        todo: 'Add at least one field to the class.',
      );
    }

    // Build the generated class
    final buffer = StringBuffer();

    // Class declaration
    buffer.writeln('class $generatedClassName extends GetxState {');

    // Constructor
    _writeConstructor(buffer, generatedClassName, fields);

    // Fields, getters, and setters
    _writeReactiveFields(buffer, fields);
    _writeUpdateFields(buffer, fields);

    // onClose
    _writeOnClose(buffer, fields);

    // Close class
    buffer.writeln('}');

    return buffer.toString();
  }

  /// Parses all instance fields from the class element.
  List<FieldInfo> _parseFields(ClassElement classElement) {
    final fields = <FieldInfo>[];

    for (final field in classElement.fields) {
      // Skip static fields, synthetic fields, and inherited fields
      if (field.isStatic || !field.isOriginDeclaration) continue;

      final fieldType = field.type;
      final isUpdate = _updateChecker.hasAnnotationOfExact(field);

      final fieldName = field.name;
      if (fieldName == null) continue;

      // Also check constructor parameter for @update annotation
      final isUpdateFromConstructor =
          _hasUpdateOnConstructorParam(classElement, fieldName);

      fields.add(
        FieldInfo(
          name: fieldName,
          typeName: _getTypeName(fieldType),
          isNullable: fieldType.nullabilitySuffix == NullabilitySuffix.question,
          isRequired: _isFieldRequired(classElement, fieldName),
          isUpdate: isUpdate || isUpdateFromConstructor,
          collectionKind: _getCollectionKind(fieldType),
          defaultValueCode:
              _getDefaultValue(classElement, fieldName),
          typeArguments: _getTypeArguments(fieldType),
        ),
      );
    }

    return fields;
  }

  /// Checks if a constructor parameter has the @update annotation.
  bool _hasUpdateOnConstructorParam(ClassElement classElement, String fieldName) {
    final constructor = classElement.unnamedConstructor;
    if (constructor == null) return false;

    for (final param in constructor.formalParameters) {
      if (param.name == fieldName) {
        return _updateChecker.hasAnnotationOfExact(param);
      }
    }
    return false;
  }

  /// Returns the full type name as a string.
  String _getTypeName(DartType type) {
    return type.getDisplayString();
  }

  /// Returns the [CollectionKind] for the given type.
  CollectionKind _getCollectionKind(DartType type) {
    if (type.isDartCoreList) return CollectionKind.list;
    if (type.isDartCoreMap) return CollectionKind.map;
    if (type.isDartCoreSet) return CollectionKind.set;
    return CollectionKind.none;
  }

  /// Extracts type arguments from generic types.
  List<String> _getTypeArguments(DartType type) {
    if (type is InterfaceType) {
      return type.typeArguments.map(_getTypeName).toList();
    }
    return const [];
  }

  /// Checks if the field's corresponding constructor parameter is required.
  bool _isFieldRequired(ClassElement classElement, String fieldName) {
    final constructor = classElement.unnamedConstructor;
    if (constructor == null) return false;

    for (final param in constructor.formalParameters) {
      if (param.name == fieldName) {
        return param.isRequired;
      }
    }
    return false;
  }

  /// Gets the default value source code for a constructor parameter.
  String? _getDefaultValue(ClassElement classElement, String fieldName) {
    final constructor = classElement.unnamedConstructor;
    if (constructor == null) return null;

    for (final param in constructor.formalParameters) {
      if (param.name == fieldName && param.hasDefaultValue) {
        return param.defaultValueCode;
      }
    }
    return null;
  }

  /// Writes the constructor with Rx initializers.
  void _writeConstructor(
    StringBuffer buffer,
    String className,
    List<FieldInfo> fields,
  ) {
    // Constructor parameters
    buffer.writeln('  $className({');
    for (final field in fields) {
      final requiredPrefix = field.isRequired ? 'required ' : '';
      final defaultSuffix = field.defaultValueCode != null
          ? ' = ${field.defaultValueCode}'
          : '';
      buffer.writeln(
        '    $requiredPrefix${field.typeName} ${field.name}$defaultSuffix,',
      );
    }
    buffer.write('  })');

    // Initializer list for reactive fields
    final reactiveFields = fields.where((f) => !f.isUpdate).toList();
    final updateFields = fields.where((f) => f.isUpdate).toList();

    if (reactiveFields.isNotEmpty || updateFields.isNotEmpty) {
      buffer.write('  : ');

      final initializers = <String>[];

      for (final field in reactiveFields) {
        initializers.add(
          '_${field.name} = ${field.rxInitializer(field.name)}',
        );
      }

      for (final field in updateFields) {
        initializers.add('_${field.name} = ${field.name}');
      }

      buffer.writeln(initializers.join(',\n        '));
    }

    buffer.writeln(';');
    buffer.writeln();
  }

  /// Writes reactive field declarations with getters and setters.
  void _writeReactiveFields(StringBuffer buffer, List<FieldInfo> fields) {
    final reactiveFields = fields.where((f) => !f.isUpdate).toList();
    if (reactiveFields.isEmpty) return;

    buffer.writeln('  // --- Reactive fields ---');
    buffer.writeln();

    for (final field in reactiveFields) {
      // Private Rx field
      buffer.writeln('  final ${field.rxTypeName} _${field.name};');

      // Public getter
      buffer.writeln(
        '  ${field.typeName} get ${field.name} => _${field.name}.value;',
      );

      // Public setter
      buffer.writeln(
        '  set ${field.name}(${field.typeName} value) '
        '=> _${field.name}.value = value;',
      );

      buffer.writeln();
    }
  }

  /// Writes non-reactive (@update) field declarations with getters and setters.
  void _writeUpdateFields(StringBuffer buffer, List<FieldInfo> fields) {
    final updateFields = fields.where((f) => f.isUpdate).toList();
    if (updateFields.isEmpty) return;

    buffer.writeln('  // --- Update fields (non-reactive) ---');
    buffer.writeln();

    for (final field in updateFields) {
      // Private plain field
      buffer.writeln('  ${field.typeName} _${field.name};');

      // Public getter
      buffer.writeln(
        '  ${field.typeName} get ${field.name} => _${field.name};',
      );

      // Public setter
      buffer.writeln(
        '  set ${field.name}(${field.typeName} value) '
        '=> _${field.name} = value;',
      );

      buffer.writeln();
    }
  }

  /// Writes the `onClose()` method that disposes all reactive fields.
  void _writeOnClose(StringBuffer buffer, List<FieldInfo> fields) {
    final closableFields = fields.where((f) => f.needsClose).toList();

    buffer.writeln('  // --- Lifecycle ---');
    buffer.writeln();
    buffer.writeln('  @override');
    buffer.writeln('  void onClose() {');

    for (final field in closableFields) {
      buffer.writeln('    _${field.name}.close();');
    }

    buffer.writeln('  }');
  }
}
