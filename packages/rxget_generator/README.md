# rxget_generator

Code generator for the `rxget` state management package. Automatically produces safe, reactive `GetxState` classes from simple schema definitions.

## Setup

Add the following to your `pubspec.yaml`:

```yaml
dependencies:
  rxget: ^0.1.3
  rxget_annotation: ^0.0.1

dev_dependencies:
  build_runner: ^2.4.0
  rxget_generator: ^0.0.1
```

## Usage

Simply define your schema with the `@getxState` annotation and run the builder:

```bash
dart run build_runner build -d
```
(or `flutter pub run build_runner build -d` for Flutter projects)
