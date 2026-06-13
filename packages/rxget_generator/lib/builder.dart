/// The builder configuration for rxget_generator.
library;

import 'package:build/build.dart';
import 'package:source_gen/source_gen.dart';

import 'src/getx_state_generator.dart';

/// Entry point for the `rxget_state` builder.
///
/// Registered in `build.yaml` and invoked by `build_runner` to generate
/// `GetxState` subclasses from `@getxState`-annotated schema classes.
Builder rxgetStateBuilder(BuilderOptions options) =>
    SharedPartBuilder([const GetxStateGenerator()], 'rxget_state');
