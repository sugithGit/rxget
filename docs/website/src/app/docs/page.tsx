export default function DocsIntroductionPage() {
  return (
    <>
      <h1>Introduction</h1>
      <p className="lead">
        rxget is a lightweight, performance-focused fork of GetX — keeping only reactivity and dependency injection.
      </p>
      
      <div className="bg-muted/50 border-l-4 border-primary p-4 my-6 rounded-r-md">
        <p className="m-0 font-medium text-foreground">
           No routing. No UI helpers. Just pure state management.
        </p>
      </div>

      <h2>What is rxget?</h2>
      <p>
        GetX is a powerful solution for Flutter, but as it grew, it became a "micro-framework" handling everything from routes to localization. 
        <strong>rxget</strong> returns to the roots: providing the two most powerful pillars of GetX without the bloat.
      </p>

      <h3>Core Pillars</h3>
      <ul>
        <li>
            <strong>Performance:</strong> Focused on minimum resource consumption. No Streams, no ChangeNotifier.
        </li>
        <li>
            <strong>Productivity:</strong> Easy and pleasant syntax. Save hours of development.
        </li>
        <li>
            <strong>Organization:</strong> Total decoupling of View, presentation logic, business logic, and dependency injection.
        </li>
      </ul>

      <h2>Why rxget?</h2>
      <p>
        1. <strong>Reliability through simplicity:</strong> Fewer dependencies mean fewer conflicts. Updates are painless.
      </p>
      <p>
        2. <strong>Flutter made simpler:</strong> Turn any variable reactive with <code>.obs</code> and use <code>Obx</code> to rebuild. No boilerplate.
      </p>
      <p>
        3. <strong>Performance without overhead:</strong> Efficient memory management with automatic disposal of unused dependencies.
      </p>
      <p>
        4. <strong>Clean decoupling:</strong> UI and Logic stay truly separate. No context gymnastics required.
      </p>

      <h2>Community</h2>
      <p>
        Since rxget is a fork of GetX, the core concepts are identical. You can often use GetX resources for learning State Management and Dependency Injection.
      </p>
    </>
  );
}
