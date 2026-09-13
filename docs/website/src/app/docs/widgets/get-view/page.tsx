import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "GetView & GetWidget — rxget",
  description:
    "GetView removes Get.find boilerplate from a screen. GetWidget caches a controller per widget instance for repeated components.",
};

export default function GetViewPage() {
  return (
    <>
      <h1>GetView &amp; GetWidget</h1>
      <p className="lead">
        Two base classes that give a widget a typed <code>controller</code>{" "}
        getter. <code>GetView</code> shares one instance;{" "}
        <code>GetWidget</code> caches one per widget.
      </p>

      <h2>GetView</h2>
      <p>
        A <code>StatelessWidget</code> whose <code>controller</code> getter
        resolves <code>T</code> from the container.
      </p>

      <CodeBlock>{`class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Obx(() => Text(controller.state.name)),
      ),
      body: Obx(() => ProfileBody(user: controller.state.user)),
    );
  }
}`}</CodeBlock>

      <p>Which replaces:</p>

      <CodeBlock>{`class ProfileView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final controller = Get.find<ProfileController>();   // every build
    ...
  }
}`}</CodeBlock>

      <Callout variant="warning" title="The controller must already be registered">
        <p>
          <code>GetView</code> only resolves — it never creates. Register the
          controller above it in the tree, usually with{" "}
          <a href="/docs/get-in-widget">GetInWidget</a>.
        </p>
      </Callout>

      <CodeBlock title="the usual pairing">{`GetInWidget(
  dependencies: [GetIn<ProfileController>(() => ProfileController())],
  child: const ProfileView(),
)`}</CodeBlock>

      <h3>Tagged instances</h3>

      <CodeBlock>{`class InboxView extends GetView<ListController> {
  const InboxView({super.key});

  @override
  String? get tag => 'inbox';

  @override
  Widget build(BuildContext context) =>
      Obx(() => MessageList(items: controller.state.items));
}`}</CodeBlock>

      <h2>GetWidget</h2>
      <p>
        Where <code>GetView</code> shares one controller across every instance,{" "}
        <code>GetWidget</code> caches a controller <em>per widget instance</em>.
        Pair it with <code>Get.create</code>, which builds a fresh instance on
        every resolution.
      </p>

      <CodeBlock>{`// register a factory, not a singleton
Get.create<RowController>(() => RowController());

class RowCard extends GetWidget<RowController> {
  const RowCard({required this.item, super.key});

  final Item item;

  @override
  Widget build(BuildContext context) {
    return Obx(() => Card(
      color: controller.state.isSelected ? Colors.teal : null,
      child: ListTile(
        title: Text(item.title),
        onTap: controller.toggle,
      ),
    ));
  }
}`}</CodeBlock>

      <p>
        Every <code>RowCard</code> in a list gets its own{" "}
        <code>RowController</code>, with its own <code>onInit</code> and{" "}
        <code>onClose</code>. The cache is an <code>Expando</code> keyed on the
        widget, so the controller is released when the widget is collected.
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold" />
              <th className="py-2 pr-4 font-semibold">GetView</th>
              <th className="py-2 font-semibold">GetWidget</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Controller instances</td>
              <td className="py-2 pr-4">One, shared</td>
              <td className="py-2">One per widget</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 text-foreground">Register with</td>
              <td className="py-2 pr-4 font-mono text-xs">put / lazyPut</td>
              <td className="py-2 font-mono text-xs">create</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Typical use</td>
              <td className="py-2 pr-4">A screen</td>
              <td className="py-2">A repeated component</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="tip" title="Reach for GetView first">
        <p>
          <code>GetWidget</code> exists for a narrow case — many instances of
          one component, each with independent state. For that case, a{" "}
          <code>GetX</code> with <code>global: false</code> is often simpler and
          keeps the controller visibly local to the widget.
        </p>
      </Callout>

      <h2>GetView with GetBuilder</h2>
      <p>
        <code>GetView</code> only supplies the controller; it says nothing about
        how you rebuild. Both work:
      </p>

      <CodeBlock>{`class SettingsView extends GetView<SettingsController> {
  const SettingsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // reactive
      Obx(() => Switch(
        value: controller.state.darkMode,
        onChanged: controller.setDarkMode,
      )),
      // manual
      GetBuilder<SettingsController>(
        id: 'account',
        builder: (c) => AccountTile(email: c.state.email),
      ),
    ]);
  }
}`}</CodeBlock>

      <PageNav
        prev={{ title: "GetX Widget", href: "/docs/widgets/getx" }}
        next={{
          title: "ValueBuilder & MixinBuilder",
          href: "/docs/widgets/value-builder",
        }}
      />
    </>
  );
}
