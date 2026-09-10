import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color primary = Color(0xFFE91E8C);
  static const Color primaryDark = Color(0xFFC2185B);
  static const Color primaryLight = Color(0xFFFCE4EC);
  static const Color background = Color(0xFFFFF5F7);
  static const Color card = Colors.white;
  static const Color accentGold = Color(0xFFD4AF37);
  static const Color textCharcoal = Color(0xFF2D2D2D);
  static const Color textMuted = Color(0xFF757575);
  static const Color borderPink = Color(0xFFF8D7DA);
  static const Color success = Color(0xFF10B981);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.accentGold,
        background: AppColors.background,
        surface: AppColors.card,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: AppColors.textCharcoal,
        ),
        displayMedium: GoogleFonts.playfairDisplay(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: AppColors.textCharcoal,
        ),
        titleLarge: GoogleFonts.playfairDisplay(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.textCharcoal,
        ),
        bodyLarge: const TextStyle(
          fontSize: 14,
          color: AppColors.textCharcoal,
        ),
        bodyMedium: const TextStyle(
          fontSize: 12,
          color: AppColors.textMuted,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        iconTheme: const IconThemeData(color: AppColors.textCharcoal),
        titleTextStyle: GoogleFonts.playfairDisplay(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppColors.textCharcoal,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.card,
        elevation: 2,
        shadowColor: AppColors.primary.withOpacity(0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.borderPink, width: 0.8),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 3,
          shadowColor: AppColors.primary.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}
