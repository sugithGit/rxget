import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';

import 'counter_controller.dart';

void main() {
  runApp(const CounterApp());
}

class CounterApp extends StatelessWidget {
  const CounterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'rxget Generator Counter',
      theme: ThemeData(
        colorSchemeSeed: Colors.deepPurple,
        useMaterial3: true,
      ),
      home: const CounterPage(),
    );
  }
}

class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return GetInWidget(
      dependencies: [GetIn(() => CounterController())],
      child: Builder(
        builder: (context) {
          final controller = Get.find<CounterController>();
          return Scaffold(
            appBar: AppBar(
              title: Obx(() => Text(controller.state.title)),
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('You have pushed the button this many times:'),
                  Obx(
                    () => Text(
                      '${controller.state.count}',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        onPressed: controller.decrement,
                        icon: const Icon(Icons.remove),
                      ),
                      IconButton(
                        onPressed: controller.reset,
                        icon: const Icon(Icons.refresh),
                      ),
                      IconButton(
                        onPressed: controller.increment,
                        icon: const Icon(Icons.add),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            floatingActionButton: FloatingActionButton(
              onPressed: controller.increment,
              tooltip: 'Increment',
              child: const Icon(Icons.add),
            ),
          );
        },
      ),
    );
  }
}
