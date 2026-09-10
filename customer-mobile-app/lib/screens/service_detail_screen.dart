import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../models/models.dart';
import '../providers/booking_provider.dart';
import 'date_time_picker_screen.dart';

class ServiceDetailScreen extends ConsumerStatefulWidget {
  final ServiceModel service;

  const ServiceDetailScreen({super.key, required this.service});

  @override
  ConsumerState<ServiceDetailScreen> createState() => _ServiceDetailScreenState();
}

class _ServiceDetailScreenState extends ConsumerState<ServiceDetailScreen> {
  int _selectedTab = 0; // 0: About, 1: Benefits, 2: Process, 3: Reviews

  @override
  Widget build(BuildContext context) {
    final s = widget.service;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 90),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Banner Image
                Stack(
                  children: [
                    Image.network(
                      s.imageUrl,
                      width: double.infinity,
                      height: 280,
                      fit: BoxFit.cover,
                    ),
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.between,
                          children: [
                            CircleAvatar(
                              backgroundColor: Colors.white.withOpacity(0.9),
                              child: IconButton(
                                icon: const Icon(Icons.arrow_back, color: AppColors.textCharcoal, size: 20),
                                onPressed: () => Navigator.pop(context),
                              ),
                            ),
                            Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: Colors.white.withOpacity(0.9),
                                  child: const Icon(Icons.favorite_border, color: AppColors.primary, size: 20),
                                ),
                                const SizedBox(width: 8),
                                CircleAvatar(
                                  backgroundColor: Colors.white.withOpacity(0.9),
                                  child: const Icon(Icons.share, color: AppColors.textCharcoal, size: 20),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                // Details Body
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.amber.shade100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Bestseller',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.amber,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        s.name,
                        style: const TextStyle(
                          fontFamily: 'Playfair Display',
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textCharcoal,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(Icons.star, size: 14, color: Colors.amber),
                          const SizedBox(width: 3),
                          Text(
                            '${s.rating} (${s.reviewCount} reviews) • ${s.durationMinutes} mins',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Text(
                            '₹${s.price.toInt()}',
                            style: const TextStyle(
                              fontFamily: 'Playfair Display',
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textCharcoal,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '₹${s.originalPrice.toInt()}',
                            style: const TextStyle(
                              decoration: TextDecoration.lineThrough,
                              fontSize: 13,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.pink.shade50,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${s.discountPercent}% OFF',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),

                      // Tabs (Screen 3)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: ['About', 'Benefits', 'Process', 'Reviews'].asMap().entries.map((e) {
                          final isSelected = _selectedTab == e.key;
                          return GestureDetector(
                            onTap: () => setState(() => _selectedTab = e.key),
                            child: Column(
                              children: [
                                Text(
                                  e.value,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                    color: isSelected ? AppColors.primary : Colors.grey,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  height: 2,
                                  width: 40,
                                  color: isSelected ? AppColors.primary : Colors.transparent,
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),

                      const SizedBox(height: 16),

                      // Tab Content (Screen 3 Bullets)
                      if (_selectedTab == 0) ...[
                        _buildBullet('Deep cleansing & gentle enzyme exfoliation'),
                        _buildBullet('Korean active peptide serum & moisture lock mask'),
                        _buildBullet('Instant dewy glass glow & deep hydration'),
                        _buildBullet('Suitable for all skin types'),
                      ] else if (_selectedTab == 1) ...[
                        _buildBullet('Unclogs stubborn blackheads and whiteheads'),
                        _buildBullet('Stimulates facial collagen and lymphatic drainage'),
                        _buildBullet('Prevents premature signs of aging and dullness'),
                      ] else if (_selectedTab == 2) ...[
                        _buildBullet('Step 1: Double cleanse with soothing camellia oil'),
                        _buildBullet('Step 2: Enzyme peel & mild ultrasonic steam'),
                        _buildBullet('Step 3: Chilled jade roller lymphatic contouring'),
                        _buildBullet('Step 4: Hydro-jelly sheet mask & SPF finish'),
                      ] else ...[
                        _buildBullet('★ 5.0 - "Luminous glow! My skin feels super soft." (Shalini)'),
                        _buildBullet('★ 5.0 - "Ananya was extremely gentle and hygienic." (Pooja)'),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Sticky Book Now Button (Screen 3)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    ref.read(bookingProvider.notifier).selectService(s);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const DateTimePickerScreen()),
                    );
                  },
                  child: const Text('Book Now →', style: TextStyle(fontSize: 16)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBullet(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: AppColors.textCharcoal),
            ),
          ),
        ],
      ),
    );
  }
}
