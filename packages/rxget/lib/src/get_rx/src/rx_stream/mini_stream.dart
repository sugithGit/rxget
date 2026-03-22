part of 'rx_stream.dart';

/// A doubly-linked list node used internally by [FastList].
class Node<T> {
  /// Creates a [Node] with optional [data], [next], and [prev] pointers.
  Node({this.data, this.next, this.prev});

  /// The data stored in this node.
  T? data;

  /// Pointer to the next node in the list.
  Node<T>? next;

  /// Pointer to the previous node in the list.
  Node<T>? prev;
}

/// A lightweight subscription returned when listening to a [MiniStream].
///
/// Call [cancel] to unsubscribe from the stream.
class MiniSubscription<T> {
  /// Creates a [MiniSubscription] with the given callbacks.
  const MiniSubscription(
    this.data,
    this.onError,
    this.onDone,
    this.cancelOnError,
    this.listener,
  );

  /// Callback invoked when new data is emitted.
  final OnData<T> data;

  /// Callback invoked when an error occurs.
  final Function? onError;

  /// Callback invoked when the stream is done.
  final Callback? onDone;

  /// Whether to automatically cancel the subscription on error.
  final bool cancelOnError;

  /// Cancels this subscription.
  Future<void> cancel() async => listener.removeListener(this);

  /// Reference to the parent listener list.
  final FastList<T> listener;
}

/// A lightweight stream implementation used internally by GetX's reactive system.
///
/// Provides a simple pub/sub mechanism without the overhead of Dart's
/// built-in [Stream] class.
class MiniStream<T> {
  /// The underlying listener list.
  FastList<T> listenable = FastList<T>();

  late T _value;

  /// The current value held by this stream.
  T get value => _value;

  /// Sets a new [val] and notifies all listeners.
  set value(T val) {
    add(val);
  }

  /// Emits an [event] to all listeners.
  void add(T event) {
    _value = event;
    listenable._notifyData(event);
  }

  /// Emits an error to all listeners.
  void addError(Object error, [StackTrace? stackTrace]) {
    listenable._notifyError(error, stackTrace);
  }

  /// The number of active listeners.
  int get length => listenable.length;

  /// Whether there are any active listeners.
  bool get hasListeners => listenable.isNotEmpty;

  /// Whether this stream has been closed.
  bool get isClosed => _isClosed;

  /// Subscribes to this stream with an [onData] callback.
  ///
  /// Returns a [MiniSubscription] that can be used to cancel the subscription.
  MiniSubscription<T> listen(
    void Function(T event) onData, {
    Function? onError,
    void Function()? onDone,
    bool cancelOnError = false,
  }) {
    final subs = MiniSubscription<T>(
      onData,
      onError,
      onDone,
      cancelOnError,
      listenable,
    );
    listenable.addListener(subs);
    return subs;
  }

  bool _isClosed = false;

  /// Closes this stream and notifies all listeners that the stream is done.
  ///
  /// Throws an [Exception] if the stream has already been closed.
  void close() {
    if (_isClosed) {
      throw Exception('You can not close a closed Stream');
    }
    listenable
      .._notifyDone()
      ..clear();
    _isClosed = true;
  }
}

/// A fast doubly-linked list implementation for managing [MiniSubscription] listeners.
///
/// Uses a linked list rather than a [List] for O(1) insertions and removals.
class FastList<T> {
  Node<MiniSubscription<T>>? _head;
  Node<MiniSubscription<T>>? _tail;
  int _length = 0;

  void _notifyData(T data) {
    var currentNode = _head;
    while (currentNode != null) {
      currentNode.data?.data(data);
      currentNode = currentNode.next;
    }
  }

  void _notifyDone() {
    var currentNode = _head;
    while (currentNode != null) {
      currentNode.data?.onDone?.call();
      currentNode = currentNode.next;
    }
  }

  void _notifyError(Object error, [StackTrace? stackTrace]) {
    var currentNode = _head;
    while (currentNode != null) {
      // We need to call the error handler if it exists, but we don't know the exact signature.
      // ignore: avoid_dynamic_calls
      currentNode.data?.onError?.call(error, stackTrace);
      currentNode = currentNode.next;
    }
  }

  /// Whether the list has no listeners.
  bool get isEmpty => _length == 0;

  /// Whether the list has at least one listener.
  bool get isNotEmpty => _length > 0;

  /// The current number of listeners.
  int get length => _length;

  /// Returns the subscription at the given [position], or `null` if out of range.
  MiniSubscription<T>? elementAt(int position) {
    if (isEmpty || position < 0 || position >= _length) {
      return null;
    }

    var node = _head;
    var current = 0;

    while (current != position) {
      node = node!.next;
      current++;
    }
    return node!.data;
  }

  /// Appends a [data] subscription to the end of the list.
  void addListener(MiniSubscription<T> data) {
    final newNode = Node(data: data);

    if (isEmpty) {
      _head = _tail = newNode;
    } else {
      _tail!.next = newNode;
      newNode.prev = _tail;
      _tail = newNode;
    }
    _length++;
  }

  /// Returns `true` if the list contains the given [element].
  bool contains(T element) {
    var currentNode = _head;
    while (currentNode != null) {
      if (currentNode.data == element) {
        return true;
      }
      currentNode = currentNode.next;
    }
    return false;
  }

  /// Removes the given [element] subscription from the list.
  void removeListener(MiniSubscription<T> element) {
    var currentNode = _head;
    while (currentNode != null) {
      if (currentNode.data == element) {
        _removeNode(currentNode);
        break;
      }
      currentNode = currentNode.next;
    }
  }

  /// Removes all listeners from the list.
  void clear() {
    _head = _tail = null;
    _length = 0;
  }

  void _removeNode(Node<MiniSubscription<T>> node) {
    if (node.prev == null) {
      _head = node.next;
    } else {
      node.prev!.next = node.next;
    }

    if (node.next == null) {
      _tail = node.prev;
    } else {
      node.next!.prev = node.prev;
    }

    _length--;
  }
}
