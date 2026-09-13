## Unreleased

* Improved: the "used after close" error on a reactive variable now names the variable, the line it was declared on and the line that closed it, instead of only reporting `A RxInt was used after being disposed`. No new errors are thrown — only the existing ones say more.
* Added: `RxLifecycleDebug` to control that debug-only tracking — `captureStackTraces` (on by default in debug builds) and `stackFrameCount`.
* Added: `debugLabel` on reactive objects, for naming a variable in those error messages.

### Performance and memory

* Fixed: an `Obx`, `Obl` or `GetX` now unsubscribes from reactive variables its latest build did not read. Previously a reactive widget kept every subscription it had ever made, holding a strong reference to each variable it had once touched — so a widget rebound to new data (a recycled list row, a branch behind a flag) leaked the old variables and rebuilt on changes it no longer displayed.
* Fixed: unmounting a reactive widget whose observed variable had already been closed threw `A RxInt was used after being closed`. Disposing a controller before its widget left the tree is normal, and no longer errors.
* Fixed: a build that throws inside a reactive widget no longer leaves the reactive scope open, which previously let reads from unrelated widgets attach themselves to the failed widget's scope.
* Improved: notifying a reactive variable with no listeners, or exactly one, no longer allocates a copy of the listener list. These are the two common cases; the multi-listener path still copies, because a listener may add or remove listeners while being notified.
* Improved: listener groups (`update([ids])`) allocate their map on first use instead of one `HashMap` per controller, and a `ListNotifier` captures one debug stack trace instead of two, rather than one per mixin.
* Improved: a burst of writes schedules one rebuild microtask instead of one per write, and a rebuild scheduled just before unmount no longer runs against a defunct element. This reduces scheduling churn; it does not change the number of rebuilds, since Flutter already coalesces `markNeedsBuild` on a dirty element.
* Improved: repeated reads of the same variable within one build are now a hash lookup rather than a scan of that variable's listener list.

  Measured throughput on these paths is unchanged within noise (Apple M4, debug JIT, 20 warmed rounds). The allocation and lifetime changes above are about memory and correctness; treat them as such rather than as a speed-up.

## 0.1.3

* Fixed: Added `_isRegistered` guard to `GetIn` to prevent accidental disposal of shared dependencies when navigating back and forth between pages.
* Added comprehensive unit tests for `GetIn` registration and deletion lifecycle (`get_in_registered_guard_test.dart`).

## 0.1.2

* Added comprehensive API documentation comments across all public APIs.
* Added counter app example project (`example/`) for pub.dev scoring.
* Introduced `GetxState` base class and `GetxController<T>` with typed state pattern.
* Updated `README.md` with rxget architecture overview and `GetInWidget` usage.
* Updated LICENSE copyright.

## 0.1.1

* Remove `flutter_web_plugins` and `web` dependencies from `pubspec.yaml`.
* Update library documentation and structure.

## [0.1.0+3]

* Initial release of rxget.
* Forked from GetX, focusing on state management and dependency injection.
* Removed routing and other non-core features.
