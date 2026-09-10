import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'my_bookings_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Account'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // User Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderPink),
            ),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundImage: NetworkImage(
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Priya Verma',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textCharcoal),
                      ),
                      SizedBox(height: 2),
                      Text('+91 98765 43210', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                      SizedBox(height: 2),
                      Text('Aliganj, Lucknow', style: TextStyle(fontSize: 11, color: AppColors.primary)),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit_outlined, size: 20, color: AppColors.primary),
                  onPressed: () {},
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Wallet Widget
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2D2D2D), Color(0xFF4A3B45)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.between,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('BeautyNest Wallet', style: TextStyle(color: Colors.white70, fontSize: 11)),
                    SizedBox(height: 4),
                    Text('₹250.00', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  ],
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                  onPressed: () {},
                  child: const Text('Add Money', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Menu Options
          _buildMenuItem(context, Icons.calendar_month_outlined, 'My Bookings', () {
            Navigator.push(context, MaterialPageRoute(builder: (_) => const MyBookingsScreen()));
          }),
          _buildMenuItem(context, Icons.location_on_outlined, 'Saved Addresses (Aliganj, Gomti Nagar)', () {}),
          _buildMenuItem(context, Icons.card_giftcard_outlined, 'Refer & Earn (Code: PRIYA2026)', () {}),
          _buildMenuItem(context, Icons.shield_outlined, 'Safety & Hygiene Pledge', () {}),
          _buildMenuItem(context, Icons.headset_mic_outlined, 'Help & WhatsApp Support', () {}),
          _buildMenuItem(context, Icons.logout_outlined, 'Sign Out', () {}, isDestructive: true),
        ],
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, VoidCallback onTap, {bool isDestructive = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderPink.withOpacity(0.6)),
      ),
      child: ListTile(
        leading: Icon(icon, color: isDestructive ? Colors.rose : AppColors.primary, size: 22),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDestructive ? Colors.rose : AppColors.textCharcoal,
          ),
        ),
        trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
        onTap: onTap,
      ),
    );
  }
}
