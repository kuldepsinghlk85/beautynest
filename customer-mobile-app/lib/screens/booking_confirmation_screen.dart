import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/models.dart';
import 'live_tracking_screen.dart';
import 'my_bookings_screen.dart';

class BookingConfirmationScreen extends StatelessWidget {
  final BookingModel booking;

  const BookingConfirmationScreen({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animated Pink Checkmark (Screen 6)
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.check_rounded,
                    color: Colors.white,
                    size: 44,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Title
              const Text(
                'Booking Confirmed! 🎉',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textCharcoal,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Your beautician will arrive at your location on time.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 24),

              // Receipt Summary Card (Screen 6)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.borderPink),
                ),
                child: Column(
                  children: [
                    _buildRow('Booking ID', booking.bookingNumber, isBold: true),
                    const Divider(height: 16, color: AppColors.borderPink),
                    _buildRow('Date', '${booking.date} 2026'),
                    const SizedBox(height: 6),
                    _buildRow('Time', booking.timeSlot),
                    const SizedBox(height: 6),
                    _buildRow('Service', booking.service.name),
                    const SizedBox(height: 6),
                    _buildRow('Professional', booking.beautician.name, isPrimary: true),
                    const Divider(height: 16, color: AppColors.borderPink),
                    _buildRow('Total Paid', '₹${booking.totalAmount.toInt()}', isBold: true, isPrimary: true),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Service Start OTP Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.lock_outline, size: 16, color: Colors.amber),
                    const SizedBox(width: 8),
                    Text(
                      'Service Start OTP: ${booking.startOtp}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.brown,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // View My Bookings Button (Screen 6)
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const MyBookingsScreen()),
                    );
                  },
                  child: const Text('View My Bookings!', style: TextStyle(fontSize: 15)),
                ),
              ),
              const SizedBox(height: 10),

              // Track Live Button (Screen 6)
              SizedBox(
                width: double.infinity,
                height: 50,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const LiveTrackingScreen()),
                    );
                  },
                  child: const Text('Track Live (GPS)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isBold = false, bool isPrimary = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 14 : 12,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
            color: isPrimary ? AppColors.primary : AppColors.textCharcoal,
          ),
        ),
      ],
    );
  }
}
