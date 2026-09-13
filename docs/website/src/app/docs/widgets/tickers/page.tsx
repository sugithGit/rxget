import { CodeBlock } from "@/components/docs/CodeBlock";
import { Callout } from "@/components/docs/Callout";
import { PageNav } from "@/components/docs/PageNav";

export const metadata = {
  title: "Ticker Providers — rxget",
  description:
    "GetSingleTickerProviderStateMixin and GetTickerProviderStateMixin: driving AnimationControllers from a controller instead of a State.",
};

export default function TickersPage() {
  return (
    <>
      <h1>Ticker Providers</h1>
      <p className="lead">
        An <code>AnimationController</code> needs a <code>TickerProvider</code>,
        which normally comes from a <code>State</code>. These mixins let a rxget
        controller be that provider, so animation state lives with the rest of
        your state.
      </p>

      <h2>Single ticker</h2>
      <p>
        For a controller that drives exactly one{" "}
        <code>AnimationController</code>.
      </p>

      <CodeBlock>{`class FadeController extends GetxController<_FadeState>
    with GetSingleTickerProviderStateMixin {
  @override
  final state = _FadeState();

  late final AnimationController animation;

  @override
  void onInit() {
    super.onInit();
    animation = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  void show() => animation.forward();
  void hide() => animation.reverse();

  @override
  void onClose() {
    animation.dispose();
    super.onClose();
  }
}`}</CodeBlock>

      <CodeBlock title="in the view">{`FadeTransition(
  opacity: controller.animation,
  child: const ProfileCard(),
)`}</CodeBlock>

      <Callout variant="warning" title="One ticker only">
        <p>
          <code>GetSingleTickerProviderStateMixin</code> asserts if a second
          ticker is created. Use{" "}
          <code>GetTickerProviderStateMixin</code> for more than one.
        </p>
      </Callout>

      <h2>Multiple tickers</h2>

      <CodeBlock>{`class DashboardController extends GetxController<_DashboardState>
    with GetTickerProviderStateMixin {
  @override
  final state = _DashboardState();

  late final AnimationController slide;
  late final AnimationController pulse;

  @override
  void onInit() {
    super.onInit();
    slide = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    pulse = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void onClose() {
    slide.dispose();
    pulse.dispose();
    super.onClose();
  }
}`}</CodeBlock>

      <h2>You still dispose the AnimationController</h2>
      <p>
        The mixin provides the ticker and stops it when the controller closes,
        but the <code>AnimationController</code> itself is yours to dispose in{" "}
        <code>onClose()</code>.
      </p>

      <h2>Should animation live in a controller?</h2>
      <p>
        Often not. A purely visual animation — a button&apos;s press effect, a
        hover highlight — belongs in the widget&apos;s own{" "}
        <code>State</code> with the standard Flutter mixins. Nothing outside the
        widget needs it, so nothing outside the widget should own it.
      </p>

      <p>These mixins earn their place when the animation is driven by state:</p>

      <CodeBlock>{`class CartController extends GetxController<_CartState>
    with GetSingleTickerProviderStateMixin {
  @override
  final state = _CartState();

  late final AnimationController bounce;

  @override
  void onInit() {
    super.onInit();
    bounce = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    // The badge bounces whenever an item is added
    ever(state._itemCount, (_) => bounce.forward(from: 0));
  }

  @override
  void onClose() {
    bounce.dispose();
    super.onClose();
  }
}`}</CodeBlock>

      <p>
        Here the animation is a consequence of state, and putting it in the
        controller keeps the trigger next to the thing that triggers it.
      </p>

      <h2>TickerMode is respected</h2>
      <p>
        Both mixins honour Flutter&apos;s <code>TickerMode</code>, so animations
        driven from a controller stop when their subtree is muted — for example
        a screen pushed behind another route.
      </p>

      <PageNav
        prev={{ title: "GetIn Widget", href: "/docs/get-in-widget" }}
        next={{ title: "Code Generation", href: "/docs/codegen" }}
      />
    </>
  );
}
