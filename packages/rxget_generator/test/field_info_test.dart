import 'package:rxget_generator/src/field_info.dart';
import 'package:test/test.dart';

void main() {
  group('FieldInfo', () {
    group('rxTypeName', () {
      test('non-nullable primitive uses Rx<T>', () {
        const field = FieldInfo(
          name: 'count',
          typeName: 'int',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxTypeName, 'Rx<int>');
      });

      test('nullable type uses Rxn<T>', () {
        const field = FieldInfo(
          name: 'name',
          typeName: 'String?',
          isNullable: true,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxTypeName, 'Rxn<String>');
      });

      test('List uses RxList<T>', () {
        const field = FieldInfo(
          name: 'items',
          typeName: 'List<String>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.list,
          typeArguments: ['String'],
        );
        expect(field.rxTypeName, 'RxList<String>');
      });

      test('nullable List uses Rxn<List<T>>', () {
        const field = FieldInfo(
          name: 'items',
          typeName: 'List<String>?',
          isNullable: true,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.list,
          typeArguments: ['String'],
        );
        expect(field.rxTypeName, 'Rxn<List<String>>');
      });

      test('Map uses RxMap<K, V>', () {
        const field = FieldInfo(
          name: 'data',
          typeName: 'Map<String, int>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.map,
          typeArguments: ['String', 'int'],
        );
        expect(field.rxTypeName, 'RxMap<String, int>');
      });

      test('Set uses RxSet<T>', () {
        const field = FieldInfo(
          name: 'tags',
          typeName: 'Set<String>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.set,
          typeArguments: ['String'],
        );
        expect(field.rxTypeName, 'RxSet<String>');
      });

      test('@update field returns raw type', () {
        const field = FieldInfo(
          name: 'isDirty',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: true,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxTypeName, 'bool');
      });

      test('custom model type uses Rx<T>', () {
        const field = FieldInfo(
          name: 'user',
          typeName: 'UserModel',
          isNullable: false,
          isRequired: true,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxTypeName, 'Rx<UserModel>');
      });

      test('nullable custom model uses Rxn<T>', () {
        const field = FieldInfo(
          name: 'user',
          typeName: 'UserModel?',
          isNullable: true,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxTypeName, 'Rxn<UserModel>');
      });
    });

    group('rxInitializer', () {
      test('non-nullable generates Rx<T>(param)', () {
        const field = FieldInfo(
          name: 'count',
          typeName: 'int',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxInitializer('count'), 'Rx<int>(count)');
      });

      test('nullable generates Rxn<T>(param)', () {
        const field = FieldInfo(
          name: 'name',
          typeName: 'String?',
          isNullable: true,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxInitializer('name'), 'Rxn<String>(name)');
      });

      test('List generates RxList<T>(param)', () {
        const field = FieldInfo(
          name: 'items',
          typeName: 'List<String>',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.list,
          typeArguments: ['String'],
        );
        expect(field.rxInitializer('items'), 'RxList<String>(items)');
      });

      test('@update returns raw param name', () {
        const field = FieldInfo(
          name: 'isDirty',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: true,
          collectionKind: CollectionKind.none,
        );
        expect(field.rxInitializer('isDirty'), 'isDirty');
      });
    });

    group('needsClose', () {
      test('reactive field needs close', () {
        const field = FieldInfo(
          name: 'count',
          typeName: 'int',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.needsClose, isTrue);
      });

      test('@update field does not need close', () {
        const field = FieldInfo(
          name: 'isDirty',
          typeName: 'bool',
          isNullable: false,
          isRequired: false,
          isUpdate: true,
          collectionKind: CollectionKind.none,
        );
        expect(field.needsClose, isFalse);
      });
    });

    group('rawTypeName', () {
      test('non-nullable returns typeName as-is', () {
        const field = FieldInfo(
          name: 'count',
          typeName: 'int',
          isNullable: false,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rawTypeName, 'int');
      });

      test('nullable strips trailing ?', () {
        const field = FieldInfo(
          name: 'name',
          typeName: 'String?',
          isNullable: true,
          isRequired: false,
          isUpdate: false,
          collectionKind: CollectionKind.none,
        );
        expect(field.rawTypeName, 'String');
      });
    });
  });
}
