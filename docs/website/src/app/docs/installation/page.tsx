export default function InstallationPage() {
  return (
    <>
      <h1>Installation</h1>
      <p>
        Add <code>rxget</code> to your <code>pubspec.yaml</code> file.
      </p>

      <h2>Using pub</h2>
      <pre><code className="language-yaml">
{`dependencies:
  rxget: ^1.0.0`}
      </code></pre>

      <h2>Import it</h2>
      <p>
        Now in your Dart code, you can use:
      </p>
      <pre><code className="language-dart">
{`import 'package:rxget/get.dart';`}
      </code></pre>
      
      <p>
        Note: You might still see references to <code>package:get</code> in older tutorials. For <strong>rxget</strong>, always use <code>package:rxget/get.dart</code>.
      </p>
    </>
  );
}
