/// The kind of collection a field represents.
enum CollectionKind {
  /// Not a collection — a scalar type.
  none,

  /// `List<T>` → generates `RxList<T>`.
  list,

  /// `Map<K, V>` → generates `RxMap<K, V>`.
  map,

  /// `Set<T>` → generates `RxSet<T>`.
  set,
}

/// Parsed metadata for a single field in a `@getxState` schema class.
class FieldInfo {
  /// Creates a [FieldInfo].
  const FieldInfo({
    required this.name,
    required this.typeName,
    required this.isNullable,
    required this.isRequired,
    required this.isUpdate,
    required this.collectionKind,
    this.defaultValueCode,
    this.typeArguments = const [],
  });

  /// The field name as declared by the user (e.g. `selectedDate`).
  final String name;

  /// The full type name as a string (e.g. `DateTime`, `List<String>`).
  final String typeName;

  /// The raw type without nullability (e.g. `DateTime` for `DateTime?`).
  String get rawTypeName {
    if (isNullable && typeName.endsWith('?')) {
      return typeName.substring(0, typeName.length - 1);
    }
    return typeName;
  }

  /// Whether the type is nullable (e.g. `String?`).
  final bool isNullable;

  /// Whether the constructor parameter is `required`.
  final bool isRequired;

  /// Whether the field is annotated with `@update` (non-reactive).
  final bool isUpdate;

  /// The kind of collection, if any.
  final CollectionKind collectionKind;

  /// The source code for the default value, if any (e.g. `0`, `false`, `''`).
  final String? defaultValueCode;

  /// Type arguments for generics (e.g. `['String']` for `List<String>`,
  /// `['String', 'int']` for `Map<String, int>`).
  final List<String> typeArguments;

  /// Returns the Rx wrapper type for this field.
  ///
  /// - `@update` fields return the raw type (no wrapper).
  /// - Nullable fields use `Rxn<T>`.
  /// - Collections use `RxList<T>`, `RxMap<K,V>`, `RxSet<T>`.
  /// - Everything else uses `Rx<T>`.
  String get rxTypeName {
    if (isUpdate) return typeName;

    switch (collectionKind) {
      case CollectionKind.list:
        final elementType =
            typeArguments.isNotEmpty ? typeArguments.first : 'dynamic';
        return isNullable ? 'Rxn<List<$elementType>>' : 'RxList<$elementType>';
      case CollectionKind.map:
        final keyType =
            typeArguments.isNotEmpty ? typeArguments[0] : 'dynamic';
        final valueType =
            typeArguments.length > 1 ? typeArguments[1] : 'dynamic';
        return isNullable
            ? 'Rxn<Map<$keyType, $valueType>>'
            : 'RxMap<$keyType, $valueType>';
      case CollectionKind.set:
        final elementType =
            typeArguments.isNotEmpty ? typeArguments.first : 'dynamic';
        return isNullable ? 'Rxn<Set<$elementType>>' : 'RxSet<$elementType>';
      case CollectionKind.none:
        if (isNullable) return 'Rxn<$rawTypeName>';
        return 'Rx<$typeName>';
    }
  }

  /// Returns the Rx constructor expression for the initializer list.
  ///
  /// For example: `Rx<DateTime>(selectedDate)` or `RxList<String>(workoutLogs)`.
  String rxInitializer(String paramName) {
    if (isUpdate) return paramName;

    switch (collectionKind) {
      case CollectionKind.list:
        final elementType =
            typeArguments.isNotEmpty ? typeArguments.first : 'dynamic';
        if (isNullable) return 'Rxn<List<$elementType>>($paramName)';
        return 'RxList<$elementType>($paramName)';
      case CollectionKind.map:
        final keyType =
            typeArguments.isNotEmpty ? typeArguments[0] : 'dynamic';
        final valueType =
            typeArguments.length > 1 ? typeArguments[1] : 'dynamic';
        if (isNullable) {
          return 'Rxn<Map<$keyType, $valueType>>($paramName)';
        }
        return 'RxMap<$keyType, $valueType>($paramName)';
      case CollectionKind.set:
        final elementType =
            typeArguments.isNotEmpty ? typeArguments.first : 'dynamic';
        if (isNullable) return 'Rxn<Set<$elementType>>($paramName)';
        return 'RxSet<$elementType>($paramName)';
      case CollectionKind.none:
        if (isNullable) return 'Rxn<$rawTypeName>($paramName)';
        return 'Rx<$typeName>($paramName)';
    }
  }

  /// Whether this field needs `.close()` in `onClose()`.
  bool get needsClose => !isUpdate;
}
