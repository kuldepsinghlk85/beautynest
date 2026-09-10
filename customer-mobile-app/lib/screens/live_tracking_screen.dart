import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class LiveTrackingScreen extends StatelessWidget {
  const LiveTrackingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Live Tracking'),
        elevation: 1,
      ),
      body: Stack(
        children: [
          // Simulated Map Viewport with roads and pin
          Container(
            color: const Color(0xFFE8ECEF),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.4),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.directions_car, color: Colors.white, size: 16),
                            SizedBox(width: 6),
                            Text(
                              'Ananya is on the way (ETA: 18 mins)',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Icon(Icons.location_on, size: 48, color: AppColors.primary),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Beautician Card & Action Triggers
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.network(
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
                          width: 56,
                          height: 56,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Ananya Sharma',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textCharcoal),
                            ),
                            SizedBox(height: 2),
                            Text(
                              '★ 4.8 • Verified Doorstep Specialist',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Carrying Sterilized Kit #BN-402',
                              style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      // Call button
                      CircleAvatar(
                        backgroundColor: AppColors.primaryLight,
                        child: IconButton(
                          icon: const Icon(Icons.phone, color: AppColors.primary, size: 20),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Calling Ananya Sharma (+91 98112 23344)...')),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Chat button
                      CircleAvatar(
                        backgroundColor: AppColors.primaryLight,
                        child: IconButton(
                          icon: const Icon(Icons.chat_bubble_outline, color: AppColors.primary, size: 20),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Opening in-app chat...')),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.amber.shade200),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.shield_outlined, size: 16, color: Colors.brown),
                        SizedBox(width: 8),
                        Text(
                          'Share Start OTP: 4821 only when Ananya arrives',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.brown),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
