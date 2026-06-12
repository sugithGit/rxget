import 'package:rxget_generator/src/field_info.dart';
import 'package:test/test.dart';

/// Simulates the generator's output logic for testing without needing
/// the full analyzer/build_runner setup.
///
/// This mirrors the logic in [GetxStateGenerator] but operates on
/// pre-parsed [FieldInfo] objects instead of Dart AST elements.
String generateStateClass(String className, List<FieldInfo> fields) {
  final generatedClassName = '_$className';
  final buffer = StringBuffer();

  // Class declaration
  buffer.writeln('class $generatedClassName extends GetxState {');

  // Constructor
  buffer.writeln('  $generatedClassName({');
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

  final reactiveFields = fields.where((f) => !f.isUpdate).toList();
  final updateFields = fields.where((f) => f.isUpdate).toList();

  if (reactiveFields.isNotEmpty || updateFields.isNotEmpty) {
    buffer.write('  : ');
    final initializers = <String>[];

    for (final field in reactiveFields) {
      initializers.add('_${field.name} = ${field.rxInitializer(field.name)}');
    }
    for (final field in updateFields) {
      initializers.add('_${field.name} = ${field.name}');
    }

    buffer.writeln(initializers.join(',\n        '));
  }

  buffer.writeln(';');
  buffer.writeln();

  // Reactive fields
  final reactive = fields.where((f) => !f.isUpdate).toList();
  if (reactive.isNotEmpty) {
    buffer.writeln('  // --- Reactive fields ---');
    buffer.writeln();
    for (final field in reactive) {
      buffer.writeln('  final ${field.rxTypeName} _${field.name};');
      buffer.writeln(
        '  ${field.typeName} get ${field.name} => _${field.name}.value;',
      );
      buffer.writeln(
        '  set ${field.name}(${field.typeName} value) '
        '=> _${field.name}.value = value;',
      );
      buffer.writeln();
    }
  }

  // Update fields
  final update = fields.where((f) => f.isUpdate).toList();
  if (update.isNotEmpty) {
    buffer.writeln('  // --- Update fields (non-reactive) ---');
    buffer.writeln();
    for (final field in update) {
      buffer.writeln('  ${field.typeName} _${field.name};');
      buffer.writeln(
        '  ${field.typeName} get ${field.name} => _${field.name};',
      );
      buffer.writeln(
        '  set ${field.name}(${field.typeName} value) '
        '=> _${field.name} = value;',
      );
      buffer.writeln();
    }
  }

  // onClose
  final closable = fields.where((f) => f.needsClose).toList();
  buffer.writeln('  // --- Lifecycle ---');
  buffer.writeln();
  buffer.writeln('  @override');
  buffer.writeln('  void onClose() {');
  for (final field in closable) {
    buffer.writeln('    _${field.name}.close();');
  }
  buffer.writeln('  }');
  buffer.writeln('}');

  return buffer.toString();
}

void main() {
  group('Generated output', () {
    test('basic state with primitives', () {
      final fields = [
        const FieldInfo(
          name: 'count',
          typeName: 'int',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
          defaultValueCode: '0',
        ),
        const FieldInfo(
          name: 'name',
          typeName: 'String',
          isNullable: false,
          isRequired: true,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        ),
      ];

      final output = generateStateClass('CounterState', fields);

      expect(output, contains('class _CounterState extends GetxState {'));
      expect(output, contains('int count = 0,'));
      expect(output, contains('required String name,'));
      expect(output, contains('_count = Rx<int>(count)'));
      expect(output, contains('_name = Rx<String>(name)'));
      expect(output, contains('final Rx<int> _count;'));
      expect(output, contains('int get count => _count.value;'));
      expect(output, contains('set count(int value) => _count.value = value;'));
      expect(output, contains('final Rx<String> _name;'));
      expect(output, contains('_count.close();'));
      expect(output, contains('_name.close();'));
    });

    test('nullable fields use Rxn', () {
      final fields = [
        const FieldInfo(
          name: 'email',
          typeName: 'String?',
          isNullable: true,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        ),
      ];

      final output = generateStateClass('FormState', fields);

      expect(output, contains('_email = Rxn<String>(email)'));
      expect(output, contains('final Rxn<String> _email;'));
      expect(output, contains('String? get email => _email.value;'));
      expect(
        output,
        contains('set email(String? value) => _email.value = value;'),
      );
      expect(output, contains('_email.close();'));
    });

    test('@update fields are plain (non-reactive)', () {
      final fields = [
        const FieldInfo(
          name: 'count',
          typeName: 'int',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
          defaultValueCode: '0',
        ),
        const FieldInfo(
          name: 'manuelSwitch',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: true,
          collectionKind: CollectionKind.none,
          defaultValueCode: 'false',
        ),
      ];

      final output = generateStateClass('LiftState', fields);

      // @update field should NOT have Rx wrapper
      expect(output, contains('bool _manuelSwitch;'));
      expect(output, contains('bool get manuelSwitch => _manuelSwitch;'));
      expect(
        output,
        contains('set manuelSwitch(bool value) => _manuelSwitch = value;'),
      );

      // @update field should NOT be in onClose
      expect(output, isNot(contains('_manuelSwitch.close()')));

      // Reactive field should be in onClose
      expect(output, contains('_count.close();'));
    });

    test('collection fields use RxList, RxMap, RxSet', () {
      final fields = [
        const FieldInfo(
          name: 'items',
          typeName: 'List<String>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.list,
          typeArguments: ['String'],
        ),
        const FieldInfo(
          name: 'scores',
          typeName: 'Map<String, int>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.map,
          typeArguments: ['String', 'int'],
        ),
        const FieldInfo(
          name: 'tags',
          typeName: 'Set<String>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.set,
          typeArguments: ['String'],
        ),
      ];

      final output = generateStateClass('DataState', fields);

      expect(output, contains('final RxList<String> _items;'));
      expect(output, contains('final RxMap<String, int> _scores;'));
      expect(output, contains('final RxSet<String> _tags;'));
      expect(output, contains('_items.close();'));
      expect(output, contains('_scores.close();'));
      expect(output, contains('_tags.close();'));
    });

    test('mixed reactive and update fields', () {
      final fields = [
        const FieldInfo(
          name: 'selectedDate',
          typeName: 'DateTime',
          isNullable: false,
          isRequired: true,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        ),
        const FieldInfo(
          name: 'switchDate',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
          defaultValueCode: 'false',
        ),
        const FieldInfo(
          name: 'manuelSwitch',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: true,
          collectionKind: CollectionKind.none,
          defaultValueCode: 'false',
        ),
      ];

      final output = generateStateClass('LiftState', fields);

      // Class name
      expect(output, contains('class _LiftState extends GetxState'));

      // Constructor should have all params
      expect(output, contains('required DateTime selectedDate,'));
      expect(output, contains('bool switchDate = false,'));
      expect(output, contains('bool manuelSwitch = false,'));

      // Reactive initializers
      expect(output, contains('_selectedDate = Rx<DateTime>(selectedDate)'));
      expect(output, contains('_switchDate = Rx<bool>(switchDate)'));

      // Update initializer
      expect(output, contains('_manuelSwitch = manuelSwitch'));

      // Reactive section
      expect(output, contains('// --- Reactive fields ---'));
      expect(output, contains('final Rx<DateTime> _selectedDate;'));
      expect(output, contains('final Rx<bool> _switchDate;'));

      // Update section
      expect(output, contains('// --- Update fields (non-reactive) ---'));
      expect(output, contains('bool _manuelSwitch;'));

      // onClose only has reactive fields
      expect(output, contains('_selectedDate.close();'));
      expect(output, contains('_switchDate.close();'));
      expect(output, isNot(contains('_manuelSwitch.close()')));
    });

    test('all @update fields produces empty onClose body', () {
      final fields = [
        const FieldInfo(
          name: 'flag',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: true,
          collectionKind: CollectionKind.none,
          defaultValueCode: 'false',
        ),
      ];

      final output = generateStateClass('PureUpdateState', fields);

      // onClose exists but has no .close() calls
      expect(output, contains('void onClose() {'));
      expect(output, isNot(contains('.close();')));
    });
  });
}
