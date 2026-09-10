import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../models/models.dart';
import '../providers/booking_provider.dart';
import 'service_detail_screen.dart';
import 'service_discovery_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Sample service data for instant navigation
    final sampleService = ServiceModel(
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
      shortDesc: 'Deep cleansing, Korean essence infusion, jade roller lymphatic massage and glass skin hydration mask.',
      about: 'The ultimate Korean glass skin doorstep treatment. Restores deep skin radiance, detoxifies pores, and delivers intense cellular hydration.',
      benefits: [
        'Deep cleansing & gentle enzyme exfoliation',
        'Korean active peptide serum & moisture lock mask',
        'Instant glass glow & deep hydration',
        'Suitable for all skin types',
      ],
      processSteps: [
        '1. Double Cleanse with Camellia Oil & Foam',
        '2. Mild Rice Enzyme Exfoliation',
        '3. Ultrasonic Serum Infusion & Jade Roller Contouring',
        '4. Chilled Hydro-Jelly Mask for 20 mins',
        '5. SPF 50 Ceramide Shield finish',
      ],
      isBestseller: true,
    );

    final categories = [
      {'name': 'Facial', 'icon': Icons.spa_rounded},
      {'name': 'Hair', 'icon': Icons.content_cut_rounded},
      {'name': 'Waxing', 'icon': Icons.auto_awesome_rounded},
      {'name': 'Makeup', 'icon': Icons.brush_rounded},
      {'name': 'Spa', 'icon': Icons.self_improvement_rounded},
      {'name': 'Bridal', 'icon': Icons.diamond_rounded},
      {'name': 'Nails', 'icon': Icons.fingerprint_rounded},
      {'name': 'Skin Care', 'icon': Icons.wb_sunny_rounded},
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on, size: 14, color: AppColors.primary),
                const SizedBox(width: 4),
                const Text(
                  'Sigra, Varanasi',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textCharcoal,
                  ),
                ),
                const Icon(Icons.keyboard_arrow_down, size: 16, color: Colors.grey),
              ],
            ),
            const Text(
              'BeautyNest • Doorstep Salon',
              style: TextStyle(fontSize: 10, color: AppColors.textMuted),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded, color: AppColors.textCharcoal),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderPink),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                child: Row(
                  children: const [
                    Icon(Icons.search, color: Colors.grey, size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Search for "Korean Facial", "Waxing"...',
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Hero Promo Banner (Matches Screen 1)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFDE8EE), Color(0xFFF8BBD0)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.borderPink),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'FLAT 47% OFF',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Glowing Skin,\nHappier You',
                            style: TextStyle(
                              fontFamily: 'Playfair Display',
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textCharcoal,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            onPressed: () {
                              ref.read(bookingProvider.notifier).selectService(sampleService);
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ServiceDetailScreen(service: sampleService),
                                ),
                              );
                            },
                            child: const Text('Book Now', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ),
                    ),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=400&q=80',
                        width: 100,
                        height: 100,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Service Categories (8 Circles)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: const Text(
                'Explore Services',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textCharcoal,
                ),
              ),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: categories.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 12,
                mainAxisSpacing: 14,
                childAspectRatio: 0.85,
              ),
              itemBuilder: (context, index) {
                final cat = categories[index];
                return GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ServiceDiscoveryScreen()),
                    );
                  },
                  child: Column(
                    children: [
                      Container(
                        width: 54,
                        height: 54,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(color: AppColors.borderPink),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.06),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Icon(
                          cat['icon'] as IconData,
                          color: AppColors.primary,
                          size: 24,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        cat['name'] as String,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textCharcoal,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 20),

            // Top Rated Beauticians Near You (Screen 1)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text(
                    'Top Rated Beauticians Near You',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textCharcoal,
                    ),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('View All', style: TextStyle(fontSize: 11, color: AppColors.primary)),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.borderPink),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Image.network(
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
                        width: 60,
                        height: 60,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Ananya Sharma',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.textCharcoal,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            '★ 4.8 (330+) • 2.5 km away',
                            style: TextStyle(fontSize: 11, color: Colors.amber, fontWeight: FontWeight.bold),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Specialist in Facials, Waxing',
                            style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryLight,
                        foregroundColor: AppColors.primary,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      onPressed: () {
                        ref.read(bookingProvider.notifier).selectService(sampleService);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ServiceDetailScreen(service: sampleService),
                          ),
                        );
                      },
                      child: const Text('Book', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Stats Bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderPink),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: const [
                  _StatItem(value: '10K+', label: 'Happy Clients'),
                  _StatItem(value: '500+', label: 'Beauticians'),
                  _StatItem(value: '4.9★', label: 'Rating'),
                  _StatItem(value: '100%', label: 'Safe & Pure'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;

  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontFamily: 'Playfair Display',
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
        ),
      ],
    );
  }
}
