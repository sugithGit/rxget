export default function StateManagementPage() {
  return (
    <>
      <h1>State Management</h1>
      <p>
        rxget offers a powerful <strong>Reactive State Manager</strong> utilizing <code>.obs</code> and <code>Obx</code>.
      </p>

      <h2>Reactive State Manager</h2>
      <p>
        Reactive programming utilizes streams, but rxget hides the complexity. You don&apos;t need StreamControllers, StreamBuilders, or code generators.
      </p>
      
      <h3>How to use</h3>
      <ol>
        <li>
            <strong>Add .obs</strong> to any variable.
            <pre><code className="language-dart">{`var name = 'John'.obs;`}</code></pre>
        </li>
        <li>
            <strong>Use Obx</strong> in the UI.
            <pre><code className="language-dart">{`Obx(() => Text(controller.name.value));`}</code></pre>
        </li>
      </ol>

      <p>
        Currently, that&apos;s all you need to know to get started!
      </p>
    </>
  );
}
