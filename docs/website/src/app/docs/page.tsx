import { CodeBlock } from "@/components/docs/CodeBlock";
import { PageNav } from "@/components/docs/PageNav";
import Link from "next/link";

export const metadata = {
  title: "Introduction — rxget",
  description:
    "rxget is a fork of GetX that keeps reactivity and dependency injection, drops everything else, and adds the constraints that make state ownership explicit.",
};

export default function DocsIntroductionPage() {
  return (
    <>
      <h1>Introduction</h1>
      <p className="lead">
        rxget is a fork of GetX that keeps two things — reactive state and
        dependency injection — and drops the rest. It is a library, not a
        framework.
      </p>

      <div className="not-prose my-6 rounded-r-md border-l-4 border-primary bg-primary/5 px-4 py-3">
        <p className="m-0 text-sm font-medium text-foreground">
          No routing. No dialogs. No HTTP client. No localization. Just state
          and injection.
        </p>
      </div>

      <h2>What it looks like</h2>

      <CodeBlock title="counter_controller.dart">{`class _CounterState extends GetxState {
  final _count = 0.obs;

  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}`}</CodeBlock>

      <CodeBlock title="counter_view.dart">{`Obx(() => Text('\${controller.state.count}'))`}</CodeBlock>

      <p>
        No <code>StreamBuilder</code>, no <code>setState</code>, no manual
        subscription. Reading <code>state.count</code> inside the{" "}
        <code>Obx</code> is what registers the dependency, and only that{" "}
        <code>Text</code> rebuilds when the count changes.
      </p>

      <h2>A whole working app</h2>
      <p>
        State, controller, injection and view — nothing omitted, and no
        provider, consumer, builder or <code>BuildContext</code> anywhere.
      </p>

      <CodeBlock title="main.dart">{`import 'package:flutter/material.dart';
import 'package:rxget/rxget.dart';

class _CounterState extends GetxState {
  final _count = 0.obs;

  int get count => _count.value;

  @override
  void onClose() => _count.close();
}

class CounterController extends GetxController<_CounterState> {
  @override
  final state = _CounterState();

  void increment() => state._count.value++;
}

void main() => runApp(MaterialApp(
      home: GetInWidget(
        dependencies: [GetIn<CounterController>(() => CounterController())],
        child: const CounterView(),
      ),
    ));

class CounterView extends GetView<CounterController> {
  const CounterView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Center(child: Obx(() => Text('\${controller.state.count}'))),
        floatingActionButton: FloatingActionButton(
          onPressed: controller.increment,
          child: const Icon(Icons.add),
        ),
      );
}`}</CodeBlock>

      <p>
        <code>Get.find</code> needs no context, so if you would rather skip{" "}
        <code>GetView</code> the whole view collapses to one line:
      </p>

      <CodeBlock>{`child: Obx(() => Text('\${Get.find<CounterController>().state.count}')),`}</CodeBlock>

      <h2>Why it exists</h2>
      <p>
        GetX is quick to start with and hard to audit at scale. A reactive
        variable can be declared anywhere, written from anywhere, and nothing
        says who is responsible for closing it. In a small app that is freedom;
        in a fifty-screen app it is a category of bug that does not show up as
        an error.
      </p>
      <p>rxget makes three changes to that, and accepts more ceremony for them:</p>

      <div className="not-prose my-6 space-y-3">
        {[
          {
            t: "State is owned",
            d: "Reactive variables live inside a private GetxState, owned by one controller. The controller is the only writer.",
          },
          {
            t: "Disposal is structural",
            d: "GetxState.onClose() is abstract, and the controller calls it for you. A state class that disposes nothing is a deliberate statement, not an oversight.",
          },
          {
            t: "Rules are enforced by tooling",
            d: "An assertion, three lint rules and a code generator, rather than a paragraph in a style guide.",
          },
        ].map((x) => (
          <div key={x.t} className="rounded-lg border border-border p-4">
            <p className="m-0 text-sm font-semibold text-foreground">{x.t}</p>
            <p className="m-0 mt-1 text-sm text-muted-foreground">{x.d}</p>
          </div>
        ))}
      </div>

  

      <h2>What you get</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">
                Reactive state
              </td>
              <td className="py-2">
                <code>.obs</code>, <code>Obx</code>, and per-variable rebuilds.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">
                Manual state
              </td>
              <td className="py-2">
                <code>update()</code> and <code>GetBuilder</code>, with
                id-scoped rebuilds.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">
                Dependency injection
              </td>
              <td className="py-2">
                A context-free container, plus <code>GetIn</code> for
                subtree-scoped lifetimes.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Effects</td>
              <td className="py-2">
                Workers, and <code>Obl</code> for effects that need the tree.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Tooling</td>
              <td className="py-2">
                A code generator and an analyzer plugin.
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">
                Memory behaviour
              </td>
              <td className="py-2">
                Dependencies are diffed each build and released when no longer
                read.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Where to go next</h2>

      <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
        {[
          ["Installation", "/docs/installation", "Add it to a project."],
          ["Counter App", "/docs/counter-app", "The whole library in one app."],
          [
            "Design Principles",
            "/docs/philosophy",
            "Why the constraints exist.",
          ],
          [
            "Derived from GetX",
            "/docs/from-getx",
            "What was kept, dropped and changed.",
          ],
          [
            "Architecture Rules",
            "/docs/architecture-rules",
            "The six rules and what enforces them.",
          ],
          [
            "Migrating from GetX",
            "/docs/migration",
            "Step-by-step, with the hard parts marked.",
          ],
        ].map(([title, href, desc]) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <p className="m-0 text-sm font-semibold text-primary">{title}</p>
            <p className="m-0 mt-1 text-xs text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>

      <PageNav next={{ title: "Installation", href: "/docs/installation" }} />
    </>
  );
}
