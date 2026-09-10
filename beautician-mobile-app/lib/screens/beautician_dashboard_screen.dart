import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/beautician_models.dart';
import 'active_job_screen.dart';

class BeauticianDashboardScreen extends StatefulWidget {
  const BeauticianDashboardScreen({super.key});

  @override
  State<BeauticianDashboardScreen> createState() => _BeauticianDashboardScreenState();
}

class _BeauticianDashboardScreenState extends State<BeauticianDashboardScreen> {
  bool _isOnline = true;
  int _selectedTab = 0; // 0: New, 1: Upcoming, 2: Completed

  final JobModel _sampleJob = JobModel(
    id: 'job-1',
    bookingNumber: 'BK-6887',
    serviceName: 'Korean Facial Ritual',
    customerName: 'Priya Verma',
    customerPhone: '+91 98765 43210',
    address: 'Flat 204, Ganga Vihar, Sigra, Varanasi',
    distanceKm: 2.5,
    timeSlot: '11:30 AM - 12:30 PM',
    earningsAmount: 759.0, // 80% of service value
    status: 'Assigned',
    startOtp: '4821',
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BeauticianColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Row(
          children: [
            const CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Good Morning, Ananya 🌸',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: BeauticianColors.textCharcoal),
                ),
                Text('BeautyNest Pro • Sigra, Varanasi Hub', style: TextStyle(fontSize: 10, color: BeauticianColors.textMuted)),
              ],
            ),
          ],
        ),
        actions: [
          Row(
            children: [
              Text(
                _isOnline ? 'Online' : 'Offline',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: _isOnline ? BeauticianColors.onlineGreen : Colors.grey,
                ),
              ),
              Switch(
                value: _isOnline,
                activeColor: BeauticianColors.onlineGreen,
                onChanged: (val) => setState(() => _isOnline = val),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Today's Stats (Screen 7)
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard(
                    title: "Today's Jobs",
                    value: '5',
                    icon: Icons.assignment_turned_in_outlined,
                    color: BeauticianColors.primary,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    title: "Today's Earnings",
                    value: '₹4,250',
                    icon: Icons.currency_rupee,
                    color: Colors.emerald,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildMetricCard(
                    title: 'Pro Rating',
                    value: '4.9 ★',
                    icon: Icons.star_rounded,
                    color: Colors.amber,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Tabs: New (1) | Upcoming (3) | Completed (8) (Screen 7)
            Row(
              children: [
                _buildFilterTab(0, 'New (1)'),
                const SizedBox(width: 8),
                _buildFilterTab(1, 'Upcoming (3)'),
                const SizedBox(width: 8),
                _buildFilterTab(2, 'Completed (8)'),
              ],
            ),

            const SizedBox(height: 16),

            // Job Card (Screen 7)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: BeauticianColors.borderPink),
                boxShadow: [
                  BoxShadow(
                    color: BeauticianColors.primary.withOpacity(0.06),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.pink.shade50,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Doorstep Facial Booking',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: BeauticianColors.primary),
                        ),
                      ),
                      const Text(
                        'Earn ₹759 (80%)',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.emerald),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.network(
                          'https://images.unsplash.com/photo-1512290900672-1f41444e2fc1?w=200&q=80',
                          width: 60,
                          height: 60,
                          fit: BoxFit.cover,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _sampleJob.serviceName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: BeauticianColors.textCharcoal),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '⏰ ${_sampleJob.timeSlot}',
                              style: const TextStyle(fontSize: 12, color: BeauticianColors.textMuted),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '📍 Aliganj, Lucknow • ${_sampleJob.distanceKm} km',
                              style: const TextStyle(fontSize: 11, color: BeauticianColors.primary, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                  const Divider(color: BeauticianColors.borderPink),
                  const SizedBox(height: 12),

                  // Actions: Navigate + Start Service (Screen 7)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: BeauticianColors.textCharcoal,
                            side: const BorderSide(color: BeauticianColors.borderPink),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Launching Google Maps navigation to Aliganj...')),
                            );
                          },
                          icon: const Icon(Icons.navigation_outlined, size: 16),
                          label: const Text('Navigate', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: BeauticianColors.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ActiveJobScreen(job: _sampleJob),
                              ),
                            );
                          },
                          icon: const Icon(Icons.play_arrow_rounded, size: 18),
                          label: const Text('Start Service', style: TextStyle(fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard({required String title, required String value, required IconData icon, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: BeauticianColors.borderPink),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: BeauticianColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterTab(int index, String label) {
    final isSelected = _selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedTab = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? BeauticianColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: BeauticianColors.borderPink),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : BeauticianColors.textCharcoal,
          ),
        ),
      ),
    );
  }
}
