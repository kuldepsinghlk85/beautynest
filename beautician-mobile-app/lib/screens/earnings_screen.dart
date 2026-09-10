import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  int _selectedFilter = 0; // 0: Today, 1: Week, 2: Month

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BeauticianColors.background,
      appBar: AppBar(
        title: const Text('Earnings & Payouts'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Filter Toggle
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: BeauticianColors.borderPink),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: ['Today', 'This Week', 'This Month'].asMap().entries.map((e) {
                  final isSelected = _selectedFilter == e.key;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedFilter = e.key),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? BeauticianColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Center(
                          child: Text(
                            e.value,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : BeauticianColors.textCharcoal,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),

            // Summary Balance Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [BeauticianColors.primary, Color(0xFFC2185B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: BeauticianColors.primary.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Net Earnings', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 6),
                  Text(
                    _selectedFilter == 0 ? '₹4,250' : _selectedFilter == 1 ? '₹24,800' : '₹68,400',
                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Bank Account: HDFC **** 3821', style: TextStyle(color: Colors.white70, fontSize: 11)),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: BeauticianColors.primary,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Payout transfer initiated to HDFC Bank account!')),
                          );
                        },
                        child: const Text('Withdraw', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Pink Bar Chart Representation
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: BeauticianColors.borderPink),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Daily Performance (INR)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _buildBar('Mon', 70),
                      _buildBar('Tue', 95),
                      _buildBar('Wed', 80),
                      _buildBar('Thu', 110),
                      _buildBar('Fri', 140),
                      _buildBar('Sat', 180, isHighest: true),
                      _buildBar('Sun', 150),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Recent Payouts List
            const Text(
              'Payout History',
              style: TextStyle(fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            _buildPayoutItem('05 Aug 2026', 'NEFT Ref: 20260805128', '₹18,400', 'Transferred'),
            _buildPayoutItem('29 Jul 2026', 'NEFT Ref: 20260729482', '₹22,150', 'Transferred'),
            _buildPayoutItem('22 Jul 2026', 'NEFT Ref: 20260722910', '₹16,900', 'Transferred'),
          ],
        ),
      ),
    );
  }

  Widget _buildBar(String day, double height, {bool isHighest = false}) {
    return Column(
      children: [
        Container(
          width: 22,
          height: height,
          decoration: BoxDecoration(
            color: isHighest ? BeauticianColors.primary : Colors.pink.shade200,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 6),
        Text(day, style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildPayoutItem(String date, String ref, String amount, String status) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: BeauticianColors.borderPink),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(date, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 2),
              Text(ref, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(amount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.emerald)),
              const SizedBox(height: 2),
              Text(status, style: const TextStyle(fontSize: 10, color: Colors.emerald, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
