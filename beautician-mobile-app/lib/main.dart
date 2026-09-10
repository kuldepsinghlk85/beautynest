import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/beautician_registration_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BeautyNestBeauticianApp());
}

class BeautyNestBeauticianApp extends StatelessWidget {
  const BeautyNestBeauticianApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BeautyNest Pro – Partner App',
      debugShowCheckedModeBanner: false,
      theme: BeauticianTheme.theme,
      home: const BeauticianRegistrationScreen(),
    );
  }
}
