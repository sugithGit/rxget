import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';

// Example controllers
class CounterController extends RxController {
  final count = 0.obs;

  void increment() => count.value++;

  @override
  void onClose() {
    debugPrint('CounterController disposed');
    super.onClose();
  }
}

class UserController extends RxController {
  final name = 'Guest'.obs;

  void updateName(String newName) => name.value = newName;

  @override
  void onClose() {
    debugPrint('UserController disposed');
    super.onClose();
  }
}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'GetInWidget Example',
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GetInWidget Examples')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Example 1: Single dependency
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const SingleDependencyExample(),
                ),
              );
            },
            child: const Text('Single Dependency Example'),
          ),
          const SizedBox(height: 16),

          // Example 2: Multiple dependencies
          ElevatedButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const MultipleDependenciesExample(),
                ),
              );
            },
            child: const Text('Multiple Dependencies Example'),
          ),
        ],
      ),
    );
  }
}

// Example 1: Single Dependency
class SingleDependencyExample extends StatelessWidget {
  const SingleDependencyExample({super.key});

  @override
  Widget build(BuildContext context) {
    return GetInWidget(
      dependencies: [
        GetIn<CounterController>(CounterController()),
      ],
      child: Scaffold(
        appBar: AppBar(title: const Text('Single Dependency')),
        body: Builder(
          builder: (context) {
            // Access the controller
            final counter = Get.find<CounterController>();

            return Center(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Counter Value:',
                        style: TextStyle(fontSize: 18),
                      ),
                      const SizedBox(height: 16),
                      Obx(
                        () => Text(
                          '${counter.count.value}',
                          style: const TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: counter.increment,
                        child: const Text('Increment'),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Controller will be automatically disposed when you leave this screen',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

// Example 2: Multiple Dependencies
class MultipleDependenciesExample extends StatelessWidget {
  const MultipleDependenciesExample({super.key});

  @override
  Widget build(BuildContext context) {
    return GetInWidget(
      dependencies: [
        GetIn<CounterController>(CounterController()),
        GetIn<UserController>(UserController()),
      ],
      child: Scaffold(
        appBar: AppBar(title: const Text('Multiple Dependencies')),
        body: Builder(
          builder: (context) {
            // Access both controllers
            final counter = Get.find<CounterController>();
            final user = Get.find<UserController>();

            return Center(
              child: Card(
                margin: const EdgeInsets.all(16),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // User info
                      Obx(
                        () => Text(
                          'Hello, ${user.name.value}!',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Counter
                      const Text('Counter:', style: TextStyle(fontSize: 16)),
                      const SizedBox(height: 8),
                      Obx(
                        () => Text(
                          '${counter.count.value}',
                          style: const TextStyle(
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: counter.increment,
                        child: const Text('Increment'),
                      ),
                      const SizedBox(height: 24),

                      // Name input
                      TextField(
                        decoration: const InputDecoration(
                          labelText: 'Update Name',
                          border: OutlineInputBorder(),
                        ),
                        onSubmitted: user.updateName,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Both controllers will be automatically disposed when you leave this screen',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
