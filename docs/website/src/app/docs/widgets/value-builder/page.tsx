import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "ValueBuilder & MixinBuilder — rxget",
  description:
    "ValueBuilder for local state without a controller, and MixinBuilder for a section driven by both update() and .obs.",
};

export default function ValueBuilderPage() {
  return (
    <>
      <h1>ValueBuilder &amp; MixinBuilder</h1>
      <p className="lead">
        Two smaller widgets: one for local state that never leaves the widget,
        one for a section that needs both rebuild mechanisms at once.
      </p>

      <h2>ValueBuilder</h2>
      <p>
        Local state with no <code>Rx</code> and no controller — a{" "}
        <code>StatefulWidget</code> and a <code>setState</code>, packaged as a
        builder.
      </p>

      <CodeBlock>{`ValueBuilder<bool>(
  initialValue: false,
  builder: (value, update) => Switch(
    value: value,
    onChanged: update,
  ),
  onUpdate: (value) => debugPrint('now \$value'),
  onDispose: () => debugPrint('gone'),
)`}</CodeBlock>

      <p>
        The builder gets the current value and a setter. Calling the setter
        rebuilds just this widget.
      </p>

      <h3>When to use it</h3>
      <p>
        State that is genuinely local and disappears with the widget — a
        checkbox in a dialog, an expanded flag on a card, a form field the rest
        of the app never sees.
      </p>

      <CodeBlock>{`showDialog(
  context: context,
  builder: (_) => ValueBuilder<bool>(
    initialValue: false,
    builder: (accepted, update) => AlertDialog(
      content: CheckboxListTile(
        value: accepted,
        onChanged: (v) => update(v ?? false),
        title: const Text('I accept the terms'),
      ),
      actions: [
        TextButton(
          onPressed: accepted ? () => Navigator.pop(context, true) : null,
          child: const Text('Continue'),
        ),
      ],
    ),
  ),
);`}</CodeBlock>

      <Callout variant="note" title="It disposes what it holds">
        <p>
          If the value is a <code>ChangeNotifier</code> or a{" "}
          <code>StreamController</code>, <code>ValueBuilder</code> disposes or
          closes it automatically when the widget is removed.
        </p>
      </Callout>

      <h3>ValueBuilder or ObxValue?</h3>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">ValueBuilder</th>
              <th className="py-2 font-semibold">ObxValue</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Backed by</td>
              <td className="py-2 pr-4">setState</td>
              <td className="py-2">An Rx you supply</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Owns the lifetime</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">No — you must close it</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">
                Value readable elsewhere
              </td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2">Yes, it is an Rx</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Prefer <code>ValueBuilder</code> when the state is private to the
        widget — it cannot leak, because it has nothing to leak.
      </p>

      <h2>MixinBuilder</h2>
      <p>
        A <code>GetBuilder</code> with an <code>Obx</code> inside it, so the
        subtree rebuilds on <code>update()</code> <em>and</em> on any{" "}
        <code>.obs</code> change read inside.
      </p>

      <CodeBlock>{`MixinBuilder<ProductController>(
  init: ProductController(),
  id: 'details',
  builder: (controller) => Column(children: [
    // rebuilds on update(['details'])
    Text(controller.state.description),
    // also rebuilds when this reactive value changes
    Text('\${controller.state.stockCount} in stock'),
  ]),
)`}</CodeBlock>

      <p>
        It takes the same parameters as <code>GetBuilder</code> —{" "}
        <code>init</code>, <code>global</code>, <code>autoRemove</code>,{" "}
        <code>id</code>, and the lifecycle callbacks.
      </p>

      <Callout variant="warning" title="Usually a sign to split the widget">
        <p>
          Needing both mechanisms in one subtree often means the subtree is
          doing two jobs. Two adjacent widgets — a <code>GetBuilder</code> and
          an <code>Obx</code> — rebuild less and read more clearly.{" "}
          <code>MixinBuilder</code> is worth it when the two really are one
          visual unit.
        </p>
      </Callout>

      <CodeBlock title="the usual alternative">{`Column(children: [
  GetBuilder<ProductController>(
    id: 'details',
    builder: (c) => Text(c.state.description),
  ),
  Obx(() => Text('\${controller.state.stockCount} in stock')),
])`}</CodeBlock>

      <PageNav
        prev={{ title: "GetView & GetWidget", href: "/docs/widgets/get-view" }}
        next={{ title: "GetIn Widget", href: "/docs/get-in-widget" }}
      />
    </>
  );
}
