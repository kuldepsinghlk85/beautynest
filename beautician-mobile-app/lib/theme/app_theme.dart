import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class BeauticianColors {
  static const Color primary = Color(0xFFE91E8C);
  static const Color primaryDark = Color(0xFFC2185B);
  static const Color background = Color(0xFFFFF5F7);
  static const Color card = Colors.white;
  static const Color accentGold = Color(0xFFD4AF37);
  static const Color textCharcoal = Color(0xFF2D2D2D);
  static const Color textMuted = Color(0xFF757575);
  static const Color borderPink = Color(0xFFF8D7DA);
  static const Color onlineGreen = Color(0xFF10B981);
}

class BeauticianTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: BeauticianColors.background,
      primaryColor: BeauticianColors.primary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: BeauticianColors.primary,
        primary: BeauticianColors.primary,
        secondary: BeauticianColors.accentGold,
        background: BeauticianColors.background,
        surface: BeauticianColors.card,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        titleLarge: GoogleFonts.playfairDisplay(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: BeauticianColors.textCharcoal,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: false,
        iconTheme: IconThemeData(color: BeauticianColors.textCharcoal),
      ),
    );
  }
}
