import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../models/models.dart';
import '../providers/booking_provider.dart';
import 'booking_confirmation_screen.dart';

class BeauticianAssignmentScreen extends ConsumerWidget {
  const BeauticianAssignmentScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(bookingProvider);

    final beautician = BeauticianModel(
      id: 'ananya-sharma',
      name: 'Ananya Sharma',
      rating: 4.8,
      reviewCount: 330,
      experienceYears: 5,
      specialization: 'Expert in Facials, Waxing, Skin Care',
      distanceKm: 2.5,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Beautician Assignment'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Decorative spark
            Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.sparkles, color: AppColors.primary, size: 36),
            ),
            const SizedBox(height: 16),

            // Title (Screen 5)
            const Text(
              'We Found the Best\nBeautician for You!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Playfair Display',
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.textCharcoal,
                height: 1.25,
              ),
            ),
            const SizedBox(height: 24),

            // Beautician Profile Card (Screen 5)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.borderPink, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.08),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Photo
                  ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.network(
                      beautician.imageUrl,
                      width: 90,
                      height: 90,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Name & Rating
                  Text(
                    beautician.name,
                    style: const TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textCharcoal,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.star, size: 14, color: Colors.amber),
                      const SizedBox(width: 3),
                      Text(
                        '${beautician.rating} (${beautician.reviewCount}+ reviews)',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    beautician.specialization,
                    style: const TextStyle(fontSize: 12, color: AppColors.primary),
                  ),

                  const SizedBox(height: 16),
                  const Divider(color: AppColors.borderPink),
                  const SizedBox(height: 12),

                  // Badges (Screen 5)
                  _buildBadge(Icons.verified_rounded, 'Verified Professional', Colors.emerald),
                  _buildBadge(Icons.workspace_premium_rounded, '5+ Years Experience', Colors.amber.shade800),
                  _buildBadge(Icons.location_on_rounded, '2.5 km Away in Aliganj', AppColors.primary),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // Confirm Button (Screen 5)
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(bookingProvider.notifier).assignBeautician(beautician);
                  final confirmedBooking = BookingModel(
                    id: 'b-6887',
                    bookingNumber: 'BK-6887',
                    service: state.selectedService ??
                        ServiceModel(
                          id: 'korean-facial-ritual',
                          name: 'Korean Facial Ritual',
                          category: 'facial',
                          price: 899,
                          originalPrice: 1699,
                          discountPercent: 47,
                          durationMinutes: 65,
                          rating: 4.9,
                          reviewCount: 11563,
                          imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=800&q=80',
                          shortDesc: 'Deep cleansing',
                          about: 'About',
                          benefits: [],
                          processSteps: [],
                        ),
                    beautician: beautician,
                    date: state.selectedDate,
                    timeSlot: state.selectedTimeSlot,
                    address: state.deliveryAddress,
                    totalAmount: 949,
                    status: 'Assigned',
                    startOtp: '4821',
                  );

                  ref.read(bookingProvider.notifier).confirmBooking(confirmedBooking);

                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => BookingConfirmationScreen(booking: confirmedBooking),
                    ),
                  );
                },
                child: const Text('Confirm Booking →', style: TextStyle(fontSize: 16)),
              ),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Alternative beauticians: Pooja Gupta, Kavita Sinha')),
                );
              },
              child: const Text(
                'Change Professional',
                style: TextStyle(fontSize: 13, color: AppColors.textMuted),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(IconData icon, String text, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.textCharcoal),
          ),
        ],
      ),
    );
  }
}
