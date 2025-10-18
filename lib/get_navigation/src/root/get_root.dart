import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../get.dart';
import '../router_report.dart';

class ConfigData {
  final VoidCallback? onInit;
  final VoidCallback? onReady;
  final VoidCallback? onDispose;
  final bool? enableLog;
  final LogWriterCallback? logWriterCallback;
  final SmartManagement smartManagement;
  final List<Bind> binds;
  final Duration? transitionDuration;
  final bool? defaultGlobalState;
  final RouteInformationProvider? routeInformationProvider;
  final RouteInformationParser<Object>? routeInformationParser;
  final RouterDelegate<Object>? routerDelegate;
  final BackButtonDispatcher? backButtonDispatcher;
  final List<NavigatorObserver>? navigatorObservers;
  final GlobalKey<NavigatorState>? navigatorKey;
  final GlobalKey<ScaffoldMessengerState>? scaffoldMessengerKey;
  final Map<String, Map<String, String>>? translationsKeys;
  final Translations? translations;
  final Locale? locale;
  final Locale? fallbackLocale;
  final String? initialRoute;
  final Widget? home;
  final bool testMode;
  final Key? unikey;
  final ThemeData? theme;
  final ThemeData? darkTheme;
  final ThemeMode? themeMode;
  final bool? defaultPopGesture;
  final bool defaultOpaqueRoute;
  final Duration defaultTransitionDuration;
  final Curve defaultTransitionCurve;
  final Curve defaultDialogTransitionCurve;
  final Duration defaultDialogTransitionDuration;
  final Map<String, String?> parameters;

  ConfigData({
    required this.onInit,
    required this.onReady,
    required this.onDispose,
    required this.enableLog,
    required this.logWriterCallback,
    required this.smartManagement,
    required this.binds,
    required this.transitionDuration,
    required this.defaultGlobalState,
    required this.routeInformationProvider,
    required this.routeInformationParser,
    required this.routerDelegate,
    required this.backButtonDispatcher,
    required this.navigatorObservers,
    required this.navigatorKey,
    required this.scaffoldMessengerKey,
    required this.translationsKeys,
    required this.translations,
    required this.locale,
    required this.fallbackLocale,
    required this.initialRoute,
    required this.home,
    this.theme,
    this.darkTheme,
    this.themeMode,
    this.unikey,
    this.testMode = false,
    this.defaultOpaqueRoute = true,
    this.defaultTransitionDuration = const Duration(milliseconds: 300),
    this.defaultTransitionCurve = Curves.easeOutQuad,
    this.defaultDialogTransitionCurve = Curves.easeOutQuad,
    this.defaultDialogTransitionDuration = const Duration(milliseconds: 300),
    this.parameters = const {},
    required this.defaultPopGesture,
  });

  ConfigData copyWith({
    VoidCallback? onInit,
    VoidCallback? onReady,
    VoidCallback? onDispose,
    bool? enableLog,
    LogWriterCallback? logWriterCallback,
    SmartManagement? smartManagement,
    List<Bind>? binds,
    Duration? transitionDuration,
    bool? defaultGlobalState,
    RouteInformationProvider? routeInformationProvider,
    RouteInformationParser<Object>? routeInformationParser,
    RouterDelegate<Object>? routerDelegate,
    BackButtonDispatcher? backButtonDispatcher,
    List<NavigatorObserver>? navigatorObservers,
    GlobalKey<NavigatorState>? navigatorKey,
    GlobalKey<ScaffoldMessengerState>? scaffoldMessengerKey,
    Map<String, Map<String, String>>? translationsKeys,
    Translations? translations,
    Locale? locale,
    Locale? fallbackLocale,
    String? initialRoute,
    Widget? home,
    bool? testMode,
    Key? unikey,
    ThemeData? theme,
    ThemeData? darkTheme,
    ThemeMode? themeMode,
    bool? defaultPopGesture,
    bool? defaultOpaqueRoute,
    Duration? defaultTransitionDuration,
    Curve? defaultTransitionCurve,
    Curve? defaultDialogTransitionCurve,
    Duration? defaultDialogTransitionDuration,
    Map<String, String?>? parameters,
  }) {
    return ConfigData(
      onInit: onInit ?? this.onInit,
      onReady: onReady ?? this.onReady,
      onDispose: onDispose ?? this.onDispose,
      enableLog: enableLog ?? this.enableLog,
      logWriterCallback: logWriterCallback ?? this.logWriterCallback,
      smartManagement: smartManagement ?? this.smartManagement,
      binds: binds ?? this.binds,
      transitionDuration: transitionDuration ?? this.transitionDuration,
      defaultGlobalState: defaultGlobalState ?? this.defaultGlobalState,
      routeInformationProvider:
          routeInformationProvider ?? this.routeInformationProvider,
      routeInformationParser:
          routeInformationParser ?? this.routeInformationParser,
      routerDelegate: routerDelegate ?? this.routerDelegate,
      backButtonDispatcher: backButtonDispatcher ?? this.backButtonDispatcher,
      navigatorObservers: navigatorObservers ?? this.navigatorObservers,
      navigatorKey: navigatorKey ?? this.navigatorKey,
      scaffoldMessengerKey: scaffoldMessengerKey ?? this.scaffoldMessengerKey,
      translationsKeys: translationsKeys ?? this.translationsKeys,
      translations: translations ?? this.translations,
      locale: locale ?? this.locale,
      fallbackLocale: fallbackLocale ?? this.fallbackLocale,
      initialRoute: initialRoute ?? this.initialRoute,
      home: home ?? this.home,
      testMode: testMode ?? this.testMode,
      unikey: unikey ?? this.unikey,
      theme: theme ?? this.theme,
      darkTheme: darkTheme ?? this.darkTheme,
      themeMode: themeMode ?? this.themeMode,
      defaultPopGesture: defaultPopGesture ?? this.defaultPopGesture,
      defaultOpaqueRoute: defaultOpaqueRoute ?? this.defaultOpaqueRoute,
      defaultTransitionDuration:
          defaultTransitionDuration ?? this.defaultTransitionDuration,
      defaultTransitionCurve:
          defaultTransitionCurve ?? this.defaultTransitionCurve,
      defaultDialogTransitionCurve:
          defaultDialogTransitionCurve ?? this.defaultDialogTransitionCurve,
      defaultDialogTransitionDuration: defaultDialogTransitionDuration ??
          this.defaultDialogTransitionDuration,
      parameters: parameters ?? this.parameters,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is ConfigData &&
        other.onInit == onInit &&
        other.onReady == onReady &&
        other.onDispose == onDispose &&
        other.enableLog == enableLog &&
        other.logWriterCallback == logWriterCallback &&
        other.smartManagement == smartManagement &&
        listEquals(other.binds, binds) &&
        other.transitionDuration == transitionDuration &&
        other.defaultGlobalState == defaultGlobalState &&
        other.routeInformationProvider == routeInformationProvider &&
        other.routeInformationParser == routeInformationParser &&
        other.routerDelegate == routerDelegate &&
        other.backButtonDispatcher == backButtonDispatcher &&
        listEquals(other.navigatorObservers, navigatorObservers) &&
        other.navigatorKey == navigatorKey &&
        other.scaffoldMessengerKey == scaffoldMessengerKey &&
        mapEquals(other.translationsKeys, translationsKeys) &&
        other.translations == translations &&
        other.locale == locale &&
        other.fallbackLocale == fallbackLocale &&
        other.initialRoute == initialRoute &&
        other.home == home &&
        other.testMode == testMode &&
        other.unikey == unikey &&
        other.theme == theme &&
        other.darkTheme == darkTheme &&
        other.themeMode == themeMode &&
        other.defaultPopGesture == defaultPopGesture &&
        other.defaultOpaqueRoute == defaultOpaqueRoute &&
        other.defaultTransitionDuration == defaultTransitionDuration &&
        other.defaultTransitionCurve == defaultTransitionCurve &&
        other.defaultDialogTransitionCurve == defaultDialogTransitionCurve &&
        other.defaultDialogTransitionDuration ==
            defaultDialogTransitionDuration &&
        mapEquals(other.parameters, parameters);
  }

  @override
  int get hashCode {
    return onInit.hashCode ^
        onReady.hashCode ^
        onDispose.hashCode ^
        enableLog.hashCode ^
        logWriterCallback.hashCode ^
        smartManagement.hashCode ^
        binds.hashCode ^
        transitionDuration.hashCode ^
        defaultGlobalState.hashCode ^
        routeInformationProvider.hashCode ^
        routeInformationParser.hashCode ^
        routerDelegate.hashCode ^
        backButtonDispatcher.hashCode ^
        navigatorObservers.hashCode ^
        navigatorKey.hashCode ^
        scaffoldMessengerKey.hashCode ^
        translationsKeys.hashCode ^
        translations.hashCode ^
        locale.hashCode ^
        fallbackLocale.hashCode ^
        initialRoute.hashCode ^
        home.hashCode ^
        testMode.hashCode ^
        unikey.hashCode ^
        theme.hashCode ^
        darkTheme.hashCode ^
        themeMode.hashCode ^
        defaultPopGesture.hashCode ^
        defaultOpaqueRoute.hashCode ^
        defaultTransitionDuration.hashCode ^
        defaultTransitionCurve.hashCode ^
        defaultDialogTransitionCurve.hashCode ^
        defaultDialogTransitionDuration.hashCode ^
        parameters.hashCode;
  }
}

class GetRoot extends StatefulWidget {
  const GetRoot({
    super.key,
    required this.config,
    required this.child,
  });
  final ConfigData config;
  final Widget child;
  @override
  State<GetRoot> createState() => GetRootState();

  static bool get treeInitialized => GetRootState._controller != null;

  static GetRootState of(BuildContext context) {
    // Handles the case where the input context is a navigator element.
    GetRootState? root;
    if (context is StatefulElement && context.state is GetRootState) {
      root = context.state as GetRootState;
    }
    root = context.findRootAncestorStateOfType<GetRootState>() ?? root;
    assert(() {
      if (root == null) {
        throw FlutterError(
          'GetRoot operation requested with a context that does not include a GetRoot.\n'
          'The context used must be that of a '
          'widget that is a descendant of a GetRoot widget.',
        );
      }
      return true;
    }());
    return root!;
  }
}

class GetRootState extends State<GetRoot> with WidgetsBindingObserver {
  static GetRootState? _controller;
  static GetRootState get controller {
    if (_controller == null) {
      throw Exception('GetRoot is not part of the three');
    } else {
      return _controller!;
    }
  }

  late ConfigData config;

  @override
  void initState() {
    config = widget.config;
    GetRootState._controller = this;
    Engine.instance.addObserver(this);
    onInit();
    super.initState();
  }

  // @override
  // void didUpdateWidget(covariant GetRoot oldWidget) {
  //   if (oldWidget.config != widget.config) {
  //     config = widget.config;
  //   }

  //   super.didUpdateWidget(oldWidget);
  // }

  void onClose() {
    config.onDispose?.call();
    Get.clearTranslations();
    RouterReportManager.instance.clearRouteKeys();
    RouterReportManager.dispose();
    Get.resetInstance(clearRouteBindings: true);
    _controller = null;
    Engine.instance.removeObserver(this);
  }

  @override
  void dispose() {
    onClose();
    super.dispose();
  }

  void onInit() {
    if (config.home == null) {
      throw 'You need add pages or home';
    }

    if (config.locale != null) Get.locale = config.locale;

    if (config.fallbackLocale != null) {
      Get.fallbackLocale = config.fallbackLocale;
    }

    if (config.translations != null) {
      Get.addTranslations(config.translations!.keys);
    } else if (config.translationsKeys != null) {
      Get.addTranslations(config.translationsKeys!);
    }

    Get.smartManagement = config.smartManagement;
    config.onInit?.call();

    Get.isLogEnable = config.enableLog ?? kDebugMode;
    Get.log = config.logWriterCallback ?? defaultLogWriterCallback;

    // defaultOpaqueRoute = config.opaqueRoute ?? true;
    // defaultPopGesture = config.popGesture ?? GetPlatform.isIOS;
    // defaultTransitionDuration =
    //     config.transitionDuration ?? Duration(milliseconds: 300);

    Future(() => onReady());
  }

  set parameters(Map<String, String?> newParameters) {
    // rootController.parameters = newParameters;
    config = config.copyWith(parameters: newParameters);
  }

  set testMode(bool isTest) {
    config = config.copyWith(testMode: isTest);
  }

  void onReady() {
    config.onReady?.call();
  }

  @override
  void didChangeLocales(List<Locale>? locales) {}

  void setTheme(ThemeData value) {
    if (config.darkTheme == null) {
      config = config.copyWith(theme: value);
    } else {
      if (value.brightness == Brightness.light) {
        config = config.copyWith(theme: value);
      } else {
        config = config.copyWith(darkTheme: value);
      }
    }
    update();
  }

  void setThemeMode(ThemeMode value) {
    config = config.copyWith(themeMode: value);
    update();
  }

  void restartApp() {
    config = config.copyWith(unikey: UniqueKey());
    update();
  }

  void update() {
    context.visitAncestorElements((element) {
      element.markNeedsBuild();
      return false;
    });
  }

  RouteInformationParser<Object> get informationParser =>
      config.routeInformationParser!;

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }

  String cleanRouteName(String name) {
    name = name.replaceAll('() => ', '');

    /// uncomment for URL styling.
    // name = name.paramCase!;
    if (!name.startsWith('/')) {
      name = '/$name';
    }
    return Uri.tryParse(name)?.toString() ?? name;
  }
}
