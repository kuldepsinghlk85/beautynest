import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'live_tracking_screen.dart';
import 'review_rating_screen.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Bookings'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Upcoming (1)'),
            Tab(text: 'Completed (2)'),
            Tab(text: 'Cancelled (0)'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Upcoming Tab
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildBookingCard(
                bookingNumber: 'BK-6887',
                serviceName: 'Korean Facial Ritual',
                date: 'Mon, 03 Aug 2026',
                time: '11:30 AM - 12:30 PM',
                beautician: 'Ananya Sharma',
                status: 'Assigned (On Schedule)',
                amount: '₹949',
                isUpcoming: true,
              ),
            ],
          ),

          // Completed Tab
          ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildBookingCard(
                bookingNumber: 'BK-5412',
                serviceName: 'Full Body Waxing + Brightening',
                date: '24 Jul 2026',
                time: '02:00 PM',
                beautician: 'Ananya Sharma',
                status: 'Completed',
                amount: '₹999',
                isCompleted: true,
              ),
              _buildBookingCard(
                bookingNumber: 'BK-4890',
                serviceName: 'Hair Spa Advanced Repair',
                date: '10 Jul 2026',
                time: '04:30 PM',
                beautician: 'Pooja Gupta',
                status: 'Completed',
                amount: '₹789',
                isCompleted: true,
              ),
            ],
          ),

          // Cancelled Tab
          const Center(
            child: Text(
              'No cancelled bookings',
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookingCard({
    required String bookingNumber,
    required String serviceName,
    required String date,
    required String time,
    required String beautician,
    required String status,
    required String amount,
    bool isUpcoming = false,
    bool isCompleted = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(
                bookingNumber,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textCharcoal),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isUpcoming ? Colors.pink.shade50 : Colors.emerald.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isUpcoming ? AppColors.primary : Colors.emerald,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            serviceName,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textCharcoal,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '📅 $date  •  ⏰ $time',
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
          Text(
            '💅 Professional: $beautician',
            style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
          ),
          const Divider(height: 20, color: AppColors.borderPink),
          Row(
            mainAxisAlignment: MainAxisAlignment.between,
            children: [
              Text(
                amount,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textCharcoal),
              ),
              if (isUpcoming)
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const LiveTrackingScreen()),
                    );
                  },
                  child: const Text('Track Live', style: TextStyle(fontSize: 12)),
                ),
              if (isCompleted)
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ReviewRatingScreen()),
                    );
                  },
                  child: const Text('Rate Service', style: TextStyle(fontSize: 12)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
