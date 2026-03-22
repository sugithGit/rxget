/// A callback that returns a boolean, typically used for conditional checks.
typedef Condition = bool Function();

/// A callback that receives data of type [T].
typedef OnData<T> = void Function(T data);

/// A simple void callback with no parameters.
typedef Callback = void Function();
