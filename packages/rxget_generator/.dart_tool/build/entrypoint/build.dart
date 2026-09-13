// @dart=3.6
// ignore_for_file: type=lint
// build_runner >=2.4.16
import 'dart:io' as _io;
import 'package:build_runner/src/build_plan/builder_factories.dart'
    as _build_runner;
import 'package:build_runner/src/bootstrap/processes.dart' as _build_runner;
import 'package:build_test/builder.dart' as _i1;
import 'package:rxget_generator/builder.dart' as _i2;
import 'package:source_gen/builder.dart' as _i3;

final _builderFactories = _build_runner.BuilderFactories(
  {
    'build_test:test_bootstrap': [
      _i1.debugIndexBuilder,
      _i1.debugTestBuilder,
      _i1.testBootstrapBuilder
    ],
    'rxget_generator:rxget_state': [_i2.rxgetStateBuilder],
    'source_gen:combining_builder': [_i3.combiningBuilder],
  },
  postProcessBuilderFactories: {
    'source_gen:part_cleanup': _i3.partCleanup,
  },
);
void main(List<String> args) async {
  _io.exitCode = await _build_runner.ChildProcess.run(
    args,
    _builderFactories,
  )!;
}
