## Unreleased

* Improved: the "used after close" error on a reactive variable now names the variable, the line it was declared on and the line that closed it, instead of only reporting `A RxInt was used after being disposed`. No new errors are thrown — only the existing ones say more.
* Added: `RxLifecycleDebug` to control that debug-only tracking — `captureStackTraces` (on by default in debug builds) and `stackFrameCount`.
* Added: `debugLabel` on reactive objects, for naming a variable in those error messages.

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
