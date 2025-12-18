export default function DependencyInjectionPage() {
  return (
    <>
      <h1>Dependency Management</h1>
      <p>
        rxget has a simple and powerful dependency manager that allows you to retrieve the same class as your Bloc or Controller with just 1 line of code.
      </p>

      <h2>Basic Usage</h2>
      
      <h3>Put</h3>
      <p>Inject a dependency so it is available globally (or scoped to the route if using a routing system, but rxget is route-agnostic mostly).</p>
      <pre><code className="language-dart">
{`Controller controller = Get.put(Controller());`}
      </code></pre>

      <h3>Find</h3>
      <p>Retrieve the dependency anywhere in your application.</p>
      <pre><code className="language-dart">
{`Controller controller = Get.find();`}
      </code></pre>

      <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 my-6 rounded-r-md">
        <p className="m-0 text-blue-500 dark:text-blue-400">
           <strong>Magic?</strong> No, just a Map. Get finds the instance you put earlier. You can rely on it to always deliver the right controller.
        </p>
      </div>

      <h2>Scoping</h2>
      <p>
        Since rxget removed route management, dependencies are often kept in memory unless manually disposed or used with the specialized <code>GetIn</code> widget.
      </p>
    </>
  );
}
