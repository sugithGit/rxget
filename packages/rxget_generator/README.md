# rxget_generator

Code generator for the `rxget` state management package. Automatically produces safe, reactive `GetxState` classes from simple schema definitions.

## Setup

Add the following to your `pubspec.yaml`:

```yaml
dependencies:
  rxget: ^1.0.0
  rxget_annotation: ^0.0.2

dev_dependencies:
  build_runner: ^2.4.0
  rxget_generator: ^1.0.2
```

## Usage

Simply define your schema with the `@getxState` annotation and run the builder:

```bash
dart run build_runner build -d
```
(or `flutter pub run build_runner build -d` for Flutter projects)

## Example
```
@getxState
class CounterState {
  CounterState({
    this.count = 0,
    this.title = 'Counter',
  });

  int count;

  @update
  String title;
}
```