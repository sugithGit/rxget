import 'dart:isolate';
import 'package:custom_lint_builder/custom_lint_builder.dart';
import 'package:rxget_lint/rxget_lint.dart';

void main(List<String> args, SendPort sendPort) {
  startPlugin(sendPort, createPlugin());
}
