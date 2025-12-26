# hooks_rxget

A flutter_hooks integration for the `rxget` state management package.

This package provides custom hooks to easily use `rxget` dependencies within `flutter_hooks` widgets.

## Features

- `useGetIn<T>`: A hook to register and retrieve a `GetIn` dependency. It automatically handles registration (lazy or immediate) and disposal when the widget is unmounted.

## Getting started

Add dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  flutter_hooks: ^0.21.0
  rxget: ^0.0.1
  hooks_rxget: ^0.0.1
```

## Usage

### Using `useGetIn`

The `useGetIn` hook allows you to define a `GetIn` dependency configuration and use it within a `HookWidget` or `HookBuilder`.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_rxget/hooks_rxget.dart';
import 'package:rxget/rxget.dart';

// 1. Define your controller
class MyController {
  final count = 0.obs;
  void increment() => count.value++;
}

class MyWidget extends HookWidget {
  const MyWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // 2. Register the dependency using the hook
    // The dependency will be disposed when this widget is unmounted.
    final controller = useGetIn<MyController>(
      GetIn(() => MyController()),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('hooks_rxget example')),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
      body: Center(
        // Use Obx from rxget to listen to changes
        child: Obx(() => Text('Count: ${controller.count.value}')),
      ),
    );
  }
}
```

### Parameters

`useGetIn` accepts a `GetIn` object which configures the dependency:

- **builder**: A factory function that creates the dependency.
- **lazy**: (Optional) If `true` (default), the dependency is created only when first accessed. If `false`, it is created immediately.
- **tag**: (Optional) A string tag to distinguish multiple instances of the same type.

```dart
final controller = useGetIn(
  GetIn(
    () => MyController(),
    lazy: false,
    tag: 'unique_tag',
  ),
);
```
