export default function CounterAppPage() {
  return (
    <>
      <h1>Counter App Example</h1>
      <p>
        The default Flutter "counter" app created with <code>flutter create</code> often has over 100 lines of code. 
        With <strong>rxget</strong>, we can do it in about 26 lines, separating logic from view.
      </p>

      <h2>Step 1: Business Logic</h2>
      <p>
        Create your controller class. Place all variables and methods inside it. 
        Make any variable observable using <code>.obs</code>.
      </p>
      
      <pre><code className="language-dart">
{`class Controller extends GetxController {
  var count = 0.obs;
  increment() => count++;
}`}
      </code></pre>

      <h2>Step 2: The View</h2>
      <p>
        Use <code>StatelessWidget</code> to save RAM. You no longer need <code>StatefulWidget</code>.
      </p>

      <pre><code className="language-dart">
{`class Home extends StatelessWidget {

  @override
  Widget build(context) {

    // Initialize your controller
    final Controller c = Get.put(Controller());

    return Scaffold(
      // Use Obx(() => ...) to update Text() whenever count changes.
      appBar: AppBar(title: Obx(() => Text("Clicks: \${c.count}"))),

      // Replace 8 lines of Navigator.push with a simple Get.to() if using routing...
      // BUT WAIT! rxget doesn't have routing.
      // So stick to standard Navigator or GoRouter for navigation.
      body: Center(
        child: ElevatedButton(
            child: Text("Go to Other"), 
            onPressed: () => Navigator.push(
                context, 
                MaterialPageRoute(builder: (context) => Other())
            )
        )
      ),
      floatingActionButton:
          FloatingActionButton(child: Icon(Icons.add), onPressed: c.increment));
  }
}

class Other extends StatelessWidget {
  // Find the controller that was initialized in another page
  final Controller c = Get.find();

  @override
  Widget build(context){
     // Access the updated count variable
     return Scaffold(body: Center(child: Text("\${c.count}")));
  }
}`}
      </code></pre>

      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 my-6 rounded-r-md">
        <p className="m-0 font-medium text-yellow-500 dark:text-yellow-400">
           Note on Routing: The original GetX example uses <code>Get.to()</code>. Since <strong>rxget</strong> removes routing, you use standard Flutter navigation (Navigator 1.0 or 2.0) as shown above. This keeps your architecture clean and standard.
        </p>
      </div>

      <p>
        This simple project demonstrates the power of <strong>rxget</strong>. separating logic (Controller) from UI (View) cleanly.
      </p>
    </>
  );
}
