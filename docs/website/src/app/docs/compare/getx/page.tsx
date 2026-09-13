import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "rxget vs GetX — rxget",
  description:
    "A direct comparison of rxget and GetX: scope, constraints, the reactivity engine, and when GetX is still the better choice.",
};

export default function CompareGetXPage() {
  return (
    <>
      <h1>rxget vs GetX</h1>
      <p className="lead">
        rxget is a fork of GetX, so this is less a comparison of two libraries
        than an account of what was deliberately given up.
      </p>

      <p>
        For the full feature-by-feature inheritance table, see{" "}
        <a href="/docs/from-getx">Derived from GetX</a>. This page is about the
        choice.
      </p>

      <h2>Scope</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Concern</th>
              <th className="py-2 pr-4 font-semibold">GetX</th>
              <th className="py-2 font-semibold">rxget</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">State management</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Dependency injection</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">Yes, plus scoped GetIn</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Routing</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">No</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Dialogs, snackbars</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">No</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">HTTP client</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">No</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">i18n, theming</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">No</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Lints, codegen</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>The constraint difference</h2>
      <p>
        GetX lets you put a reactive variable anywhere and read{" "}
        <code>.value</code> from any widget. rxget does not. That is the
        substantive difference, and whether it is an improvement depends
        entirely on your situation.
      </p>

      <CodeBlock>{`// GetX — valid
class CounterController extends GetxController {
  var count = 0.obs;
}
Obx(() => Text('\${controller.count.value}'));

// rxget — the state class must be private, the Rx must be private
class _CounterState extends GetxState {
  final _count = 0.obs;
  int get count => _count.value;

  @override
  void onClose() => _count.close();
}
class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();
}
Obx(() => Text('\${controller.state.count}'));`}</CodeBlock>

      <p>
        rxget is more code for this example. The return is that{" "}
        <code>_count</code> has exactly one writer, exactly one owner, and a
        disposal path the compiler insists on.
      </p>

      <h2>The engine difference</h2>
      <p>
        The public API of <code>Obx</code> is identical, but the tracking
        underneath is not. In GetX, an <code>Obx</code> subscribes to every
        variable it has ever read and releases them only at unmount. rxget diffs
        each build&apos;s reads and releases what is no longer read.
      </p>

      <CodeBlock>{`Obx(() {
  if (!c.state.isExpanded) return const SizedBox.shrink();
  return Text(c.state.body);
})

// GetX  — once expanded, \`body\` is watched for the widget's lifetime
// rxget — collapsing releases \`body\`; writes to it stop costing anything`}</CodeBlock>

      <p>
        This matters most where a widget&apos;s reads vary — recycled list rows,
        conditional sections. See{" "}
        <a href="/docs/internals/memory">Memory Management</a>.
      </p>

      <h2>When GetX is the better choice</h2>
      <ul>
        <li>
          <strong>You use GetX routing.</strong> rxget has no replacement.
          Migrating means adopting <code>go_router</code> or{" "}
          <code>Navigator</code> as well, which is a separate project.
        </li>
        <li>
          <strong>You use GetConnect, translations or theming.</strong> Same —
          rxget deletes them rather than replacing them.
        </li>
        <li>
          <strong>Prototypes and small apps.</strong> GetX is genuinely faster
          to write when the app is small enough that ownership rules do not pay
          for themselves.
        </li>
        <li>
          <strong>You need context-free dialogs.</strong>{" "}
          <code>Get.snackbar</code> from a controller has no rxget equivalent —
          by design, since rxget wants UI concerns in the tree.
        </li>
        <li>
          <strong>The ecosystem.</strong> GetX has far more tutorials, packages
          and StackOverflow answers.
        </li>
      </ul>

      <h2>When rxget is the better choice</h2>
      <ul>
        <li>
          <strong>The app is large and the team is mixed.</strong> The
          architecture rules are worth their ceremony once more than one person
          writes controllers.
        </li>
        <li>
          <strong>You have leaked reactive variables.</strong> The lints and the
          mandatory <code>onClose()</code> attack that directly.
        </li>
        <li>
          <strong>You already use another router.</strong> Then GetX&apos;s
          routing is dead weight you still upgrade.
        </li>
        <li>
          <strong>Widgets rebind to different data.</strong> The dependency diff
          is a straight improvement.
        </li>
        <li>
          <strong>You want state management to be a library.</strong> rxget has
          no opinion about your app shell.
        </li>
      </ul>

      <Callout variant="note" title="Not a drop-in replacement">
        <p>
          Code using only <code>.obs</code>, <code>Obx</code> and{" "}
          <code>Get.find</code> moves across with small edits. Code using GetX
          routing, bindings or context-free UI does not.{" "}
          <a href="/docs/migration">Migrating from GetX</a> has the mechanical
          steps.
        </p>
      </Callout>

      <PageNav
        prev={{ title: "Performance Metrics", href: "/docs/performance" }}
        next={{ title: "vs Bloc", href: "/docs/compare/bloc" }}
      />
    </>
  );
}
