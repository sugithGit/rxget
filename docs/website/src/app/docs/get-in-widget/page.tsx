export default function GetInWidgetPage() {
  return (
    <>
      <h1>GetIn Widget</h1>
      <p>
        Since auto-disposal relied on routing in GetX, rxget introduces the <code>GetIn</code> widget to handle lifecycle management of dependencies scoped to the Widget Tree.
      </p>

      <h2>Why GetIn?</h2>
      <p>
        It solves the problem: <em>"When should I dispose my controller?"</em>. usage:
      </p>

      <h3>Single Dependency</h3>
      <pre><code className="language-dart">
{`GetIn(
  single: MyController(),
  child: MyWidget(),
)`}
      </code></pre>
      <p>
        When <code>GetIn</code> is removed from the widget tree, <code>MyController</code> is disposed.
      </p>

      <h3>Multiple Dependencies</h3>
      <pre><code className="language-dart">
{`GetIn(
  multiple: [
    UserController(),
    SettingsController(),
  ],
  child: MyWidget(),
)`}
      </code></pre>

      <h3>Single + Multiple</h3>
       <pre><code className="language-dart">
{`GetIn(
  single: MainController(),
  multiple: [HelperController(), UtilsController()],
  child: MyWidget(),
)`}
      </code></pre>

      <h2>Accessing Dependencies</h2>
      <p>
        Just use <code>Get.find&lt;Type&gt;()</code> in any child widget.
      </p>
    </>
  );
}
