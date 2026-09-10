import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../models/models.dart';
import '../providers/booking_provider.dart';
import 'service_detail_screen.dart';

class ServiceDiscoveryScreen extends ConsumerStatefulWidget {
  const ServiceDiscoveryScreen({super.key});

  @override
  ConsumerState<ServiceDiscoveryScreen> createState() => _ServiceDiscoveryScreenState();
}

class _ServiceDiscoveryScreenState extends ConsumerState<ServiceDiscoveryScreen> {
  String _selectedCategory = 'All';

  final List<String> _tabs = ['All', 'Facial', 'Hair', 'Waxing', 'Makeup'];

  final List<ServiceModel> _services = [
    ServiceModel(
      id: 'korean-facial-ritual',
      name: 'Korean Facial Ritual',
      category: 'Facial',
      price: 899,
      originalPrice: 1699,
      discountPercent: 47,
      durationMinutes: 65,
      rating: 4.9,
      reviewCount: 11563,
      imageUrl: 'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=600&q=80',
      shortDesc: 'Deep cleansing, Korean essence infusion, jade roller contouring & glass mask.',
      about: 'The ultimate Korean glass skin doorstep treatment with chilled jade roller and peptide serums.',
      benefits: ['Instant dewy glow', 'Deep pore detox', 'Hydration barrier'],
      processSteps: ['Cleanse', 'Peel', 'Serum', 'Mask', 'SPF'],
      isBestseller: true,
    ),
    ServiceModel(
      id: 'full-body-waxing',
      name: 'Full Body Waxing with Brightening Serum',
      category: 'Waxing',
      price: 999,
      originalPrice: 1999,
      discountPercent: 50,
      durationMinutes: 75,
      rating: 4.8,
      reviewCount: 9140,
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      shortDesc: 'Painless cartridge waxing for full arms, underarms, and full legs.',
      about: 'Single-use hygienic cartridge waxing ensuring 100% hygiene and zero mess.',
      benefits: ['99% painless', 'Smooth skin', 'Soothing oil'],
      processSteps: ['Cleanse', 'Powder', 'Wax', 'Massage'],
      isBestseller: true,
    ),
    ServiceModel(
      id: 'hair-spa-repair',
      name: 'Hair Spa Advanced Repair Therapy',
      category: 'Hair',
      price: 789,
      originalPrice: 1499,
      discountPercent: 47,
      durationMinutes: 60,
      rating: 4.9,
      reviewCount: 8250,
      imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80',
      shortDesc: 'Deep conditioning argan oil masque, scalp steam & acupressure massage.',
      about: 'Revives chemically treated, dry, and frizzy hair with deep scalp restoration.',
      benefits: ['Frizz control', 'Scalp detox', 'Stress relief'],
      processSteps: ['Wash', 'Mask', 'Steam', 'Massage', 'Blowdry'],
      isBestseller: true,
    ),
    ServiceModel(
      id: 'bridal-makeup-hd',
      name: 'Bridal Makeup HD + Draping',
      category: 'Makeup',
      price: 4999,
      originalPrice: 7999,
      discountPercent: 38,
      durationMinutes: 120,
      rating: 4.9,
      reviewCount: 3810,
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
      shortDesc: 'HD waterproof wedding makeup, mink lashes, hairstyle and royal dupatta draping.',
      about: 'Top-tier bridal transformation crafted by certified master artists.',
      benefits: ['Waterproof', 'Contoured', 'Dupatta setting'],
      processSteps: ['Primer', 'Base', 'Eyes', 'Hair', 'Drape'],
      isBestseller: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedCategory == 'All'
        ? _services
        : _services.where((s) => s.category == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Services'),
        centerTitle: false,
      ),
      body: Column(
        children: [
          // Filter Tabs (Screen 2)
          Container(
            color: Colors.white,
            height: 54,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _tabs.length,
              itemBuilder: (context, index) {
                final tab = _tabs[index];
                final isSelected = _selectedCategory == tab;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = tab),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.background,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Center(
                      child: Text(
                        tab,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppColors.textCharcoal,
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // Services List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final service = filtered[index];
                return GestureDetector(
                  onTap: () {
                    ref.read(bookingProvider.notifier).selectService(service);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => ServiceDetailScreen(service: service),
                      ),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.borderPink),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Image.network(
                            service.imageUrl,
                            width: 84,
                            height: 84,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                service.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: AppColors.textCharcoal,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.star, size: 13, color: Colors.amber),
                                  const SizedBox(width: 3),
                                  Text(
                                    '${service.rating} (${service.reviewCount}) • ${service.durationMinutes}m',
                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text(
                                    '₹${service.price.toInt()}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: AppColors.textCharcoal,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    '₹${service.originalPrice.toInt()}',
                                    style: const TextStyle(
                                      decoration: TextDecoration.lineThrough,
                                      fontSize: 11,
                                      color: Colors.grey,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.pink.shade50,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '${service.discountPercent}% OFF',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.favorite_border, size: 20, color: Colors.grey),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
