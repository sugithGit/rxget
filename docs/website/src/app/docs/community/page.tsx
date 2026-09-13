import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Community — rxget",
  description: "Where to report bugs, ask questions and contribute to rxget.",
};

const REPO = "https://github.com/sugithGit/rxget";

export default function CommunityPage() {
  return (
    <>
      <h1>Community</h1>
      <p className="lead">
        rxget is maintained at{" "}
        <Link href={REPO} className="text-primary hover:underline">
          github.com/sugithGit/rxget
        </Link>
        .
      </p>

      <h2>Where to go</h2>

      <div className="not-prose my-6 space-y-2">
        {[
          {
            t: "Bugs and feature requests",
            h: `${REPO}/issues`,
            d: "Include the rxget version, a minimal reproduction, and the full error.",
          },
          {
            t: "Pull requests",
            h: `${REPO}/pulls`,
            d: "Tests are expected for anything touching the reactivity engine.",
          },
          {
            t: "Package on pub.dev",
            h: "https://pub.dev/packages/rxget",
            d: "Versions, changelog and API docs.",
          },
        ].map((x) => (
          <Link
            key={x.h}
            href={x.h}
            className="block rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <p className="m-0 text-sm font-semibold text-primary">{x.t}</p>
            <p className="m-0 mt-1 text-xs text-muted-foreground">{x.d}</p>
          </Link>
        ))}
      </div>

      <h2>The packages</h2>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-semibold">Package</th>
              <th className="py-2 font-semibold">What it is</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground text-xs">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-foreground">rxget</td>
              <td className="py-2">State management and dependency injection.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-foreground">
                rxget_annotation
              </td>
              <td className="py-2">
                <code>@getxState</code> and <code>@update</code>.
              </td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-foreground">
                rxget_generator
              </td>
              <td className="py-2">build_runner generator for state classes.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-foreground">rxget_lint</td>
              <td className="py-2">Analyzer plugin with the architecture rules.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono text-foreground">hooks_rxget</td>
              <td className="py-2">flutter_hooks bridge.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Working on rxget locally</h2>

      <CodeBlock language="bash">{`git clone https://github.com/sugithGit/rxget.git
cd rxget/packages/rxget

flutter pub get
flutter test
dart analyze`}</CodeBlock>

      <p>The repository layout:</p>

      <CodeBlock language="text">{`packages/
  rxget/              core library
  rxget_annotation/   annotations
  rxget_generator/    build_runner generator
  rxget_lint/         analyzer plugin
  hooks_rxget/        flutter_hooks bridge
examples/
  counter_example/    the app from the Counter App guide
docs/website/         this site`}</CodeBlock>

      <h2>Filing a good bug report</h2>
      <ul>
        <li>The rxget and Flutter versions.</li>
        <li>
          A minimal reproduction — ideally a failing{" "}
          <code>testWidgets</code>.
        </li>
        <li>The full error and stack trace.</li>
        <li>
          For a suspected leak, the <code>listenersLength</code> you observed
          and the one you expected.
        </li>
      </ul>

      <h2>GetX resources</h2>
      <p>
        Because rxget is a fork, GetX material on <code>.obs</code>,{" "}
        <code>Obx</code>, workers and DI mostly transfers. What does not
        transfer is anything about routing, bindings or context-free UI, and any
        controller written without a typed <code>GetxState</code> — see{" "}
        <Link href="/docs/from-getx" className="text-primary hover:underline">
          Derived from GetX
        </Link>
        .
      </p>

      <PageNav prev={{ title: "FAQ", href: "/docs/faq" }} />
    </>
  );
}
