# RxGet

[![Pub Version](https://img.shields.io/pub/v/rxget?label=pub&color=blue)](https://pub.dev/packages/rxget)
[![GitHub Stars](https://img.shields.io/github/stars/sugithGit/rxget?style=social)](https://github.com/sugithGit/rxget)
[![License: MIT](https://img.shields.io/badge/license-MIT-purple.svg)](https://opensource.org/licenses/MIT)

**A lightweight, performance-focused fork of GetX — keeping only reactivity and dependency injection.**  
No routing, no UI helpers — just pure state management.

---

## 🚀 Features

- **Reactive State Management**: Simple and powerful state management with `.obs` and `Obx`.
- **Dependency Injection**: Smart dependency management with `Get.put`, `Get.find`, and `Get.lazyPut`.
- **Widget-Scoped DI**: Exclusive `GetIn` widget for scoped dependency injection with automatic disposal.
- **Zero Bloat**: No routing, no snackbars, no unnecessary utils. Only what you need.
- **High Performance**: Optimized for speed and minimal resource consumption.

## 📦 Installation

Add `rxget` to your `pubspec.yaml`:

```yaml
dependencies:
  rxget: 
```

Or install it via terminal:

```bash
flutter pub add rxget
```

## ⚡️ Usage

### Reactive State Management

RxGet makes reactivity simple. No streams, no boilerplate.

```dart
import 'package:rxget/rxget.dart';

class Controller extends GetxController {
  // Make any variable observable with .obs
  var count = 0.obs;
  
  void increment() => count++;
}

class Home extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Initialize the controller
    final controller = Get.put(Controller());

    return Scaffold(
      body: Center(
        // Obx listens to changes in observable variables
        child: Obx(() => Text("Clicks: ${controller.count}")),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: Icon(Icons.add),
      ),
    );
  }
}
```

### Dependency Injection

Manage your dependencies seamlessly without context.

```dart
// Register a dependency
Get.put(AuthService());

// Retrieve it anywhere
final authService = Get.find<AuthService>();
```

### Scoped Injection with `GetIn`

RxGet introduces `GetIn` for widget-scoped dependency lifecycle management. Dependencies are automatically disposed when the widget is removed from the tree.

```dart
GetIn(
  // Single dependency
  single: ProfileController(),
  // Or multiple
  multiple: [
    ThemeController(),
    SettingsController(),
  ],
  child: ProfileView(),
)
```

## ❓ Why RxGet?

RxGet was created to provide the legendary productivity of GetX's state management and dependency injection without the architectural intrusion of its routing and UI helpers.

| Feature              | GetX | RxGet |
| :------------------- | :--: | :--: |
| Data Binding         |  ✅  |  ✅  |
| Dependency Injection |  ✅  |  ✅  |
| Routing              |  ✅  |  ❌  |
| Snackbars/Dialogs    |  ✅  |  ❌  |
| Utils                |  ✅  |  ❌  |

## 🤝 Contributing

Contributions are welcome! If you find a bug or want to suggest a feature, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
