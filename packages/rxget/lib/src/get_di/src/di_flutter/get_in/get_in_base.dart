/// A class to define a dependency injection configuration.
///
/// [T] is the type of the dependency.
/// A contract for managing the lifecycle of a dependency injection binding.
///
/// Implementers of this interface are responsible for registering and disposing
/// of dependencies within the `GetX` ecosystem.
abstract interface class GetInBase {
  /// Registers the dependency into the `GetX` dependency injection system.
  void register();

  /// Removes the dependency from the `GetX` dependency injection system.
  void dispose();
}
