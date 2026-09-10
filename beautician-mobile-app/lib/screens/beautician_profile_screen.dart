import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class BeauticianProfileScreen extends StatelessWidget {
  const BeauticianProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BeauticianColors.background,
      appBar: AppBar(
        title: const Text('Partner Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: BeauticianColors.borderPink),
            ),
            child: Column(
              children: [
                const CircleAvatar(
                  radius: 44,
                  backgroundImage: NetworkImage(
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Ananya Sharma',
                  style: TextStyle(
                    fontFamily: 'Playfair Display',
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: BeauticianColors.textCharcoal,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  '★ 4.8 Rating (330+ reviews) • 5 Yrs Exp',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.emerald.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    '✓ Verified & Background Checked',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.emerald),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: BeauticianColors.borderPink),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Performance Overview', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total Jobs Completed:', style: TextStyle(fontSize: 12, color: BeauticianColors.textMuted)),
                    Text('420 Jobs', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('On-Time Arrival Rate:', style: TextStyle(fontSize: 12, color: BeauticianColors.textMuted)),
                    Text('99.4%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.emerald)),
                  ],
                ),
                SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Commission Tier:', style: TextStyle(fontSize: 12, color: BeauticianColors.textMuted)),
                    Text('Gold Partner (80% Payout)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: BeauticianColors.primary)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          ListTile(
            tileColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            leading: const Icon(Icons.help_outline, color: BeauticianColors.primary),
            title: const Text('Partner Support & SOS Helpline', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
    );
  }
}
