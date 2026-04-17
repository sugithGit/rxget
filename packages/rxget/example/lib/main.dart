import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';

import 'controller/counter_controller.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'rxget Counter Example',
      // 2. Inject the controller into memory
      home: GetInWidget(
        dependencies: [GetIn(() => CounterController())],
        child: const Home(),
      ),
    );
  }
}

class Home extends StatelessWidget {
  const Home({super.key});

  @override
  Widget build(BuildContext context) {
    // 3. Find the existing controller in memory
    final controller = Get.find<CounterController>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('rxget Counter App'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('You have pushed the button this many times:'),
            // 4. Wrap the reactive part with Obx to automatically rebuild when count changes
            Obx(() {
              return Text(
                '${controller.state.count}',
                style: Theme.of(context).textTheme.headlineMedium,
              );
            }),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Navigate to another screen
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (context) => const OtherScreen()),
                );
              },
              child: const Text("Go to Other Screen"),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class OtherScreen extends StatelessWidget {
  const OtherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Find the existing controller in memory
    final controller = Get.find<CounterController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Other Screen"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('The count from the previous screen is:'),
            Obx(
              () => Text(
                '${controller.state.count}',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
