import Link from "next/link";

export default function CommunityPage() {
  return (
    <>
      <h1>Community</h1>
      <p>
        rxget relies on the vibrant GetX community for general reactive patterns, but has its own repository for issues specific to this fork.
      </p>

      <h2>Channels</h2>
      <ul>
        <li>
            <Link href="https://github.com/rxget/rxget/issues" className="text-primary hover:underline">
                GitHub Issues
            </Link>
             - Best for bugs and feature requests.
        </li>
      </ul>

      <h2>How to contribute</h2>
      <p>
        We welcome contributions!
      </p>
      <ul>
        <li>Translating documentation</li>
        <li>Improving README</li>
        <li>Submitting PRs for code/tests</li>
      </ul>
    </>
  );
}
