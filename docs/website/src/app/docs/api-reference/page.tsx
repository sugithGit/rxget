import { PageNav } from "@/components/docs/PageNav";
import Link from "next/link";

export const metadata = {
  title: "API Reference — rxget",
  description:
    "Index of every public type exported by rxget, rxget_annotation, rxget_generator, rxget_lint and hooks_rxget.",
};

function Group({
  title,
  href,
  rows,
}: {
  title: string;
  href: string;
  rows: [string, string][];
}) {
  return (
    <section className="not-prose my-8">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <h3 className="m-0 text-base font-semibold text-foreground">{title}</h3>
        <Link href={href} className="text-xs text-primary hover:underline">
          Guide →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map(([name, desc]) => (
              <tr key={name} className="border-b border-border/50 align-top">
                <td className="w-1/3 py-1.5 pr-4 font-mono text-xs text-foreground">
                  {name}
                </td>
                <td className="py-1.5 text-xs text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ApiReferencePage() {
  return (
    <>
      <h1>API Reference</h1>
      <p className="lead">
        Every public type in the rxget packages, grouped by area. Each group
        links to the guide that covers it.
      </p>

      <Group
        title="Controllers and state"
        href="/docs/controllers"
        rows={[
          ["GetxState", "Abstract base for state objects. Declares onClose()."],
          [
            "GetxController<T>",
            "Main controller. Generic over a private GetxState.",
          ],
          ["RxController", "Lifecycle only, no listeners."],
          ["GetLifeCycleMixin", "onStart, onInit, onReady, onClose, onDelete."],
        ]}
      />

      <Group
        title="Reactive types"
        href="/docs/reactive-types"
        rows={[
          ["Rx<T> / Rxn<T>", "Generic reactive wrapper, nullable variant."],
          ["RxInt / RxnInt", "Reactive int."],
          ["RxDouble / RxnDouble", "Reactive double."],
          ["RxNum / RxnNum", "Reactive num."],
          ["RxString / RxnString", "Reactive String, implements Pattern."],
          ["RxBool / RxnBool", "Reactive bool, with toggle()."],
          ["RxList<E>", "Reactive List."],
          ["RxMap<K,V>", "Reactive Map."],
          ["RxSet<E>", "Reactive Set."],
          ["RxInterface<T>", "Contract implemented by every Rx."],
          ["GetListenable<T>", "Notifier holding a value and a lazy stream."],
          [".obs", "Extension on int, double, bool, String, List, Map, Set, Object."],
        ]}
      />

      <Group
        title="Widgets"
        href="/docs/widgets"
        rows={[
          ["Obx", "Rebuilds when any Rx read inside changes."],
          ["Obl", "Runs a side effect on change without rebuilding."],
          ["GetBuilder<T>", "Rebuilds on update()."],
          ["GetInWidget", "Registers dependencies for a subtree."],
          [
            "ObxStatelessWidget / OblStatelessWidget",
            "Base classes for the two reactive widgets.",
          ],
          ["Binder<T> / BindElement<T>", "The element GetBuilder is built on."],
        ]}
      />

      <Group
        title="Dependency injection"
        href="/docs/dependency-injection"
        rows={[
          ["Get", "The global container instance."],
          ["Get.put / putAsync", "Register eagerly."],
          ["Get.lazyPut", "Register a factory, built on first find."],
          ["Get.create", "A new instance on every find."],
          ["Get.spawn", "An independent instance."],
          ["Get.find", "Resolve by type and optional tag."],
          ["Get.delete / deleteAll / reset", "Remove registrations."],
          ["Get.replace / lazyReplace", "Swap an implementation."],
          ["Get.reload / reloadAll", "Dispose and rebuild."],
          ["Get.isRegistered / isPrepared", "Query the container."],
          ["Get.getInstanceInfo", "InstanceInfo for a registration."],
          ["SmartManagement", "full, onlyBuilder, keepFactory."],
          ["Get.asap / Get.toEnd", "Defer work past the current turn."],
        ]}
      />

      <Group
        title="Scoped injection"
        href="/docs/get-in-widget"
        rows={[
          ["GetIn<T>", "A scoped dependency: builder, lazy, tag."],
          ["GetInBase", "register() / dispose() contract."],
          ["GetInWidget", "Registers dependencies for a subtree."],
          ["useGetIn", "The flutter_hooks equivalent (hooks_rxget)."],
        ]}
      />

      <Group
        title="Workers"
        href="/docs/workers"
        rows={[
          ["ever", "Fires on every change."],
          ["everAll", "Fires when any of several change."],
          ["once", "Fires on the first change only."],
          ["debounce", "Fires after changes stop."],
          ["interval", "Fires at most once per window."],
          ["Worker", "Handle with dispose(); also callable."],
          ["Workers", "Disposes a group of workers."],
        ]}
      />

      <Group
        title="Async status"
        href="/docs/async-status"
        rows={[
          ["StateMixin<T>", "Adds a value plus a status to a notifier."],
          ["GetStatus<T>", "Base for the status union."],
          [
            "LoadingStatus / SuccessStatus / ErrorStatus / EmptyStatus / CustomStatus",
            "The five statuses.",
          ],
          ["futurize", "Runs a future and sets the status for you."],
          ["StatusDataExt", "isLoading, isSuccess, data, errorMessage, ..."],
        ]}
      />

      <Group
        title="Notifiers"
        href="/docs/internals/list-notifier"
        rows={[
          ["ListNotifier", "Single listeners plus id groups."],
          ["ListNotifierSingle / ListNotifierGroup", "One behaviour each."],
          [
            "ListNotifierSingleMixin",
            "addListener returning a Disposer, refresh, dispose.",
          ],
          ["ListNotifierGroupMixin", "addListenerId, refreshGroup, disposeId."],
          ["Notifier", "Singleton holding the current reactive scope."],
          ["NotifyData", "One reactive pass: updater, disposers, observed."],
          ["RxObserverScope", "Per-widget dependency tracking and diff."],
          ["ObxError", "Thrown when a reactive builder observes nothing."],
          ["Disposer / GetStateUpdate", "Callback typedefs."],
        ]}
      />

      <Group
        title="Debugging"
        href="/docs/internals/list-notifier"
        rows={[
          ["RxLifecycleDebug", "captureStackTraces, stackFrameCount."],
          ["debugLabel", "Names a variable in lifecycle errors."],
          ["listenersLength / isDisposed", "Inspect a reactive object."],
          ["Get.isLogEnable / Get.log", "Container logging."],
          ["LogWriterCallback", "Custom log sink."],
        ]}
      />

      <Group
        title="Code generation"
        href="/docs/codegen"
        rows={[
          ["@getxState", "Marks a schema class for generation."],
          ["@update", "Excludes a field from reactive wrapping."],
          ["GetxStateAnnotation / UpdateAnnotation", "The annotation classes."],
        ]}
      />

      <Group
        title="Lint rules"
        href="/docs/lint"
        rows={[
          ["getx_state_must_be_private", "State classes must start with _."],
          ["avoid_public_rx_declaration", "Rx fields must be private."],
          ["avoid_rx_outside_getx_state", "Rx belongs inside a GetxState."],
        ]}
      />

      <PageNav
        prev={{ title: "Breaking Changes", href: "/docs/breaking-changes" }}
        next={{ title: "FAQ", href: "/docs/faq" }}
      />
    </>
  );
}
